<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use RuntimeException;

class DemoSeeder extends Seeder
{
    public function run()
    {
        if (ENVIRONMENT !== 'development' || (env('TORTUGUERO_HUELLAS_DEMO_SEED', false) !== true && env('VITALINK_DEMO_SEED', false) !== true)) {
            throw new RuntimeException('Los datos de demo requieren desarrollo local habilitado explícitamente.');
        }

        $this->db->transException(true)->transStart();

        foreach (['superusuario', 'administrador'] as $role) {
            $user = ['username' => $role];
            $hash = password_hash($role, PASSWORD_DEFAULT);
            if ($this->db->table('users')->where($user)->countAllResults() === 0) {
                $this->db->table('users')->insert($user + [
                    'role' => $role,
                    'password_hash' => $hash,
                ]);
            } else {
                $this->db->table('users')->where($user)->update([
                    'role' => $role,
                    'password_hash' => $hash,
                ]);
            }
        }

        $districtIds = [];
        foreach (['Carmen', 'Catedral', 'Zapote'] as $name) {
            $districtIds[$name] = $this->findOrInsert('districts', [
                'province' => 'San José',
                'canton' => 'San José',
                'name' => $name,
            ]);
        }

        $animals = [
            ['Luna', 'perro', 'hogar', 'activo', 'Carmen'],
            ['Toby', 'perro', 'calle', 'activo', 'Carmen'],
            ['Mora', 'perro', 'albergue', 'activo', 'Catedral'],
            ['Nube', 'perro', 'calle', 'archivado', 'Carmen'],
            ['Chispa', 'perro', 'hogar', 'inactivo', 'Carmen'],
        ];

        foreach ($animals as [$name, $species, $condition, $status, $district]) {
            $code = substr(hash('sha256', 'vitalink-demo:' . $name), 0, 32);
            $this->findOrInsert('animals', [
                'public_code' => $code,
            ], [
                'qr_code' => $code,
                'name' => $name,
                'species' => $species,
                'living_condition' => $condition,
                'status' => $status,
                'district_id' => $districtIds[$district],
                'address' => 'Ubicación ficticia para la demostración',
            ]);
        }

        $this->call('DemoAdoptionsSeeder');

        if (! $this->db->transComplete()) {
            throw new RuntimeException('No se pudo cargar el conjunto de datos de demostración.');
        }
    }

    private function findOrInsert(string $table, array $key, array $values = []): int
    {
        $row = $this->db->table($table)->select('id')->where($key)->get()->getRowArray();
        if ($row !== null) {
            return (int) $row['id'];
        }

        $this->db->table($table)->insert($key + $values);

        return (int) $this->db->insertID();
    }
}
