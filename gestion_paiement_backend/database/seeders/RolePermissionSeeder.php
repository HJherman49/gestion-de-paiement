<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ── Permissions par module ─────────────────────────────────────────
        $modules = [
            'agents'          => ['voir', 'creer', 'modifier', 'supprimer'],
            'carrieres'       => ['voir', 'creer', 'modifier', 'supprimer'],
            'paies'           => ['voir', 'creer', 'modifier', 'supprimer', 'valider'],
            'reclassements'   => ['voir', 'creer', 'modifier', 'supprimer'],
            'fonctions'       => ['voir', 'creer', 'modifier', 'supprimer'],
            'preembauches'    => ['voir', 'creer', 'modifier', 'supprimer'],
            'enfants'         => ['voir', 'creer', 'modifier', 'supprimer'],
            'banques'         => ['voir', 'creer', 'modifier', 'supprimer'],
            'comptes_bancaires'=> ['voir', 'creer', 'modifier', 'supprimer'],
            'baremes'         => ['voir', 'creer', 'modifier', 'supprimer'],
            'directions'      => ['voir', 'creer', 'modifier', 'supprimer'],
            'services'        => ['voir', 'creer', 'modifier', 'supprimer'],
            'divisions'       => ['voir', 'creer', 'modifier', 'supprimer'],
            'historique'      => ['voir', 'supprimer'],
            'utilisateurs'    => ['voir', 'creer', 'modifier', 'supprimer'],
            'parametres'      => ['voir', 'modifier'],
        ];

        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                Permission::firstOrCreate(['name' => "{$module}.{$action}", 'guard_name' => 'web']);
            }
        }

        // ── Rôles ──────────────────────────────────────────────────────────
        $roles = [

            'Administrateur' => Permission::all()->pluck('name')->toArray(), // tout

            'Gestionnaire RH' => [
                'agents.voir', 'agents.creer', 'agents.modifier', 'agents.supprimer',
                'carrieres.voir', 'carrieres.creer', 'carrieres.modifier',
                'reclassements.voir', 'reclassements.creer', 'reclassements.modifier',
                'fonctions.voir', 'fonctions.creer', 'fonctions.modifier',
                'preembauches.voir', 'preembauches.creer', 'preembauches.modifier',
                'enfants.voir', 'enfants.creer', 'enfants.modifier',
                'comptes_bancaires.voir', 'comptes_bancaires.creer',
                'directions.voir', 'services.voir', 'divisions.voir',
                'baremes.voir',
                'historique.voir',
            ],

            'Gestionnaire Paie' => [
                'agents.voir',
                'paies.voir', 'paies.creer', 'paies.modifier', 'paies.valider',
                'baremes.voir', 'baremes.creer', 'baremes.modifier',
                'banques.voir', 'banques.creer',
                'comptes_bancaires.voir', 'comptes_bancaires.creer', 'comptes_bancaires.modifier',
                'historique.voir',
            ],

            'Consultant' => [
                'agents.voir',
                'carrieres.voir',
                'paies.voir',
                'reclassements.voir',
                'fonctions.voir',
                'preembauches.voir',
                'directions.voir', 'services.voir', 'divisions.voir',
                'baremes.voir',
            ],

            'Agent' => [
                'agents.voir',
            ],

            'Auditeur' => [
                'agents.voir',
                'historique.voir',
                'carrieres.voir',
                'paies.voir',
                'reclassements.voir',
            ],
        ];

        foreach ($roles as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($permissions);
        }

        // ── Créer l'admin par défaut si inexistant ─────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@instat.mg'],
            [
                'name'     => 'Admin SIRH',
                'password' => bcrypt('Admin@2025!'),
            ]
        );
        $admin->assignRole('Administrateur');

        $this->command->info('✅ Rôles et permissions SIRH créés avec succès');
        $this->command->table(
            ['Rôle', 'Permissions'],
            collect($roles)->map(fn($perms, $role) => [$role, count($perms) . ' permission(s)'])->toArray()
        );
    }
}