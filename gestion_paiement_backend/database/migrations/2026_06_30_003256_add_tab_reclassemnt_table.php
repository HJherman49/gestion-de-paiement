<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reclassements', function (Blueprint $table) {
            // Capture la catégorie de la carrière TELLE QU'ELLE ÉTAIT avant la
            // validation de ce reclassement — figée pour toujours, même si la
            // carrière change ensuite via un reclassement suivant.
            $table->string('ancienne_categorie')->nullable()->after('categ_reclassement');
            $table->string('nouveau_corps')->nullable()->after('ancienne_categorie');
            $table->string('nouveau_grade')->nullable()->after('nouveau_corps');
            $table->string('nouvelle_classe')->nullable()->after('nouveau_grade');
            $table->integer('nouvel_indice')->nullable()->after('nouvelle_classe');
            $table->string('nouvelle_echelon')->nullable()->after('nouvel_indice');
        });
    }

    public function down(): void
    {
        Schema::table('reclassements', function (Blueprint $table) {
            $table->dropColumn('ancienne_categorie');
            $table->dropColumn('nouveau_corps');
            $table->dropColumn('nouveau_grade');
            $table->dropColumn('nouvelle_classe');
            $table->dropColumn('nouvel_indice');
            $table->dropColumn('nouvelle_echelon');
        });
    }
};