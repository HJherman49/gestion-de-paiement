<?php

namespace App\Http\Controllers;
use App\Http\Requests\StoreDiplomeRequest;
use App\Http\Resources\DiplomeResource;
use App\Models\Diplome;
use Illuminate\Http\Request;

class DiplomeController extends Controller
{
    public function index() { return DiplomeResource::collection(Diplome::paginate(20)); }

    public function store(StoreDiplomeRequest $request) 
    {
        $diplome = Diplome::create($request->validated());
        return new DiplomeResource($diplome);
    }
}
