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
        Schema::create('preembauches', function (Blueprint $table) {
            $table->id('Id_preemb');
            $table->string('N_contrat');
            $table->date('Date_recrutement');
            $table->date('Date_recrutement1')->nullable();
            $table->date('Deb_stage_PreEmb');
            $table->text('Deb_stage_PreEmb_txt')->nullable();
            $table->date('Fin_stage_PreEmb');
            $table->text('Fin_stage_PreEmb_txt')->nullable();
            $table->decimal('Montant_PreEmb', 15, 2);
            $table->decimal('Montant_PreEmb_Contrat', 15, 2);

            // Clés étrangères
            $table->unsignedBigInteger('Id_agent');
            $table->unsignedBigInteger('Id_contrat');

            $table->foreign('Id_agent')
                ->references('Id_agent')->on('agents')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreign('Id_contrat')
                ->references('Id_contrat')->on('contrats')
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
        Schema::dropIfExists('preembauches');
    }
};
