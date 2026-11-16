<?php

$schema = getenv('VITALINK_QA_SCHEMA');
if (! is_string($schema) || preg_match('/\Avitalink_qa_[a-f0-9]{32}\z/', $schema) !== 1) {
    throw new RuntimeException('El arnés requiere un esquema temporal de VitaLink.');
}

$_ENV['database.default.database'] = $schema;
$_ENV['database.default.hostname'] = '127.0.0.1';
$_ENV['database.default.port'] = '3306';
$_ENV['database.default.username'] = 'root';
