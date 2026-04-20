<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContratResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'Id_contrat'   => $this->Id_contrat,
            'type_contrat' => $this->type_contrat,
            'duree'        => $this->duree,
            'created_at'   => $this->created_at?->format('Y-m-d H:i'),
            'updated_at'   => $this->updated_at?->format('Y-m-d H:i'),
        ];
    }
}