<?php

namespace Database\Seeders;

use App\Models\Contrat;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContratSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('contrats')->insert([
            ['Id_contrat' => 1, 'type_contrat' => 'CDI',      'duree' => 'Indéterminée', 'created_at' => now(), 'updated_at' => now()],
            ['Id_contrat' => 2, 'type_contrat' => 'CDD',      'duree' => '12 mois',      'created_at' => now(), 'updated_at' => now()],
            ['Id_contrat' => 3, 'type_contrat' => 'Stage',    'duree' => '6 mois',       'created_at' => now(), 'updated_at' => now()],
            ['Id_contrat' => 4, 'type_contrat' => 'Vacation', 'duree' => '3 mois',       'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}