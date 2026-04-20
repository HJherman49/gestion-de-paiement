<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FonctionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'Id_fonction'      => $this->Id_fonction,
            'nom_fonction'     => $this->nom_fonction,
            'date_fonction'    => $this->date_fonction?->format('Y-m-d'),
            'date_affectation' => $this->date_affectation?->format('Y-m-d'),
            'fonction_prime'   => number_format($this->fonction_prime ?? 0, 2),
            'num_fonct'        => $this->num_fonct,

            // Relations
            'direction'        => $this->whenLoaded('direction', fn() => [
                'Id_direction'  => $this->direction->Id_direction,
                'nom_direction' => $this->direction->nom_direction,
                'sigle'         => $this->direction->sigle,
            ]),

            'agent'            => $this->whenLoaded('agent', fn() => [
                'Id_agents'     => $this->agent->id_agents,
                'nom_complet'   => $this->agent->nom . ' ' . $this->agent->prenoms,
                'num_matricule' => $this->agent->num_matricule,
            ]),

            'created_at'       => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}