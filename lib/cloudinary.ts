// Fonction pour upload d'image côté client (sans dépendance cloudinary)
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Le fichier est trop volumineux. Taille maximum : 10MB');
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // Vérifier que les variables d'environnement sont définies
    if (!cloudName) {
      throw new Error('Cloudinary Cloud Name non configuré');
    }
    if (!uploadPreset) {
      throw new Error('Cloudinary Upload Preset non configuré');
    }

    console.log('Configuration Cloudinary:', { cloudName, uploadPreset });

    // Créer un FormData pour l'upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);
    // Spécifier le dossier où uploader l'image
    formData.append('folder', 'folders/images');

    console.log('FormData créé avec:', {
      file: file.name,
      upload_preset: uploadPreset,
      cloud_name: cloudName,
      folder: 'folders/images'
    });

    // Upload vers Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    console.log('Réponse Cloudinary:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur Cloudinary détaillée:', JSON.stringify(errorData, null, 2));
      throw new Error(`Erreur lors de l'upload: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Upload Cloudinary réussi:', data);
    return data.secure_url; // URL sécurisée de l'image
  } catch (error: any) {
    console.error('Erreur lors de l\'upload vers Cloudinary:', error);
    throw new Error(`Erreur lors de l'upload de l'image: ${error.message}`);
  }
};

// Fonction pour supprimer une image (optionnel)
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de l\'image');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
  }
}; 