<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Utilisateur de test',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
    }
}
