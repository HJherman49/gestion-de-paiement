<?php

namespace App\Traits;

use App\Models\Historique;

/**
 * Trait pour enregistrer automatiquement les opérations CRUD dans l'historique
 * 
 * Usage:
 *   use LogsHistorique;
 *   
 *   $this->logCreate('agents', $agent->id);
 *   $this->logUpdate('agents', $agent->id, $before, $after);
 *   $this->logDelete('agents', $agent->id);
 */
trait LogsHistorique
{
    /**
     * Enregistre une création
     */
    protected function logCreate(string $table, int $recordId, ?string $user = null): void
    {
        Historique::log($table, $recordId, 'CREATE', null, null, null, $user ?? auth()->user()?->name);
    }

    /**
     * Enregistre une modification (avant/après)
     */
    protected function logUpdate(string $table, int $recordId, array $before, array $after, ?string $user = null): void
    {
        Historique::logChanges($table, $recordId, $before, $after, $user ?? auth()->user()?->name);
    }

    /**
     * Enregistre une suppression
     */
    protected function logDelete(string $table, int $recordId, ?string $user = null): void
    {
        Historique::log($table, $recordId, 'DELETE', null, null, null, $user ?? auth()->user()?->name);
    }
}
