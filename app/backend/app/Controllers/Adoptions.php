<?php

namespace App\Controllers;

use CodeIgniter\Database\BaseBuilder;
use CodeIgniter\HTTP\ResponseInterface;
use Throwable;

class Adoptions extends BaseController
{
    public function gallery(): ResponseInterface
    {
        $profiles = $this->publicProfiles()->orderBy('adoption_profiles.id', 'DESC')->get()->getResultArray();
        foreach ($profiles as &$profile) {
            $profile['photo'] = $profile['photo_path'] === null ? null : '/api/adopciones/' . $profile['code'] . '/foto';
            unset($profile['photo_path']);
        }
        unset($profile);

        return $this->response->noCache()->setJSON(['profiles' => $profiles]);
    }

    public function apply(string $code): ResponseInterface
    {
        $limit = 'vitalink-adoption-' . hash('sha256', $this->request->getIPAddress());
        if (! service('throttler')->check($limit, 10, MINUTE)) {
            return $this->response->setStatusCode(429)->setJSON(['message' => 'Esperá un momento antes de volver a intentar.']);
        }

        $input = $this->postFields(['name', 'email', 'phone', 'message']);
        if (! $this->validateData($input, [
            'name' => 'required|max_length[120]', 'email' => 'required|valid_email|max_length[254]',
            'phone' => 'permit_empty|max_length[40]', 'message' => 'required|max_length[2000]',
        ])) {
            return $this->response->setStatusCode(422)->setJSON(['message' => 'Completá el nombre, un correo válido y el mensaje.']);
        }

        $db = db_connect();
        $input['phone'] = $input['phone'] === '' ? null : $input['phone'];
        if (! $db->transBegin()) {
            throw new \RuntimeException('No se pudo iniciar el registro de la solicitud.');
        }
        try {
            // La disponibilidad se mantiene hasta guardar la solicitud, incluso si se retira el perfil a la vez.
            $query = $this->publicProfiles()->where('animals.public_code', $code)->getCompiledSelect();
            $profile = $db->query($query . ' FOR UPDATE')->getRowArray();
            if ($profile === null) {
                $db->transRollback();
                return $this->response->setStatusCode(404)->setJSON(['message' => 'Este perfil ya no está disponible para adopción.']);
            }

            if (! $db->table('adoption_requests')->insert($input + [
                'profile_id' => $profile['id'], 'created_at' => gmdate('Y-m-d H:i:s'),
            ]) || ! $db->transCommit()) {
                throw new \RuntimeException('No se pudo guardar la solicitud.');
            }
        } catch (Throwable $error) {
            $db->transRollback();
            throw $error;
        }

        return $this->response->setStatusCode(201)->setJSON(['message' => 'Tu solicitud quedó registrada.']);
    }

    public function management(): ResponseInterface
    {
        if ($denied = $this->denyUnlessManager('Necesitás una sesión autorizada para gestionar adopciones.')) {
            return $denied;
        }

        $db = db_connect();
        $profiles = $db->table('adoption_profiles')->select('animal_id, shelter_name, age_label, story, published')
            ->get()->getResultArray();
        $requests = $db->table('adoption_requests')->select('adoption_requests.*, animals.name AS animal_name')
            ->join('adoption_profiles', 'adoption_profiles.id = adoption_requests.profile_id')
            ->join('animals', 'animals.id = adoption_profiles.animal_id')
            ->orderBy('adoption_requests.id', 'DESC')->get(50)->getResultArray();

        return $this->response->noCache()->setJSON(['profiles' => $profiles, 'requests' => $requests]);
    }

    public function publish(string $id): ResponseInterface
    {
        if ($denied = $this->denyUnlessManager('Necesitás una sesión autorizada para gestionar adopciones.')) {
            return $denied;
        }

        $input = $this->postFields(['shelter_name', 'age_label', 'story']);
        if (! $this->validateData($input, [
            'shelter_name' => 'required|max_length[120]', 'age_label' => 'required|max_length[80]',
            'story' => 'required|max_length[2000]',
        ])) {
            return $this->response->setStatusCode(422)->setJSON(['message' => 'Completá el albergue, la edad aproximada y la historia.']);
        }

        $db = db_connect();
        $animal = $db->table('animals')->select('id')->where(['id' => $id, 'status' => 'activo', 'living_condition' => 'albergue'])
            ->get()->getRowArray();
        if ($animal === null) {
            return $this->response->setStatusCode(422)->setJSON(['message' => 'Seleccioná un expediente activo de albergue.']);
        }

        if (! $db->table('adoption_profiles')->upsert($input + ['animal_id' => $id, 'published' => 1])) {
            return $this->response->setStatusCode(500)->setJSON(['message' => 'No se pudo publicar el perfil.']);
        }

        return $this->response->setStatusCode(204);
    }

    public function unpublish(string $id): ResponseInterface
    {
        if ($denied = $this->denyUnlessManager('Necesitás una sesión autorizada para gestionar adopciones.')) {
            return $denied;
        }

        if (! db_connect()->table('adoption_profiles')->where('animal_id', $id)->update(['published' => 0])) {
            return $this->response->setStatusCode(500)->setJSON(['message' => 'No se pudo retirar el perfil.']);
        }

        return $this->response->setStatusCode(204);
    }

    private function publicProfiles(): BaseBuilder
    {
        return db_connect()->table('adoption_profiles')
            ->select('adoption_profiles.id, shelter_name, age_label, story, is_demo, animals.public_code AS code,
                animals.name, animals.species, animals.photo_path, districts.name AS district, districts.canton, districts.province')
            ->join('animals', 'animals.id = adoption_profiles.animal_id')
            ->join('districts', 'districts.id = animals.district_id')
            ->where(['adoption_profiles.published' => 1, 'animals.status' => 'activo', 'animals.living_condition' => 'albergue']);
    }
}
