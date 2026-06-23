<?php

namespace App\Console\Commands;

use App\Models\Agent;
use App\Models\Paie;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GenererBulletinsMensuels extends Command
{
    protected $signature = 'paie:generer
                            {--mois= : Mois cible (1-12). Par défaut : mois courant}
                            {--annee= : Année cible. Par défaut : année courante}
                            {--force : Régénère même si des bulletins existent déjà (uniquement ceux en statut "auto")}';

    protected $description = 'Génère automatiquement les bulletins de paie mensuels pour tous les agents actifs';

    public function handle(): int
    {
        $mois  = (int) ($this->option('mois')  ?? Carbon::now()->month);
        $annee = (int) ($this->option('annee') ?? Carbon::now()->year);
        $force = (bool) $this->option('force');

        $this->info("=== Génération des bulletins — {$mois}/{$annee} ===");

        // Adapte le nom de la relation et le critère "actif" selon ton modèle Agent réel
        // ⚠️ Pas de colonne "statut" actif/inactif sur agents — on exclut seulement
        // les agents dont la date de retraite est déjà passée (si renseignée).
        // À affiner plus tard avec le vrai critère métier (contrat, carrière, etc.)
        $agents = Agent::with(['carriereActuelle'])
            ->where(function ($q) {
                $q->whereNull('date_retraite')
                  ->orWhere('date_retraite', '>=', Carbon::now()->toDateString());
            })
            ->get();

        if ($agents->isEmpty()) {
            $this->warn('Aucun agent actif trouvé.');
            return Command::SUCCESS;
        }

        $this->info("Agents actifs trouvés : {$agents->count()}");

        $crees = 0; $ignores = 0; $erreurs = 0;

        $bar = $this->output->createProgressBar($agents->count());
        $bar->start();

        foreach ($agents as $agent) {
            try {
                $existant = Paie::where('Id_agent', $agent->Id_agent)
                    ->where('mois', $mois)
                    ->where('annee', $annee)
                    ->first();

                if ($existant && !$force) {
                    $ignores++;
                    $bar->advance();
                    continue;
                }

                DB::transaction(function () use ($agent, $mois, $annee, $existant, &$crees) {
                    $base = $this->calculerSalaireBrutEtIndice($agent);

                    $donnees = [
                        'Id_agent'        => $agent->Id_agent,
                        'mois'            => $mois,
                        'annee'           => $annee,
                        'salaire_brut'    => $base['salaire_brut'],
                        'Indice'          => $base['indice'],
                        'prime'           => 0,
                        'prime_fonction'  => 0,
                        'prime_speciale'  => 0,
                        'prime_fin_annee' => 0,
                        'scola'           => 0,
                        'remboursement'   => 0,
                        'alloc'           => 0,
                        'logement'        => 0,
                        'rappel'          => 0,
                        'IGR'             => $base['igr'],
                        'PA'              => 0,
                        'mode_paie'       => $agent->mode_paiement ?? 'Virement',
                        'chap'            => $agent->chap ?? null,
                        'art'             => $agent->art ?? null,
                        'date_effet'      => Carbon::create($annee, $mois, 1)->endOfMonth(),
                        'statut'          => 'auto',
                    ];

                    if ($existant) {
                        // --force : ne régénère que si pas encore touché manuellement
                        if ($existant->statut === 'auto') {
                            $existant->update($donnees);
                        }
                    } else {
                        Paie::create($donnees);
                        $crees++;
                    }
                });

            } catch (\Throwable $e) {
                $erreurs++;
                Log::error("GenererBulletins: erreur agent #{$agent->Id_agent}", ['message' => $e->getMessage()]);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(['Créés', 'Ignorés (déjà existants)', 'Erreurs'], [[$crees, $ignores, $erreurs]]);

        if ($erreurs > 0) {
            $this->warn('Des erreurs ont été rencontrées — consultez les logs Laravel.');
        } else {
            $this->info('Génération terminée avec succès.');
        }

        return $erreurs > 0 ? Command::FAILURE : Command::SUCCESS;
    }

    /**
     * Calcule salaire_brut, Indice et IGR depuis la carrière actuelle de l'agent.
     * "indice" est une colonne directe sur la table carrieres (pas une relation Grade).
     * ⚠️ La formule salaire_brut = indice × valeur_point est un squelette à valider
     * avec ton vrai barème (via Id_bareme sur carrieres si la valeur du point en dépend).
     */
    private function calculerSalaireBrutEtIndice(Agent $agent): array
    {
        $carriere = $agent->carriereActuelle;

        if (!$carriere) {
            // Aucune carrière enregistrée — on génère un bulletin à 0,
            // à corriger manuellement par la suite plutôt que planter toute la commande.
            return ['salaire_brut' => 0, 'indice' => 0, 'igr' => 0];
        }

        $indice = (int) $carriere->indice;

        // Valeur du point d'indice (à stocker en config ou table de référence, pas en dur)
        $valeurPoint = config('paie.valeur_point', 2000);

        $salaire_brut = $indice * $valeurPoint;

        $igr = $this->calculerIGR($salaire_brut);

        return ['salaire_brut' => $salaire_brut, 'indice' => $indice, 'igr' => $igr];
    }

    /**
     * Calcul IGR simplifié — tranches à vérifier avec la réglementation fiscale réelle.
     */
    private function calculerIGR(float $revenuImposable): float
    {
        $tranches = [
            [0,       350_000,      0,  0],
            [350_001, 400_000,      5,  0],
            [400_001, 500_000,     10,  17_500],
            [500_001, 600_000,     15,  42_500],
            [600_001, PHP_INT_MAX, 20,  72_500],
        ];

        foreach ($tranches as [$min, $max, $taux, $deduction]) {
            if ($revenuImposable >= $min && $revenuImposable <= $max) {
                return round(($revenuImposable * $taux / 100) - $deduction, 2);
            }
        }

        return 0;
    }
}