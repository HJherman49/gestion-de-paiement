<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRegionRequest;
use App\Http\Resources\RegionResource;
use App\Models\Region;

class RegionController extends Controller
{
    public function index()  { return RegionResource::collection(Region::paginate(15)); }
    public function store(StoreRegionRequest $request) { 
        $region = Region::create($request->validated()); 
        return new RegionResource($region); 
    }
    public function show(Region $region) { return new RegionResource($region); }
    public function update(StoreRegionRequest $request, Region $region) {
        $region->update($request->validated());
        return new RegionResource($region);
    }
    public function destroy(Region $region) { 
        $region->delete(); 
        return response()->json(['message' => 'Région supprimée']); 
    }
}