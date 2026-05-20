<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnfantRequest;
use App\Http\Resources\EnfantResource;
use App\Models\Agent;
use App\Models\Enfant;

class EnfantController extends Controller
{
    public function index()
    {
        $enfants = Enfant::with('agent')->paginate(20);
        return EnfantResource::collection($enfants);
    }

    public function parAgent(Agent $agent)
    {
        return EnfantResource::collection($agent->enfants()->with('agent')->get());
    }

    public function store(StoreEnfantRequest $request)
    {
        $data = $request->validated();
        if (isset($data['date_de_naissance'])) {
            $data['date_naissance'] = $data['date_de_naissance'];
            unset($data['date_de_naissance']);
        }

        $enfant = Enfant::create($data);
        return new EnfantResource($enfant);
    }

    public function show(Enfant $enfant)
    {
        $enfant->load('agent');
        return new EnfantResource($enfant);
    }

    public function update(StoreEnfantRequest $request, Enfant $enfant)
    {
        $data = $request->validated();
        if (isset($data['date_de_naissance'])) {
            $data['date_naissance'] = $data['date_de_naissance'];
            unset($data['date_de_naissance']);
        }

        $enfant->update($data);
        return new EnfantResource($enfant);
    }

    public function destroy(Enfant $enfant)
    {
        $enfant->delete();
        return response()->json(['message' => 'Enfant supprimé avec succès']);
    }
}