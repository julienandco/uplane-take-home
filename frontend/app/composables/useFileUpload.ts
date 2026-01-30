import type { RealtimeChannel } from '@supabase/supabase-js'

export interface UploadedFile {
  id: string
  name: string
  originalName: string
  size: number
  type: string
  status: 'uploading' | 'queued' | 'ongoing' | 'successful' | 'failed'
  progress: number
  url?: string
  processedUrl?: string
  error?: string
  createdAt: Date
}

export function useFileUpload() {
  const { client: supabase, isConfigured: isSupabaseConfigured } = useSupabase()
  
  const files = useState<UploadedFile[]>('uploaded-files', () => [])
  const realtimeChannel = ref<RealtimeChannel | null>(null)

  // Setup realtime listener for processing status updates
  const setupRealtimeListener = () => {
    if (!supabase.value) return

    realtimeChannel.value = supabase.value
      .channel('image-processing-tasks')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'image_processing_tasks',
        },
        (payload) => {
          const { original_image_url, status, processed_image_url } = payload.new as {
            original_image_url: string
            status: string
            processed_image_url?: string
          }
          
          // Match by original_image_url since DB id doesn't match frontend fileId
          const file = files.value.find(f => f.url === original_image_url)
          if (file) {
            file.status = status as UploadedFile['status']
            if (processed_image_url) {
              file.processedUrl = processed_image_url
            }
          }
        }
      )
      .subscribe()
  }

  // Upload file to Supabase storage
  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const fileId = generateId()
    // Store file in folder: images/{fileId}/raw
    const filePath = `${fileId}/raw`
    
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: filePath,
      originalName: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
      createdAt: new Date(),
    }
    
    files.value = [uploadedFile, ...files.value]

    try {
      // If Supabase is configured, use real upload
      if (supabase.value) {
        const { error: uploadError } = await supabase.value.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.value.storage
          .from('images')
          .getPublicUrl(filePath)

        const publicUrl = urlData.publicUrl

        // Create entry in image_processing_tasks table
        const { error: dbError } = await supabase.value
          .from('image_processing_tasks')
          .insert({
            original_image_url: publicUrl,
          })

        if (dbError) throw dbError

        updateFile(fileId, {
          url: publicUrl,
          status: 'queued',
          progress: 100,
        })
      }

      return files.value.find(f => f.id === fileId)!
    } catch (error) {
      updateFile(fileId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Upload failed',
      })
      throw error
    }
  }

  // Update a file's properties
  const updateFile = (fileId: string, updates: Partial<UploadedFile>) => {
    const file = files.value.find(f => f.id === fileId)
    if (file) {
      Object.assign(file, updates)
    }
  }

  // Delete a file
  const deleteFile = async (fileId: string) => {
    const file = files.value.find(f => f.id === fileId)
    if (!file) return

    try {
      if (supabase.value) {
        // Delete raw file from Supabase storage (images/{fileId}/raw)
        await supabase.value.storage.from('images').remove([`${file.id}/raw`])
        
        // If there's a processed file, delete that too (images/{fileId}/processed)
        if (file.processedUrl) {
          await supabase.value.storage.from('images').remove([`${file.id}/processed`])
        }
      }

      files.value = files.value.filter(f => f.id !== fileId)
    } catch (error) {
      console.error('Failed to delete file:', error)
      throw error
    }
  }

  // Download a file
  const downloadFile = async (fileId: string) => {
    const file = files.value.find(f => f.id === fileId)
    if (!file || !file.processedUrl) return

    try {
      const response = await fetch(file.processedUrl)
      const blob = await response.blob()
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `processed-${file.originalName}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download file:', error)
      throw error
    }
  }

  // Generate unique ID
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Cleanup on unmount
  onUnmounted(() => {
    if (realtimeChannel.value) {
      realtimeChannel.value.unsubscribe()
    }
  })

  // Initialize realtime listener on mount if Supabase is configured
  onMounted(() => {
    if (isSupabaseConfigured.value) {
      setupRealtimeListener()
    }
  })

  return {
    files: readonly(files),
    uploadFile,
    deleteFile,
    downloadFile,
    isSupabaseConfigured,
  }
}
