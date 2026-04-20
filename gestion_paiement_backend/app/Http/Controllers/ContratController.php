<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContratRequest;   // On va le créer juste après
use App\Http\Resources\ContratResource;
use App\Models\Contrat;
use Illuminate\Http\Request;

class ContratController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $contrats = Contrat::paginate(15);
        return ContratResource::collection($contrats);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreContratRequest $request)
    {
        $contrat = Contrat::create($request->validated());
        
        return new ContratResource($contrat);
    }

    /**
     * Display the specified resource.
     */
    public function show(Contrat $contrat)
    {
        return new ContratResource($contrat);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreContratRequest $request, Contrat $contrat)
    {
        $contrat->update($request->validated());
        
        return new ContratResource($contrat);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Contrat $contrat)
    {
        // Optionnel : vérifier si le contrat est utilisé par des agents avant suppression
        if ($contrat->preembauches()->exists() || $contrat->agents()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce contrat car il est utilisé par des agents ou des préembauches.'
            ], 422);
        }

        $contrat->delete();
        
        return response()->json([
            'message' => 'Contrat supprimé avec succès'
        ]);
    }
}