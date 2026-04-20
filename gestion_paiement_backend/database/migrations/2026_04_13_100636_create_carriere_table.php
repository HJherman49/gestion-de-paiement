<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('carrieres', function (Blueprint $table) {
            $table->id('Id_carriere');           // ou Id_carriere si tu préfères la cohérence totale
            $table->string('Categorie');
            $table->string('corps');
            $table->string('grade');
            $table->string('classe');
            $table->string('echelon');
            $table->integer('indice');

            // Clés étrangères
            $table->unsignedBigInteger('Id_agent');   // FK vers Agent
            $table->unsignedBigInteger('Id_bareme');   // FK vers Bareme

            $table->foreign('Id_agent')
                  ->references('Id_agent')->on('agents')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();

            $table->foreign('Id_bareme')
                  ->references('Id_bareme')->on('baremes')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('carrieres');
    }
};