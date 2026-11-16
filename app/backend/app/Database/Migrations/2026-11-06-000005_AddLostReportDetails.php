<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddLostReportDetails extends Migration
{
    public function up()
    {
        $this->forge->addColumn('animal_reports', [
            'photo_path' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'resolved_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('animal_reports', ['photo_path', 'resolved_at']);
    }
}
