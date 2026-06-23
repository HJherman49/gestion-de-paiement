# Calcul Automatique du Salaire Mensuel

## Description
Le salaire mensuel est calculé automatiquement lors de la création ou la modification d'un barème, selon la formule suivante :

```
salaire_mensuel = salaire_base + anciennete + DIF + rappell
```

## Implémentation

### Modèle Bareme
La méthode `calculerSalaireMensuel()` est appelée automatiquement via l'événement `saving` du modèle Eloquent.

```php
// Fichier: app/Models/Bareme.php
public function calculerSalaireMensuel()
{
    $this->salaire_mensuel = 
        ($this->salaire_base ?? 0) + 
        ($this->anciennete ?? 0) + 
        ($this->DIF ?? 0) + 
        ($this->rappell ?? 0);
}
```

### Champs utilisés
- **salaire_base**: Salaire de base (décimal, 15,2)
- **anciennete**: Indemnité d'ancienneté en mois (entier, défaut: 0)
- **DIF**: Droit Individuel de Formation (décimal, 15,2, défaut: 0)
- **rappell**: Rappel de salaire (décimal, 15,2, défaut: 0)
- **salaire_mensuel**: Résultat du calcul (décimal, 15,2)

## Utilisation

### Création d'un barème
```bash
POST /api/baremes
Content-Type: application/json

{
    "Indice": 1,
    "salaire_base": 10000,
    "anciennete": 500,
    "DIF": 200,
    "rappell": 0
}
```

**Résultat**: `salaire_mensuel = 10000 + 500 + 200 + 0 = 10700`

### Mise à jour d'un barème
```bash
PUT /api/baremes/{id}
Content-Type: application/json

{
    "Indice": 1,
    "salaire_base": 11000,
    "anciennete": 600,
    "DIF": 250,
    "rappell": 100
}
```

**Résultat**: `salaire_mensuel = 11000 + 600 + 250 + 100 = 11950`

## Points Importants

1. **Calcul automatique**: Vous n'avez pas besoin d'envoyer `salaire_mensuel` dans votre requête, il sera calculé automatiquement.

2. **Stockage en BD**: Le `salaire_mensuel` est automatiquement enregistré dans la base de données lors de la sauvegarde.

3. **Validation**: Tous les champs excepté `salaire_mensuel` sont obligatoires. Le champ `salaire_mensuel` est optionnel lors de la création/mise à jour car il est généré automatiquement.

4. **Valeurs nulles**: Si un champ (anciennete, DIF, rappell) n'est pas fourni ou est nul, il est traité comme 0 dans le calcul.

## Événements Déclencheurs

Le calcul est déclenché par :
- **Création**: `Bareme::create($data)`
- **Mise à jour**: `$bareme->update($data)`
- **Sauvegarde directe**: `$bareme->save()`

## Exemple côté Frontend (React/Axios)

### Créer un barème
```typescript
const createBareme = async (baremeData) => {
    try {
        const response = await axios.post('/api/baremes', {
            Indice: baremeData.indice,
            salaire_base: parseFloat(baremeData.salaire_base),
            anciennete: parseInt(baremeData.anciennete) || 0,
            DIF: parseFloat(baremeData.dif) || 0,
            rappell: parseFloat(baremeData.rappell) || 0
            // Pas besoin d'envoyer salaire_mensuel, il sera calculé automatiquement
        });
        
        console.log('Barème créé:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur:', error);
    }
};
```

### Mettre à jour un barème
```typescript
const updateBareme = async (id, baremeData) => {
    try {
        const response = await axios.put(`/api/baremes/${id}`, {
            Indice: baremeData.indice,
            salaire_base: parseFloat(baremeData.salaire_base),
            anciennete: parseInt(baremeData.anciennete) || 0,
            DIF: parseFloat(baremeData.dif) || 0,
            rappell: parseFloat(baremeData.rappell) || 0
        });
        
        console.log('Salaire mensuel calculé:', response.data.salaire_mensuel);
        return response.data;
    } catch (error) {
        console.error('Erreur:', error);
    }
};
```

## Vérification en Base de Données

Pour vérifier que les salaires sont correctement calculés et enregistrés :

```sql
SELECT 
    Id_bareme, 
    Indice, 
    salaire_base, 
    anciennete, 
    DIF, 
    rappell,
    salaire_mensuel,
    (salaire_base + COALESCE(anciennete, 0) + COALESCE(DIF, 0) + COALESCE(rappell, 0)) as calcul_verif
FROM baremes
WHERE salaire_mensuel != (salaire_base + COALESCE(anciennete, 0) + COALESCE(DIF, 0) + COALESCE(rappell, 0));
```

Cette requête affichera les barèmes où le calcul n'est pas correct (il ne devrait y avoir aucun résultat).
