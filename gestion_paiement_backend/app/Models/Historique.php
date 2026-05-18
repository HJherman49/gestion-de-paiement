<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Historique extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'Id_historique';

    protected $fillable = [
        'table_concernee',
        'id_enregistrement',
        'type_action',
        'date_action',
        'champ_modifie',
        'valeur_avant',
        'valeur_apres',
        'utilisateur',
    ];

    protected $casts = [
        'date_action'      => 'datetime',
        'id_enregistrement'=> 'integer',
    ];

    // ── Helper statique pour enregistrer facilement ────────────────────────
    /**
     * Enregistre une action dans l'historique.
     *
     * Usage:
     *   Historique::log('agents', $agent->Id_agent, 'CREATE', null, null, null, auth()->user()?->name);
     *   Historique::log('agents', $agent->Id_agent, 'UPDATE', 'nom', 'RAKOTO', 'RABE', auth()->user()?->name);
     *   Historique::log('agents', $agent->Id_agent, 'DELETE', null, null, null, auth()->user()?->name);
     */
    public static function log(
        string  $table,
        int     $idEnregistrement,
        string  $typeAction,
        ?string $champModifie   = null,
        ?string $valeurAvant    = null,
        ?string $valeurApres    = null,
        ?string $utilisateur    = null,
    ): self {
        return static::create([
            'table_concernee'   => $table,
            'id_enregistrement' => $idEnregistrement,
            'type_action'       => $typeAction,
            'date_action'       => now(),
            'champ_modifie'     => $champModifie,
            'valeur_avant'      => $valeurAvant,
            'valeur_apres'      => $valeurApres,
            'utilisateur'       => $utilisateur,
        ]);
    }

    /**
     * Enregistre toutes les différences entre deux tableaux (avant/après update).
     * Parfait pour un appel unique dans le contrôleur update().
     */
    public static function logChanges(
        string  $table,
        int     $idEnregistrement,
        array   $avant,
        array   $apres,
        ?string $utilisateur = null,
    ): void {
        foreach ($apres as $champ => $nouvelleValeur) {
            $ancienneValeur = $avant[$champ] ?? null;
            if ($ancienneValeur != $nouvelleValeur) {
                static::log(
                    table:           $table,
                    idEnregistrement:$idEnregistrement,
                    typeAction:      'UPDATE',
                    champModifie:    $champ,
                    valeurAvant:     $ancienneValeur !== null ? (string) $ancienneValeur : null,
                    valeurApres:     $nouvelleValeur !== null ? (string) $nouvelleValeur : null,
                    utilisateur:     $utilisateur,
                );
            }
        }
    }
}