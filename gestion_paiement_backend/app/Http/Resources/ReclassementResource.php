<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReclassementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'Id_reclass'            => $this->Id_reclass,
            'date_reclassement'     => $this->date_reclassement?->format('Y-m-d'),
            'categ_reclassement'    => $this->categ_reclassement,
            'date_effet_solde'      => $this->date_effet_solde?->format('Y-m-d'),
            'date_effet_anciennete' => $this->date_effet_anciennete?->format('Y-m-d'),
            'observation'           => $this->observation,

            // Relation avec Carriere
            'carriere' => $this->whenLoaded('carriere', fn() => [
                'Id_carriere' => $this->carriere->Id_carriere,
                'Categorie'   => $this->carriere->Categorie,
                'corps'       => $this->carriere->corps,
                'grade'       => $this->carriere->grade,
                'classe'      => $this->carriere->classe,
                'echelon'     => $this->carriere->echelon,
                'indice'      => $this->carriere->indice,
            ]),

            'created_at' => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}