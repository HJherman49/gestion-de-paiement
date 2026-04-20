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
        Schema::create('divisions', function (Blueprint $table) {
            $table->id('Id_division');
            $table->string('Nom_division');
            $table->string('section')->nullable();
 
            // FK → services
            $table->unsignedBigInteger('Id_service');
            $table->foreign('Id_service')
                  ->references('Id_service')->on('services')
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
        Schema::dropIfExists('divisions');
    }
};
