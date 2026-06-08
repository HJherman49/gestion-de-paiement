<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDiplomeRequest;
use App\Http\Resources\DiplomeResource;
use App\Models\Diplome;
use App\Models\Agent;
use Illuminate\Http\Request;

class DiplomeController extends Controller
{
    // ── GET /api/v1/diplomes ──────────────────────────────────────────────
    public function index()
    {
        return DiplomeResource::collection(Diplome::paginate(20));
    }

    // ── POST /api/v1/diplomes ─────────────────────────────────────────────
    public function store(StoreDiplomeRequest $request)
    {
        $diplome = Diplome::create($request->validated());
        return new DiplomeResource($diplome);
    }

    // ── GET /api/v1/agents/{agent}/diplomes ───────────────────────────────
    // Liste les diplomes d'un agent
    public function parAgent(Agent $agent)
    {
        $diplomes = $agent->diplomes()->get();
        return response()->json([
            'success' => true,
            'data'    => $diplomes->map(fn($d) => [
                'Id_diplome' => $d->Id_diplome,
                'libelle'    => $d->libelle,
                'specialite' => $d->{'specialite'},
            ]),
        ]);
    }

    // ── POST /api/v1/agents/{agent}/diplomes ──────────────────────────────
    // Synchroniser les diplomes d'un agent (remplace tous les anciens)
    public function syncAgent(Request $request, Agent $agent)
    {
        $request->validate([
            'diplomes'   => 'nullable|array',
            'diplomes.*' => 'integer|exists:diplomes,Id_diplome',
        ]);

        // sync() supprime les anciens et ajoute les nouveaux
        $agent->diplomes()->sync($request->diplomes ?? []);

        return response()->json([
            'success' => true,
            'message' => 'Diplômes de l\'agent mis à jour',
            'data'    => $agent->diplomes()->get()->map(fn($d) => [
                'Id_diplome' => $d->Id_diplome,
                'libelle'    => $d->libelle,
                'specialite' => $d->{'specialite'},
            ]),
        ]);
    }

    // ── DELETE /api/v1/agents/{agent}/diplomes/{diplome} ──────────────────
    // Detacher un diplôme specifique d'un agent
    public function detachAgent(Agent $agent, Diplome $diplome)
    {
        $agent->diplomes()->detach($diplome->Id_diplome);
        return response()->json(['success' => true, 'message' => 'Diplôme retiré']);
    }
}