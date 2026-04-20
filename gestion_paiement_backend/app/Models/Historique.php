<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Historique extends Model
{
    /** @use HasFactory<\Database\Factories\HistoriqueFactory> */
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'Id_historique';

    protected $fillable = [
        'table_concernee',
        'id_enregistrement',
        'Id_agent',
        'type_action',
        'date_action',
        'champ_modifie',
        'valeur_avant',
        'valeur_apres',
        'utilisateur'
    ];

    protected $casts = [
        'date_action' => 'datetime',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'Id_agent');
    }
}
