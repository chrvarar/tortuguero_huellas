<?php

namespace App\Controllers;

use App\Libraries\ReportNotifications;
use App\Models\TerritoryModel;
use CodeIgniter\HTTP\ResponseInterface;
use Throwable;

class AnimalReports extends BaseController
{
    public function districts(): ResponseInterface
    {
        return $this->response
            ->setHeader('Cache-Control', 'public, max-age=3600')
            ->setJSON((new TerritoryModel())->catalog());
    }

    public function index(): ResponseInterface
    {
        if ($denied = $this->denyUnlessManager('Necesitás una sesión autorizada para gestionar los avisos.')) {
            return $denied;
        }

        $db = db_connect();
        $reports = $db->table('animal_reports')
            ->select('animal_reports.*, districts.name AS district, animals.name AS linked_animal')
            ->join('districts', 'districts.id = animal_reports.district_id')
            ->join('animals', 'animals.id = animal_reports.animal_id', 'left')
            ->orderBy('animal_reports.id', 'DESC')->get(50)->getResultArray();

        $messagesByReport = [];
        if ($reports !== []) {
            $messages = $db->table('report_notifications')->whereIn('report_id', array_column($reports, 'id'))
                ->orderBy('id')->get()->getResultArray();
            foreach ($messages as $message) {
                unset($message['reply_token_hash']);
                $messagesByReport[$message['report_id']][] = $message;
            }
        }

        $photosByReport = [];
        if ($reports !== [] && $db->tableExists('report_photos')) {
            $reportPhotos = $db->table('report_photos')->whereIn('report_id', array_column($reports, 'id'))
                ->orderBy('sort_order', 'ASC')->orderBy('id', 'ASC')->get()->getResultArray();
            foreach ($reportPhotos as $rp) {
                $photosByReport[$rp['report_id']][] = $rp['photo_path'];
            }
        }

        foreach ($reports as &$report) {
            $pPaths = $photosByReport[$report['id']] ?? ($report['photo_path'] !== null ? [$report['photo_path']] : []);
            $report['photos'] = array_map(
                static fn ($idx) => '/api/avisos/' . $report['id'] . '/foto/' . $idx,
                array_keys($pPaths)
            );
            $report['photo'] = $report['photos'][0] ?? null;
            $report['notifications'] = $messagesByReport[$report['id']] ?? [];
            unset($report['photo_path']);
        }
        unset($report);

        return $this->response->noCache()->setJSON(['reports' => $reports, 'can_simulate_bounce' => ENVIRONMENT === 'development']);
    }

    public function replyStatus(string $token): ResponseInterface
    {
        return (new ReportNotifications(db_connect()))->canReply($token)
            ? $this->response->noCache()->setStatusCode(204) : $this->unavailableReply();
    }

    public function reply(string $token): ResponseInterface
    {
        $message = $this->request->getPost('message');
        $message = is_string($message) ? trim($message) : '';
        if (! $this->validateData(['message' => $message], ['message' => 'required|max_length[2000]'])) {
            return $this->response->setStatusCode(422)->setJSON(['message' => 'Escribí una respuesta de hasta 2000 caracteres.']);
        }

        return (new ReportNotifications(db_connect()))->captureReply($token, $message)
            ? $this->response->noCache()->setStatusCode(201)->setJSON(['message' => 'Tu respuesta quedó registrada.'])
            : $this->unavailableReply();
    }

    private function unavailableReply(): ResponseInterface
    {
        return $this->response->noCache()->setStatusCode(404)->setJSON(['message' => 'Este enlace de respuesta no está disponible.']);
    }

    public function bounce(string $id): ResponseInterface
    {
        if ($denied = $this->denyUnlessManager('Necesitás una sesión autorizada para gestionar los avisos.')) {
            return $denied;
        }
        if (ENVIRONMENT !== 'development') {
            return $this->response->setStatusCode(404);
        }

        return (new ReportNotifications(db_connect()))->simulateBounce($id) ? $this->response->setStatusCode(204)
            : $this->response->setStatusCode(409)->setJSON(['message' => 'Este correo no admite otro rebote.']);
    }

    public function photo(string $id, $index = 0): ResponseInterface
    {
        if ($denied = $this->denyUnlessManager('Necesitás una sesión autorizada para gestionar los avisos.')) {
            return $denied;
        }

        $db = db_connect();
        $filename = null;
        $idx = is_numeric($index) ? (int) $index : 0;

        if ($db->tableExists('report_photos')) {
            $photoRows = $db->table('report_photos')
                ->select('photo_path')
                ->where('report_id', $id)
                ->orderBy('sort_order', 'ASC')
                ->orderBy('id', 'ASC')
                ->get()->getResultArray();
            if (isset($photoRows[$idx])) {
                $filename = $photoRows[$idx]['photo_path'];
            }
        }

        if ($filename === null && $idx === 0) {
            $report = $db->table('animal_reports')->select('photo_path')->where('id', $id)->get()->getRowArray();
            $filename = $report['photo_path'] ?? null;
        }

        if ($filename === null || $filename === '') {
            return $this->response->noCache()->setStatusCode(404);
        }

        $path = WRITEPATH . 'uploads/reports/' . basename($filename);
        if (! is_file($path)) {
            return $this->response->noCache()->setStatusCode(404);
        }

        return $this->response->noCache()->setContentType('image/webp')
            ->setHeader('X-Content-Type-Options', 'nosniff')->setBody(file_get_contents($path));
    }

    public function link(string $id): ResponseInterface
    {
        if ($denied = $this->denyUnlessManager('Necesitás una sesión autorizada para gestionar los avisos.')) {
            return $denied;
        }

        $animalId = $this->request->getPost('animal_id');
        if (! is_string($animalId) || ! ctype_digit($animalId)) {
            return $this->response->setStatusCode(422)->setJSON(['message' => 'Seleccioná un expediente activo.']);
        }

        $db = db_connect();
        $animal = $db->table('animals')->select('species')->where(['id' => $animalId, 'status' => 'activo'])->get()->getRowArray();
        if ($animal === null) {
            return $this->response->setStatusCode(422)->setJSON(['message' => 'Seleccioná un expediente activo.']);
        }

        $db->table('animal_reports')->where([
            'id' => $id, 'kind' => 'extravio', 'animal_id' => null, 'resolved_at' => null, 'species' => $animal['species'],
        ])->update(['animal_id' => $animalId]);

        return $db->affectedRows() === 1 ? $this->response->setStatusCode(204)
            : $this->response->setStatusCode(409)->setJSON(['message' => 'El aviso ya se gestionó o la especie no coincide.']);
    }

    public function resolve(string $id): ResponseInterface
    {
        if ($denied = $this->denyUnlessManager('Necesitás una sesión autorizada para gestionar los avisos.')) {
            return $denied;
        }

        db_connect()->table('animal_reports')->where(['id' => $id, 'kind' => 'extravio', 'resolved_at' => null])
            ->update(['resolved_at' => gmdate('Y-m-d H:i:s')]);

        return $this->response->setStatusCode(204);
    }

    public function create(string $kind, ?string $code = null): ResponseInterface
    {
        $limit = 'vitalink-reports-' . hash('sha256', $this->request->getIPAddress());
        if (! service('throttler')->check($limit, 15, MINUTE)) {
            return $this->response->setStatusCode(429)->setJSON(['message' => 'Esperá un momento antes de enviar otro aviso.']);
        }

        $db = db_connect();
        $animal = null;
        if ($code !== null) {
            $animal = $db->table('animals')->select('id, name, species, living_condition, owner_email')
                ->where(['qr_code' => $code, 'status' => 'activo'])->get()->getRowArray();
            if ($animal === null) {
                return $this->response->setStatusCode(404)->setJSON(['message' => 'Este código no está disponible.']);
            }
        }

        $fields = ['animal_name', 'species', 'district_id', 'address', 'description', 'shelter_address',
            'contact_name', 'contact_email', 'contact_phone', 'share_contact'];
        $input = [];
        foreach ($fields as $field) {
            $value = $this->request->getPost($field);
            $input[$field] = is_string($value) ? trim($value) : '';
        }

        if ($animal !== null) {
            $input['animal_name'] = $animal['name'];
            $input['species'] = $animal['species'];
        }

        $lost = $kind === 'extravio';
        if (! $lost && $animal === null) {
            $input['animal_name'] = null;
        }

        $rawFiles = $this->request->getFileMultiple('photos');
        if ($rawFiles === null || $rawFiles === []) {
            $single = $this->request->getFile('photo');
            if ($single !== null && $single->getError() !== UPLOAD_ERR_NO_FILE) {
                $rawFiles = [$single];
            }
        }
        if ($rawFiles === null || $rawFiles === []) {
            $rawFiles = [];
            foreach (['photo_1', 'photo_2', 'photo_3'] as $pKey) {
                $p = $this->request->getFile($pKey);
                if ($p !== null && $p->getError() !== UPLOAD_ERR_NO_FILE) {
                    $rawFiles[] = $p;
                }
            }
        }

        $validFiles = [];
        if (is_array($rawFiles)) {
            foreach ($rawFiles as $f) {
                if ($f instanceof \CodeIgniter\HTTP\Files\UploadedFile && $f->getError() !== UPLOAD_ERR_NO_FILE) {
                    $validFiles[] = $f;
                }
            }
        }

        if (! $this->validateData($input, [
            'animal_name' => ($lost ? 'required' : 'permit_empty') . '|max_length[120]',
            'species' => 'required|in_list[perro]',
            'district_id' => 'required|is_natural_no_zero|is_not_unique[districts.id]',
            'address' => 'required|max_length[255]',
            'description' => 'required|max_length[2000]',
            'shelter_address' => 'permit_empty|max_length[255]',
            'contact_name' => ($lost ? 'required' : 'permit_empty') . '|max_length[120]',
            'contact_email' => 'permit_empty|valid_email|max_length[254]',
            'contact_phone' => 'permit_empty|max_length[40]',
        ]) || ($lost && $input['contact_email'] === '' && $input['contact_phone'] === '')) {
            return $this->response->setStatusCode(422)->setJSON([
                'message' => 'Revisá los datos requeridos y el formato del correo. Para un extravío, dejá un correo o teléfono.',
            ]);
        }

        $maxPhotos = $lost ? 1 : 3;
        if (count($validFiles) > $maxPhotos) {
            return $this->response->setStatusCode(422)->setJSON([
                'message' => $lost ? 'Solo puede adjuntar una foto de extravío.' : 'Puede subir hasta 3 fotografías del animal.',
            ]);
        }

        foreach ($validFiles as $f) {
            if (! $f->isValid() || $f->getSizeByUnit('kb') > 5120) {
                return $this->response->setStatusCode(422)->setJSON(['message' => 'Cada foto debe pesar hasta 5 MB.']);
            }
            $mime = $f->getMimeType();
            if (! in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
                return $this->response->setStatusCode(422)->setJSON(['message' => 'Las fotos deben estar en formato JPEG, PNG o WebP.']);
            }
        }

        $input['share_contact'] = $input['share_contact'] === '1' ? 1 : 0;
        if ($lost) {
            $input['shelter_address'] = '';
        }
        foreach (['animal_name', 'shelter_address', 'contact_name', 'contact_email', 'contact_phone'] as $field) {
            $input[$field] = $input[$field] === '' ? null : $input[$field];
        }

        $savedFilenames = [];
        $directory = WRITEPATH . 'uploads/reports';
        $transaction = false;
        try {
            if ($validFiles !== []) {
                if (! is_dir($directory) && ! mkdir($directory, 0770, true) && ! is_dir($directory)) {
                    throw new \RuntimeException('No se pudo preparar el almacenamiento de fotos.');
                }
                foreach ($validFiles as $f) {
                    $fname = bin2hex(random_bytes(16)) . '.webp';
                    $fpath = $directory . DIRECTORY_SEPARATOR . $fname;
                    if (! service('image')->withFile($f->getTempName())->convert(IMAGETYPE_WEBP)->save($fpath)) {
                        throw new \RuntimeException('No se pudo guardar la foto.');
                    }
                    $savedFilenames[] = $fname;
                }
            }

            $primaryPhoto = $savedFilenames[0] ?? null;

            $transaction = $db->transBegin();
            if (! $transaction || ! $db->table('animal_reports')->insert($input + [
                'kind' => $kind,
                'animal_id' => $animal['id'] ?? null,
                'photo_path' => $primaryPhoto,
                'created_at' => gmdate('Y-m-d H:i:s'),
            ])) {
                throw new \RuntimeException('No se pudo guardar el aviso.');
            }
            $reportId = (int) $db->insertID();

            if ($savedFilenames !== [] && $db->tableExists('report_photos')) {
                foreach ($savedFilenames as $sortOrder => $fname) {
                    $db->table('report_photos')->insert([
                        'report_id' => $reportId,
                        'photo_path' => $fname,
                        'sort_order' => $sortOrder,
                        'created_at' => gmdate('Y-m-d H:i:s'),
                    ]);
                }
            }

            (new ReportNotifications($db))->capture($reportId, $kind, $input, $animal);
            if (! $db->transStatus() || ! $db->transCommit()) {
                throw new \RuntimeException('No se pudo guardar el aviso y su notificación.');
            }
        } catch (Throwable $error) {
            if ($transaction) {
                $db->transRollback();
            }
            foreach ($savedFilenames as $fname) {
                $delPath = $directory . DIRECTORY_SEPARATOR . $fname;
                if (is_file($delPath)) {
                    unlink($delPath);
                }
            }
            throw $error;
        }

        return $this->response->setStatusCode(201)->setJSON(['message' => 'Tu aviso quedó registrado.']);
    }
}
