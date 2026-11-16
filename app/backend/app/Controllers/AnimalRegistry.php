<?php

namespace App\Controllers;

use App\Models\TerritoryModel;
use CodeIgniter\HTTP\ResponseInterface;
use Throwable;

class AnimalRegistry extends BaseController
{
    private const PHOTO_RULES = 'uploaded[photo]|max_size[photo,5120]|max_dims[photo,4096,4096]|is_image[photo]|mime_in[photo,image/jpeg,image/png,image/webp]';

    public function index(): ResponseInterface
    {
        if ($denied = $this->denyUnless(['superusuario', 'administrador', 'colaborador', 'general'])) {
            return $denied;
        }

        $search = trim((string) ($this->request->getGet('q') ?? ''));
        $limit = min(500, max(1, (int) ($this->request->getGet('limit') ?? 100)));
        $offset = max(0, (int) ($this->request->getGet('offset') ?? 0));

        $query = db_connect()->table('animals')->select('id, name, species, qr_code AS code, status, living_condition, owner_email');
        $user = session()->get('vitalink_user');
        if ($user['role'] === 'general') {
            $query->where('owner_id', $user['id'] ?? 0);
        }
        if ($search !== '') {
            $query->groupStart()
                ->like('name', $search)
                ->orWhere('id', ctype_digit($search) ? (int) $search : -1)
                ->groupEnd();
        }
        $animals = $query->orderBy('id', 'DESC')->get($limit, $offset)->getResultArray();

        return $this->response->noCache()->setJSON(['animals' => $animals]);
    }

    public function ownerEmail(string $id): ResponseInterface
    {
        if ($denied = $this->denyUnless(['superusuario', 'administrador'])) {
            return $denied;
        }

        $email = $this->request->getPost('owner_email');
        if (! is_string($email) || strlen(trim($email)) > 254
            || (trim($email) !== '' && filter_var(trim($email), FILTER_VALIDATE_EMAIL) === false)) {
            return $this->response->setStatusCode(422)->setJSON(['message' => 'Ingresá un correo válido.']);
        }

        $table = db_connect()->table('animals');
        $scope = ['id' => $id, 'living_condition' => 'hogar', 'status' => 'activo'];
        if ($table->where($scope)->countAllResults() === 0) {
            return $this->response->setStatusCode(404)->setJSON(['message' => 'No encontramos un expediente activo con hogar.']);
        }
        $table->where($scope)->update(['owner_email' => trim($email) === '' ? null : trim($email)]);

        return $this->response->setStatusCode(204);
    }

    public function detail(string $id): ResponseInterface
    {
        if ($denied = $this->denyUnless(['superusuario', 'administrador', 'colaborador', 'general'])) {
            return $denied;
        }

        $query = db_connect()->table('animals')
            ->select('id, name, species, qr_code AS code, status, living_condition, owner_email, district_id, address, observations')
            ->where('id', $id);
        $user = session()->get('vitalink_user');
        if ($user['role'] === 'general') {
            $query->where('owner_id', $user['id'] ?? 0);
        }
        $animal = $query->get()->getRowArray();

        return $animal === null ? $this->unavailable() : $this->response->noCache()->setJSON($animal);
    }

    public function census(): ResponseInterface
    {
        if ($denied = $this->denyUnless(['superusuario', 'administrador', 'colaborador'])) {
            return $denied;
        }

        $species = $this->request->getGet('species');
        $condition = $this->request->getGet('condition');
        $district = $this->request->getGet('district_id');
        $province = $this->request->getGet('province_id');
        $canton = $this->request->getGet('canton_id');
        if (! in_array($species, [null, '', 'perro'], true)
            || ! in_array($condition, [null, '', 'hogar', 'calle', 'albergue'], true)
            || ($district !== null && $district !== '' && (! is_string($district) || ! ctype_digit($district) || strlen($district) > 10))
            || ($province !== null && $province !== '' && (! is_string($province) || ! ctype_digit($province) || strlen($province) > 2))
            || ($canton !== null && $canton !== '' && (! is_string($canton) || ! ctype_digit($canton) || strlen($canton) > 3))) {
            return $this->response->setStatusCode(422)->setJSON(['message' => 'Revisá los filtros del censo.']);
        }

        $districts = (new TerritoryModel())->census($species, $condition, $province, $canton, $district);

        return $this->response->noCache()->setJSON(['districts' => $districts]);
    }

    public function create(): ResponseInterface
    {
        if ($denied = $this->denyUnless(['superusuario', 'administrador', 'colaborador', 'general'])) {
            return $denied;
        }

        $input = $this->request->getPost(['name', 'species', 'district_id', 'address', 'observations', 'living_condition']);
        $user = session()->get('vitalink_user');
        $general = $user['role'] === 'general';
        if ($general && empty($user['id'])) {
            return $this->response->setStatusCode(401)->setJSON(['message' => 'Volvé a iniciar sesión para registrar a tu compañero.']);
        }
        $input['living_condition'] = $input['living_condition'] ?: ($general ? 'hogar' : 'calle');
        foreach (['name', 'address', 'observations'] as $field) {
            $input[$field] = is_string($input[$field]) ? trim($input[$field]) : '';
        }

        if (! $this->validateData($input, [
            'name' => 'required|max_length[120]',
            'species' => 'required|in_list[perro]',
            'living_condition' => 'required|in_list[hogar,calle,albergue]',
            'district_id' => 'required|is_natural_no_zero|is_not_unique[districts.id]',
            'address' => 'required|max_length[255]',
            'observations' => 'required|max_length[2000]',
            'photo' => self::PHOTO_RULES,
        ])) {
            return $this->response->setStatusCode(422)->setJSON([
                'message' => 'Revisá los datos. La foto debe ser JPEG, PNG o WebP, pesar hasta 5 MB y medir hasta 4096 × 4096 píxeles.',
                'errors' => $this->validator->getErrors(),
            ]);
        }

        $code = bin2hex(random_bytes(16));
        $filename = $code . '.webp';

        try {
            $this->writePhoto($filename);
            $db = db_connect();
            $created = $db->table('animals')->insert($input + [
                'public_code' => $code,
                'qr_code' => $code,
                'status' => 'activo',
                'photo_path' => $filename,
                'owner_id' => $general ? $user['id'] : null,
            ]);
            if (! $created) {
                throw new \RuntimeException('No se pudo guardar el expediente.');
            }
        } catch (Throwable $error) {
            $this->removePhoto($filename);
            throw $error;
        }

        return $this->response->setStatusCode(201)->setJSON([
            'id' => $db->insertID(),
            'code' => $code,
            'name' => $input['name'],
        ]);
    }

    public function edit(string $id): ResponseInterface
    {
        if ($denied = $this->denyUnless(['superusuario', 'administrador'])) {
            return $denied;
        }

        $input = $this->request->getPost(['name', 'species', 'district_id', 'address', 'observations', 'living_condition']);
        foreach (['name', 'address', 'observations'] as $field) {
            $input[$field] = is_string($input[$field]) ? trim($input[$field]) : '';
        }
        $rules = [
            'name' => 'required|max_length[120]', 'species' => 'required|in_list[perro]',
            'living_condition' => 'required|in_list[hogar,calle,albergue]',
            'district_id' => 'required|is_natural_no_zero|is_not_unique[districts.id]',
            'address' => 'required|max_length[255]', 'observations' => 'permit_empty|max_length[2000]',
        ];
        $photo = $this->request->getFile('photo');
        if ($photo !== null && $photo->getError() !== UPLOAD_ERR_NO_FILE) {
            $rules['photo'] = self::PHOTO_RULES;
        }
        if (! $this->validateData($input, $rules)) {
            return $this->response->setStatusCode(422)->setJSON(['message' => 'Revisá los datos y el tamaño o formato de la foto.']);
        }

        $db = db_connect();
        $filename = isset($rules['photo']) ? bin2hex(random_bytes(16)) . '.webp' : null;
        if (! $db->transBegin()) {
            throw new \RuntimeException('No se pudo iniciar la edición.');
        }
        try {
            $table = $db->table('animals');
            $query = $table->select('photo_path')->where('id', $id)->getCompiledSelect();
            $animal = $db->query($query . ' FOR UPDATE')->getRowArray();
            if ($animal === null) {
                $db->transRollback();
                return $this->unavailable();
            }
            if ($filename !== null) {
                $this->writePhoto($filename);
                $input['photo_path'] = $filename;
            }
            if (! $table->where('id', $id)->update($input) || ! $db->transCommit()) {
                throw new \RuntimeException('No se pudo guardar el expediente.');
            }
        } catch (Throwable $error) {
            $db->transRollback();
            $this->removePhoto($filename);
            throw $error;
        }
        if ($filename !== null) {
            $this->removePhoto($animal['photo_path']);
        }

        return $this->response->setStatusCode(204);
    }

    public function remove(string $id): ResponseInterface
    {
        if ($denied = $this->denyUnless(['superusuario', 'administrador'])) {
            return $denied;
        }

        $db = db_connect();
        if (! $db->transBegin()) {
            throw new \RuntimeException('No se pudo iniciar la eliminación.');
        }
        try {
            $table = $db->table('animals');
            $query = $table->select('photo_path, qr_code')->where('id', $id)->getCompiledSelect();
            $animal = $db->query($query . ' FOR UPDATE')->getRowArray();
            if ($animal === null) {
                $db->transRollback();
                return $this->unavailable();
            }

            $reports = $db->table('animal_reports')->where('animal_id', $id)->countAllResults();
            $adoption = $db->table('adoption_profiles')->where('animal_id', $id)->countAllResults();
            if ($reports > 0 || $adoption > 0) {
                $db->transRollback();
                return $this->response->setStatusCode(409)->setJSON([
                    'message' => 'Este expediente tiene avisos o un perfil de adopción. Archivalo para conservar su historial.',
                ]);
            }

            if ($animal['qr_code'] !== null) {
                $db->table('retired_qr_codes')->insert(['code' => $animal['qr_code'], 'retired_at' => gmdate('Y-m-d H:i:s')]);
            }
            if (! $table->where('id', $id)->delete() || ! $db->transStatus() || ! $db->transCommit()) {
                throw new \RuntimeException('No se pudo eliminar el expediente.');
            }
        } catch (Throwable $error) {
            $db->transRollback();
            throw $error;
        }
        $this->removePhoto($animal['photo_path']);

        return $this->response->setStatusCode(204);
    }

    public function changeQr(string $id, string $action): ResponseInterface
    {
        if ($denied = $this->denyUnless(['superusuario', 'administrador'])) {
            return $denied;
        }

        $db = db_connect();
        $code = $action === 'reemplazar' ? bin2hex(random_bytes(16)) : null;
        if (! $db->transBegin()) {
            throw new \RuntimeException('No se pudo iniciar el cambio de QR.');
        }
        try {
            $table = $db->table('animals');
            $query = $table->select('qr_code')->where(['id' => $id, 'status' => 'activo'])->getCompiledSelect();
            $animal = $db->query($query . ' FOR UPDATE')->getRowArray();
            if ($animal === null) {
                $db->transRollback();
                return $this->response->setStatusCode(404)->setJSON(['message' => 'No encontramos un expediente activo.']);
            }

            if ($animal['qr_code'] !== null) {
                $db->table('retired_qr_codes')->insert(['code' => $animal['qr_code'], 'retired_at' => gmdate('Y-m-d H:i:s')]);
            }
            $table->where('id', $id)->update(['qr_code' => $code]);
            if (! $db->transStatus() || ! $db->transCommit()) {
                throw new \RuntimeException('No se pudo guardar el cambio de QR.');
            }
        } catch (Throwable $error) {
            $db->transRollback();
            throw $error;
        }

        return $this->response->noCache()->setJSON(['code' => $code]);
    }

    public function archive(string $id): ResponseInterface
    {
        if ($denied = $this->denyUnless(['superusuario', 'administrador'])) {
            return $denied;
        }

        $db = db_connect();
        $db->table('animals')->where(['id' => $id, 'status' => 'activo'])->update(['status' => 'archivado']);
        if ($db->affectedRows() === 0) {
            return $this->response->setStatusCode(404)->setJSON(['message' => 'No encontramos un expediente activo.']);
        }

        return $this->response->setStatusCode(204);
    }

    public function profile(string $code): ResponseInterface
    {
        $db = db_connect();
        $animal = $db->table('animals')
            ->select('animals.name, animals.species, animals.status, animals.photo_path, districts.name AS district')
            ->join('districts', 'districts.id = animals.district_id')
            ->where('animals.qr_code', $code)->get()->getRowArray();

        if ($animal === null) {
            if ($db->table('retired_qr_codes')->where('code', $code)->countAllResults() > 0) {
                return $this->response->noCache()->setStatusCode(410)->setJSON(['message' => 'Código fuera de servicio.']);
            }
            return $this->unavailable();
        }
        if ($animal['status'] !== 'activo') {
            return $this->unavailable();
        }

        $lost = db_connect()->table('animal_reports')->select('animal_reports.id')
            ->join('animals', 'animals.id = animal_reports.animal_id')
            ->where(['animals.qr_code' => $code, 'animal_reports.kind' => 'extravio', 'resolved_at' => null])
            ->limit(1)->get()->getRowArray() !== null;

        return $this->response->noCache()->setJSON([
            'name' => $animal['name'],
            'species' => $animal['species'],
            'district' => $animal['district'],
            'lost' => $lost,
            'photo' => $animal['photo_path'] === null ? null : '/api/ficha/' . $code . '/foto',
        ]);
    }

    public function photo(string $code): ResponseInterface
    {
        $animal = db_connect()->table('animals')->select('photo_path')
            ->where(['qr_code' => $code, 'status' => 'activo'])->get()->getRowArray();

        return $this->image($animal['photo_path'] ?? '');
    }

    public function adoptionPhoto(string $code): ResponseInterface
    {
        $animal = db_connect()->table('animals')->select('animals.photo_path')
            ->join('adoption_profiles', 'adoption_profiles.animal_id = animals.id')
            ->where(['animals.public_code' => $code, 'animals.status' => 'activo',
                'animals.living_condition' => 'albergue', 'adoption_profiles.published' => 1])->get()->getRowArray();

        return $this->image($animal['photo_path'] ?? '');
    }

    private function image(string $filename): ResponseInterface
    {
        $path = WRITEPATH . 'uploads/animals/' . basename($filename);
        if ($filename === '' || ! is_file($path)) {
            return $this->unavailable();
        }

        return $this->response->noCache()->setContentType(mime_content_type($path))
            ->setHeader('X-Content-Type-Options', 'nosniff')->setBody(file_get_contents($path));
    }

    private function writePhoto(string $filename): void
    {
        $directory = WRITEPATH . 'uploads/animals';
        if (! is_dir($directory) && ! mkdir($directory, 0770, true) && ! is_dir($directory)) {
            throw new \RuntimeException('No se pudo preparar el almacenamiento de fotos.');
        }
        $photo = $this->request->getFile('photo');
        // La nueva codificación elimina metadatos como las coordenadas GPS.
        if (! service('image')->withFile($photo->getTempName())->convert(IMAGETYPE_WEBP)->save($directory . DIRECTORY_SEPARATOR . $filename)) {
            throw new \RuntimeException('No se pudo guardar la foto.');
        }
    }

    private function removePhoto(?string $filename): void
    {
        if ($filename !== null && preg_match('/\A[a-f0-9]{32}\.webp\z/', $filename) === 1) {
            $path = WRITEPATH . 'uploads/animals/' . $filename;
            if (is_file($path) && ! unlink($path)) {
                log_message('warning', 'No se pudo retirar una foto de expediente.');
            }
        }
    }

    private function unavailable(): ResponseInterface
    {
        return $this->response->noCache()->setStatusCode(404)->setJSON(['message' => 'Esta ficha no está disponible.']);
    }
}
