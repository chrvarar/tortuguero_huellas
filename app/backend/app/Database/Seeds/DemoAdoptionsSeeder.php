<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use RuntimeException;

class DemoAdoptionsSeeder extends Seeder
{
    public function run()
    {
        if (ENVIRONMENT !== 'development' || (env('TORTUGUERO_HUELLAS_DEMO_SEED', false) !== true && env('VITALINK_DEMO_SEED', false) !== true)) {
            throw new RuntimeException('Los datos de demo requieren desarrollo local habilitado explícitamente.');
        }

        // Retirar perfiles de demostración anteriores (gatos o perros reemplazados) si no tienen solicitudes vinculadas.
        $legacyNames = ['Canela', 'Trigo', 'Nina', 'Milo', 'Peca'];
        $legacyCodes = array_map(
            static fn (string $name): string => substr(hash('sha256', 'vitalink-demo:' . $name), 0, 32),
            $legacyNames
        );
        $legacyAnimals = $this->db->table('animals')->select('id, photo_path')
            ->whereIn('public_code', $legacyCodes)->get()->getResultArray();
        foreach ($legacyAnimals as $legacy) {
            $profile = $this->db->table('adoption_profiles')->select('id')
                ->where('animal_id', $legacy['id'])->get()->getRowArray();
            if ($profile !== null) {
                $hasRequests = $this->db->table('adoption_requests')
                    ->where('profile_id', $profile['id'])->countAllResults() > 0;
                if ($hasRequests) {
                    continue;
                }
                $this->db->table('adoption_profiles')->where('id', $profile['id'])->delete();
            }
            $this->db->table('animal_reports')->where('animal_id', $legacy['id'])->update(['animal_id' => null]);
            $this->db->table('animals')->where('id', $legacy['id'])->delete();
            if (! empty($legacy['photo_path'])) {
                $oldFile = WRITEPATH . 'uploads/animals/' . basename($legacy['photo_path']);
                if (is_file($oldFile)) {
                    @unlink($oldFile);
                }
            }
        }

        // 10 perros de demostración distribuidos en San José Central: 3 Carmen, 3 Zapote y 4 Catedral.
        $profiles = [
            ['Mora', 'perro', 'Catedral', '2 años · noble y leal',
                'Historia de rescate (demo): Mora fue encontrada bajo un puente peatonal en Catedral después de un fuerte aguacero, buscando comida y refugio. Con atención veterinaria y cariño recuperó toda su alegría. Hoy luce su collar verde con orgullo y sueña con una familia que la lleve a caminar cada tarde.', 'dog1.jpeg'],
            ['Zorro', 'perro', 'Carmen', '2 años · alegre y energético',
                'Historia de rescate (demo): A Zorro lo rescataron cerca de un parque en el distrito Carmen mientras seguía a los transeúntes moviendo su cola esponjosa. Es un compañero vivaz de pelaje rojizo que disfruta jugar al aire libre y recibir caricias después de cada paseo.', 'dog2.jpeg'],
            ['Lucas', 'perro', 'Zapote', '5 meses · juguetón y fiel',
                'Historia de rescate (demo): Lucas apareció solito cerca de una cancha en Zapote cuando apenas tenía tres meses. Fue resguardado de inmediato y ya cuenta con sus vacunas al día. Le encanta correr tras pelotas suaves y quedarse dormido junto a quien lo cuida.', 'dog5.jpeg'],
            ['Oso', 'perro', 'Catedral', '4 meses · tierno y curioso',
                'Historia de rescate (demo): Oso fue rescatado junto a su camada en un lote baldío de Catedral. Este cachorrito de pelaje oscuro y patitas color fuego observa todo con curiosidad y adora explorar jardines tranquilos antes de acurrucarse en una cobija tibia.', 'dog3.jpeg'],
            ['Pirata', 'perro', 'Carmen', '3 años · sociable y aventurero',
                'Historia de rescate (demo): Pirata, distinguido por la mancha canela en su ojito, sobrevivió varios meses en calles del Carmen hasta que una vecina avisó al albergue. Es muy sociable con personas y disfruta pasear con correa bajo el sol de la mañana.', 'dog6.jpeg'],
            ['Miel', 'perro', 'Zapote', '1 año · dulce y afectuosa',
                'Historia de rescate (demo): Miel fue encontrada desorientada y con su pelaje rizado enredado tras una tormenta en Zapote. Después de un baño tibio y revisión veterinaria, mostró su carácter sumamente tierno. Busca un hogar sereno donde compartir siestas sobre el césped.', 'dog7.jpeg'],
            ['Bruno', 'perro', 'Catedral', '4 meses · dócil y protector',
                'Historia de rescate (demo): Bruno llegó al albergue desde Catedral siendo muy pequeño y tímido, pero en pocas semanas se volvió un cachorro atento y muy dócil. Le gusta sentarse tranquilo a escuchar a las personas y esperar pacientemente su premio.', 'dog4.jpeg'],
            ['Barón', 'perro', 'Carmen', '4 años · sereno y compañero',
                'Historia de rescate (demo): Barón fue abandonado frente a un portón en el distrito Carmen, donde esperó en calma hasta ser auxiliado. Es un perro adulto de porte noble que cruza sus patitas para descansar y resulta ideal para una familia que busque paz y lealtad.', 'dog8.jpeg'],
            ['Pecas', 'perro', 'Zapote', '3 meses · curioso y cariñoso',
                'Historia de rescate (demo): Pecas, llamado así por las simpáticas manchitas de su hocico y sus patas blancas, fue hallado dentro de una caja en Zapote. Hoy crece sano y fuerte, siempre dispuesto a jugar en el patio y regalar lamidas de cariño.', 'dog9.jpeg'],
            ['Roco', 'perro', 'Catedral', '3 meses · valiente y mimoso',
                'Historia de rescate (demo): Roco apareció buscando abrigo cerca de una parada de autobús en Catedral. Aunque era el más pequeñito del grupo, demostró una valentía enorme al recuperarse por completo. Hoy espera una familia que lo vea crecer con amor.', 'dog10.jpeg'],
        ];

        foreach ($profiles as [$name, $species, $districtName, $age, $story, $photo]) {
            $code = substr(hash('sha256', 'vitalink-demo:' . $name), 0, 32);
            $districtId = $this->districtId($districtName);
            $filename = $this->demoPhoto($code, $photo);
            $animal = $this->db->table('animals')->select('id, status, living_condition, photo_path')
                ->where('public_code', $code)->get()->getRowArray();

            if ($animal === null) {
                $this->db->table('animals')->insert([
                    'public_code' => $code,
                    'qr_code' => $code,
                    'name' => $name,
                    'species' => $species,
                    'living_condition' => 'albergue',
                    'status' => 'activo',
                    'district_id' => $districtId,
                    'address' => 'Ubicación ficticia para la demostración',
                    'photo_path' => $filename,
                ]);
                $animal = ['id' => $this->db->insertID(), 'status' => 'activo',
                    'living_condition' => 'albergue', 'photo_path' => $filename];
            } else {
                $this->db->table('animals')->where('id', $animal['id'])->update([
                    'species' => $species,
                    'district_id' => $districtId,
                    'photo_path' => $filename,
                ]);
            }

            if ($animal['status'] !== 'activo' || $animal['living_condition'] !== 'albergue') {
                continue;
            }

            $table = $this->db->table('adoption_profiles');
            if ($table->where('animal_id', $animal['id'])->countAllResults() === 0) {
                $table->insert([
                    'animal_id' => $animal['id'],
                    'shelter_name' => 'Albergue de demostración',
                    'age_label' => $age,
                    'story' => $story,
                    'published' => 1,
                    'is_demo' => 1,
                ]);
            } else {
                $table->where(['animal_id' => $animal['id'], 'is_demo' => 1])->update([
                    'age_label' => $age,
                    'story' => $story,
                ]);
            }
        }
    }

    private function districtId(string $name): int
    {
        $key = ['province' => 'San José', 'canton' => 'San José', 'name' => $name];
        $table = $this->db->table('districts');
        $row = $table->select('id')->where($key)->get()->getRowArray();
        if ($row !== null) {
            return (int) $row['id'];
        }

        $table->insert($key);
        return (int) $this->db->insertID();
    }

    private function demoPhoto(string $code, string $sourceName): string
    {
        $filename = $code . '.webp';
        $source = __DIR__ . '/demo-animals/' . $sourceName;
        $directory = WRITEPATH . 'uploads/animals/';
        $target = $directory . $filename;
        if (! is_dir($directory) && ! mkdir($directory, 0770, true) && ! is_dir($directory)) {
            throw new RuntimeException('No se pudo preparar el almacenamiento de fotos de demostración.');
        }
        if ((! is_file($target) || filemtime($source) > filemtime($target))
            && ! service('image')->withFile($source)->convert(IMAGETYPE_WEBP)->save($target)) {
            throw new RuntimeException('No se pudo preparar una foto de demostración.');
        }

        return $filename;
    }
}
