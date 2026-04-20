<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Agent::with(['direction', 'service', 'division', 'statut', 'contrat'])->get();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'num_matricule' => 'required|unique:agents',
            'nom' => 'required',
            'prenoms' => 'required',
            'adresse' => 'nullable',
            'N_CIN' => 'unique:agents',
            'date_naissance' => 'required|date',
            'date_delivrance_CI' => 'required|date',
            'lieu_delivrance_CI' => 'required|string|max:150',
            'sexe' => 'required|in:M,F',
            'civilite' => 'required|in:Mr,Mme,Melle',
            'tel' => 'required|string|max:30',
            'mail' => 'nullable|email',
            'date_entree_admin' => 'required|date',
            'porte' => 'nullable',
            'pp_gale' => 'nullable|numeric',

            'Id_direction' => 'required|exists:directions,Id_direction',
            'Id_service' => 'required|exists:services,Id_service',
            'Id_division' => 'required|exists:divisions,Id_division',
            'Id_statut' => 'required|exists:statuts,Id_statut',
            'Id_contrat' => 'required|exists:contrats,Id_contrat',
        ]);

        Agent::create($data);

        return response()->json([
            'message' => 'Agent creer avec succes'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Agent $agent)
    {
        return $agent->load(['direction', 'service', 'division', 'statut', 'contrat']);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Agent $agent)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Agent $agent)
    {
        $data = $request->validate([
            'num_matricule' => 'string|max:50|unique:agents,num_matricule,' . $agent->Id_agent . ',Id_agent',
            'nom' => 'string|max:100',
            'prenoms' => 'string|max:150',
            'adresse' => 'string|max:250',
            'N_CIN' => 'string|max:50|unique:agents,N_CIN,' . $agent->Id_agent . ',Id_agent',
            'date_naissance' => 'date',
            'sexe' => 'in:M,F',
            'date_delivrance_CI' => 'date',
            'lieu_delivrance_CI' => 'string|max:150',
            'civilite' => 'in:Mr,Mme,Melle',
            'tel' => 'string|max:30',
            'mail' => 'string|max:150|nullable',
            'date_entree_admin' => 'date',
            'porte' => 'string|max:50|nullable',
            'pp_gale' => 'decimal:0,2|min:0',
            'Id_direction' => 'exists:directions,Id_direction',
            'Id_service' => 'exists:services,Id_service',
            'Id_division' => 'exists:divisions,Id_division',
            'Id_statut' => 'exists:statuts,Id_statut',
            'Id_contrat' => 'exists:contrats,Id_contrat'
        ]);

        $agent->update($data);

        return response()->json([
            'message' => 'Agent mis à jour avec succès'
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Agent $agent)
    {
        $agent->delete();

        return response()->json([
            'message' => 'Agent supprimé avec succès'
        ], 200);
    }
}
