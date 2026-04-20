<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Diplome extends Model
{
    /** @use HasFactory<\Database\Factories\DiplomeFactory> */
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'Id_diplome';
    protected $fillable = ['spécialité', 'libelle'];
    public function agents()
    {
        return $this->belongsToMany(Agent::class, 'agent_diplome', 'Id_diplome', 'Id_agent');
    }
}
