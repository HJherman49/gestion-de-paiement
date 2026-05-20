<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDivisionRequest;
use App\Http\Resources\DivisionResource;
use App\Models\Division;
use App\Traits\LogsHistorique;

class DivisionController extends Controller
{
    use LogsHistorique;
    public function index()
    {
        $divisions = Division::with('service.direction')->get();
        return DivisionResource::collection($divisions);
    }

    public function store(StoreDivisionRequest $request)
    {
        $division = Division::create($request->validated());
        $this->logCreate('divisions', $division->Id_division);
        return new DivisionResource($division);
    }

    public function show(Division $division)
    {
        $division->load('service.direction');
        return new DivisionResource($division);
    }

    public function update(StoreDivisionRequest $request, Division $division)
    {
        $before = $division->getAttributes();
        $division->update($request->validated());
        $this->logUpdate('divisions', $division->Id_division, $before, $request->validated());
        return new DivisionResource($division);
    }

    public function destroy(Division $division)
    {
        $this->logDelete('divisions', $division->Id_division);
        $division->delete();
        return response()->json(['message' => 'Division supprimée avec succès']);
    }
}