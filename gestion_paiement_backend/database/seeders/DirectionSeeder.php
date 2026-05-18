<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DirectionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('directions')->truncate();
        DB::table('directions')->insert([
            [
                'Id_Direction'  => 1,
                'nom_Direction' => 'Direction Générale',
                'Sigle'         => 'DG',
                'Siege'         => 'Antananarivo',
                'Faritany'      => 'Analamanga',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'Id_Direction'  => 2,
                'nom_Direction' => 'Direction des Systèmes d\'Information',
                'Sigle'         => 'DSI',
                'Siege'         => 'Antananarivo',
                'Faritany'      => 'Analamanga',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'Id_Direction'  => 3,
                'nom_Direction' => 'Direction des Ressources Humaines',
                'Sigle'         => 'DRH',
                'Siege'         => 'Antananarivo',
                'Faritany'      => 'Analamanga',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'Id_Direction'  => 4,
                'nom_Direction' => 'Direction des Statistiques Économiques',
                'Sigle'         => 'DISE',
                'Siege'         => 'Antananarivo',
                'Faritany'      => 'Analamanga',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'Id_Direction'  => 5,
                'nom_Direction' => 'Direction Financière',
                'Sigle'         => 'DF',
                'Siege'         => 'Antananarivo',
                'Faritany'      => 'Analamanga',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ]);
    }
}