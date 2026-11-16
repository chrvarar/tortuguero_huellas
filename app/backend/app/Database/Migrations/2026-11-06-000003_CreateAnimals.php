<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateAnimals extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'public_code' => ['type' => 'CHAR', 'constraint' => 32],
            'name' => ['type' => 'VARCHAR', 'constraint' => 120],
            'species' => ['type' => 'ENUM', 'constraint' => ['perro']],
            'living_condition' => ['type' => 'ENUM', 'constraint' => ['hogar', 'calle', 'albergue']],
            'status' => ['type' => 'ENUM', 'constraint' => ['activo', 'inactivo', 'archivado'], 'default' => 'activo'],
            'district_id' => ['type' => 'INT', 'unsigned' => true],
            'address' => ['type' => 'VARCHAR', 'constraint' => 255],
            'observations' => ['type' => 'TEXT', 'null' => true],
            'photo_path' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'owner_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('public_code');
        $this->forge->addKey(['district_id', 'status', 'species', 'living_condition'], false, false, 'idx_animals_census');
        $this->forge->addForeignKey('district_id', 'districts', 'id', 'RESTRICT', 'RESTRICT');
        $this->forge->addForeignKey('owner_id', 'users', 'id', 'RESTRICT', 'SET NULL');
        $this->forge->createTable('animals', false, ['ENGINE' => 'InnoDB']);
    }

    public function down()
    {
        $this->forge->dropTable('animals', true);
    }
}
