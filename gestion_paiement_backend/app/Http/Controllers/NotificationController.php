<?php

namespace App\Http\Controllers;

use App\Models\Historique;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/v1/notifications
     */
    public function index(Request $request)
    {
        $depuis = $request->get('depuis'); // ISO date optionnelle pour le polling

        $query = Historique::query()->latest('date_action')->limit(50);

        if ($depuis) {
            $query->where('date_action', '>', $depuis);
        }

        $historiques = $query->get();

        $notifications = $historiques->map(function ($h, $index) {
            return [
                'id'               => $h->Id_historique,
                'titre'            => $this->genererTitre($h),
                'message'          => $this->genererMessage($h),
                'categorie'        => $this->mapCategorie($h->table_concernee),
                'priorite'         => $this->mapPriorite($h->type_action, $h->table_concernee),
                'date'             => $h->date_action?->toIso8601String(),
                'lue'              => false,
                'agent_matricule'  => null,
                'agent_nom'        => null,
                'type_action'      => $h->type_action,
                'table_concernee'  => $h->table_concernee,
                'utilisateur'      => $h->utilisateur,
            ];
        });

        return response()->json([
            'success'    => true,
            'data'       => $notifications,
            'total'      => $notifications->count(),
            'server_time'=> now()->toIso8601String(),
        ]);
    }

    // Helpers 

    private function genererTitre(Historique $h): string
    {
        $table   = $this->tableLabel($h->table_concernee);
        $action  = match($h->type_action) {
            'CREATE' => "Nouveau {$table} créé",
            'UPDATE' => "{$table} modifié",
            'DELETE' => "{$table} supprimé",
            default  => "Action sur {$table}",
        };

        // Titres specifiques
        if ($h->table_concernee === 'paies' && $h->type_action === 'CREATE') {
            return 'Nouveau bulletin de paie généré';
        }
        if ($h->table_concernee === 'reclassements' && $h->type_action === 'CREATE') {
            return 'Reclassement enregistré';
        }
        if ($h->table_concernee === 'carrieres' && $h->type_action === 'UPDATE') {
            return 'Carrière mise à jour';
        }
        if ($h->table_concernee === 'agents' && $h->type_action === 'DELETE') {
            return 'Agent supprimé du système';
        }

        return $action;
    }

    private function genererMessage(Historique $h): string
    {
        $user   = $h->utilisateur ?? 'Système';
        $table  = $this->tableLabel($h->table_concernee);
        $id     = $h->id_enregistrement;
        $champ  = $h->champ_modifie;
        $avant  = $h->valeur_avant;
        $apres  = $h->valeur_apres;

        if ($h->type_action === 'UPDATE' && $champ) {
            $avantStr = $avant ? " (avant : {$avant})" : '';
            $apresStr = $apres ? " → {$apres}" : '';
            return "{$table} #{$id} — champ « {$champ} » modifié{$avantStr}{$apresStr} par {$user}.";
        }

        if ($h->type_action === 'CREATE') {
            return "Un nouvel enregistrement {$table} (#{$id}) a été créé par {$user}.";
        }

        if ($h->type_action === 'DELETE') {
            return "{$table} #{$id} a été supprimé par {$user}.";
        }

        return "{$table} #{$id} — action effectuée par {$user}.";
    }

    private function mapCategorie(string $table): string
    {
        return match($table) {
            'agents'                         => 'agent',
            'fonctions', 'directions',
            'services', 'divisions'          => 'affectation',
            'carrieres', 'reclassements'     => 'promotion',
            'preembauches', 'contrats'       => 'contrat',
            'paies', 'baremes'               => 'paie',
            'historiques', 'utilisateurs'    => 'audit',
            'enfants'                        => 'famille',
            'diplomes'                       => 'diplome',
            'banques', 'compte_bancaires'    => 'paie',
            default                          => 'audit',
        };
    }

    private function mapPriorite(string $typeAction, string $table): string
    {
        // Suppressions = haute priorite
        if ($typeAction === 'DELETE') return 'haute';

        // Tables critiques
        if (in_array($table, ['paies', 'reclassements', 'carrieres'])) {
            return $typeAction === 'CREATE' ? 'moyenne' : 'haute';
        }

        // Agents = moyenne
        if ($table === 'agents') return 'moyenne';

        return 'info';
    }

    private function tableLabel(string $table): string
    {
        return match($table) {
            'agents'            => 'Agent',
            'carrieres'         => 'Carrière',
            'paies'             => 'Paie',
            'reclassements'     => 'Reclassement',
            'fonctions'         => 'Fonction',
            'preembauches'      => 'Préembauche',
            'enfants'           => 'Enfant',
            'diplomes'          => 'Diplôme',
            'banques'           => 'Banque',
            'compte_bancaires'  => 'Compte bancaire',
            'baremes'           => 'Barème',
            'directions'        => 'Direction',
            'services'          => 'Service',
            'divisions'         => 'Division',
            'utilisateurs'      => 'Utilisateur',
            default             => ucfirst($table),
        };
    }
}