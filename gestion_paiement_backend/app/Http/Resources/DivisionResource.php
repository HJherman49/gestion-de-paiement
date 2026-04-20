<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DivisionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'Id_division'   => $this->Id_division,
            'Nom_division'  => $this->Nom_division,
            'section'       => $this->section,
            'service'       => $this->whenLoaded('service', fn() => $this->service->nom_service),
        ];
    }
}