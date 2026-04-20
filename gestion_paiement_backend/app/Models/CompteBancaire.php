<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompteBancaire extends Model
{
    /** @use HasFactory<\Database\Factories\CompteBancaireFactory> */
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'Id_compte_bancaire';
    protected $fillable = [
        'num_compte',
        'adresse_banque',
        'code_localite',
        'CODQEB',
        'GUICHB',
        'RIB',
        'Id_agent',
        'Id_banque',
    ];
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'Id_agent');
    }

    public function banque()
    {
        return $this->belongsTo(Banque::class, 'Id_banque');
    }
}
