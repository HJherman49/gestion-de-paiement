<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaieResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        $salaire_net =
            (float)($this->salaire_brut ?? 0) +
            (float)($this->prime ?? 0) +
            (float)($this->prime_speciale ?? 0) +
            (float)($this->prime_fin_annee ?? 0) +
            (float)($this->alloc ?? 0) +
            (float)($this->logement ?? 0) +
            (float)($this->rappel ?? 0) -
            (float)($this->IGR ?? 0) -
            (float)($this->PA ?? 0);

        return [
            'Id_paie'        => $this->Id_paie,
            'mois'           => $this->mois,
            'annee'          => $this->annee,
            'periode'        => $this->mois . '/' . $this->annee,

            // (float) pour forcer number et non string
            'salaire_brut'   => (float)($this->salaire_brut ?? 0),
            'prime'          => (float)($this->prime ?? 0),
            'prime_speciale' => (float)($this->prime_speciale ?? 0),
            'prime_fin_annee'=> (float)($this->prime_fin_annee ?? 0),
            'alloc'          => (float)($this->alloc ?? 0),
            'logement'       => (float)($this->logement ?? 0),
            'scola'          => (float)($this->scola ?? 0),
            'remboursement'  => (float)($this->remboursement ?? 0),
            'rappel'         => (float)($this->rappel ?? 0),
            'Indice'         => (float)($this->Indice ?? 0),
            'IGR'            => (float)($this->IGR ?? 0),
            'PA'             => (float)($this->PA ?? 0),

            'salaire_net'    => (float)$salaire_net,
            'mode_paie'      => $this->mode_paie,
            'chap'           => $this->chap,
            'art'            => $this->art,
            'date_effet'     => $this->date_effet?->format('Y-m-d'),
            'Id_agent'       => $this->id_agent ?? $this->Id_agent,
            'Id_enfant'      => $this->Id_enfant,

            'agent' => $this->whenLoaded('agent', fn() => [
                'Id_agent'       => $this->agent->Id_agent,
                'nom'            => $this->agent->nom,
                'prenoms'        => $this->agent->prenoms,
                'num_matricule'  => $this->agent->num_matricule,
                'civilite'       => $this->agent->civilite,
                'direction'      => $this->agent->direction ? [
                    'Sigle' => $this->agent->direction->Sigle,
                ] : null,
                'service'        => $this->agent->service ? [
                    'nom_service' => $this->agent->service->nom_service,
                ] : null,
            ]),

            'enfant'     => $this->whenLoaded('enfant', fn() => [
                'Id_enfant'    => $this->enfant->Id_enfant
            ]),
            'created_at' => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}