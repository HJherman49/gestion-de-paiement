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

            // PK
            $table->id('Id_agent');
            $table->string('num_matricule', 50)->unique();

            // ------------------------------------------------
            // INFORMATIONS PERSONNELLES — toutes obligatoires
            // ------------------------------------------------
            $table->string('nom', 100);
            $table->string('prenoms', 150);
            $table->string('adresse', 250);
            $table->string('N_CIN', 50)->unique();
            $table->date('date_naissance');
            $table->date('date_delivrance_CI');
            $table->string('lieu_delivrance_CI', 150);
            $table->enum('sexe', ['M', 'F']);
            $table->enum('civilite', ['Mr', 'Mme', 'Melle']);
            $table->string('tel', 30);
            $table->string('mail', 150)->nullable();  

            // ------------------------------------------------
            // INFORMATIONS ADMINISTRATIVES
            // ------------------------------------------------
            $table->date('date_entree_admin');
            $table->date('date_retraite')->nullable();      // calculée 
            $table->string('categ_retraite', 100)->nullable(); // calculée 
            $table->string('N_Cnaps', 50)->nullable();
            $table->string('porte', 50)->nullable();     
            $table->decimal('pp_gale', 15, 2)->default(0);

            // ------------------------------------------------
            // CLÉS ÉTRANGÈRES — toutes obligatoires
            // ------------------------------------------------
            $table->unsignedBigInteger('Id_direction');
            $table->unsignedBigInteger('Id_service');
            $table->unsignedBigInteger('Id_division');
            $table->unsignedBigInteger('Id_statut');
            $table->unsignedBigInteger('Id_contrat');

            $table->foreign('Id_direction')
                  ->references('Id_direction')->on('directions')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();

            $table->foreign('Id_service')
                  ->references('Id_service')->on('services')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();

            $table->foreign('Id_division')
                  ->references('Id_division')->on('divisions')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();

            $table->foreign('Id_statut')
                  ->references('Id_statut')->on('statuts')
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

      public function down(): void
      {
      Schema::dropIfExists('agents');
      }
};
