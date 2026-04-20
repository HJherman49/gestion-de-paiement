<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCompteBancaireRequest;
use App\Http\Resources\CompteBancaireResource;
use App\Models\CompteBancaire;

class CompteBancaireController extends Controller
{
    public function index()
    {
        $comptes = CompteBancaire::with(['agent', 'banque'])->paginate(15);
        return CompteBancaireResource::collection($comptes);
    }

    public function store(StoreCompteBancaireRequest $request)
    {
        $compte = CompteBancaire::create($request->validated());
        return new CompteBancaireResource($compte);
    }

    public function show(CompteBancaire $compteBancaire)
    {
        $compteBancaire->load(['agent', 'banque']);
        return new CompteBancaireResource($compteBancaire);
    }

    public function update(StoreCompteBancaireRequest $request, CompteBancaire $compteBancaire)
    {
        $compteBancaire->update($request->validated());
        return new CompteBancaireResource($compteBancaire);
    }

    public function destroy(CompteBancaire $compteBancaire)
    {
        $compteBancaire->delete();
        return response()->json(['message' => 'Compte bancaire supprimé avec succès']);
    }
}