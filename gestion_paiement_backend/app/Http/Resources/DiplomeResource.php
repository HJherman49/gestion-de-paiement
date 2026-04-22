<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiplomeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'Id_diplome'  => $this->Id_diplome,
            'spécialité'  => $this->spécialité,
            'libelle'     => $this->libelle,
        ];
    }
}
