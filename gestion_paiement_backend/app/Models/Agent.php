<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{
    protected $primaryKey = 'Id_agent';

    protected $fillable = [
        'num_matricule',
        'nom',
        'prenoms',
        'adresse',
        'N_CIN',
        'date_naissance',
        'sexe',
        'date_entree_admin',
        'date_delivrance_CI',
        'lieu_delivrance_CI',
        'civilite',
        'tel',
        'porte',
        'pp_gale',
        'Id_direction',
        'Id_service',
        'Id_division',
        'Id_statut',
        'Id_contrat',
    ];
    
    protected $casts = [
        'date_de_naissance' => 'date',
        'date_entree_admin' => 'date',
        'date_delivrance_CI' => 'date',
        'sexe' => 'string',
    ];
    public function direction()
    {
        return $this->belongsTo(Direction::class, 'Id_direction', 'Id_direction');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'Id_service', 'Id_service');
    }

    public function division()
    {
        return $this->belongsTo(Division::class, 'Id_division', 'Id_division');
    }

    public function statut()
    {
        return $this->belongsTo(Statut::class, 'Id_statut', 'Id_statut');
    }

    public function contrat()
    {
        return $this->belongsTo(Contrat::class, 'Id_contrat', 'Id_contrat');
    }
    
    public function enfants()
    {
        return $this->hasMany(Enfant::class, 'Id_agent');
    }

    public function comptesBancaires()
    {
        return $this->hasMany(CompteBancaire::class, 'Id_agent');
    }

    public function carrieres()
    {
        return $this->hasMany(Carriere::class, 'Id_agent');
    }

    public function reclassements()
    {
        return $this->hasManyThrough(Reclassement::class, Carriere::class, 'Id_agent', 'Id_carriere');
    }

    public function fonctions()
    {
        return $this->hasMany(Fonction::class, 'Id_agent');
    }

    public function preembauches()
    {
        return $this->hasMany(Preembauche::class, 'Id_agent');
    }

    public function paies()
    {
        return $this->hasMany(Paie::class, 'Id_agent');
    }

    public function diplomes()
    {
        return $this->belongsToMany(Diplome::class, 'agent_diplome', 'Id_agent', 'Id_diplome');
    }

    public function concours()
    {
        return $this->belongsToMany(Concours::class, 'agent_concours', 'Id_agent', 'Id_concours');
    }

    public function historique()
    {
        return $this->hasMany(Historique::class, 'Id_agent');
    }
}
