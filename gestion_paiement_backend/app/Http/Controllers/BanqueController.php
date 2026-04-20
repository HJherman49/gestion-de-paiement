<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBanqueRequest;
use App\Http\Resources\BanqueResource;
use App\Models\Banque;

class BanqueController extends Controller
{
    public function index()
    {
        $banques = Banque::withCount('comptesBancaires')->paginate(15);
        return BanqueResource::collection($banques);
    }

    public function store(StoreBanqueRequest $request)
    {
        $banque = Banque::create($request->validated());
        return new BanqueResource($banque);
    }

    public function show(Banque $banque)
    {
        $banque->loadCount('comptesBancaires');
        return new BanqueResource($banque);
    }

    public function update(StoreBanqueRequest $request, Banque $banque)
    {
        $banque->update($request->validated());
        return new BanqueResource($banque);
    }

    public function destroy(Banque $banque)
    {
        if ($banque->comptesBancaires()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer cette banque car elle est utilisée par des comptes bancaires.'
            ], 422);
        }

        $banque->delete();
        return response()->json(['message' => 'Banque supprimée avec succès']);
    }
}