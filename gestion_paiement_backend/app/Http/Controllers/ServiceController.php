<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Traits\LogsHistorique;

class ServiceController extends Controller
{
    use LogsHistorique;
    public function index()
    {
        $services = Service::with('direction')->get();
        return ServiceResource::collection($services);
    }

    public function store(StoreServiceRequest $request)
    {
        $service = Service::create($request->validated());
        $this->logCreate('services', $service->Id_service);
        return new ServiceResource($service);
    }

    public function show(Service $service)
    {
        $service->load('direction');
        return new ServiceResource($service);
    }

    public function update(StoreServiceRequest $request, Service $service)
    {
        $before = $service->getAttributes();
        $service->update($request->validated());
        $this->logUpdate('services', $service->Id_service, $before, $request->validated());
        return new ServiceResource($service);
    }

    public function destroy(Service $service)
    {
        $this->logDelete('services', $service->Id_service);
        $service->delete();
        return response()->json(['message' => 'Service supprimé avec succès']);
    }
}