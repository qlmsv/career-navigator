import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['SUPABASE_SERVICE_ROLE_KEY']!
    )
    
    // Создаем bucket для медиа файлов тестов
    const { data, error } = await supabase.storage.createBucket('test-media', {
      public: true,
      allowedMimeTypes: [
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'audio/mp3',
        'audio/wav',
        'audio/ogg'
      ],
      fileSizeLimit: 50 * 1024 * 1024 // 50MB
    })

    if (error && !error.message.includes('already exists')) {
      throw error
    }

    return Response.json({ 
      success: true, 
      message: 'Storage bucket created successfully',
      data 
    })
  } catch (error) {
    console.error('Error creating storage bucket:', error)
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
