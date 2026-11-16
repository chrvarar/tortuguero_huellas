<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');
$routes->get('ingresar', 'Home::index');
$routes->get('hallazgo', 'Home::index');
$routes->get('extravio', 'Home::index');
$routes->get('adopciones', 'Home::index');
$routes->get('adopciones/([a-f0-9]{32})', 'Home::index');
$routes->get('ficha/([a-f0-9]{32})', 'Home::index');
$routes->get('ficha/([a-f0-9]{32})/hallazgo', 'Home::index');
$routes->get('responder/([a-f0-9]{64})', 'Home::index');

$routes->group('api', static function (RouteCollection $routes): void {
    $routes->get('sesion', 'DemoAccess::session');
    $routes->post('sesion', 'DemoAccess::login', ['filter' => 'csrf']);
    $routes->post('registro', 'DemoAccess::register', ['filter' => 'csrf']);
    $routes->get('usuarios', 'DemoAccess::users');
    $routes->post('usuarios', 'DemoAccess::createUser', ['filter' => 'csrf']);
    $routes->post('salir', 'DemoAccess::logout', ['filter' => 'csrf']);
    $routes->post('perfil', 'DemoAccess::updateProfile', ['filter' => 'csrf']);
    $routes->get('perfil/foto', 'DemoAccess::profilePhoto');
    $routes->get('censo', 'AnimalRegistry::census');
    $routes->get('animales', 'AnimalRegistry::index');
    $routes->get('animales/(:num)', 'AnimalRegistry::detail/$1');
    $routes->post('animales', 'AnimalRegistry::create', ['filter' => 'csrf']);
    $routes->post('animales/(:num)/editar', 'AnimalRegistry::edit/$1', ['filter' => 'csrf']);
    $routes->post('animales/(:num)/eliminar', 'AnimalRegistry::remove/$1', ['filter' => 'csrf']);
    $routes->post('animales/(:num)/archivar', 'AnimalRegistry::archive/$1', ['filter' => 'csrf']);
    $routes->post('animales/(:num)/correo', 'AnimalRegistry::ownerEmail/$1', ['filter' => 'csrf']);
    $routes->post('animales/(:num)/qr/(reemplazar|desactivar)', 'AnimalRegistry::changeQr/$1/$2', ['filter' => 'csrf']);
    $routes->get('ficha/([a-f0-9]{32})', 'AnimalRegistry::profile/$1');
    $routes->get('ficha/([a-f0-9]{32})/foto', 'AnimalRegistry::photo/$1');
    $routes->get('distritos', 'AnimalReports::districts');
    $routes->get('avisos', 'AnimalReports::index');
    $routes->get('avisos/(:num)/foto', 'AnimalReports::photo/$1');
    $routes->get('avisos/(:num)/foto/(:num)', 'AnimalReports::photo/$1/$2');
    $routes->post('avisos/(:num)/vincular', 'AnimalReports::link/$1', ['filter' => 'csrf']);
    $routes->post('avisos/(:num)/cerrar', 'AnimalReports::resolve/$1', ['filter' => 'csrf']);
    $routes->post('notificaciones/(:num)/rebote', 'AnimalReports::bounce/$1', ['filter' => 'csrf']);
    $routes->get('respuestas/([a-f0-9]{64})', 'AnimalReports::replyStatus/$1');
    $routes->post('respuestas/([a-f0-9]{64})', 'AnimalReports::reply/$1', ['filter' => 'csrf']);
    $routes->post('avisos/(hallazgo|extravio)', 'AnimalReports::create/$1', ['filter' => 'csrf']);
    $routes->post('ficha/([a-f0-9]{32})/hallazgo', 'AnimalReports::create/hallazgo/$1', ['filter' => 'csrf']);
    $routes->get('adopciones', 'Adoptions::gallery');
    $routes->get('adopciones/([a-f0-9]{32})/foto', 'AnimalRegistry::adoptionPhoto/$1');
    $routes->post('adopciones/([a-f0-9]{32})/solicitudes', 'Adoptions::apply/$1', ['filter' => 'csrf']);
    $routes->get('gestion/adopciones', 'Adoptions::management');
    $routes->post('gestion/adopciones/(:num)/publicar', 'Adoptions::publish/$1', ['filter' => 'csrf']);
    $routes->post('gestion/adopciones/(:num)/retirar', 'Adoptions::unpublish/$1', ['filter' => 'csrf']);
});
