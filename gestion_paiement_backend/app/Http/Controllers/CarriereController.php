<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCarriereRequest;
use App\Http\Resources\CarriereResource;
use App\Models\Agent;
use App\Models\Carriere;

class CarriereController extends Controller
{
    public function index()
    {
        $carrieres = Carriere::with(['agent.direction', 'agent.service', 'bareme'])->paginate(15);
        return CarriereResource::collection($carrieres);
    }

    public function store(StoreCarriereRequest $request)
    {
        $carriere = Carriere::create($request->validated());
        $carriere->load(['agent.direction', 'agent.service', 'bareme']);
        return new CarriereResource($carriere);
    }

    public function show(Carriere $carriere)
    {
        $carriere->load(['agent.direction', 'agent.service', 'bareme']);
        return new CarriereResource($carriere);
    }

    public function parAgent(Agent $agent)
    {
        return CarriereResource::collection(
            $agent->carrieres()->with(['agent.direction', 'agent.service', 'bareme'])->get()
        );
    }

    public function actuelle(Agent $agent)
    {
        $carriere = $agent->carriereActuelle()->with(['agent.direction', 'agent.service', 'bareme'])->first();
        return $carriere ? new CarriereResource($carriere) : response()->json(null, 204);
    }

    public function update(StoreCarriereRequest $request, Carriere $carriere)
    {
        $carriere->update($request->validated());
        $carriere->load(['agent.direction', 'agent.service', 'bareme']);
        return new CarriereResource($carriere);
    }

    public function destroy(Carriere $carriere)
    {
        $carriere->delete();
        return response()->json(['message' => 'Carrière supprimée avec succès']);
    }
}