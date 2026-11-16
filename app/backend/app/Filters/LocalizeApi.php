<?php

namespace App\Filters;

use App\Libraries\ApiMessages;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class LocalizeApi implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        return null;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        if (function_exists('csrf_hash') && session_status() === PHP_SESSION_ACTIVE) {
            $response->setHeader('X-CSRF-TOKEN', csrf_hash());
        }

        $language = strtolower(trim(explode(',', $request->getHeaderLine('Accept-Language'))[0]));
        $language = explode('-', $language)[0];
        if (! in_array($language, ['en', 'de'], true)) {
            return $response;
        }

        $data = json_decode($response->getBody(), true);
        if (! is_array($data) || ! is_string($data['message'] ?? null)) {
            return $response;
        }

        $translation = ApiMessages::translate($data['message'], $language);
        if ($translation === null) {
            return $response;
        }

        $data['message'] = $translation;
        return $response->setHeader('Vary', 'Accept-Language')->setJSON($data);
    }
}
