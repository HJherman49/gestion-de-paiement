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
        Schema::create('paies', function (Blueprint $table) {
            $table->id('Id_paie');
            $table->integer('mois');
            $table->integer('annee');
            $table->decimal('salaire_brut', 15, 2);
            $table->decimal('prime', 15, 2)->default(0);
            $table->decimal('scola', 15, 2)->default(0);
            $table->decimal('remboursement', 15, 2)->default(0);
            $table->integer('Indice');
            $table->decimal('prime_speciale', 15, 2)->default(0);
            $table->decimal('prime_fin_annee', 15, 2)->default(0);
            $table->decimal('alloc', 15, 2)->default(0);
            $table->decimal('logement', 15, 2)->default(0);
            $table->decimal('IGR', 15, 2)->default(0);
            $table->decimal('rappel', 15, 2)->default(0);
            $table->decimal('PA', 15, 2)->default(0);
            $table->string('mode_paie');
            $table->string('chap')->nullable();
            $table->string('art')->nullable();
            $table->date('date_effet');

            // Clés étrangères
            $table->unsignedBigInteger('id_agent');
            $table->unsignedBigInteger('Id_enfant')->nullable();

            $table->foreign('Id_agent')
                ->references('Id_agent')->on('agents')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreign('Id_enfant')
                ->references('Id_enfant')->on('enfants')
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
        Schema::dropIfExists('paies');
    }
};
