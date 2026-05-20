<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'Id_agent'          => $this->Id_agent,
            'num_matricule'      => $this->num_matricule,
            'nom'                => $this->nom,
            'prenoms'            => $this->prenoms,
            'nom_complet'        => $this->nom . ' ' . $this->prenoms,
            'adresse'            => $this->adresse,
            'N_CIN'              => $this->N_CIN,
            'date_naissance'     => $this->date_naissance?->format('Y-m-d'),
            'sexe'               => $this->sexe,
            'civilite'           => $this->civilite,
            'tel'                => $this->tel,
            'date_entree_admin'  => $this->date_entree_admin?->format('Y-m-d'),
            'date_delivrance_CI' => $this->date_delivrance_CI?->format('Y-m-d'),
            'lieu_delivrance_CI' => $this->lieu_delivrance_CI,

            // Relations simples
            'direction' => $this->whenLoaded('direction', fn() => [
                'Id_direction'   => $this->direction->Id_direction,
                'nom_direction'  => $this->direction->nom_direction,
                'sigle'          => $this->direction->sigle ?? null,
            ]),

            'service' => $this->whenLoaded('service', fn() => [
                'Id_service'   => $this->service->Id_service,
                'nom_service'  => $this->service->nom_service,
            ]),

            'division' => $this->whenLoaded('division', fn() => [
                'Id_division'   => $this->division->Id_division,
                'Nom_division'  => $this->division->Nom_division,
            ]),

            'statut' => $this->whenLoaded('statut', fn() => [
                'Id_statut'    => $this->statut->Id_statut,
                'type_statut'  => $this->statut->type_statut,
            ]),

            'contrat' => $this->whenLoaded('contrat', fn() => [
                'Id_contrat'   => $this->contrat->Id_contrat,
                'type_contrat' => $this->contrat->type_contrat,
            ]),

            // Relations plus détaillées (chargées avec with())
            'enfants_count'      => $this->whenCounted('enfants'),
            'carrieres'          => CarriereResource::collection($this->whenLoaded('carrieres')),
            'comptes_bancaires'  => CompteBancaireResource::collection($this->whenLoaded('comptesBancaires')),
            //'fonctions'          => FonctionResource::collection($this->whenLoaded('fonctions')),

            'created_at'         => $this->created_at?->format('Y-m-d H:i'),
            'updated_at'         => $this->updated_at?->format('Y-m-d H:i'),
        ];
    }
}