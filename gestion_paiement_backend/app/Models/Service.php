<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $primaryKey = 'Id_service';

    protected $fillable = [
        'nom_service',
        'Id_direction',
    ];

    public function direction()
    {
        return $this->belongsTo(Direction::class, 'Id_direction');
    }

    public function divisions()
    {
        return $this->hasMany(Division::class, 'Id_service');
    }
}
