<?php

namespace App\Libraries;

use CodeIgniter\Database\BaseBuilder;
use CodeIgniter\Database\BaseConnection;
use RuntimeException;

class ReportNotifications
{
    public function __construct(private BaseConnection $db)
    {
    }

    public function capture(int $reportId, string $kind, array $report, ?array $animal): void
    {
        $condition = $animal['living_condition'] ?? null;
        $email = $animal['owner_email'] ?? null;
        $owner = $condition === 'hogar' && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
        $subject = ($kind === 'extravio' ? 'Aviso de extravío' : 'Aviso de hallazgo') . ' #' . $reportId;
        $body = 'Animal: ' . ($report['animal_name'] ?? $report['species']) . "\n"
            . 'Ubicación: ' . $report['address'] . "\n"
            . 'Observaciones: ' . $report['description'];

        if ($report['shelter_address'] !== null) {
            $body .= "\nResguardo: " . $report['shelter_address'];
        }
        if ($report['share_contact'] === 1) {
            $contact = array_filter([$report['contact_name'], $report['contact_email'], $report['contact_phone']]);
            if ($contact !== []) {
                $body .= "\nContacto autorizado: " . implode(' · ', $contact);
            }
        }

        $this->insert([
            'report_id' => $reportId,
            'recipient_type' => $owner ? 'owner' : 'admin',
            'recipient_email' => $owner ? $email : $this->adminEmail(),
            'subject' => $subject,
            'body' => $body,
            'reason' => $owner ? 'owner' : ($condition === 'albergue' ? 'shelter' : 'no_contact'),
        ] + $this->replyLink($report['contact_email']));
    }

    public function simulateBounce(string $id): bool
    {
        $adminEmail = $this->adminEmail();
        $this->db->transException(true)->transStart();
        $table = $this->db->table('report_notifications');
        $table->where(['id' => $id, 'recipient_type' => 'owner', 'bounced_at' => null, 'replied_at' => null])
            ->update(['bounced_at' => gmdate('Y-m-d H:i:s'), 'reply_url' => null]);
        $changed = $this->db->affectedRows() === 1;
        if ($changed) {
            $original = $table->where('id', $id)->get()->getRowArray();
            $report = $this->db->table('animal_reports')->select('contact_email')
                ->where('id', $original['report_id'])->get()->getRowArray();
            $this->insert([
                'report_id' => $original['report_id'],
                'recipient_type' => 'admin',
                'recipient_email' => $adminEmail,
                'subject' => 'Derivación por rebote · ' . $original['subject'],
                'body' => $original['body'],
                'reason' => 'bounce',
            ] + $this->replyLink($report['contact_email'] ?? null));
        }
        if (! $this->db->transComplete()) {
            throw new RuntimeException('No se pudo derivar el aviso.');
        }

        return $changed;
    }

    public function canReply(string $token): bool
    {
        return $this->replyTarget($token)->countAllResults() === 1;
    }

    public function captureReply(string $token, string $message): bool
    {
        if (! $this->replyTarget($token)->update([
            'reply_body' => $message,
            'replied_at' => gmdate('Y-m-d H:i:s'),
            'reply_url' => null,
        ])) {
            throw new RuntimeException('No se pudo registrar la respuesta.');
        }

        return $this->db->affectedRows() === 1;
    }

    private function replyTarget(string $token): BaseBuilder
    {
        return $this->db->table('report_notifications')->where([
            'reply_token_hash' => hash('sha256', $token),
            'bounced_at' => null,
            'replied_at' => null,
            'reply_expires_at >' => gmdate('Y-m-d H:i:s'),
        ]);
    }

    private function replyLink(?string $email): array
    {
        if ($email === null) {
            return [];
        }

        $origin = (string) env('VITALINK_PUBLIC_ORIGIN', 'http://127.0.0.1:5173');
        $token = bin2hex(random_bytes(32));

        return [
            'reply_url' => rtrim($origin, '/') . '/responder/' . $token,
            'reply_token_hash' => hash('sha256', $token),
            'reply_expires_at' => gmdate('Y-m-d H:i:s', time() + 7 * 86400),
        ];
    }

    private function insert(array $message): void
    {
        if (! $this->db->table('report_notifications')->insert($message + ['created_at' => gmdate('Y-m-d H:i:s')])) {
            throw new RuntimeException('No se pudo registrar la notificación.');
        }
    }

    private function adminEmail(): string
    {
        $email = env('VITALINK_DEMO_ADMIN_EMAIL', 'administrador@example.test');
        if (! is_string($email) || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            throw new RuntimeException('El correo de demostración de Administración no es válido.');
        }

        return $email;
    }
}
