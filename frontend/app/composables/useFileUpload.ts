import type { RealtimeChannel } from '@supabase/supabase-js'

export interface UploadedFile {
  id: string
  name: string
  originalName: string
  size: number
  type: string
  status: 'uploading' | 'processing' | 'done' | 'error'
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
      .channel('file-processing')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'file_processing',
        },
        (payload) => {
          const { id, status, processed_url } = payload.new as {
            id: string
            status: string
            processed_url?: string
          }
          
          const file = files.value.find(f => f.id === id)
          if (file) {
            file.status = status as UploadedFile['status']
            if (processed_url) {
              file.processedUrl = processed_url
            }
          }
        }
      )
      .subscribe()
  }

  // Upload file to Supabase storage
  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const fileId = generateId()
    const fileName = `${fileId}-${file.name}`
    
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: fileName,
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
        const { error } = await supabase.value.storage
          .from('images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (error) throw error

        // Get public URL
        const { data: urlData } = supabase.value.storage
          .from('images')
          .getPublicUrl(fileName)

        updateFile(fileId, {
          url: urlData.publicUrl,
          status: 'processing',
          progress: 100,
        })
      } else {
        // Mock upload for development without Supabase
        await simulateUpload(fileId, file)
      }

      return files.value.find(f => f.id === fileId)!
    } catch (error) {
      updateFile(fileId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      })
      throw error
    }
  }

  // Simulate upload and processing for development
  const simulateUpload = async (fileId: string, file: File) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      updateFile(fileId, { progress })
    }

    // Create a local URL for the file
    const url = URL.createObjectURL(file)
    updateFile(fileId, {
      url,
      status: 'processing',
      progress: 100,
    })

    // Simulate processing time (3-6 seconds)
    const processingTime = 3000 + Math.random() * 3000
    await new Promise(resolve => setTimeout(resolve, processingTime))

    updateFile(fileId, {
      status: 'done',
      processedUrl: url, // In real scenario, this would be different
    })
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
        // Delete from Supabase storage
        await supabase.value.storage.from('uploads').remove([file.name])
        
        // If there's a processed file, delete that too
        if (file.processedUrl) {
          const processedFileName = file.processedUrl.split('/').pop()
          if (processedFileName) {
            await supabase.value.storage.from('processed').remove([processedFileName])
          }
        }
      } else {
        // Revoke object URLs for mock uploads
        if (file.url) URL.revokeObjectURL(file.url)
        if (file.processedUrl && file.processedUrl !== file.url) {
          URL.revokeObjectURL(file.processedUrl)
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
