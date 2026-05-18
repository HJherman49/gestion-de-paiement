<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Database\Seeders\UserSeeder;
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ✅ Désactiver les FK pour tous les seeders
        Schema::disableForeignKeyConstraints();

        $this->call([
            UserSeeder::class,
            DirectionSeeder::class,
            ServiceSeeder::class,
            DivisionSeeder::class,
            StatutSeeder::class,
            ContratSeeder::class,
        ]);

        // ✅ Réactiver après
        Schema::enableForeignKeyConstraints();
    }
}