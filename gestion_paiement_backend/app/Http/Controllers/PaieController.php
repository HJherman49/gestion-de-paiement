<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaieRequest;
use App\Http\Resources\PaieResource;
use App\Models\Paie;
use Illuminate\Http\Request;

class PaieController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $paies = Paie::with(['agent', 'enfant'])
                     ->latest()
                     ->paginate(20);

        return PaieResource::collection($paies);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePaieRequest $request)
    {
        $paie = Paie::create($request->validated());

        // Optionnel : charger les relations pour la réponse
        $paie->load(['agent', 'enfant']);

        return new PaieResource($paie);
    }

    /**
     * Display the specified resource.
     */
    public function show(Paie $paie)
    {
        $paie->load(['agent', 'enfant']);
        return new PaieResource($paie);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StorePaieRequest $request, Paie $paie)
    {
        $paie->update($request->validated());
        $paie->load(['agent', 'enfant']);

        return new PaieResource($paie);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Paie $paie)
    {
        $paie->delete();
        return response()->json([
            'message' => 'Bulletin de paie supprimé avec succès'
        ]);
    }

    /**
     * Bonus : Lister les paies d'un agent spécifique
     */
    public function paiesParAgent($Id_agent)
    {
        $paies = Paie::where('Id_agent', $Id_agent)
                     ->with('enfant')
                     ->latest()
                     ->paginate(15);

        return PaieResource::collection($paies);
    }
}