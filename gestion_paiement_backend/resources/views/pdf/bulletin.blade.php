<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Bulletin de paie</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #222; margin: 0; padding: 20px; }
        header { text-align: center; margin-bottom: 24px; }
        h1 { font-size: 20px; margin: 0; }
        .info, .totals { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info td, .totals td { padding: 8px 10px; border: 1px solid #ddd; }
        .info th, .totals th { padding: 8px 10px; border: 1px solid #ddd; background: #f3f3f3; text-align: left; }
        .section-title { margin: 16px 0 8px; font-weight: bold; }
        .right { text-align: right; }
    </style>
</head>
<body>
    <header>
        <h1>Bulletin de paie</h1>
        <p>Référence : {{ $paie->Id_paie }}</p>
    </header>

    <table class="info">
        <tr>
            <th>Agent</th>
            <td>{{ optional($paie->agent)->civilite ?? '—' }} {{ optional($paie->agent)->nom ?? '—' }}</td>
        </tr>
        <tr>
            <th>Matricule</th>
            <td>{{ optional($paie->agent)->num_matricule ?? '—' }}</td>
        </tr>
        <tr>
            <th>Période</th>
            <td>{{ $paie->mois }}/{{ $paie->annee }}</td>
        </tr>
        <tr>
            <th>Mode de paie</th>
            <td>{{ $paie->mode_paie ?? '—' }}</td>
        </tr>
    </table>

    <div class="section-title">Détails</div>
    <table class="totals">
        <tr>
            <th>Description</th>
            <th class="right">Montant</th>
        </tr>
        <tr>
            <td>Salaire brut</td>
            <td class="right">{{ number_format($paie->salaire_brut ?? 0, 2, ',', ' ') }} Ar</td>
        </tr>
        <tr>
            <td>IGR</td>
            <td class="right">{{ number_format($paie->IGR ?? 0, 2, ',', ' ') }} Ar</td>
        </tr>
        <tr>
            <td>PA</td>
            <td class="right">{{ number_format($paie->PA ?? 0, 2, ',', ' ') }} Ar</td>
        </tr>
        <tr>
            <td>Rappel</td>
            <td class="right">{{ number_format($paie->rappel ?? 0, 2, ',', ' ') }} Ar</td>
        </tr>
        <tr>
            <td>Remboursement</td>
            <td class="right">{{ number_format($paie->remboursement ?? 0, 2, ',', ' ') }} Ar</td>
        </tr>
        <tr>
            <th>Net à payer</th>
            <th class="right">{{ number_format((float) $paie->salaire_brut - ($paie->IGR ?? 0) - ($paie->PA ?? 0) + ($paie->remboursement ?? 0) + ($paie->rappel ?? 0), 2, ',', ' ') }} Ar</th>
        </tr>
    </table>

    <div class="section-title">Informations complémentaires</div>
    <table class="info">
        <tr>
            <th>Chapitre</th>
            <td>{{ $paie->chap ?? '—' }}</td>
        </tr>
        <tr>
            <th>Article</th>
            <td>{{ $paie->art ?? '—' }}</td>
        </tr>
        <tr>
            <th>Date d'effet</th>
            <td>{{ optional($paie->date_effet)->format('d/m/Y') ?? '—' }}</td>
        </tr>
    </table>
</body>
</html>
