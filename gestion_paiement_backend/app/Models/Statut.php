<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Statut extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'statuts';
    protected $primaryKey = 'Id_statut';

    protected $fillable = [
        'type_statut'
    ];

    // === AJOUTE CETTE RELATION ===
    public function agents()
    {
        return $this->hasMany(Agent::class, 'Id_statut');
    }
}