<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateAnimalReports extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'kind' => ['type' => 'ENUM', 'constraint' => ['hallazgo', 'extravio']],
            'animal_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'animal_name' => ['type' => 'VARCHAR', 'constraint' => 120, 'null' => true],
            'species' => ['type' => 'ENUM', 'constraint' => ['perro']],
            'district_id' => ['type' => 'INT', 'unsigned' => true],
            'address' => ['type' => 'VARCHAR', 'constraint' => 255],
            'description' => ['type' => 'TEXT'],
            'shelter_address' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'contact_name' => ['type' => 'VARCHAR', 'constraint' => 120, 'null' => true],
            'contact_email' => ['type' => 'VARCHAR', 'constraint' => 254, 'null' => true],
            'contact_phone' => ['type' => 'VARCHAR', 'constraint' => 40, 'null' => true],
            'share_contact' => ['type' => 'TINYINT', 'unsigned' => true, 'default' => 0],
            'created_at' => ['type' => 'DATETIME'],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('animal_id', 'animals', 'id', 'RESTRICT', 'SET NULL');
        $this->forge->addForeignKey('district_id', 'districts', 'id', 'RESTRICT', 'RESTRICT');
        $this->forge->createTable('animal_reports', false, ['ENGINE' => 'InnoDB']);
    }

    public function down()
    {
        $this->forge->dropTable('animal_reports', true);
    }
}
