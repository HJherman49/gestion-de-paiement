<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDivisionRequest;
use App\Http\Resources\DivisionResource;
use App\Models\Division;

class DivisionController extends Controller
{
    public function index()
    {
        $divisions = Division::with('service.direction')->paginate(20);
        return DivisionResource::collection($divisions);
    }

    public function store(StoreDivisionRequest $request)
    {
        $division = Division::create($request->validated());
        return new DivisionResource($division);
    }

    public function show(Division $division)
    {
        $division->load('service.direction');
        return new DivisionResource($division);
    }

    public function update(StoreDivisionRequest $request, Division $division)
    {
        $division->update($request->validated());
        return new DivisionResource($division);
    }

    public function destroy(Division $division)
    {
        $division->delete();
        return response()->json(['message' => 'Division supprimée avec succès']);
    }
}