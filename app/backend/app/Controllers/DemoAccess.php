<?php

namespace App\Controllers;

use CodeIgniter\HTTP\ResponseInterface;
use RuntimeException;
use Throwable;

class DemoAccess extends BaseController
{
    private const REMEMBER_COOKIE = 'vitalink_remember';
    private const REMEMBER_SECONDS = 14 * 86400;

    public function session(): ResponseInterface
    {
        helper('form');

        if (! session()->get('vitalink_user')) {
            $this->restoreRememberedSession();
        }

        return $this->response->noCache()->setJSON([
            'user' => session()->get('vitalink_user'),
            'csrf' => csrf_hash(),
        ]);
    }

    public function login(): ResponseInterface
    {
        $key = 'vitalink-login-' . hash('sha256', $this->request->getIPAddress());
        if (! service('throttler')->check($key, 12, MINUTE)) {
            return $this->response->setStatusCode(429)->setJSON(['message' => 'Esperá un momento antes de volver a intentar.']);
        }

        $input = $this->request->getJSON(true);
        $username = $input['username'] ?? null;
        $password = $input['password'] ?? null;
        if (! is_string($username) || ! is_string($password) || strlen($username) > 80 || strlen($password) > 72) {
            return $this->invalidCredentials();
        }

        $user = db_connect()->table('users')->where('username', trim($username))->get()->getRowArray();
        if (ENVIRONMENT === 'development' && (env('TORTUGUERO_HUELLAS_DEMO_SEED', false) === true || env('VITALINK_DEMO_SEED', false) === true)) {
            $normalizedUser = trim($username);
            if (in_array($normalizedUser, ['superusuario', 'administrador'], true) && $password === $normalizedUser) {
                $db = db_connect();
                $hash = password_hash($normalizedUser, PASSWORD_DEFAULT);
                if ($user === null) {
                    $db->table('users')->insert([
                        'username' => $normalizedUser,
                        'role' => $normalizedUser,
                        'password_hash' => $hash,
                    ]);
                    $user = $db->table('users')->where('username', $normalizedUser)->get()->getRowArray();
                } elseif (! password_verify($password, $user['password_hash'])) {
                    $db->table('users')->where('id', $user['id'])->update([
                        'role' => $normalizedUser,
                        'password_hash' => $hash,
                    ]);
                    $user['role'] = $normalizedUser;
                    $user['password_hash'] = $hash;
                }
            }
        }
        if ($user === null || ! password_verify($password, $user['password_hash'])) {
            return $this->invalidCredentials();
        }

        $this->revokeRememberToken();
        $response = $this->startSession($user);
        if (($input['remember'] ?? false) === true) {
            $this->issueRememberToken((int) $user['id']);
        }

        return $response;
    }

    public function register(): ResponseInterface
    {
        $key = 'vitalink-registration-' . hash('sha256', $this->request->getIPAddress());
        if (! service('throttler')->check($key, 8, MINUTE)) {
            return $this->response->setStatusCode(429)->setJSON(['message' => 'Esperá un momento antes de volver a intentar.']);
        }

        $input = $this->request->getJSON(true);
        $username = is_string($input['username'] ?? null) ? trim($input['username']) : '';
        $name = is_string($input['display_name'] ?? null) ? trim($input['display_name']) : '';
        $email = is_string($input['email'] ?? null) ? strtolower(trim($input['email'])) : '';
        $password = $input['password'] ?? null;
        $confirm = $input['password_confirmation'] ?? null;
        if ($name === '' || mb_strlen($name) > 120) {
            return $this->response->setStatusCode(422)->setJSON(['field' => 'display_name', 'message' => 'Indique su nombre completo (máximo 120 caracteres).']);
        }
        if (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            return $this->response->setStatusCode(422)->setJSON(['field' => 'email', 'message' => 'Indique un correo electrónico válido.']);
        }
        if (preg_match('/\A[a-z0-9][a-z0-9._-]{2,39}\z/i', $username) !== 1) {
            return $this->response->setStatusCode(422)->setJSON(['field' => 'username', 'message' => 'Use un usuario de 3 a 40 caracteres: letras, números, punto, guion o guion bajo.']);
        }
        if (! is_string($password) || strlen($password) < 4 || strlen($password) > 72 || str_contains($password, "\0")) {
            return $this->response->setStatusCode(422)->setJSON(['field' => 'password', 'message' => 'Use una contraseña de 4 a 72 bytes.']);
        }
        if (! is_string($confirm) || $password !== $confirm) {
            return $this->response->setStatusCode(422)->setJSON(['field' => 'password_confirmation', 'message' => 'Las contraseñas no coinciden.']);
        }

        $db = db_connect();
        if ($db->table('users')->where('username', $username)->countAllResults() > 0) {
            return $this->response->setStatusCode(409)->setJSON(['field' => 'username', 'message' => 'Ese nombre de usuario no está disponible.']);
        }
        if ($db->table('users')->where('email', $email)->countAllResults() > 0) {
            return $this->response->setStatusCode(409)->setJSON(['field' => 'email', 'message' => 'Ese correo electrónico ya está registrado.']);
        }
        $user = ['username' => $username, 'display_name' => $name, 'email' => $email, 'role' => 'general'];
        $db->table('users')->ignore()->insert($user + ['password_hash' => password_hash($password, PASSWORD_DEFAULT)]);
        if ($db->affectedRows() !== 1) {
            return $this->response->setStatusCode(409)->setJSON(['message' => 'El usuario o el correo ya están registrados.']);
        }

        return $this->startSession($user + ['id' => $db->insertID()])->setStatusCode(201);
    }

    public function users(): ResponseInterface
    {
        $role = session()->get('vitalink_user')['role'] ?? null;
        if (! in_array($role, ['superusuario', 'administrador'], true)) {
            return $this->response->noCache()->setStatusCode(403)->setJSON(['message' => 'No tenés acceso a la gestión de usuarios.']);
        }

        $roles = $role === 'superusuario' ? ['administrador', 'colaborador'] : ['colaborador'];
        $users = db_connect()->table('users')->select('id, username, role, display_name')
            ->whereIn('role', $roles)->orderBy('username')->get()->getResultArray();

        return $this->response->noCache()->setJSON(['users' => $users]);
    }

    public function createUser(): ResponseInterface
    {
        $role = session()->get('vitalink_user')['role'] ?? null;
        if (! in_array($role, ['superusuario', 'administrador'], true)) {
            return $this->response->noCache()->setStatusCode(403)->setJSON(['message' => 'No tenés permiso para crear usuarios.']);
        }

        $key = 'vitalink-user-creation-' . hash('sha256', $this->request->getIPAddress());
        if (! service('throttler')->check($key, 12, MINUTE)) {
            return $this->response->setStatusCode(429)->setJSON(['message' => 'Esperá un momento antes de volver a intentar.']);
        }

        $input = $this->request->getJSON(true);
        $username = is_string($input['username'] ?? null) ? trim($input['username']) : '';
        $password = $input['password'] ?? null;
        $targetRole = $input['role'] ?? null;
        $allowed = $role === 'superusuario' ? ['administrador'] : ['colaborador'];
        if (! in_array($targetRole, $allowed, true)) {
            return $this->response->setStatusCode(403)->setJSON(['message' => 'No podés asignar ese rol.']);
        }
        if (preg_match('/\A[a-z0-9][a-z0-9._-]{2,39}\z/i', $username) !== 1
            || ! is_string($password) || strlen($password) < 4 || strlen($password) > 72 || str_contains($password, "\0")) {
            return $this->response->setStatusCode(422)->setJSON(['message' => 'Usá un usuario de 3 a 40 caracteres y una contraseña de 4 a 72 bytes.']);
        }

        $db = db_connect();
        $db->table('users')->ignore()->insert([
            'username' => $username, 'role' => $targetRole,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);
        if ($db->affectedRows() !== 1) {
            return $this->response->setStatusCode(409)->setJSON(['message' => 'Ese nombre de usuario no está disponible.']);
        }

        return $this->response->noCache()->setStatusCode(201)->setJSON([
            'user' => ['id' => (int) $db->insertID(), 'username' => $username, 'role' => $targetRole],
        ]);
    }

    public function logout(): ResponseInterface
    {
        $this->revokeRememberToken();
        session()->destroy();

        return $this->response->noCache()->setStatusCode(204);
    }

    public function updateProfile(): ResponseInterface
    {
        $user = session()->get('vitalink_user');
        if (empty($user['id'])) {
            return $this->profileUnauthorized();
        }

        $name = $this->request->getPost('display_name');
        $name = is_string($name) ? trim($name) : '';
        $photo = $this->request->getFile('avatar');
        $replace = $photo !== null && $photo->getError() !== UPLOAD_ERR_NO_FILE;
        $remove = $this->request->getPost('remove_avatar') === '1';
        $rules = ['display_name' => 'permit_empty|max_length[120]'];
        if ($replace) {
            $rules['avatar'] = 'uploaded[avatar]|max_size[avatar,2048]|max_dims[avatar,2048,2048]|is_image[avatar]|mime_in[avatar,image/jpeg,image/png,image/webp]';
        }
        if (($replace && $remove) || ! $this->validateData(['display_name' => $name], $rules)) {
            return $this->response->setStatusCode(422)->setJSON(['message' => 'Revisá el nombre y la foto. Podés subir una foto JPEG, PNG o WebP de hasta 2 MB y 2048 × 2048 píxeles, o quitarla.']);
        }

        $db = db_connect();
        $filename = $replace ? bin2hex(random_bytes(16)) . '.webp' : null;
        if (! $db->transBegin()) {
            throw new RuntimeException('No se pudo iniciar el cambio de perfil.');
        }
        try {
            $table = $db->table('users');
            $query = $table->select('avatar_path')->where('id', $user['id'])->getCompiledSelect();
            $current = $db->query($query . ' FOR UPDATE')->getRowArray();
            if ($current === null) {
                $db->transRollback();
                return $this->profileUnauthorized();
            }

            if ($replace) {
                $directory = WRITEPATH . 'uploads/avatars';
                if (! is_dir($directory) && ! mkdir($directory, 0770, true) && ! is_dir($directory)) {
                    throw new RuntimeException('No se pudo preparar el almacenamiento de fotos.');
                }
                if (! service('image')->withFile($photo->getTempName())->convert(IMAGETYPE_WEBP)->save($this->avatarPath($filename))) {
                    throw new RuntimeException('No se pudo guardar la foto.');
                }
            }

            $avatar = $replace || $remove ? $filename : $current['avatar_path'];
            if (! $table->where('id', $user['id'])->update([
                'display_name' => $name === '' ? null : $name, 'avatar_path' => $avatar,
            ]) || ! $db->transCommit()) {
                throw new RuntimeException('No se pudo guardar el perfil.');
            }
        } catch (Throwable $error) {
            $db->transRollback();
            $this->removeAvatar($filename);
            throw $error;
        }

        if ($replace || $remove) {
            $this->removeAvatar($current['avatar_path']);
        }
        $user['display_name'] = $name === '' ? null : $name;
        $user['avatar'] = $this->avatarUrl($avatar);
        session()->set('vitalink_user', $user);

        return $this->session();
    }

    public function profilePhoto(): ResponseInterface
    {
        $user = session()->get('vitalink_user');
        if (empty($user['id'])) {
            return $this->profileUnauthorized();
        }

        $profile = db_connect()->table('users')->select('avatar_path')->where('id', $user['id'])->get()->getRowArray();
        $filename = $profile['avatar_path'] ?? null;
        $path = $this->avatarPath($filename);
        $version = $this->request->getGet('v');
        if ($path === null || ($version !== null && $version !== substr($filename, 0, 32)) || ! is_file($path)) {
            return $this->response->noCache()->setStatusCode(404);
        }

        return $this->response->noCache()->setContentType('image/webp')
            ->setHeader('X-Content-Type-Options', 'nosniff')->setBody(file_get_contents($path));
    }

    private function profileUnauthorized(): ResponseInterface
    {
        return $this->response->noCache()->setStatusCode(401)->setJSON(['message' => 'Iniciá sesión para consultar tu perfil.']);
    }

    private function avatarPath(?string $filename): ?string
    {
        return $filename !== null && preg_match('/\A[a-f0-9]{32}\.webp\z/', $filename) === 1
            ? WRITEPATH . 'uploads/avatars/' . $filename : null;
    }

    private function avatarUrl(?string $filename): ?string
    {
        return $this->avatarPath($filename) === null ? null : '/api/perfil/foto?v=' . substr($filename, 0, 32);
    }

    private function removeAvatar(?string $filename): void
    {
        $path = $this->avatarPath($filename);
        if ($path !== null && is_file($path) && ! @unlink($path)) {
            log_message('warning', 'No se pudo retirar una foto de perfil.');
        }
    }

    private function invalidCredentials(): ResponseInterface
    {
        return $this->response->setStatusCode(401)->setJSON(['message' => 'El usuario o la contraseña no son correctos.']);
    }

    private function startSession(array $user): ResponseInterface
    {
        $session = session();
        $session->regenerate(true);
        $session->set('vitalink_user', [
            'id' => (int) $user['id'], 'username' => $user['username'], 'role' => $user['role'],
            'display_name' => $user['display_name'] ?? null, 'avatar' => $this->avatarUrl($user['avatar_path'] ?? null),
        ]);

        return $this->session();
    }

    private function restoreRememberedSession(): void
    {
        $this->purgeExpiredRememberTokens();
        $parts = $this->rememberParts();
        if ($parts === null) {
            if ($this->request->getCookie(self::REMEMBER_COOKIE) !== null) {
                $this->clearRememberCookie();
            }
            return;
        }

        [$selector, $validator] = $parts;
        $db = db_connect();
        $token = $db->table('remember_tokens')->where('selector', $selector)->get()->getRowArray();
        if ($token === null || ! hash_equals($token['validator_hash'], hash('sha256', hex2bin($validator)))
            || strtotime($token['expires_at'] . ' UTC') <= time()) {
            $this->revokeRememberToken();
            return;
        }

        $user = $db->table('users')->where('id', $token['user_id'])->get()->getRowArray();
        if ($user === null) {
            $this->revokeRememberToken();
            return;
        }

        $session = session();
        $session->regenerate(true);
        $session->set('vitalink_user', [
            'id' => (int) $user['id'], 'username' => $user['username'], 'role' => $user['role'],
            'display_name' => $user['display_name'] ?? null, 'avatar' => $this->avatarUrl($user['avatar_path'] ?? null),
        ]);
    }

    private function issueRememberToken(int $userId): void
    {
        $this->purgeExpiredRememberTokens();
        $selector = random_bytes(16);
        $validator = random_bytes(32);
        db_connect()->table('remember_tokens')->insert([
            'selector' => bin2hex($selector),
            'validator_hash' => hash('sha256', $validator),
            'user_id' => $userId,
            'expires_at' => gmdate('Y-m-d H:i:s', time() + self::REMEMBER_SECONDS),
        ]);
        $this->response->setCookie(self::REMEMBER_COOKIE, bin2hex($selector) . ':' . bin2hex($validator),
            self::REMEMBER_SECONDS, '', '/', '', $this->request->isSecure(), true, 'Lax');
    }

    private function purgeExpiredRememberTokens(): void
    {
        db_connect()->table('remember_tokens')->where('expires_at <=', gmdate('Y-m-d H:i:s'))->delete();
    }

    private function revokeRememberToken(): void
    {
        $parts = $this->rememberParts();
        if ($parts !== null) {
            db_connect()->table('remember_tokens')->where('selector', $parts[0])->delete();
        }
        $this->clearRememberCookie();
    }

    private function clearRememberCookie(): void
    {
        $this->response->deleteCookie(self::REMEMBER_COOKIE);
    }

    private function rememberParts(): ?array
    {
        $value = $this->request->getCookie(self::REMEMBER_COOKIE);
        return is_string($value) && preg_match('/\A([a-f0-9]{32}):([a-f0-9]{64})\z/', $value, $matches) === 1
            ? [$matches[1], $matches[2]] : null;
    }
}
