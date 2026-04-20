<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StatutResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'Id_statut'    => $this->Id_statut,
            'type_statut'  => $this->type_statut,
            'created_at'   => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}
