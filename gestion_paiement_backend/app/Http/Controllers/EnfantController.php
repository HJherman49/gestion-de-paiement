<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnfantRequest;
use App\Http\Resources\EnfantResource;
use App\Models\Enfant;

class EnfantController extends Controller
{
    public function index()
    {
        $enfants = Enfant::with('agent')->paginate(20);
        return EnfantResource::collection($enfants);
    }

    public function store(StoreEnfantRequest $request)
    {
        $enfant = Enfant::create($request->validated());
        return new EnfantResource($enfant);
    }

    public function show(Enfant $enfant)
    {
        $enfant->load('agent');
        return new EnfantResource($enfant);
    }

    public function update(StoreEnfantRequest $request, Enfant $enfant)
    {
        $enfant->update($request->validated());
        return new EnfantResource($enfant);
    }

    public function destroy(Enfant $enfant)
    {
        $enfant->delete();
        return response()->json(['message' => 'Enfant supprimé avec succès']);
    }
}