<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Preembauche extends Model
{
    /** @use HasFactory<\Database\Factories\PreembaucheFactory> */
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'Id_preembauche';
    protected $fillable = [
        'N_contrat', 
        'Date_recrutement', 
        'Date_recrutement1',
        'Deb_stage_PreEmb', 
        'Deb_stage_PreEmb_txt', 
        'Fin_stage_PreEmb',
        'Fin_stage_PreEmb_txt', 
        'Montant_PreEmb', 
        'Montant_PreEmb_Contrat',
        'id_agent', 
        'Id_contrat'
    ];
    protected $casts = [
        'Date_recrutement' => 'date',
        'Date_recrutement1' => 'date',
        'Deb_stage_PreEmb' => 'date',
        'Fin_stage_PreEmb' => 'date',
        'Montant_PreEmb' => 'decimal:2',
        'Montant_PreEmb_Contrat' => 'decimal:2',
    ];
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'Id_agent');
    }

    public function contrat()
    {
        return $this->belongsTo(Contrat::class, 'Id_contrat');
    }
}
