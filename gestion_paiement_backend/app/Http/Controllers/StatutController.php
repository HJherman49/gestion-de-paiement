<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStatutRequest;
use App\Http\Resources\StatutResource;
use App\Models\Statut;

class StatutController extends Controller
{
    public function index()
    {
        $statuts = Statut::paginate(15);
        return StatutResource::collection($statuts);
    }

    public function store(StoreStatutRequest $request)
    {
        $statut = Statut::create($request->validated());
        return new StatutResource($statut);
    }

    public function show(Statut $statut)
    {
        return new StatutResource($statut);
    }

    public function update(StoreStatutRequest $request, Statut $statut)
    {
        $statut->update($request->validated());
        return new StatutResource($statut);
    }

    public function destroy(Statut $statut)
    {
        // Vérification de sécurité
        if ($statut->agents()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce statut car il est utilisé par des agents.'
            ], 422);
        }

        $statut->delete();
        return response()->json(['message' => 'Statut supprimé avec succès']);
    }
}