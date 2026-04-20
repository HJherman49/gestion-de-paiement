<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DirectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'Id_direction'   => $this->Id_direction,
            'nom_direction'  => $this->nom_direction,
            'sigle'          => $this->sigle,
            'siege'          => $this->siege,
            'faritany'       => $this->faritany,
            'services_count' => $this->whenCounted('services'),
        ];
    }
}