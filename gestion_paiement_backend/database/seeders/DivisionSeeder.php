<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DivisionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('divisions')->insert([
            [
                'Id_division'  => 1,
                'Nom_division' => 'Division Développement',
                'section'      => 'Web',
                'Id_service'   => 1,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'Id_division'  => 2,
                'Nom_division' => 'Division Infrastructure',
                'section'      => 'Serveurs',
                'Id_service'   => 2,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'Id_division'  => 3,
                'Nom_division' => 'Division Administration RH',
                'section'      => 'Gestion',
                'Id_service'   => 3,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'Id_division'  => 4,
                'Nom_division' => 'Division Traitement Paie',
                'section'      => 'Calcul',
                'Id_service'   => 4,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
        ]);
    }
}