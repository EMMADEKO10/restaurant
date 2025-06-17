# Configuration Cloudinary

Ce projet utilise Cloudinary pour la gestion des images au lieu de Firebase Storage.

## Étapes de configuration

### 1. Créer un compte Cloudinary
- Allez sur [cloudinary.com](https://cloudinary.com)
- Créez un compte gratuit
- Notez votre `Cloud Name`, `API Key` et `API Secret`

### 2. Configurer les variables d'environnement
Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Configuration Firebase (existante)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Configuration Cloudinary (nouvelle)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=restaurant_dishes
```

### 3. Configurer l'Upload Preset
1. Connectez-vous à votre dashboard Cloudinary
2. Allez dans **Settings** > **Upload**
3. Dans la section **Upload presets**, cliquez sur **Add upload preset**
4. Nommez-le `restaurant_dishes`
5. Définissez **Signing Mode** sur **Unsigned** (pour l'upload côté client)
6. Optionnellement, configurez des transformations d'image (redimensionnement, compression, etc.)

### 4. Avantages de Cloudinary
- **Plus simple** : Pas de règles de sécurité complexes
- **Plus fiable** : Moins d'erreurs CORS
- **Optimisation automatique** : Redimensionnement et compression automatiques
- **CDN global** : Images servies rapidement partout dans le monde
- **Transformations** : Possibilité de modifier les images à la volée

### 5. Utilisation dans le code
Les images sont maintenant uploadées directement vers Cloudinary et les URLs sont stockées dans Firestore :

```typescript
// Upload d'image
const imageUrl = await uploadImageToCloudinary(file)

// Stockage dans Firestore
const dishData = {
  name: "Mon plat",
  imageUrl: imageUrl, // URL Cloudinary
  // ... autres données
}
```

### 6. Gestion des erreurs
Le système inclut une gestion d'erreurs robuste :
- Validation de la taille des fichiers (max 10MB)
- Validation du type de fichier (images uniquement)
- Messages d'erreur clairs pour l'utilisateur

### 7. Sécurité
- L'API Secret n'est utilisée que côté serveur
- L'upload se fait via un preset non signé (plus sécurisé)
- Validation côté client et serveur

## Migration depuis Firebase Storage
Si vous migrez depuis Firebase Storage :
1. Les anciennes images restent dans Firebase Storage
2. Les nouvelles images seront sur Cloudinary
3. Vous pouvez supprimer les règles Firebase Storage si vous n'en avez plus besoin 