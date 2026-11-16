<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateAdoptions extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'animal_id' => ['type' => 'INT', 'unsigned' => true],
            'shelter_name' => ['type' => 'VARCHAR', 'constraint' => 120],
            'age_label' => ['type' => 'VARCHAR', 'constraint' => 80],
            'story' => ['type' => 'TEXT'],
            'published' => ['type' => 'TINYINT', 'unsigned' => true, 'default' => 1],
            'is_demo' => ['type' => 'TINYINT', 'unsigned' => true, 'default' => 0],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('animal_id');
        $this->forge->addForeignKey('animal_id', 'animals', 'id', 'RESTRICT', 'CASCADE');
        $this->forge->createTable('adoption_profiles', false, ['ENGINE' => 'InnoDB']);

        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'profile_id' => ['type' => 'INT', 'unsigned' => true],
            'name' => ['type' => 'VARCHAR', 'constraint' => 120],
            'email' => ['type' => 'VARCHAR', 'constraint' => 254],
            'phone' => ['type' => 'VARCHAR', 'constraint' => 40, 'null' => true],
            'message' => ['type' => 'TEXT'],
            'created_at' => ['type' => 'DATETIME'],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('profile_id', 'adoption_profiles', 'id', 'RESTRICT', 'RESTRICT');
        $this->forge->createTable('adoption_requests', false, ['ENGINE' => 'InnoDB']);
    }

    public function down()
    {
        $this->forge->dropTable('adoption_requests', true);
        $this->forge->dropTable('adoption_profiles', true);
    }
}
