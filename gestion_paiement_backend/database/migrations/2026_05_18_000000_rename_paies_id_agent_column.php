<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('paies')) {
            return;
        }

        if (Schema::hasColumn('paies', 'id_agent') && ! Schema::hasColumn('paies', 'Id_agent')) {
            DB::statement('ALTER TABLE `paies` CHANGE COLUMN `id_agent` `Id_agent` BIGINT UNSIGNED NOT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('paies')) {
            return;
        }

        if (Schema::hasColumn('paies', 'Id_agent') && ! Schema::hasColumn('paies', 'id_agent')) {
            DB::statement('ALTER TABLE `paies` CHANGE COLUMN `Id_agent` `id_agent` BIGINT UNSIGNED NOT NULL');
        }
    }
};
