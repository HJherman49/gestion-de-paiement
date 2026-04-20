<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PreembaucheResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'Id_preemb'               => $this->Id_preemb,
            'N_contrat'               => $this->N_contrat,
            'Date_recrutement'        => $this->Date_recrutement?->format('Y-m-d'),
            'Date_recrutement1'       => $this->Date_recrutement1?->format('Y-m-d'),
            
            'periode_stage' => [
                'debut' => $this->Deb_stage_PreEmb?->format('Y-m-d'),
                'fin'   => $this->Fin_stage_PreEmb?->format('Y-m-d'),
                'texte_debut' => $this->Deb_stage_PreEmb_txt,
                'texte_fin'   => $this->Fin_stage_PreEmb_txt,
            ],

            'montants' => [
                'preembauche' => number_format($this->Montant_PreEmb ?? 0, 2),
                'contrat'     => number_format($this->Montant_PreEmb_Contrat ?? 0, 2),
            ],

            // Relations
            'agent' => $this->whenLoaded('agent', fn() => [
                'Id_agents'     => $this->agent->Id_agents,
                'nom_complet'   => $this->agent->nom . ' ' . $this->agent->prenoms,
                'num_matricule' => $this->agent->num_matricule,
            ]),

            'contrat' => $this->whenLoaded('contrat', fn() => [
                'type_contrat' => $this->contrat->type_contrat,
                'duree'        => $this->contrat->duree,
            ]),

            'created_at' => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}