<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BanqueResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'Id_banque'         => $this->Id_banque,
            'nom_banque'        => $this->nom_banque,
            'agence'            => $this->agence,
            'code_banque'       => $this->code_banque,
            'code_localite_bnq' => $this->code_localite_bnq,
            'comptes_count'     => $this->whenCounted('comptesBancaires'),
            'created_at'        => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}
