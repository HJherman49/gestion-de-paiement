<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Concours extends Model
{
    /** @use HasFactory<\Database\Factories\ConcoursFactory> */
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'Id_concours';
    protected $fillable = ['libelle'];
    public function agents()
    {
        return $this->belongsToMany(Agent::class, 'agent_concours', 'Id_concours', 'Id_agent');
    }
}
