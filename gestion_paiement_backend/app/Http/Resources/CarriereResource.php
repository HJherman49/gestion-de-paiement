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
            'agent'       => $this->whenLoaded('agent', fn() => [
                'Id_agent'       => $this->agent->Id_agent,
                'num_matricule'  => $this->agent->num_matricule,
                'nom'            => $this->agent->nom,
                'prenoms'        => $this->agent->prenoms,
                'civilite'       => $this->agent->civilite,
                'direction'      => $this->agent->direction ? [
                    'Sigle' => $this->agent->direction->Sigle,
                ] : null,
                'service'        => $this->agent->service ? [
                    'nom_service' => $this->agent->service->nom_service,
                ] : null,
            ]),
            'bareme'      => $this->whenLoaded('bareme', fn() => [
                'salaire_base'    => $this->bareme->salaire_base,
                'salaire_mensuel' => $this->bareme->salaire_mensuel,
            ]),
            'date_debut'  => $this->created_at?->format('Y-m-d'),
        ];
    }
}