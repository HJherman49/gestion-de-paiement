<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    protected $primaryKey = 'Id_division';

    protected $fillable = [
        'Nom_division',
        'section',
        'Id_service',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class, 'Id_service', 'Id_service');
    }
}