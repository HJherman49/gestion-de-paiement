<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaieResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $salaire_net = 
            ($this->salaire_brut ?? 0) +
            ($this->prime ?? 0) +
            ($this->prime_speciale ?? 0) +
            ($this->prime_fin_annee ?? 0) +
            ($this->alloc ?? 0) +
            ($this->logement ?? 0) +
            ($this->rappel ?? 0) -
            ($this->IGR ?? 0) -
            ($this->PA ?? 0);

        return [
            'Id_paie'           => $this->Id_paie,
            'periode'           => $this->mois . '/' . $this->annee,
            'mois'              => $this->mois,
            'annee'             => $this->annee,

            'salaire_brut'      => number_format($this->salaire_brut ?? 0, 2),
            'primes_total'      => number_format(
                ($this->prime ?? 0) + 
                ($this->prime_speciale ?? 0) + 
                ($this->prime_fin_annee ?? 0), 2
            ),
            'allocations'       => number_format(
                ($this->alloc ?? 0) + ($this->logement ?? 0), 2
            ),
            'retenues'          => number_format(
                ($this->IGR ?? 0) + ($this->PA ?? 0), 2
            ),
            'salaire_net'       => number_format($salaire_net, 2),

            'mode_paie'         => $this->mode_paie,
            'date_effet'        => $this->date_effet?->format('Y-m-d'),

            // Relations
            'agent' => $this->whenLoaded('agent', fn() => [
                'Id_agents'   => $this->agent->Id_agent,
                'nom_complet' => $this->agent->nom . ' ' . $this->agent->prenoms,
                'num_matricule' => $this->agent->num_matricule,
            ]),

            'enfant' => $this->whenLoaded('enfant'),

            'created_at' => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}