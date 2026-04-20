<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDirectionRequest;
use App\Http\Resources\DirectionResource;
use App\Models\Direction;
use Illuminate\Http\Request;

class DirectionController extends Controller
{
    public function index()
    {
        $directions = Direction::with('services')->paginate(15);
        return DirectionResource::collection($directions);
    }

    public function store(StoreDirectionRequest $request)
    {
        $direction = Direction::create($request->validated());
        return new DirectionResource($direction);
    }

    public function show(Direction $direction)
    {
        $direction->load('services');
        return new DirectionResource($direction);
    }

    public function update(StoreDirectionRequest $request, Direction $direction)
    {
        $direction->update($request->validated());
        return new DirectionResource($direction);
    }

    public function destroy(Direction $direction)
    {
        $direction->delete();
        return response()->json(['message' => 'Direction supprimée avec succès']);
    }
}