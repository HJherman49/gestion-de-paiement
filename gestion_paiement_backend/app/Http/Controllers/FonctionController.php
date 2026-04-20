<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFonctionRequest;
use App\Http\Resources\FonctionResource;
use App\Models\Fonction;

class FonctionController extends Controller
{
    public function index()
    {
        $fonctions = Fonction::with(['agent', 'direction'])->paginate(15);
        return FonctionResource::collection($fonctions);
    }

    public function store(StoreFonctionRequest $request)
    {
        $fonction = Fonction::create($request->validated());
        return new FonctionResource($fonction);
    }

    public function show(Fonction $fonction)
    {
        $fonction->load(['agent', 'direction']);
        return new FonctionResource($fonction);
    }

    public function update(StoreFonctionRequest $request, Fonction $fonction)
    {
        $fonction->update($request->validated());
        return new FonctionResource($fonction);
    }

    public function destroy(Fonction $fonction)
    {
        $fonction->delete();
        return response()->json(['message' => 'Fonction supprimée avec succès']);
    }
}