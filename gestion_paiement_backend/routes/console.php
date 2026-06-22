<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

 
use Illuminate\Support\Facades\Schedule;
 
Schedule::command('paie:generer')
    ->monthlyOn(1, '00:00')
    ->timezone('Indian/Antananarivo')
    ->withoutOverlapping();
 



