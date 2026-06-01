<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaieRequest;
use App\Http\Resources\PaieResource;
use App\Models\Paie;
use App\Models\Agent;
use App\Traits\LogsHistorique;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class PaieController extends Controller
{
    use LogsHistorique;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $paies = Paie::with(['agent.direction', 'agent.service', 'enfant'])
                     ->latest()
                     ->paginate(20);

        return 
            PaieResource::collection($paies);
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePaieRequest $request)
    {
        $paie = Paie::create($request->validated());
        $this->logCreate('paies', $paie->Id_paie);

        // Optionnel : charger les relations pour la réponse
        $paie->load(['agent.direction', 'agent.service', 'enfant']);

        return new PaieResource($paie);
    }

    /**
     * Display the specified resource.
     */
    public function show(Paie $paie)
    {
        $paie->load(['agent.direction', 'agent.service', 'enfant']);
        return new PaieResource($paie);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StorePaieRequest $request, Paie $paie)
    {
        $before = $paie->getAttributes();
        $paie->update($request->validated());
        $this->logUpdate('paies', $paie->Id_paie, $before, $request->validated());
        $paie->load(['agent.direction', 'agent.service', 'enfant']);

        return new PaieResource($paie);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Paie $paie)
    {
        $this->logDelete('paies', $paie->Id_paie);
        $paie->delete();
        return response()->json([
            'message' => 'Bulletin de paie supprimé avec succès'
        ]);
    }

    /**
     * Bonus : Lister les paies d'un agent spécifique
     */
    public function paiesParAgent(Agent $Id_agent)
    {
        $paies = Paie::where('Id_agent', $Id_agent)
                     ->with(['agent.direction', 'agent.service', 'enfant'])
                     ->latest()
                     ->paginate(15);

        return PaieResource::collection($paies);
    }
    public function exportBulletin($id)
    {
        $paie = Paie::findOrFail($id);

        $pdf = Pdf::loadView('pdf.bulletin', compact('paie'));

        return $pdf->download("bulletin_{$id}.pdf");
    }
}