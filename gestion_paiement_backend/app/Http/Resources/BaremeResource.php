<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BaremeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'Id_bareme'       => $this->Id_bareme,
            'Indice'          => $this->Indice,
            // Return raw numeric values so frontend can parse them reliably
            'salaire_base'    => $this->salaire_base !== null ? (float) $this->salaire_base : 0.0,
            'salaire_mensuel' => $this->salaire_mensuel !== null ? (float) $this->salaire_mensuel : 0.0,
            'anciennete'      => $this->anciennete !== null ? (float) $this->anciennete : 0.0,
            'DIF'             => $this->DIF !== null ? (float) $this->DIF : 0.0,
            'rappell'         => $this->rappell !== null ? (float) $this->rappell : 0.0,
        ];
    }
}