<?php

namespace App\Controllers;

use CodeIgniter\HTTP\ResponseInterface;

class Home extends BaseController
{
    public function index(): ResponseInterface
    {
        $spaIndex = FCPATH . 'spa.html';
        if (! is_file($spaIndex)) {
            $spaIndex = FCPATH . 'index.html';
        }
        if (is_file($spaIndex)) {
            return $this->response
                ->setContentType('text/html; charset=UTF-8')
                ->setBody((string) file_get_contents($spaIndex));
        }

        return $this->response->setBody(view('welcome_message'));
    }
}
