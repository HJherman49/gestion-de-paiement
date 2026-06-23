<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Agent;
use App\Models\Bareme;
use App\Models\Reclassement;

class Carriere extends Model
{
    /** @use HasFactory<\Database\Factories\CarriereFactory> */
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'Id_carriere';

    protected $fillable = [
        'Categorie',
        'corps',
        'grade',
        'classe',
        'echelon',
        'Id_agent',
        'Id_bareme',
    ];

    protected $casts = [
        'indice' => 'integer',
    ];

    protected static function booted()
    {
        static::creating(function (Carriere $carriere) {
            $carriere->syncIndiceFromBareme();
        });

        static::updating(function (Carriere $carriere) {
            $carriere->syncIndiceFromBareme();
        });
    }

    public function syncIndiceFromBareme(): void
    {
        if (! $this->Id_bareme) {
            return;
        }

        $bareme = $this->bareme ?? Bareme::find($this->Id_bareme);

        if ($bareme) {
            $this->indice = $bareme->Indice;
        }
    }
    
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'Id_agent');
    }

    public function bareme()
    {
        return $this->belongsTo(Bareme::class, 'Id_bareme');
    }

    public function reclassements()
    {
        return $this->hasMany(Reclassement::class, 'Id_carriere');
    }
}
