<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBaremeRequest;
use App\Http\Resources\BaremeResource;
use App\Models\Bareme;

class BaremeController extends Controller
{
    public function index()
    {
        $baremes = Bareme::paginate(20);
        return BaremeResource::collection($baremes);
    }

    public function store(StoreBaremeRequest $request)
    {
        $bareme = Bareme::create($request->validated());
        return new BaremeResource($bareme);
    }

    public function show(Bareme $bareme)
    {
        return new BaremeResource($bareme);
    }

    public function update(StoreBaremeRequest $request, Bareme $bareme)
    {
        $bareme->update($request->validated());
        return new BaremeResource($bareme);
    }

    public function destroy(Bareme $bareme)
    {
        if ($bareme->carrieres()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce barème car il est utilisé dans des carrières.'
            ], 422);
        }

        $bareme->delete();
        return response()->json(['message' => 'Barème supprimé avec succès']);
    }
}