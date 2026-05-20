<?php

namespace App\Http\Controllers;
use App\Http\Resources\AgentResource;
use App\Models\Agent;
use App\Models\Historique;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    // ------------------------------------------------
    // GET /api/agents
    // ------------------------------------------------
    public function index(Request $request)
    {
        $query = Agent::with([
            'direction', 'service', 'division', 'statut', 'contrat'
        ]);

        // Filtres optionnels pour React
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenoms', 'like', "%{$search}%")
                  ->orWhere('num_matricule', 'like', "%{$search}%")
                  ->orWhere('N_CIN', 'like', "%{$search}%");
            });
        }
        if ($request->filled('Id_direction')) {
            $query->where('Id_direction', $request->Id_direction);
        }
        if ($request->filled('Id_service')) {
            $query->where('Id_service', $request->Id_service);
        }
        if ($request->filled('Id_statut')) {
            $query->where('Id_statut', $request->Id_statut);
        }

        // Pagination — React reçoit les agents par page
        $perPage = $request->get('per_page', 15);
        $agents = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Liste des agents récupérée avec succès',
            'data'    => AgentResource::collection($agents),
            'meta'    => [
                'current_page' => $agents->currentPage(),
                'last_page'    => $agents->lastPage(),
                'per_page'     => $agents->perPage(),
                'total'        => $agents->total(),
                'from'         => $agents->firstItem(),
                'to'           => $agents->lastItem(),
            ],
        ]);
    }

    // ------------------------------------------------
    // POST /api/agents
    // ------------------------------------------------
    public function store(Request $request)
    {
        $data = $request->validate([
            'num_matricule'      => 'required|string|max:50|unique:agents,num_matricule',
            'nom'                => 'required|string',
            'prenoms'            => 'required|string',
            'adresse'            => 'required|string',
            'N_CIN'              => 'required|string|max:50|unique:agents,N_CIN',
            'date_naissance'     => 'required|date',
            'date_delivrance_CI' => 'required|date',
            'lieu_delivrance_CI' => 'required|string',
            'sexe'               => 'required|in:M,F',
            'civilite'           => 'required|in:Mr,Mme,Melle',
            'tel'                => 'required|string|max:30',
            'mail'               => 'nullable|email',
            'date_entree_admin'  => 'required|date',
            'date_retraite'      => 'nullable|date|after:date_entree_admin',
            'categ_retraite'     => 'nullable|string',
            'N_Cnaps'            => 'nullable|string|max:50',
            'pp_gale'            => 'nullable|numeric|min:0',
            // Clés étrangères
            'Id_direction'       => 'required|exists:directions,Id_direction',
            'Id_service'         => 'required|exists:services,Id_service',
            'Id_division'        => 'required|exists:divisions,Id_division',
            'Id_statut'          => 'required|exists:statuts,Id_statut',
            'Id_contrat'         => 'required|exists:contrats,Id_contrat',
        ]);

        $agent = Agent::create($data);

        // Enregistrer la création dans l'historique
        Historique::log('agents', $agent->Id_agent, 'CREATE', null, null, null, auth()->user()?->name);

        // Retourner l'agent créé avec ses relations
        $agent->load(['direction', 'service', 'division', 'statut', 'contrat']);

        return response()->json([
            'success' => true,
            'message' => 'Agent créé avec succès',
            'data'    => $agent,
        ], 201);
    }

    // ------------------------------------------------
    // GET /api/agents/{agent}
    // ------------------------------------------------
    public function show(Agent $agent)
    {
        $agent->load([
            'direction', 'service', 'division',
            'statut', 'contrat', 'carriereActuelle',
            'enfants', 'comptesBancaires', 'diplomes'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Détail de l\'agent',
            'data'    => $agent,
        ], 200);
    }

    // ------------------------------------------------
    // PUT /api/agents/{agent}
    // ------------------------------------------------
    public function update(Request $request, Agent $agent)
    {
        $data = $request->validate([
            'num_matricule'      => 'sometimes|string|max:50|unique:agents,num_matricule,' . $agent->Id_agent . ',Id_agent',
            'nom'                => 'sometimes|string',
            'prenoms'            => 'sometimes|string',
            'adresse'            => 'sometimes|string',
            'N_CIN'              => 'sometimes|string|max:50|unique:agents,N_CIN,' . $agent->Id_agent . ',Id_agent',
            'date_naissance'     => 'sometimes|date',
            'date_delivrance_CI' => 'sometimes|date',
            'lieu_delivrance_CI' => 'sometimes|string',
            'sexe'               => 'sometimes|in:M,F',
            'civilite'           => 'sometimes|in:Mr,Mme,Melle',
            'tel'                => 'sometimes|string|max:30',
            'mail'               => 'nullable|email',
            'date_entree_admin'  => 'sometimes|date',
            'date_retraite'      => 'nullable|date|after:date_entree_admin',
            'categ_retraite'     => 'nullable|string',
            'N_Cnaps'            => 'nullable|string|max:50',
            'pp_gale'            => 'nullable|numeric|min:0',
            // Clés étrangères
            'Id_direction'       => 'sometimes|exists:directions,Id_direction',
            'Id_service'         => 'sometimes|exists:services,Id_service',
            'Id_division'        => 'sometimes|exists:divisions,Id_division',
            'Id_statut'          => 'sometimes|exists:statuts,Id_statut',
            'Id_contrat'         => 'sometimes|exists:contrats,Id_contrat',
        ]);

        foreach (['date_naissance', 'date_entree_admin', 'date_delivrance_CI', 'date_retraite'] as $dateField) {
            if (array_key_exists($dateField, $data) && $data[$dateField] === '') {
                unset($data[$dateField]);
            }
        }

        // Enregistrer les modifications dans l'historique
        $before = $agent->getAttributes();
        $agent->update($data);
        Historique::logChanges('agents', $agent->Id_agent, $before, $data, auth()->user()?->name);

        // Retourner l'agent mis à jour avec ses relations
        $agent->load(['direction', 'service', 'division', 'statut', 'contrat']);

        return response()->json([
            'success' => true,
            'message' => 'Agent mis à jour avec succès',
            'data'    => $agent,
        ], 200);
    }

    // ------------------------------------------------
    // DELETE /api/agents/{agent}
    // ------------------------------------------------
    public function destroy(Agent $agent)
    {
        // Enregistrer la suppression dans l'historique
        Historique::log('agents', $agent->Id_agent, 'DELETE', null, null, null, auth()->user()?->name);
        
        $agent->delete(); // SoftDelete — l'agent n'est pas effacé physiquement

        return response()->json([
            'success' => true,
            'message' => 'Agent supprimé avec succès',
            'data'    => null,
        ], 200);
    }
}