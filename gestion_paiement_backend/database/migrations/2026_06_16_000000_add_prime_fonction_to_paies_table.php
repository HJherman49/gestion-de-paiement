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
        if (! Schema::hasTable('paies') || Schema::hasColumn('paies', 'prime_fonction')) {
            return;
        }

        Schema::table('paies', function (Blueprint $table) {
            $table->decimal('prime_fonction', 15, 2)
                ->default(0)
                ->after('prime');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('paies') || ! Schema::hasColumn('paies', 'prime_fonction')) {
            return;
        }

        Schema::table('paies', function (Blueprint $table) {
            $table->dropColumn('prime_fonction');
        });
    }
};
