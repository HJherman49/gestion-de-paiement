<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Statut extends Model
{
    protected $primaryKey = 'Id_statut';

    protected $fillable = [
        'type_statut',
    ];
}