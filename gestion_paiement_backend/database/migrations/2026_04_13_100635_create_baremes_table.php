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
        Schema::create('baremes', function (Blueprint $table) {
            $table->id('Id_bareme');
            $table->integer('Indice');
            $table->decimal('salaire_base', 15, 2);
            $table->decimal('salaire_mensuel', 15, 2);
            $table->integer('anciennete')->default(0);
            $table->decimal('DIF', 15, 2)->default(0);
            $table->decimal('rappell', 15, 2)->default(0);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('baremes');
    }
};
