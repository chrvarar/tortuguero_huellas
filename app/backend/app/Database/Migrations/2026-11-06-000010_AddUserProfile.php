<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddUserProfile extends Migration
{
    public function up()
    {
        $this->forge->addColumn('users', [
            'display_name' => ['type' => 'VARCHAR', 'constraint' => 120, 'null' => true],
            'avatar_path' => ['type' => 'VARCHAR', 'constraint' => 64, 'null' => true],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('users', ['display_name', 'avatar_path']);
    }
}
