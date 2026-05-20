<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnfantResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'Id_enfant'        => $this->Id_enfant,
            'date_de_naissance'=> $this->date_naissance?->format('Y-m-d'),
            'Nb_enf'           => $this->Nb_enf,
            'Nb_enf_inf_15ans' => $this->Nb_enf_inf_15ans,
            'Nb_enf_sup_15ans' => $this->Nb_enf_sup_15ans,
            'Id_agent'         => $this->Id_agent,
            'agent'            => $this->whenLoaded('agent', fn() => [
                'Id_agent'     => $this->agent->Id_agent,
                'nom'          => $this->agent->nom,
                'prenoms'      => $this->agent->prenoms,
                'num_matricule'=> $this->agent->num_matricule,
            ]),
            'created_at'       => $this->created_at?->format('Y-m-d H:i'),
            'updated_at'       => $this->updated_at?->format('Y-m-d H:i'),
        ];
    }
}
