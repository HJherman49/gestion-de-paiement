<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReclassementRequest;
use App\Http\Resources\ReclassementResource;
use App\Models\Reclassement;

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
}