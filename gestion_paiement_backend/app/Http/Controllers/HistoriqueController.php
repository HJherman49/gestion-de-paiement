<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\HistoriqueResource;
use App\Models\Historique;
use Illuminate\Http\Request;

class HistoriqueController extends Controller
{
    // ── GET /api/v1/historiques ────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = Historique::query()->latest('date_action');

        // Filtres
        if ($request->filled('table_concernee')) {
            $query->where('table_concernee', $request->table_concernee);
        }
        if ($request->filled('type_action')) {
            $query->where('type_action', $request->type_action);
        }
        if ($request->filled('utilisateur')) {
            $query->where('utilisateur', 'like', "%{$request->utilisateur}%");
        }
        if ($request->filled('id_enregistrement')) {
            $query->where('id_enregistrement', $request->id_enregistrement);
        }
        if ($request->filled('date_debut')) {
            $query->whereDate('date_action', '>=', $request->date_debut);
        }
        if ($request->filled('date_fin')) {
            $query->whereDate('date_action', '<=', $request->date_fin);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('table_concernee',  'like', "%$s%")
                  ->orWhere('champ_modifie',  'like', "%$s%")
                  ->orWhere('valeur_avant',   'like', "%$s%")
                  ->orWhere('valeur_apres',   'like', "%$s%")
                  ->orWhere('utilisateur',    'like', "%$s%");
            });
        }

        $perPage = $request->get('per_page', 20);
        $historiques = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => HistoriqueResource::collection($historiques->items()),
            'meta'    => [
                'current_page' => $historiques->currentPage(),
                'last_page'    => $historiques->lastPage(),
                'per_page'     => $historiques->perPage(),
                'total'        => $historiques->total(),
            ],
        ]);
    }

    // ── GET /api/v1/historiques/{id} ───────────────────────────────────────
    public function show(Historique $historique)
    {
        return new HistoriqueResource($historique);
    }

    // ── GET /api/v1/historiques/stats ─────────────────────────────────────
    public function stats()
    {
        return response()->json([
            'par_action' => Historique::selectRaw('type_action, COUNT(*) as total')
                ->groupBy('type_action')->get(),
            'par_table'  => Historique::selectRaw('table_concernee, COUNT(*) as total')
                ->groupBy('table_concernee')->orderByDesc('total')->limit(10)->get(),
            'par_user'   => Historique::selectRaw('utilisateur, COUNT(*) as total')
                ->whereNotNull('utilisateur')
                ->groupBy('utilisateur')->orderByDesc('total')->limit(10)->get(),
            'aujourd_hui'=> Historique::whereDate('date_action', today())->count(),
            'cette_semaine' => Historique::whereBetween('date_action', [now()->startOfWeek(), now()->endOfWeek()])->count(),
        ]);
    }

    // ── DELETE /api/v1/historiques/{id} (purge admin) ──────────────────────
    public function destroy(Historique $historique)
    {
        $historique->delete();
        return response()->json(['message' => 'Entrée supprimée de l\'historique']);
    }
}