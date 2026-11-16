<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateReportPhotos extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'report_id' => ['type' => 'INT', 'unsigned' => true],
            'photo_path' => ['type' => 'VARCHAR', 'constraint' => 255],
            'sort_order' => ['type' => 'TINYINT', 'unsigned' => true, 'default' => 0],
            'created_at' => ['type' => 'DATETIME'],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey(['report_id', 'sort_order']);
        $this->forge->addForeignKey('report_id', 'animal_reports', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('report_photos', false, ['ENGINE' => 'InnoDB']);

        $db = $this->db;
        $existing = $db->table('animal_reports')
            ->select('id, photo_path, created_at')
            ->where('photo_path IS NOT NULL')
            ->get()->getResultArray();
        foreach ($existing as $row) {
            $db->table('report_photos')->insert([
                'report_id' => $row['id'],
                'photo_path' => $row['photo_path'],
                'sort_order' => 0,
                'created_at' => $row['created_at'],
            ]);
        }
    }

    public function down()
    {
        $this->forge->dropTable('report_photos', true);
    }
}
