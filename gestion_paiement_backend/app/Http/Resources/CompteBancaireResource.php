<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompteBancaireResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'Id_compte'     => $this->Id_compte,
            'num_compte'    => $this->num_compte,
            'banque'        => $this->whenLoaded('banque', fn() => $this->banque->nom_banque),
            'agence'        => $this->whenLoaded('banque', fn() => $this->banque->agence),
            'RIB'           => $this->RIB,
        ];
    }
}