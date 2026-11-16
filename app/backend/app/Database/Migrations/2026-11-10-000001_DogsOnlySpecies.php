<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class DogsOnlySpecies extends Migration
{
    public function up()
    {
        $this->db->table('animals')->where('species !=', 'perro')->update(['species' => 'perro']);
        $this->db->table('animal_reports')->where('species !=', 'perro')->update(['species' => 'perro']);
        $this->db->query("ALTER TABLE `animals` MODIFY COLUMN `species` ENUM('perro') NOT NULL");
        $this->db->query("ALTER TABLE `animal_reports` MODIFY COLUMN `species` ENUM('perro') NOT NULL");
    }

    public function down()
    {
        $this->db->query("ALTER TABLE `animals` MODIFY COLUMN `species` ENUM('perro', 'gato') NOT NULL");
        $this->db->query("ALTER TABLE `animal_reports` MODIFY COLUMN `species` ENUM('perro', 'gato') NOT NULL");
    }
}
