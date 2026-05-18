<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\DirectionController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\CarriereController;
use App\Http\Controllers\FonctionController;
use App\Http\Controllers\PreembaucheController;
use App\Http\Controllers\EnfantController;
use App\Http\Controllers\ReclassementController;
use App\Http\Controllers\CompteBancaireController;
use App\Http\Controllers\ContratController;
use App\Http\Controllers\StatutController;
use App\Http\Controllers\BaremeController;
use App\Http\Controllers\BanqueController;
use App\Http\Controllers\PaieController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\DiplomeController;
use App\Http\Controllers\ConcoursController;
use App\Http\Controllers\HistoriqueController;

// ------------------------------------------------
// ROUTES PUBLIQUES — pas besoin de token
// ------------------------------------------------
Route::prefix('v1')->group(function () {

    // Authentification - login ne nécessite pas CSRF
    Route::post('/login',  [AuthController::class, 'login'])
        ->withoutMiddleware([\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class]);
    Route::post('/logout', [AuthController::class, 'logout'])
         ->middleware('auth:sanctum');

    // ------------------------------------------------
    // ROUTES PROTÉGÉES — token obligatoire
    // ------------------------------------------------
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);

        // ---- Référentiels ----
        Route::apiResource('directions',  DirectionController::class);
        Route::apiResource('services',    ServiceController::class);
        Route::apiResource('divisions',   DivisionController::class);
        Route::apiResource('statuts',     StatutController::class);
        Route::apiResource('contrats',    ContratController::class);
        Route::apiResource('baremes',     BaremeController::class);
        Route::apiResource('banques',     BanqueController::class);
        Route::apiResource('regions',     RegionController::class);
        Route::apiResource('diplomes',    DiplomeController::class);

        // ---- Agent (table centrale) ----
        Route::apiResource('agents', AgentController::class);

        // Routes imbriquées de l'agent
        Route::prefix('agents/{agent}')->group(function () {
            Route::get('carrieres',        [CarriereController::class,      'parAgent']);
            Route::get('carrieres/actuelle',[CarriereController::class,     'actuelle']);
            Route::get('paies',            [PaieController::class,          'parAgent']);
            Route::get('enfants',          [EnfantController::class,        'parAgent']);
            Route::get('fonctions',        [FonctionController::class,      'parAgent']);
            Route::get('preembauches',     [PreembaucheController::class,   'parAgent']);
            Route::get('reclassements',    [ReclassementController::class,  'parAgent']);
            Route::get('compte-bancaire',  [CompteBancaireController::class,'parAgent']);
            //Route::get('concours',         [ConcoursController::class,      'parAgent']);
            Route::get('diplomes',         [DiplomeController::class,       'parAgent']);
            
        });

        // ---- Autres ressources ----
        Route::apiResource('carrieres',       CarriereController::class);
        Route::apiResource('fonctions',       FonctionController::class);
        Route::apiResource('preembauches',    PreembaucheController::class);
        Route::apiResource('enfants',         EnfantController::class);
        Route::apiResource('reclassements',   ReclassementController::class);
        Route::apiResource('compte-bancaires',CompteBancaireController::class);
        Route::apiResource('paies',           PaieController::class);
       // Route::apiResource('historiques',      HistoriqueController::class);
        //Route::apiResource('concours',        ConcoursController::class);

        // ---- Actions spéciales ----
        Route::post('paies/{paie}/valider',   [PaieController::class,      'valider']);
        Route::post('reclassements/{reclassement}/valider',
                                              [ReclassementController::class,'valider']);

        // ---- Historique (lecture seule) ----
        Route::get('historiques/stats', [HistoriqueController::class, 'stats']);
        Route::get('historiques', [HistoriqueController::class, 'index']);
        Route::delete('historiques/{id}', [HistoriqueController::class, 'destroy']);

    });
});