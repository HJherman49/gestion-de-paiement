<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'Id_service'    => $this->Id_service,
            'nom_service'   => $this->nom_service,
            'direction'     => $this->whenLoaded('direction', fn() => $this->direction->nom_Direction),
        ];
    }
}