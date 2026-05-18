<?php

namespace Database\Seeders;
use Illuminate\Support\Facades\DB;
use App\Models\Statut;
use Illuminate\Database\Seeder;

class StatutSeeder extends Seeder
{
    public function run(): void
    {
         // Statuts
        DB::table('statuts')->insert([
            ['Id_statut' => 1, 'type_statut' => 'Fonctionnaire', 'created_at' => now(), 'updated_at' => now()],
            ['Id_statut' => 2, 'type_statut' => 'Contractuel',   'created_at' => now(), 'updated_at' => now()],
            ['Id_statut' => 3, 'type_statut' => 'Stagiaire',     'created_at' => now(), 'updated_at' => now()],
            ['Id_statut' => 4, 'type_statut' => 'Vacataire',     'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}