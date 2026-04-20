<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Fonction extends Model
{
    /** @use HasFactory<\Database\Factories\FonctionFactory> */
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'Id_fonction';
    protected $fillable = [
        'nom_fonction', 
        'date_fonction', 
        'date_affectation', 
        'fonction_prime', 
        'num_fonct',
        'Id_direction', 
        'Id_agent',
    ];
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'Id_agent');
    }

    public function direction()
    {
        return $this->belongsTo(Direction::class, 'Id_direction');
    }
}
