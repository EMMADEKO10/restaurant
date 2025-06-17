import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary-server'

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID requis' },
        { status: 400 }
      )
    }

    // Supprimer l'image de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === 'ok') {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 