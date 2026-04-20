<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contrat extends Model
{
    protected $primaryKey = 'Id_contrat';

    protected $fillable = [
        'type_contrat',
        'duree',
    ];
}