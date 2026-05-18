<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('services')->insert([
            [
                'Id_service'   => 1,
                'nom_service'  => 'Service Informatique',
                'Id_direction' => 2,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'Id_service'   => 2,
                'nom_service'  => 'Service Réseau',
                'Id_direction' => 2,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'Id_service'   => 3,
                'nom_service'  => 'Service Recrutement',
                'Id_direction' => 3,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'Id_service'   => 4,
                'nom_service'  => 'Service Paie',
                'Id_direction' => 3,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'Id_service'   => 5,
                'nom_service'  => 'Service Comptabilité',
                'Id_direction' => 5,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'Id_service'   => 6,
                'nom_service'  => 'Service Statistiques',
                'Id_direction' => 4,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
        ]);
    }
}