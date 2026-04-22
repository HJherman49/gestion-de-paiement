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
            'prénoms'            => $this->prenoms,
            'nom_complet'        => $this->nom . ' ' . $this->prenoms,
            'adresse'            => $this->adresse,
            'N_CIN'              => $this->N_CIN,
            'date_de_naissance'  => $this->date_de_naissance?->format('Y-m-d'),
            'sexe'               => $this->sexe,
            'civilite'           => $this->civilite,
            'tel'                => $this->tel,
            'date_entree_admin'  => $this->date_entree_admin?->format('Y-m-d'),

            // Relations simples
            'direction'          => $this->whenLoaded('direction', fn() => $this->direction->nom_Direction),
            'service'            => $this->whenLoaded('service', fn() => $this->service->nom_service),
            'division'           => $this->whenLoaded('division', fn() => $this->division->Nom_division),
            'statut'             => $this->whenLoaded('statut', fn() => $this->statut->type_statut),
            'contrat'            => $this->whenLoaded('contrat', fn() => $this->contrat->type_contrat),

            // Relations plus détaillées (chargées avec with())
            'enfants_count'      => $this->whenCounted('enfants'),
            'carrieres'          => CarriereResource::collection($this->whenLoaded('carrieres')),
            'comptes_bancaires'  => CompteBancaireResource::collection($this->whenLoaded('comptesBancaires')),
            'fonctions'          => FonctionResource::collection($this->whenLoaded('fonctions')),

            'created_at'         => $this->created_at?->format('Y-m-d H:i'),
            'updated_at'         => $this->updated_at?->format('Y-m-d H:i'),
        ];
    }
}