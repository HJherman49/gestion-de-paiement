<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Direction extends Model
{
    protected $primaryKey = 'Id_direction';

    protected $fillable = [
        'nom_direction',
        'sigle',
        'siege',
        'faritany',
    ];
    public function services()
    {
        return $this->hasMany(Service::class, 'id_direction');
    }

    public function fonctions()
    {
        return $this->hasMany(Fonction::class, 'id_direction');
    }
}
