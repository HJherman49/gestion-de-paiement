<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CarriereResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'Id_carriere' => $this->Id_carriere,
            'Categorie'   => $this->Categorie,
            'corps'       => $this->corps,
            'grade'       => $this->grade,
            'classe'      => $this->classe,
            'echelon'     => $this->echelon,
            'indice'      => $this->indice,
            'bareme'      => $this->whenLoaded('bareme', fn() => [
                'salaire_base'    => $this->bareme->salaire_base,
                'salaire_mensuel' => $this->bareme->salaire_mensuel,
            ]),
            'date_debut'  => $this->created_at?->format('Y-m-d'),
        ];
    }
}