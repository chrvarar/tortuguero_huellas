<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use CodeIgniter\HTTP\CLIRequest;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * BaseController provides a convenient place for loading components
 * and performing functions that are needed by all your controllers.
 *
 * Extend this class in any new controllers:
 * ```
 *     class Home extends BaseController
 * ```
 *
 * For security, be sure to declare any new methods as protected or private.
 */
abstract class BaseController extends Controller
{
    /**
     * Be sure to declare properties for any property fetch you initialized.
     * The creation of dynamic property is deprecated in PHP 8.2.
     */

    // protected $session;

    /**
     * @param CLIRequest|IncomingRequest $request
     *
     * @return void
     */
    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        // Load here all helpers you want to be available in your controllers that extend BaseController.
        // Caution: Do not put the this below the parent::initController() call below.
        // $this->helpers = ['form', 'url'];

        // Caution: Do not edit this line.
        parent::initController($request, $response, $logger);

        // Preload any models, libraries, etc, here.
        // $this->session = service('session');
    }

    protected function denyUnless(array $roles, string $message = 'Necesitás una sesión autorizada para realizar esta acción.'): ?ResponseInterface
    {
        $user = session()->get('vitalink_user');
        if (in_array($user['role'] ?? null, $roles, true)) {
            return null;
        }

        return $this->response->noCache()->setStatusCode($user ? 403 : 401)
            ->setJSON(['message' => $message]);
    }

    protected function denyUnlessManager(string $message = 'Necesitás una sesión autorizada para realizar esta acción.'): ?ResponseInterface
    {
        return $this->denyUnless(['superusuario', 'administrador'], $message);
    }

    protected function postFields(array $names): array
    {
        $input = [];
        foreach ($names as $name) {
            $value = $this->request->getPost($name);
            $input[$name] = is_string($value) ? trim($value) : '';
        }

        return $input;
    }
}
