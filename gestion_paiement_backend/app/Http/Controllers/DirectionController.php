<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDirectionRequest;
use App\Http\Resources\DirectionResource;
use App\Models\Direction;
use App\Traits\LogsHistorique;
use Illuminate\Http\Request;

class DirectionController extends Controller
{
    use LogsHistorique;
    public function index()
    {
        $directions = Direction::with('services')->get();
        return DirectionResource::collection($directions);
    }

    public function store(StoreDirectionRequest $request)
    {
        $direction = Direction::create($request->validated());
        $this->logCreate('directions', $direction->Id_direction);
        return new DirectionResource($direction);
    }

    public function show(Direction $direction)
    {
        $direction->load('services');
        return new DirectionResource($direction);
    }

    public function update(StoreDirectionRequest $request, Direction $direction)
    {
        $before = $direction->getAttributes();
        $direction->update($request->validated());
        $this->logUpdate('directions', $direction->Id_direction, $before, $request->validated());
        return new DirectionResource($direction);
    }

    public function destroy(Direction $direction)
    {
        $this->logDelete('directions', $direction->Id_direction);
        $direction->delete();
        return response()->json(['message' => 'Direction supprimée avec succès']);
    }
}