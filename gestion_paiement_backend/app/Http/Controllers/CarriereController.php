<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCarriereRequest;
use App\Http\Resources\CarriereResource;
use App\Models\Carriere;

class CarriereController extends Controller
{
    public function index()
    {
        $carrieres = Carriere::with(['agent', 'bareme'])->paginate(15);
        return CarriereResource::collection($carrieres);
    }

    public function store(StoreCarriereRequest $request)
    {
        $carriere = Carriere::create($request->validated());
        return new CarriereResource($carriere);
    }

    public function show(Carriere $carriere)
    {
        $carriere->load(['agent', 'bareme']);
        return new CarriereResource($carriere);
    }

    public function update(StoreCarriereRequest $request, Carriere $carriere)
    {
        $carriere->update($request->validated());
        return new CarriereResource($carriere);
    }

    public function destroy(Carriere $carriere)
    {
        $carriere->delete();
        return response()->json(['message' => 'Carrière supprimée avec succès']);
    }
}