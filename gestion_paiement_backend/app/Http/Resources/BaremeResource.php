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
            'salaire_base'    => number_format($this->salaire_base, 2),
            'salaire_mensuel' => number_format($this->salaire_mensuel, 2),
            'anciennete'      => $this->anciennete,
            'DIF'             => number_format($this->DIF ?? 0, 2),
            'rappell'         => number_format($this->rappell ?? 0, 2),
        ];
    }
}