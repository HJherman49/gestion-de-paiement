<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePreembaucheRequest;
use App\Http\Resources\PreembaucheResource;
use App\Models\Preembauche;

class PreembaucheController extends Controller
{
    public function index()
    {
        $preembauches = Preembauche::with(['agent', 'contrat'])->paginate(15);
        return PreembaucheResource::collection($preembauches);
    }

    public function store(StorePreembaucheRequest $request)
    {
        $preembauche = Preembauche::create($request->validated());
        return new PreembaucheResource($preembauche);
    }

    public function show(Preembauche $preembauche)
    {
        $preembauche->load(['agent', 'contrat']);
        return new PreembaucheResource($preembauche);
    }

    public function update(StorePreembaucheRequest $request, Preembauche $preembauche)
    {
        $preembauche->update($request->validated());
        return new PreembaucheResource($preembauche);
    }

    public function destroy(Preembauche $preembauche)
    {
        $preembauche->delete();
        return response()->json(['message' => 'Préembauche supprimée avec succès']);
    }
}