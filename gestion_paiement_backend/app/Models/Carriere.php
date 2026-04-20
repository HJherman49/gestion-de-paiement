<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Carriere extends Model
{
    /** @use HasFactory<\Database\Factories\CarriereFactory> */
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'Id_carriere';

    protected $fillable = [
        'Categorie',
        'corps',
        'grade',
        'classe',
        'echelon',
        'indice',
        'Id_agent',
        'Id_bareme',
    ];

    protected $casts = [
        'indice' => 'integer',
    ];
    
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'Id_agent');
    }

    public function bareme()
    {
        return $this->belongsTo(Bareme::class, 'Id_bareme');
    }

    public function reclassements()
    {
        return $this->hasMany(Reclassement::class, 'Id_carriere');
    }
}
