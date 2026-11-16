<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddUserEmail extends Migration
{
    public function up()
    {
        $this->forge->addColumn('users', [
            'email' => ['type' => 'VARCHAR', 'constraint' => 254, 'null' => true],
        ]);
        $this->db->query('CREATE UNIQUE INDEX users_email_unique ON users (email)');
    }

    public function down()
    {
        $this->db->query('DROP INDEX users_email_unique ON users');
        $this->forge->dropColumn('users', 'email');
    }
}
