<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use RuntimeException;

class CreateTerritoryCatalog extends Migration
{
    public function up()
    {
        $path = APPPATH . 'Database/Seeds/territory-2026.json';
        $rows = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        if (count($rows) !== 494) {
            throw new RuntimeException('El catálogo DTA 2026 debe contener 494 distritos.');
        }

        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true],
            'name' => ['type' => 'VARCHAR', 'constraint' => 80],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('provinces', false, ['ENGINE' => 'InnoDB']);

        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true],
            'province_id' => ['type' => 'INT', 'unsigned' => true],
            'name' => ['type' => 'VARCHAR', 'constraint' => 80],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey('province_id');
        $this->forge->addForeignKey('province_id', 'provinces', 'id', 'RESTRICT', 'RESTRICT');
        $this->forge->createTable('cantons', false, ['ENGINE' => 'InnoDB']);

        $provinces = [];
        $cantons = [];
        foreach ($rows as $row) {
            $provinces[$row['province_code']] = ['id' => $row['province_code'], 'name' => $row['province']];
            $cantons[$row['canton_code']] = [
                'id' => $row['canton_code'], 'province_id' => $row['province_code'], 'name' => $row['canton'],
            ];
        }
        if (count($provinces) !== 7 || count($cantons) !== 84) {
            throw new RuntimeException('El catálogo DTA 2026 debe contener 7 provincias y 84 cantones.');
        }
        $this->db->table('provinces')->insertBatch(array_values($provinces));
        $this->db->table('cantons')->insertBatch(array_values($cantons));

        // Se conservan los ID existentes porque animales y avisos los referencian.
        $this->forge->addColumn('districts', [
            'official_code' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'canton_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
        ]);
        $existing = [];
        foreach ($this->db->table('districts')->get()->getResultArray() as $district) {
            $existing[$district['province'] . '|' . $district['canton'] . '|' . $district['name']] = $district['id'];
        }
        foreach ($rows as $row) {
            $key = $row['province'] . '|' . $row['canton'] . '|' . $row['name'];
            $values = ['official_code' => $row['code'], 'canton_id' => $row['canton_code']];
            if (isset($existing[$key])) {
                $this->db->table('districts')->where('id', $existing[$key])->update($values);
            } else {
                $this->db->table('districts')->insert($values + [
                    'province' => $row['province'], 'canton' => $row['canton'], 'name' => $row['name'],
                ]);
            }
        }
        $this->db->query('CREATE UNIQUE INDEX districts_official_code_unique ON districts (official_code)');
        $this->db->query('CREATE INDEX districts_canton_id_index ON districts (canton_id)');
        $this->db->query('ALTER TABLE districts ADD CONSTRAINT fk_districts_canton FOREIGN KEY (canton_id) REFERENCES cantons(id)');
    }

    public function down()
    {
        $this->db->query('ALTER TABLE districts DROP FOREIGN KEY fk_districts_canton');
        $this->db->query('DROP INDEX districts_canton_id_index ON districts');
        $this->db->query('DROP INDEX districts_official_code_unique ON districts');
        // Los distritos se conservan al revertir para no borrar expedientes vinculados.
        $this->forge->dropColumn('districts', ['official_code', 'canton_id']);
        $this->forge->dropTable('cantons', true);
        $this->forge->dropTable('provinces', true);
    }
}
