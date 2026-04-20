<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('compte_bancaires', function (Blueprint $table) {
            $table->id('Id_compte');
            $table->string('num_compte')->unique();
            $table->string('adresse_bnq');
            $table->string('code_localite');
            $table->string('CODQEB', 20)->nullable();
            $table->string('GUICHB', 20)->nullable();
            $table->string('RIB', 50)->nullable();

            // Clés étrangères
            $table->unsignedBigInteger('Id_agent');
            $table->unsignedBigInteger('Id_banque');

            $table->foreign('Id_agent')
                ->references('Id_agent')->on('agents')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreign('Id_banque')
                ->references('Id_banque')->on('banques')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compte_bancaires');
    }
};
