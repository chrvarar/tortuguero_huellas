<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateRememberTokens extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'selector' => ['type' => 'CHAR', 'constraint' => 32],
            'validator_hash' => ['type' => 'CHAR', 'constraint' => 64],
            'user_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'expires_at' => ['type' => 'DATETIME'],
        ]);
        $this->forge->addKey('selector', true);
        $this->forge->addKey('user_id');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('remember_tokens');
    }

    public function down()
    {
        $this->forge->dropTable('remember_tokens');
    }
}
