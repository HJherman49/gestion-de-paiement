<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReclassementRequest;
use App\Http\Resources\ReclassementResource;
use App\Models\Reclassement;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;


class ReclassementController extends Controller
{
    public function index()
    {
        $reclassements = Reclassement::with('carriere.agent')->paginate(15);
        return ReclassementResource::collection($reclassements);
    }

    public function store(StoreReclassementRequest $request)
    {
        $reclassement = Reclassement::create($request->validated());
        return new ReclassementResource($reclassement);
    }

    public function show(Reclassement $reclassement)
    {
        $reclassement->load('carriere.agent');
        return new ReclassementResource($reclassement);
    }

    public function update(StoreReclassementRequest $request, Reclassement $reclassement)
    {
        $reclassement->update($request->validated());
        return new ReclassementResource($reclassement);
    }

    public function destroy(Reclassement $reclassement)
    {
        $reclassement->delete();
        return response()->json(['message' => 'Reclassement supprimé avec succès']);
    }
     public function valider(Reclassement $reclassement): JsonResponse
    {
        if ($reclassement->valide_le !== null) {
            return response()->json([
                'message' => 'Ce reclassement a déjà été validé.',
            ], 409);
        }
 
        $carriere = $reclassement->carriere;
 
        if (!$carriere) {
            return response()->json([
                'message' => "Aucune carrière liée à ce reclassement (Id_carriere invalide).",
            ], 422);
        }
 
        DB::transaction(function () use ($reclassement, $carriere) {
            // 1. Capturer l'ancienne catégorie AVANT de l'écraser
            $ancienneCategorie = $carriere->Categorie;
 
            // 2. Mettre à jour la carrière avec la nouvelle catégorie
            $carriere->update([
                'Categorie' => $reclassement->categ_reclassement,
            ]);
 
            // 3. Figer l'ancienne valeur + marquer comme validé, dans la même requête
            $reclassement->update([
                'ancienne_categorie' => $ancienneCategorie,
                'valide_le'          => now(),
            ]);
        });
 
        return response()->json([
            'message' => 'Reclassement validé — catégorie de carrière mise à jour.',
            'data' => [
                'Id_carriere'         => $carriere->Id_carriere,
                'ancienne_categorie'  => $reclassement->fresh()->ancienne_categorie,
                'nouvelle_categorie'  => $carriere->Categorie,
            ],
        ]);
    }
}