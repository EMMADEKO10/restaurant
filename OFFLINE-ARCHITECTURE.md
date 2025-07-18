# Architecture Offline-First - Restaurant Management

## 🎯 Vue d'ensemble

Votre application Restaurant Management utilise maintenant une **architecture offline-first** qui permet :

- ✅ **Fonctionnement hors ligne** complet
- 🔄 **Synchronisation automatique** en arrière-plan
- 💾 **Stockage local** avec IndexedDB
- 🌐 **Transition transparente** online/offline
- 📱 **Expérience PWA** native

## 🏗️ Architecture

### Couches de l'architecture

```
┌─────────────────────────────────────┐
│           Interface React           │ ← useOfflineApi(), OfflineIndicator
├─────────────────────────────────────┤
│         OfflineProvider             │ ← Gestion d'état global
├─────────────────────────────────────┤
│         OfflineApiClient            │ ← API unifiée
├─────────────────────────────────────┤
│         OfflineManager              │ ← Logique métier offline
├─────────────────────────────────────┤
│         OfflineStorage              │ ← IndexedDB
├─────────────────────────────────────┤
│    Service Worker + Firebase       │ ← Synchronisation
└─────────────────────────────────────┘
```

### Composants clés

| Composant | Rôle |
|-----------|------|
| `OfflineStorage` | Gestion IndexedDB, stockage local |
| `OfflineManager` | Logique métier, synchronisation |
| `OfflineApiClient` | API unifiée pour l'application |
| `OfflineProvider` | Provider React, état global |
| `useOfflineApi` | Hook pour les composants |
| `OfflineIndicator` | Indicateur visuel d'état |

## 🚀 Utilisation

### 1. Hook principal : `useOfflineApi`

```tsx
import { useOfflineApi } from '@/lib/hooks/useOfflineApi'

function MonComposant() {
  const { dishes, orders, isOnline, isLoading } = useOfflineApi()

  // Récupérer tous les plats (fonctionne online/offline)
  const loadDishes = async () => {
    const allDishes = await dishes.getAll()
    setDishes(allDishes)
  }

  // Créer un nouveau plat
  const createNewDish = async (dishData) => {
    const newDish = await dishes.create(dishData)
    // Synchronisation automatique si en ligne
  }

  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-100 p-2">
          Mode hors ligne - vos modifications seront synchronisées
        </div>
      )}
      {/* Votre interface */}
    </div>
  )
}
```

### 2. API disponible

#### Plats (Dishes)
```tsx
const { dishes } = useOfflineApi()

// Récupérer tous les plats
const allDishes = await dishes.getAll()

// Créer un plat
const newDish = await dishes.create({
  name: "Pizza Margherita",
  price: 15.99,
  category: "food",
  // ...
})

// Mettre à jour un plat
const updatedDish = await dishes.update(dishId, {
  price: 17.99
})

// Supprimer un plat (soft delete)
await dishes.delete(dishId)
```

#### Commandes (Orders)
```tsx
const { orders } = useOfflineApi()

// Récupérer toutes les commandes
const allOrders = await orders.getAll()

// Créer une commande
const newOrder = await orders.create({
  items: [...],
  total: 25.50,
  table: tableInfo,
  status: 'pending'
})

// Mettre à jour le statut
const updatedOrder = await orders.updateStatus(orderId, 'preparing')
```

### 3. Composants visuels

#### Indicateur d'état simple
```tsx
import { OfflineIndicator } from '@/components/offline/OfflineIndicator'

// Déjà intégré dans le layout principal
<OfflineIndicator />
```

#### Statut détaillé (pour l'admin)
```tsx
import { OfflineStatus } from '@/components/offline/OfflineStatus'

<OfflineStatus showDetails={true} />
```

## 🔧 Migration des composants existants

### Avant (Firebase direct)
```tsx
import { getAllDishes, createDish } from '@/lib/firebase/dishes'

function AdminDashboard() {
  const [dishes, setDishes] = useState([])

  useEffect(() => {
    const loadDishes = async () => {
      const allDishes = await getAllDishes()
      setDishes(allDishes)
    }
    loadDishes()
  }, [])

  const handleCreateDish = async (dishData) => {
    const newDish = await createDish(dishData)
    setDishes(prev => [newDish, ...prev])
  }
}
```

### Après (Offline-first)
```tsx
import { useOfflineApi } from '@/lib/hooks/useOfflineApi'

function AdminDashboard() {
  const { dishes, isLoading, isOnline } = useOfflineApi()
  const [dishList, setDishList] = useState([])

  useEffect(() => {
    const loadDishes = async () => {
      const allDishes = await dishes.getAll()
      setDishList(allDishes)
    }
    loadDishes()
  }, [dishes])

  const handleCreateDish = async (dishData) => {
    const newDish = await dishes.create(dishData)
    setDishList(prev => [newDish, ...prev])
    // Synchronisation automatique !
  }
}
```

## 📱 Fonctionnalités offline

### Ce qui fonctionne hors ligne
- ✅ Consultation des plats et commandes
- ✅ Création de nouveaux plats
- ✅ Modification des plats existants
- ✅ Création de commandes
- ✅ Changement de statut des commandes
- ✅ Navigation dans l'application

### Synchronisation automatique
- 🔄 **Au retour en ligne** : synchronisation immédiate
- ⏰ **Toutes les 30 secondes** : si en ligne et données en attente
- 🚀 **Lors des modifications** : tentative de sync immédiate si en ligne

### Gestion des conflits
- **Création** : IDs temporaires remplacés par IDs Firebase
- **Modification** : Les modifications locales sont prioritaires
- **Suppression** : Soft delete (marquer comme indisponible)

## 🛠️ Configuration avancée

### Service Worker personnalisé
Le service worker `sw-offline.js` gère :
- Cache des ressources statiques
- Cache des API calls
- Cache des images (Cloudinary)
- Synchronisation en arrière-plan

### IndexedDB
Base de données locale avec :
- **dishes** : plats avec métadonnées de sync
- **orders** : commandes avec métadonnées de sync
- **sync_queue** : queue de synchronisation
- **metadata** : métadonnées système

### Configuration PWA
Le fichier `next.config.js` inclut :
```js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Configuration de cache personnalisée
})
```

## 🐛 Dépannage

### Problèmes courants

#### 1. Synchronisation bloquée
```tsx
const { sync } = useOfflineApi()

// Forcer la synchronisation
await sync.forceSync()

// Vérifier les éléments en attente
const pendingCount = await sync.getPendingCount()
```

#### 2. Cache corrompu
```tsx
const { clearCache } = useOffline()

// Vider le cache (attention : perte des données non synchronisées)
await clearCache()
```

#### 3. Données dupliquées
- Vérifiez que les IDs offline sont bien remplacés
- Vérifiez les logs de synchronisation dans la console

### Debugging

#### Logs de développement
```js
// Dans la console du navigateur
console.log('[Offline] État actuel:', {
  isOnline: navigator.onLine,
  pendingSync: await getPendingSyncCount(),
  lastSync: getLastSyncTime()
})
```

#### DevTools
1. **Application** > **IndexedDB** > **restaurant-offline**
2. **Application** > **Service Workers**
3. **Network** > **Offline** (pour tester)

## 📊 Monitoring

### Métriques à surveiller
- Nombre d'éléments en attente de synchronisation
- Temps depuis la dernière synchronisation
- Taux d'échec de synchronisation
- Utilisation de l'espace IndexedDB

### Alertes recommandées
- ⚠️ Plus de 50 éléments en attente
- ⚠️ Pas de sync depuis plus de 2 heures
- ⚠️ Taux d'échec > 10%

## 🚀 Évolutions futures

### Fonctionnalités planifiées
- 📸 **Cache des images** optimisé
- 🔄 **Synchronisation différentielle**
- 📊 **Analytics offline**
- 🔒 **Chiffrement des données locales**
- 📱 **Notifications push offline**

### Optimisations possibles
- Compression des données locales
- Synchronisation par lots
- Priorisation des synchronisations
- Cache intelligent basé sur l'usage

---

## 💡 Conseils d'utilisation

1. **Toujours utiliser `useOfflineApi`** au lieu des fonctions Firebase directes
2. **Gérer l'état offline** dans vos composants avec `isOnline`
3. **Informer l'utilisateur** des opérations en attente avec `pendingSyncCount`
4. **Tester régulièrement** en mode offline (DevTools > Network > Offline)
5. **Surveiller la console** pour les logs de synchronisation

Votre application Restaurant Management est maintenant prête pour un usage professionnel en conditions réelles ! 🎉 