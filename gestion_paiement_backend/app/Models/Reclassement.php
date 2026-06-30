<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reclassement extends Model
{
    /** @use HasFactory<\Database\Factories\ReclassementFactory> */
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'Id_reclass';

    protected $fillable = [
        'date_reclassement',
        'categ_reclassement',
        'ancienne_categorie',
        'nouveau_corps',
        'nouveau_grade',
        'nouvelle_classe',
        'nouvel_indice',
        'nouvelle_echelon',
        'date_effet_solde',
        'date_effet_anciennete',
        'observation',
        'Id_carriere',
        'valide_le',
    ];
    protected $casts = [
        'date_reclassement' => 'date',
        'date_effet_solde' => 'date',
        'date_effet_anciennete' => 'date',
        'valide_le' => 'datetime',
    ];
    public function carriere()
    {
        return $this->belongsTo(Carriere::class, 'Id_carriere');
    }
}
