<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class SeparateAnimalQrCodes extends Migration
{
    public function up()
    {
        $this->forge->addColumn('animals', [
            'qr_code' => ['type' => 'CHAR', 'constraint' => 32, 'null' => true],
        ]);
        $this->db->table('animals')->set('qr_code', 'public_code', false)->update();
        $this->forge->addUniqueKey('qr_code', 'uq_animals_qr_code');
        $this->forge->processIndexes('animals');

        $this->forge->addField([
            'code' => ['type' => 'CHAR', 'constraint' => 32],
            'retired_at' => ['type' => 'DATETIME'],
        ]);
        $this->forge->addKey('code', true);
        $this->forge->createTable('retired_qr_codes', false, ['ENGINE' => 'InnoDB']);
    }

    public function down()
    {
        $this->forge->dropTable('retired_qr_codes', true);
        $this->forge->dropColumn('animals', 'qr_code');
    }
}
