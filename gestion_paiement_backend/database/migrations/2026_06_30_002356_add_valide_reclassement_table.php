<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reclassements', function (Blueprint $table) {
            // NULL = pas encore validé. Une fois rempli, le reclassement
            // est définitif et ne doit plus pouvoir être re-validé.
            $table->timestamp('valide_le')->nullable()->after('observation');
        });
    }

    public function down(): void
    {
        Schema::table('reclassements', function (Blueprint $table) {
            $table->dropColumn('valide_le');
        });
    }
};