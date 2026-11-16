<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateReportNotifications extends Migration
{
    public function up()
    {
        $this->forge->addColumn('animals', [
            'owner_email' => ['type' => 'VARCHAR', 'constraint' => 254, 'null' => true],
        ]);
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'report_id' => ['type' => 'INT', 'unsigned' => true],
            'recipient_type' => ['type' => 'ENUM', 'constraint' => ['owner', 'admin']],
            'recipient_email' => ['type' => 'VARCHAR', 'constraint' => 254],
            'subject' => ['type' => 'VARCHAR', 'constraint' => 255],
            'body' => ['type' => 'TEXT'],
            'reason' => ['type' => 'ENUM', 'constraint' => ['owner', 'shelter', 'no_contact', 'bounce']],
            'bounced_at' => ['type' => 'DATETIME', 'null' => true],
            'created_at' => ['type' => 'DATETIME'],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey(['report_id', 'recipient_type']);
        $this->forge->addForeignKey('report_id', 'animal_reports', 'id', 'RESTRICT', 'CASCADE');
        $this->forge->createTable('report_notifications', false, ['ENGINE' => 'InnoDB']);
    }

    public function down()
    {
        $this->forge->dropTable('report_notifications', true);
        $this->forge->dropColumn('animals', 'owner_email');
    }
}
