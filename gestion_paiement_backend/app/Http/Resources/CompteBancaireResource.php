<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompteBancaireResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'Id_compte' => $this->Id_compte,
            'Id_agent'      => $this->Id_agent,
            'Id_banque'     => $this->Id_banque,
            'num_compte'    => $this->num_compte,
            'adresse_bnq'   => $this->adresse_bnq,
            'code_localite' => $this->code_localite,
            'CODQEB'        => $this->CODQEB,
            'GUICHB'        => $this->GUICHB,
            'RIB'           => $this->RIB,
            'agent'            => $this->whenLoaded('agent', fn() => [
                'Id_agent'     => $this->agent->Id_agent,
                'nom'          => $this->agent->nom,
                'prenoms'      => $this->agent->prenoms,
                'civilite'     => $this->agent->civilite,
                'num_matricule'=> $this->agent->num_matricule,
            ]),
            'banque'        => $this->whenLoaded('banque', fn() => [
                'Id_banque'   => $this->banque->Id_banque,
                'Nom_banque' => $this->banque->Nom_banque,
                'code_banque' => $this->banque->code_banque,
                'agence'     => $this->banque->agence
            ]),
            
        ];
    }
}