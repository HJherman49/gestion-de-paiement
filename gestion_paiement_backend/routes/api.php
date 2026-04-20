<?php
use Illuminate\Support\Facades\Route;
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

Route::apiResource('agents', AgentController::class);
Route::apiResource('directions', DirectionController::class);
Route::apiResource('services', ServiceController::class);
Route::apiResource('divisions', DivisionController::class);
Route::apiResource('carrieres', CarriereController::class);
Route::apiResource('fonctions', FonctionController::class);
Route::apiResource('preembauches', PreembaucheController::class);
Route::apiResource('enfants', EnfantController::class);
Route::apiResource('reclassements', ReclassementController::class);
Route::apiResource('compte-bancaires', CompteBancaireController::class);
Route::apiResource('contrats', ContratController::class);
Route::apiResource('statuts', StatutController::class);
Route::apiResource('baremes', BaremeController::class);
Route::apiResource('banques', BanqueController::class);
Route::apiResource('paies', PaieController::class);

// Route bonus : paies d'un agent
Route::get('agents/{id_agent}/paies', [PaieController::class, 'paiesParAgent']);