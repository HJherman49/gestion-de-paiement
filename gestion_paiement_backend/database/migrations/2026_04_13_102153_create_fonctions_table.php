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
        Schema::create('fonctions', function (Blueprint $table) {
            $table->id('Id_fonction');
            $table->string('nom_fonction');
            $table->date('date_fonction');
            $table->date('date_affectation');
            $table->decimal('fonction_prime', 15, 2)->default(0);
            $table->string('num_fonct')->nullable();

            // Clés étrangères
            $table->unsignedBigInteger('Id_direction');
            $table->unsignedBigInteger('Id_agent');

            $table->foreign('Id_direction')
                ->references('Id_Direction')->on('directions')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreign('Id_agent')
                ->references('Id_agent')->on('agents')
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
        Schema::dropIfExists('fonctions');
    }
};
