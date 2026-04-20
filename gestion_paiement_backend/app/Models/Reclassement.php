<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reclassement extends Model
{
    /** @use HasFactory<\Database\Factories\ReclassementFactory> */
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'Id_reclassement';

    protected $fillable = [
        'date_reclassement',
        'categ_reclassement',
        'date_effet_solde',
        'date_effet_anciennete',
        'observation',
        'Id_carriere',
    ];
    protected $casts = [
        'date_reclassement' => 'date',
        'date_effet_solde' => 'date',
        'date_effet_anciennete' => 'date',
    ];
    public function carriere()
    {
        return $this->belongsTo(Carriere::class, 'Id_carriere');
    }
}
