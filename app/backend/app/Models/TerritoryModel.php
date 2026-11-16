<?php

namespace App\Models;

class TerritoryModel
{
    public function catalog(): array
    {
        $db = db_connect();
        $provinces = $db->table('provinces')->select('id, name')->orderBy('id')->get()->getResultArray();
        $cantons = $db->table('cantons')->select('id, province_id, name')->orderBy('id')->get()->getResultArray();
        $districts = $db->table('districts')->select('id, official_code, canton_id, name, province, canton')
            ->where('official_code IS NOT NULL', null, false)
            ->orderBy('official_code')->get()->getResultArray();

        return ['provinces' => $provinces, 'cantons' => $cantons, 'districts' => $districts];
    }

    public function census(?string $species, ?string $condition, ?string $provinceId, ?string $cantonId, ?string $districtId): array
    {
        $db = db_connect();
        $join = "animals.district_id = districts.id AND animals.status = 'activo'";
        if ($species) {
            $join .= ' AND animals.species = ' . $db->escape($species);
        }
        if ($condition) {
            $join .= ' AND animals.living_condition = ' . $db->escape($condition);
        }

        $query = $db->table('districts')
            ->select('districts.id, districts.province, districts.canton, districts.name')
            ->selectCount('animals.id', 'total')
            ->join('cantons', 'cantons.id = districts.canton_id', 'left')
            ->join('animals', $join, 'left')
            ->groupBy(['districts.id', 'districts.province', 'districts.canton', 'districts.name'])
            ->orderBy('districts.name');

        if ($districtId !== null && $districtId !== '') {
            $query->where('districts.id', (int) $districtId);
        }
        if ($provinceId !== null && $provinceId !== '') {
            $query->where('cantons.province_id', (int) $provinceId);
        }
        if ($cantonId !== null && $cantonId !== '') {
            $query->where('districts.canton_id', (int) $cantonId);
        }

        return $query->get()->getResultArray();
    }
}
