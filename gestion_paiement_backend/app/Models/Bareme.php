<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Bareme extends Model
{
    /** @use HasFactory<\Database\Factories\BaremeFactory> */
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'Id_bareme';

    protected $fillable = [
        'Indice',
        'salaire_base',
        'salaire_mensuel',
        'anciennete',
        'DIF',
        'rappell'
    ];

    protected static function booted()
    {
        // Calculer le salaire mensuel automatiquement avant de sauvegarder
        static::saving(function (Bareme $bareme) {
            $bareme->calculerSalaireMensuel();
        });

        static::updated(function (Bareme $bareme) {
            if ($bareme->wasChanged('Indice')) {
                $bareme->carrieres()->update(['indice' => $bareme->Indice]);
            }
        });
    }

    /**
     * Calculer automatiquement le salaire mensuel
     * Formule: salaire_mensuel = salaire_base + anciennete + DIF + rappell
     */
    public function calculerSalaireMensuel()
    {
        $this->salaire_mensuel = 
            ($this->salaire_base ?? 0) + 
            ($this->anciennete ?? 0) + 
            ($this->DIF ?? 0) + 
            ($this->rappell ?? 0);
    }

    protected $casts = [
        'Indice' => 'integer',
        'salaire_base' => 'decimal:2',
        'salaire_mensuel' => 'decimal:2',
        'anciennete' => 'integer',
        'DIF' => 'decimal:2',
        'rappell' => 'decimal:2',
    ];
    public function carrieres()
    {
        return $this->hasMany(Carriere::class, 'Id_bareme', 'Id_bareme');
    }
}
