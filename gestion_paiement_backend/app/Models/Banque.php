<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Banque extends Model
{
    /** @use HasFactory<\Database\Factories\BanqueFactory> */
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'Id_banque';

    protected $fillable = [
        'Nom_banque',
        'agence',
        'code_banque',
        'code_localite_bnq'
    ];
    public function comptesBancaires()
    {
        return $this->hasMany(CompteBancaire::class, 'Id_banque');
    }   
}
