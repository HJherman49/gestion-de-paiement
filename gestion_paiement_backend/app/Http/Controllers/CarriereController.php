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

    public function parAgent(Agent $agent)
    {
        $carrieres = Carriere::where('Id_agent', $agent->Id_agent)
            ->with(['agent.direction', 'agent.service', 'bareme'])
            ->orderByDesc('Id_carriere')
            ->paginate(15);

        return CarriereResource::collection($carrieres);
    }

    public function actuelle(Agent $agent)
    {
        $carriere = $agent->carriereActuelle()
            ->with(['agent.direction', 'agent.service', 'bareme'])
            ->first();

        if (! $carriere) {
            return response()->json(['message' => 'Aucune carrière actuelle trouvée'], 404);
        }

        return new CarriereResource($carriere);
    }
}