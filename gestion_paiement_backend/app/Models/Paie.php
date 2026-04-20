<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Paie extends Model
{
    /** @use HasFactory<\Database\Factories\PaieFactory> */
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'Id_paie';

    protected $fillable = [
        'mois', 
        'annee', 
        'salaire_brut', 
        'prime', 
        'scola', 
        'remboursement',
        'Indice', 
        'prime_speciale', 
        'prime_fin_annee', 
        'alloc', 
        'logement',
        'IGR', 
        'rappel', 
        'PA', 
        'mode_paie', 
        'chap', 
        'art', 
        'date_effet',
        'Id_agent', 
        'Id_enfant'
    ];

    protected $casts = [
        'mois' => 'integer',
        'annee' => 'integer',
        'salaire_brut' => 'decimal:2',
        'prime' => 'decimal:2',
        'scola' => 'decimal:2',
        'remboursement' => 'decimal:2',
        'prime_speciale' => 'decimal:2',
        'prime_fin_annee' => 'decimal:2',
        'alloc' => 'decimal:2',
        'logement' => 'decimal:2',
        'IGR' => 'decimal:2',
        'rappel' => 'decimal:2',
        'PA' => 'decimal:2',
        'date_effet' => 'date',
    ];
    
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'Id_agent');
    }

    public function enfant()
    {
        return $this->belongsTo(Enfant::class, 'Id_enfant');
    }
}
