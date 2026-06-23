<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bulletins {{ $mois }}/{{ $annee }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; margin: 0; }
        .bulletin { page-break-after: always; padding: 20px; }
        .bulletin:last-child { page-break-after: avoid; }
        h1 { text-align: center; font-size: 14px; margin-bottom: 4px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 16px; font-size: 11px; }
        .info-grid { display: flex; gap: 20px; margin-bottom: 12px; }
        .info-block { flex: 1; }
        .info-block p { margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        td, th { border: 1px solid #ccc; padding: 4px 8px; }
        th { background: #f0f0f0; font-weight: bold; }
        .section-header td { background: #e8e8e8; font-weight: bold; }
        .net td { background: #d4edda; font-weight: bold; font-size: 12px; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature { text-align: center; width: 40%; }
        .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 4px; font-size: 10px; }
    </style>
</head>
<body>
@foreach($paies as $paie)
@php
    $agent = $paie->agent;
    $moisNoms = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    $net = ($paie->salaire_brut ?? 0)
         + ($paie->prime ?? 0)
         + ($paie->prime_speciale ?? 0)
         + ($paie->prime_fonction ?? 0)
         + ($paie->prime_fin_annee ?? 0)
         + ($paie->alloc ?? 0)
         + ($paie->logement ?? 0)
         + ($paie->scola ?? 0)
         + ($paie->remboursement ?? 0)
         + ($paie->rappel ?? 0)
         - ($paie->IGR ?? 0)
         - ($paie->PA ?? 0);
@endphp
<div class="bulletin">
    <h1>BULLETIN DE PAIE</h1>
    <p class="subtitle">{{ $moisNoms[$mois] }} {{ $annee }}</p>

    <table>
        <tr>
            <td><strong>Agent :</strong> {{ $agent?->civilite }} {{ $agent?->nom }} {{ $agent?->prenoms }}</td>
            <td><strong>Matricule :</strong> {{ $agent?->num_matricule }}</td>
        </tr>
        <tr>
            <td><strong>Direction :</strong> {{ $agent?->direction?->nom ?? '—' }}</td>
            <td><strong>Service :</strong> {{ $agent?->service?->nom ?? '—' }}</td>
        </tr>
        <tr>
            <td><strong>Mode de paiement :</strong> {{ $paie->mode_paie }}</td>
            <td><strong>Date d'effet :</strong> {{ $paie->date_effet }}</td>
        </tr>
    </table>

    <table style="margin-top: 12px">
        <tr class="section-header"><td colspan="2">RÉMUNÉRATIONS</td></tr>
        <tr><td>Salaire brut</td><td>{{ number_format($paie->salaire_brut ?? 0, 0, ',', ' ') }} Ar</td></tr>
        @if(($paie->prime ?? 0) > 0)
        <tr><td>Prime</td><td>{{ number_format($paie->prime, 0, ',', ' ') }} Ar</td></tr>
        @endif
        @if(($paie->prime_speciale ?? 0) > 0)
        <tr><td>Prime spéciale</td><td>{{ number_format($paie->prime_speciale, 0, ',', ' ') }} Ar</td></tr>
        @endif
        @if(($paie->prime_fonction ?? 0) > 0)
        <tr><td>Prime de fonction</td><td>{{ number_format($paie->prime_fonction, 0, ',', ' ') }} Ar</td></tr>
        @endif
        @if(($paie->prime_fin_annee ?? 0) > 0)
        <tr><td>Prime fin d'année</td><td>{{ number_format($paie->prime_fin_annee, 0, ',', ' ') }} Ar</td></tr>
        @endif
        @if(($paie->alloc ?? 0) > 0)
        <tr><td>Allocation</td><td>{{ number_format($paie->alloc, 0, ',', ' ') }} Ar</td></tr>
        @endif
        @if(($paie->logement ?? 0) > 0)
        <tr><td>Logement</td><td>{{ number_format($paie->logement, 0, ',', ' ') }} Ar</td></tr>
        @endif
        @if(($paie->scola ?? 0) > 0)
        <tr><td>Scolarité</td><td>{{ number_format($paie->scola, 0, ',', ' ') }} Ar</td></tr>
        @endif
        @if(($paie->remboursement ?? 0) > 0)
        <tr><td>Remboursement</td><td>{{ number_format($paie->remboursement, 0, ',', ' ') }} Ar</td></tr>
        @endif
        @if(($paie->rappel ?? 0) > 0)
        <tr><td>Rappel</td><td>{{ number_format($paie->rappel, 0, ',', ' ') }} Ar</td></tr>
        @endif

        <tr class="section-header"><td colspan="2">DÉDUCTIONS</td></tr>
        <tr><td>IGR</td><td>- {{ number_format($paie->IGR ?? 0, 0, ',', ' ') }} Ar</td></tr>
        <tr><td>PA / CNAPS</td><td>- {{ number_format($paie->PA ?? 0, 0, ',', ' ') }} Ar</td></tr>

        <tr class="net">
            <td>NET À PAYER</td>
            <td>{{ number_format($net, 0, ',', ' ') }} Ar</td>
        </tr>
    </table>

    <div class="footer">
        <div class="signature">
            <div class="signature-line">Signature de l'agent</div>
        </div>
        <div class="signature">
            <div class="signature-line">Le Directeur</div>
        </div>
    </div>
</div>
@endforeach
</body>
</html>