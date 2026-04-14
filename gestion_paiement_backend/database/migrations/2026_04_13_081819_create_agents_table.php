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
        Schema::create('agents', function (Blueprint $table) {
            $table->id('id_agent');
            // ------------------------------------------------
            // INFORMATIONS PERSONNELLES
            // ------------------------------------------------
            $table->string('nom');
            $table->string('prenoms');
            $table->string('num_matricule', 50)->unique();
            $table->string('adresse');
            $table->string('N_CIN')->unique();
            $table->date('date_naissance');
            $table->date('date_delivrance_CI');
            $table->string('lieu_delivrance_CI');
            $table->enum('sexe', ['M', 'F']);
            $table->string('civilite', 20);   // Mr, Mme, Melle
            $table->string('tel')->unique();
            $table->string('mail')->unique();
            $table->string('porte');      // numéro de bureau
 
            // ------------------------------------------------
            // INFORMATIONS ADMINISTRATIVES
            // ------------------------------------------------
            $table->date('date_entree_admin');
            $table->date('date_retraite');
            $table->string('categ_retraite');
            $table->string('N_Cnaps', 50);
            $table->decimal('pp_gale', 15, 2)->default(0);

            //------------------------------------------------
            //CLES ETRANGERES
            //------------------------------------------------
            $table->foreignId('Id_direction')
                  ->constrained('directions', 'Id_direction')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();

            $table->foreignId('Id_service')
                  ->constrained('services', 'Id_service')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();

            $table->foreignId('Id_division')
                  ->constrained('divisions', 'Id_division')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();

            $table->foreignId('Id_statut')
                  ->constrained('statuts', 'Id_statut')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();

            $table->foreignId('Id_contrat')
                  ->constrained('contrats', 'Id_contrat')
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
        Schema::dropIfExists('agents');
    }
};
