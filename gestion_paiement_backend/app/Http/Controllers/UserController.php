<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // ── GET /api/v1/utilisateurs ───────────────────────────────────────────
    public function index()
    {
        $users = User::with('roles')->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $users->map(fn($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'role'       => $u->roles->first()?->name ?? 'Aucun rôle',
                'created_at' => $u->created_at?->format('Y-m-d'),
            ]),
            'meta'    => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    // ── POST /api/v1/utilisateurs ─────────────────────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:150',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role'     => 'required|string|exists:roles,name',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => bcrypt($data['password']),
        ]);

        $user->assignRole($data['role']);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur créé avec succès',
            'data'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $data['role'],
            ],
        ], 201);
    }

    // ── PUT /api/v1/utilisateurs/{user} ───────────────────────────────────
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'     => 'sometimes|string|max:150',
            'email'    => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|nullable|string|min:8',
            'role'     => 'sometimes|string|exists:roles,name',
        ]);

        if (isset($data['name']))     $user->name  = $data['name'];
        if (isset($data['email']))    $user->email = $data['email'];
        if (!empty($data['password'])) $user->password = bcrypt($data['password']);
        $user->save();

        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur modifié avec succès',
            'data'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->roles->first()?->name ?? 'Aucun rôle',
            ],
        ]);
    }

    // ── DELETE /api/v1/utilisateurs/{user} ────────────────────────────────
    public function destroy(User $user)
    {
        // Empêcher la suppression de son propre compte
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Impossible de supprimer votre propre compte.'], 422);
        }

        $user->delete();
        return response()->json(['success' => true, 'message' => 'Utilisateur supprimé']);
    }

    // ── GET /api/v1/roles ─────────────────────────────────────────────────
    public function roles()
    {
        $roles = Role::with('permissions')->get()->map(fn($r) => [
            'id'          => $r->id,
            'name'        => $r->name,
            'permissions' => $r->permissions->pluck('name'),
            'users_count' => User::role($r->name)->count(),
        ]);

        return response()->json(['success' => true, 'data' => $roles]);
    }

    // ── GET /api/v1/permissions ───────────────────────────────────────────
    public function permissions()
    {
        $permissions = Permission::all()->groupBy(fn($p) => explode('.', $p->name)[0]);
        return response()->json(['success' => true, 'data' => $permissions]);
    }

    // ── POST /api/v1/utilisateurs/me/profil ──────────────────────────────
    public function updateProfil(Request $request)
    {
        $user = auth()->user();
        $data = $request->validate([
            'name'              => 'sometimes|string|max:150',
            'email'             => 'sometimes|email|unique:users,email,' . $user->id,
            'password_actuel'   => 'sometimes|string',
            'password_nouveau'  => 'sometimes|string|min:8',
        ]);

        if (isset($data['name']))  $user->name  = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];

        if (!empty($data['password_actuel']) && !empty($data['password_nouveau'])) {
            if (!Hash::check($data['password_actuel'], $user->password)) {
                return response()->json(['message' => 'Mot de passe actuel incorrect'], 422);
            }
            $user->password = bcrypt($data['password_nouveau']);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour',
            'data'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->roles->first()?->name ?? 'Aucun rôle',
            ],
        ]);
    }

    // ── GET /api/v1/utilisateurs/me ───────────────────────────────────────
    public function me()
    {
        $user = auth()->user()->load('roles.permissions');
        return response()->json([
            'success' => true,
            'data'    => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'role'        => $user->roles->first()?->name ?? 'Aucun rôle',
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
        ]);
    }
}