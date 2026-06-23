<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('paies', function (Blueprint $table) {
            // Statut du bulletin : 'auto' = généré automatiquement, 'modifie' = touché par RH
            $table->enum('statut', ['auto', 'modifie'])->default('auto')->after('PA');

            // Empêche de générer deux bulletins pour le même agent au même mois/année
            $table->unique(['Id_agent', 'mois', 'annee'], 'unique_bulletin_agent_mois_annee');
        });
    }

    public function down(): void
    {
        Schema::table('paies', function (Blueprint $table) {
            $table->dropUnique('unique_bulletin_agent_mois_annee');
            $table->dropColumn('statut');
        });
    }
};