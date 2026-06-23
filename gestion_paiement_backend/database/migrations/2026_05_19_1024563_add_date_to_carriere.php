<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carrieres', function (Blueprint $table) {
            // date_debut : quand cette ligne de carrière prend effet (ex: date du reclassement/nomination)
            // date_fin   : NULL si c'est la carrière actuellement active, sinon date où elle a été remplacée
            $table->date('date_debut')->nullable()->after('Id_bareme');
            $table->date('date_fin')->nullable()->after('date_debut');
        });

        // Pour les lignes déjà existantes : on utilise created_at comme date_debut
        // approximative, et on laisse date_fin à NULL (considérées comme actuelles).
        // Adapte si tu as une vraie date de référence (ex: date_effet d'un reclassement).
        DB::table('carrieres')->whereNull('date_debut')->update([
            'date_debut' => DB::raw('DATE(created_at)'),
        ]);
    }

    public function down(): void
    {
        Schema::table('carrieres', function (Blueprint $table) {
            $table->dropColumn(['date_debut', 'date_fin']);
        });
    }
};