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
        Schema::create('historiques', function (Blueprint $table) {
            $table->id('Id_historique');
            $table->string('table_concernee');
            $table->unsignedBigInteger('id_enregistrement');
            $table->unsignedBigInteger('Id_agent')->nullable();
            $table->string('type_action'); // create, update, delete
            $table->timestamp('date_action');
            $table->string('champ_modifie')->nullable();
            $table->text('valeur_avant')->nullable();
            $table->text('valeur_apres')->nullable();
            $table->string('utilisateur');

            $table->foreign('Id_agent')
                ->references('Id_agent')->on('agents')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historiques');
    }
};
