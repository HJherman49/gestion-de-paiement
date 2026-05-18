<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistoriqueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'Id_historique'     => $this->Id_historique,
            'table_concernee'   => $this->table_concernee,
            'id_enregistrement' => $this->id_enregistrement,
            'type_action'       => $this->type_action,
            'date_action'       => $this->date_action?->format('Y-m-d H:i:s'),
            'champ_modifie'     => $this->champ_modifie,
            'valeur_avant'      => $this->valeur_avant,
            'valeur_apres'      => $this->valeur_apres,
            'utilisateur'       => $this->utilisateur,
            'created_at'        => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}