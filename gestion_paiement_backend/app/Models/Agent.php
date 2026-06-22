<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agent extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'Id_agent';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'num_matricule',
        'nom',
        'prenoms',
        'adresse',
        'N_CIN',
        'date_naissance',
        'sexe',
        'civilite',
        'tel',
        'mail',
        'date_entree_admin',
        'date_retraite',
        'categ_retraite',
        'date_delivrance_CI',
        'lieu_delivrance_CI',
        'N_Cnaps',
        'porte',
        'pp_gale',
        'Id_direction',
        'Id_service',
        'Id_division',
        'Id_statut',
        'Id_contrat',
    ];

    protected $casts = [
        'date_naissance'     => 'date',
        'date_entree_admin'  => 'date',
        'date_delivrance_CI' => 'date',
        'date_retraite'      => 'date',
        'pp_gale'            => 'decimal:2',
        'sexe'               => 'string',
    ];

    // MUTATORS — Convert empty strings to NULL

    public function setDateRetraiteAttribute(?string $value)
    {
        // Accept null or empty string from requests and store as NULL in DB
        $this->attributes['date_retraite'] = ($value === null || $value === '') ? null : $value;
    }

    public function setCategRetraiteAttribute(?string $value)
    {
        $this->attributes['categ_retraite'] = ($value === null || $value === '') ? null : $value;
    }

    public function setNCnapsAttribute(?string $value)
    {
        $this->attributes['N_Cnaps'] = ($value === null || $value === '') ? null : $value;
    }


    // RELATIONS belongsTo

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

 
    // RELATIONS hasMany — FK = Id_agent
  
    public function enfants()
    {
        return $this->hasMany(Enfant::class, 'Id_agent', 'Id_agent');
    }

    public function comptesBancaires()
    {
        return $this->hasMany(CompteBancaire::class, 'Id_agent', 'Id_agent');
    }

    public function carrieres()
    {
        return $this->hasMany(Carriere::class, 'Id_agent', 'Id_agent');
    }

    public function preembauches()
    {
        return $this->hasMany(Preembauche::class, 'Id_agent', 'Id_agent');
    }

    public function paies()
    {
        return $this->hasMany(Paie::class, 'Id_agent', 'Id_agent');
    }

    public function historiques()
    {
        return $this->hasMany(Historique::class, 'Id_agent', 'Id_agent');
    }

 
    // RELATION hasManyThrough
    
    public function reclassements()
    {
        return $this->hasManyThrough(
            Reclassement::class,
            Carriere::class,
            'Id_agent',     // FK dans Carriere → Agent
            'Id_carriere',  // FK dans Reclassement → Carriere
            'Id_agent',     // PK locale dans Agent
            'Id_carriere'   // PK dans Carriere
        );
    }

    
    // RELATIONS belongsToMany (pivot)
    
    public function diplomes()
    {
        return $this->belongsToMany(
            Diplome::class,
            'agent_diplome',
            'Id_agent',
            'Id_diplome'
        );
    }

    public function concours()
    {
        return $this->belongsToMany(
            Concours::class,
            'agent_concours',
            'Id_agent',
            'Id_concours'
        );
    }

    
    // CARRIERE ACTUELLE (helper)
    
    public function carriereActuelle()
    {
        return $this->hasOne(Carriere::class, 'Id_agent', 'Id_agent')
                     ->latest('Id_carriere');
    }
}