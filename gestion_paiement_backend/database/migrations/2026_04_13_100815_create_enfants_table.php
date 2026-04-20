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
        Schema::create('enfants', function (Blueprint $table) {
            $table->id('Id_enfant');
            $table->date('date_naissance');
            $table->integer('Nb_enf')->default(0);
            $table->integer('Nb_enf_inf_15ans')->default(0);
            $table->integer('Nb_enf_sup_15ans')->default(0);

            $table->unsignedBigInteger('Id_agent');

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
        Schema::dropIfExists('enfants');
    }
};
