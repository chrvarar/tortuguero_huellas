<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateDistricts extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'province' => ['type' => 'VARCHAR', 'constraint' => 80],
            'canton' => ['type' => 'VARCHAR', 'constraint' => 80],
            'name' => ['type' => 'VARCHAR', 'constraint' => 80],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey(['province', 'canton', 'name']);
        $this->forge->createTable('districts', false, ['ENGINE' => 'InnoDB']);
    }

    public function down()
    {
        $this->forge->dropTable('districts', true);
    }
}
