<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaieResource;
use App\Models\Paie;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class PaieController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/v1/paies
    // Paramètres : page, per_page, search, mois, annee, agent_id, statut
    // ──────────────────────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = Paie::with(['agent.direction', 'agent.service'])
            ->orderBy('annee', 'desc')
            ->orderBy('mois', 'desc');

        if ($request->filled('mois'))  $query->where('mois', $request->integer('mois'));
        if ($request->filled('annee')) $query->where('annee', $request->integer('annee'));
        if ($request->filled('Id_agent')) $query->where('Id_agent', $request->integer('Id_agent'));
        if ($request->filled('statut')) $query->where('statut', $request->string('statut'));

        if ($request->filled('search')) {
            $q = $request->string('search');
            $query->whereHas('agent', function ($sub) use ($q) {
                $sub->where('nom', 'like', "%{$q}%")
                    ->orWhere('prenoms', 'like', "%{$q}%")
                    ->orWhere('num_matricule', 'like', "%{$q}%");
            });
        }

        $perPage = $request->integer('per_page', 15);
        $paies   = $query->paginate($perPage);

        return response()->json([
            'data' => PaieResource::collection($paies->items()),
            'meta' => [
                'current_page' => $paies->currentPage(),
                'last_page'    => $paies->lastPage(),
                'total'        => $paies->total(),
                'per_page'     => $paies->perPage(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $paie = Paie::with('agent')->findOrFail($id);
        return response()->json(['data' => new PaieResource($paie)]);
    }
    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/v1/paies — création manuelle d'un bulletin
    // ──────────────────────────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'Id_agent'        => 'required|exists:agents,Id_agent',
            'Id_enfant'       => 'nullable|exists:enfants,Id_enfant',
            'mois'            => 'required|integer|between:1,12',
            'annee'           => 'required|integer|min:2000',
            'salaire_brut'    => 'required|numeric|min:0',
            'Indice'          => 'required|integer|min:0',
            'prime'           => 'nullable|numeric|min:0',
            'prime_fonction'  => 'nullable|numeric|min:0',
            'prime_speciale'  => 'nullable|numeric|min:0',
            'prime_fin_annee' => 'nullable|numeric|min:0',
            'scola'           => 'nullable|numeric|min:0',
            'remboursement'   => 'nullable|numeric|min:0',
            'alloc'           => 'nullable|numeric|min:0',
            'logement'        => 'nullable|numeric|min:0',
            'rappel'          => 'nullable|numeric|min:0',
            'IGR'             => 'nullable|numeric|min:0',
            'PA'              => 'nullable|numeric|min:0',
            'mode_paie'       => 'required|string',
            'chap'            => 'nullable|string',
            'art'             => 'nullable|string',
            'date_effet'      => 'required|date',
        ]);

        $existant = Paie::where('Id_agent', $data['Id_agent'])
            ->where('mois', $data['mois'])
            ->where('annee', $data['annee'])
            ->first();

        if ($existant) {
            return response()->json([
                'message' => "Un bulletin existe déjà pour cet agent en {$data['mois']}/{$data['annee']}.",
                'data'    => new PaieResource($existant),
            ], 409);
        }

        $paie = Paie::create(array_merge($data, ['statut' => 'auto']));

        return response()->json(['data' => new PaieResource($paie->load('agent'))], 201);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PUT /api/v1/paies/{id}
    // statut passe à 'modifie' si une des primes devient non nulle
    // (pas de net_a_payer stocké — PaieResource le calcule à la volée)
    // ──────────────────────────────────────────────────────────────────────────
    public function update(Request $request, int $id): JsonResponse
    {
        $paie = Paie::findOrFail($id);

        $data = $request->validate([
            'prime'           => 'nullable|numeric|min:0',
            'prime_fonction'  => 'nullable|numeric|min:0',
            'prime_speciale'  => 'nullable|numeric|min:0',
            'prime_fin_annee' => 'nullable|numeric|min:0',
            'scola'           => 'nullable|numeric|min:0',
            'remboursement'   => 'nullable|numeric|min:0',
            'alloc'           => 'nullable|numeric|min:0',
            'logement'        => 'nullable|numeric|min:0',
            'rappel'          => 'nullable|numeric|min:0',
            'IGR'             => 'nullable|numeric|min:0',
            'PA'              => 'nullable|numeric|min:0',
            'mode_paie'       => 'nullable|string',
            'chap'            => 'nullable|string',
            'art'             => 'nullable|string',
            'date_effet'      => 'nullable|date',
            'motif'           => 'nullable|string|max:500',
        ]);

        // Valeurs finales après merge — utilisées pour détecter la présence de prime
        $prime          = $data['prime']           ?? $paie->prime;
        $primeFonction  = $data['prime_fonction']  ?? $paie->prime_fonction;
        $primeSpeciale  = $data['prime_speciale']  ?? $paie->prime_speciale;
        $primeFinAnnee  = $data['prime_fin_annee'] ?? $paie->prime_fin_annee;

        $aPrime = ($prime + $primeFonction + $primeSpeciale + $primeFinAnnee) > 0;

        $paie->update(array_merge($data, [
            'statut' => $aPrime ? 'modifie' : $paie->statut,
        ]));

        return response()->json(['data' => new PaieResource($paie->load('agent'))]);
    }

    public function destroy(int $id): JsonResponse
    {
        $paie = Paie::findOrFail($id);
        $paie->delete();
        return response()->json(['message' => 'Bulletin supprimé.']);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/v1/paies/generer-mois — Body : { mois, annee, force? }
    // ──────────────────────────────────────────────────────────────────────────
    public function genererMois(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mois'  => 'required|integer|between:1,12',
            'annee' => 'required|integer|min:2000',
            'force' => 'boolean',
        ]);

        $options = ['--mois' => $data['mois'], '--annee' => $data['annee']];
        if (!empty($data['force'])) $options['--force'] = true;

        $exitCode = Artisan::call('paie:generer', $options);
        $output   = Artisan::output();

        if ($exitCode !== 0) {
            return response()->json(['message' => 'La génération a rencontré des erreurs.', 'output' => $output], 500);
        }

        return response()->json([
            'message' => "Bulletins générés pour {$data['mois']}/{$data['annee']}.",
            'output'  => $output,
        ]);
    }

       // ──────────────────────────────────────────────────────────────────────────
    // GET /api/v1/paies/recap-mois?annee=2026
    // ──────────────────────────────────────────────────────────────────────────
       // ──────────────────────────────────────────────────────────────────────────
    // GET /api/v1/paies/recap-mois?annee=2026
    // ──────────────────────────────────────────────────────────────────────────
       public function recapMois(Request $request): JsonResponse
    {
        $annee = $request->integer('annee', now()->year);

        $recap = DB::table('paies')
            ->selectRaw('mois, COUNT(*) as nb_bulletins, 
                        MAX(CASE WHEN statut = "modifie" THEN 1 ELSE 0 END) as a_des_primes')
            ->whereRaw('annee = ?', [$annee])
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        // Le reste du code reste identique...
        $result = collect(range(1, 12))->map(function ($mois) use ($recap) {
            $m = $recap->firstWhere('mois', $mois);
            return [
                'mois'         => $mois,
                'nb_bulletins' => $m?->nb_bulletins ?? 0,
                'a_des_primes' => (bool) ($m?->a_des_primes ?? 0),
                'genere'       => $m !== null,
            ];
        });

        return response()->json(['data' => $result, 'annee' => $annee]);
    }

    public function exportBulletin(int $id)
    {
        $paie = Paie::with(['agent.direction', 'agent.service'])->findOrFail($id);

        $pdf = Pdf::loadView('pdf.bulletin_paie', [
            'paie'  => $paie,
            'agent' => $paie->agent,
        ]);

        return $pdf->download("bulletin_paie_{$id}.pdf");
    }
    public function exportMois(Request $request)
    {
        $mois  = $request->integer('mois');
        $annee = $request->integer('annee');

        $paies = Paie::with(['agent.direction', 'agent.service'])
            ->where('mois', $mois)
            ->where('annee', $annee)
            ->orderBy('Id_agent')
            ->get();

        if ($paies->isEmpty()) {
            return response()->json(['message' => 'Aucun bulletin pour cette période.'], 404);
        }

        $pdf = Pdf::loadView('pdf.bulletins_mois', [
            'paies' => $paies,
            'mois'  => $mois,
            'annee' => $annee,
        ]);

        $pdf->setPaper('A4', 'portrait');

        $nomFichier = "bulletins_{$mois}_{$annee}.pdf";
        return $pdf->download($nomFichier);
    }
}