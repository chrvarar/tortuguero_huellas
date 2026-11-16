<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddPrivateReportReplies extends Migration
{
    public function up()
    {
        $this->forge->addColumn('report_notifications', [
            'reply_url' => ['type' => 'VARCHAR', 'constraint' => 512, 'null' => true],
            'reply_token_hash' => ['type' => 'CHAR', 'constraint' => 64, 'null' => true],
            'reply_expires_at' => ['type' => 'DATETIME', 'null' => true],
            'reply_body' => ['type' => 'TEXT', 'null' => true],
            'replied_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addUniqueKey('reply_token_hash', 'uq_notification_reply_token');
        $this->forge->processIndexes('report_notifications');
    }

    public function down()
    {
        $this->forge->dropColumn('report_notifications', [
            'reply_url', 'reply_token_hash', 'reply_expires_at', 'reply_body', 'replied_at',
        ]);
    }
}
