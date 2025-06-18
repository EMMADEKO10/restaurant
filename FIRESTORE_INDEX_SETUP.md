# Configuration des Index Firestore

## Problème
L'application nécessite des index Firestore pour optimiser les requêtes de plats.

## Solution

### 1. Création manuelle de l'index principal

1. **Accédez à la Console Firebase**
   - Ouvrez [https://console.firebase.google.com](https://console.firebase.google.com)
   - Sélectionnez votre projet `restaurant-eb93c`

2. **Accédez à Firestore Database**
   - Dans le menu de gauche, cliquez sur "Firestore Database"
   - Sélectionnez l'onglet "Indexes"

3. **Créez l'index composite**
   - Cliquez sur "Create Index"
   - Remplissez les champs :
     * Collection ID: `dishes`
     * Champs à indexer :
       ```
       Field Path     |  Order
       -----------------------------
       isAvailable    |  Ascending
       name          |  Ascending
       ```
     * Query Scope: Collection
   - Cliquez sur "Create"

4. **Attendez la création**
   - La création de l'index peut prendre 2-5 minutes
   - Vous recevrez un email quand l'index sera prêt
   - L'état de l'index sera visible dans la console Firebase

### 2. Index supplémentaires recommandés

Pour optimiser d'autres requêtes, créez également ces index :

#### Index pour les requêtes utilisateur
```
Collection: dishes
Fields:
  - userId (Ascending)
  - createdAt (Descending)
Query Scope: Collection
```

### 3. Règles de sécurité Firestore

Assurez-vous que vos règles Firestore permettent la lecture de la collection `dishes` :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /dishes/{document} {
      allow read: if true; // Permet la lecture publique des plats
      allow write: if request.auth != null; // Seuls les utilisateurs connectés peuvent écrire
    }
  }
}
```

### 4. Vérification

Une fois l'index créé, vous pouvez revenir à la requête optimisée dans `lib/firebase/dishes.ts` :

```typescript
const q = query(
  collection(db, 'dishes'),
  where('isAvailable', '==', true),
  orderBy('name')
)
```

### 5. Dépannage

Si vous rencontrez des erreurs :
1. Vérifiez que l'index est complètement créé (état "Enabled" dans la console)
2. Vérifiez que les noms des champs correspondent exactement (`isAvailable`, `name`)
3. Assurez-vous que les règles de sécurité permettent l'accès à la collection 