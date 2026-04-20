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
        Schema::create('reclassements', function (Blueprint $table) {
        $table->id('Id_reclass');
        $table->date('date_reclassement');
        $table->string('categ_reclassement');
        $table->date('date_effet_solde');
        $table->date('date_effet_anciennete');
        $table->text('observation')->nullable();

        // Clé étrangère vers Carriere
        $table->unsignedBigInteger('Id_carriere');

        $table->foreign('Id_carriere')
            ->references('Id_carriere')->on('carrieres')
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
        Schema::dropIfExists('reclassements');
    }
};
