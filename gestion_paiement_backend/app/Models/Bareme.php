<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Bareme extends Model
{
    /** @use HasFactory<\Database\Factories\BaremeFactory> */
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'Id_bareme';

    protected $fillable = [
        'Indice',
        'salaire_base',
        'salaire_mensuel',
        'anciennete',
        'DIF',
        'rappell'
    ];

    protected $casts = [
        'Indice' => 'integer',
        'salaire_base' => 'decimal:2',
        'salaire_mensuel' => 'decimal:2',
        'anciennete' => 'integer',
        'DIF' => 'decimal:2',
        'rappell' => 'decimal:2',
    ];
}
