<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contrat extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'contrats';
    protected $primaryKey = 'Id_contrat';

    protected $fillable = [
        'type_contrat',
        'duree',
    ];
    public function agents()
    {
        return $this->belongsTo(Agent::class, 'Id_agent');
    }
    public function preembauches()
    {
        return $this->hasMany(Preembauche::class, 'Id_contrat');
    }
}