<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'Id_region'    => $this->Id_region,
            'nom_region'   => $this->nom_region,
            'chef_region'  => $this->chef_region,
        ];
    }
}
