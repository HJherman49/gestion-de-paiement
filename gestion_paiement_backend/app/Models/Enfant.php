<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Enfant extends Model
{
    /** @use HasFactory<\Database\Factories\EnfantFactory> */
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'Id_enfant';
    protected $fillable = [
        'date_de_naissance',
        'Nb_enf',
        'Nb_enf_inf_15ans',
        'Nb_enf_sup_15ans',
        'Id_agent',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'Nb_enf' => 'integer',
        'Nb_enf_inf_15ans' => 'integer',
        'Nb_enf_sup_15ans' => 'integer',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'Id_agent');
    }
}
