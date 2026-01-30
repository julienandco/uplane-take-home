<script setup lang="ts">
const { files, uploadFile, deleteFile, downloadFile, isSupabaseConfigured } = useFileUpload()

const isUploading = ref(false)

const uploadingFiles = computed(() => 
  files.value.filter(f => f.status === 'uploading')
)

const processingFiles = computed(() => 
  files.value.filter(f => f.status === 'queued' || f.status === 'ongoing')
)

const completedFiles = computed(() => 
  files.value.filter(f => f.status === 'successful')
)

const hasActiveUploads = computed(() => 
  uploadingFiles.value.length > 0 || processingFiles.value.length > 0
)

const handleFileSelected = async (file: File) => {
  try {
    isUploading.value = true
    await uploadFile(file)
  } catch (error) {
    console.error('Upload failed:', error)
  } finally {
    isUploading.value = false
  }
}

const handleDownload = (fileId: string) => {
  downloadFile(fileId)
}

const handleDelete = (fileId: string) => {
  deleteFile(fileId)
}
</script>

<template>
  <div class="page">
    <div class="page__bg">
      <div class="page__gradient page__gradient--1" />
      <div class="page__gradient page__gradient--2" />
      <div class="page__noise" />
    </div>
    
    <main class="page__main">
      <header class="header">
        <div class="header__brand">
          <div class="header__logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="currentColor"/>
              <path d="M10 16L14 12L18 16" stroke="var(--color-bg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 12V22" stroke="var(--color-bg)" stroke-width="2" stroke-linecap="round"/>
              <path d="M18 22H22V16" stroke="var(--color-bg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="header__text">
            <h1 class="header__title">Image Processor</h1>
            <p class="header__subtitle">Upload, process, download</p>
          </div>
        </div>
        
        <div v-if="!isSupabaseConfigured" class="header__badge">
          <span class="header__badge-dot" />
          Demo Mode
        </div>
      </header>
      
      <section class="upload-section">
        <FileUploader 
          @file-selected="handleFileSelected" 
          :class="{ 'uploader--disabled': hasActiveUploads }"
        />
        
        <p v-if="hasActiveUploads" class="upload-section__hint">
          Please wait for current uploads to complete
        </p>
      </section>
      
      <!-- Uploading Files -->
      <Transition name="slide-fade">
        <section v-if="uploadingFiles.length > 0" class="section">
          <h2 class="section__title">Uploading</h2>
          <div class="upload-list">
            <TransitionGroup name="list">
              <UploadProgress 
                v-for="file in uploadingFiles" 
                :key="file.id" 
                :file="file" 
              />
            </TransitionGroup>
          </div>
        </section>
      </Transition>
      
      <!-- Processing Files -->
      <Transition name="slide-fade">
        <section v-if="processingFiles.length > 0" class="section">
          <h2 class="section__title">
            <span>Processing</span>
            <span class="section__count">{{ processingFiles.length }}</span>
          </h2>
          <div class="processing-list">
            <TransitionGroup name="list">
              <ProcessingState 
                v-for="file in processingFiles" 
                :key="file.id" 
                :file="file" 
              />
            </TransitionGroup>
          </div>
        </section>
      </Transition>
      
      <!-- Completed Files -->
      <Transition name="slide-fade">
        <section v-if="completedFiles.length > 0" class="section">
          <h2 class="section__title">
            <span>Ready to download</span>
            <span class="section__count section__count--success">{{ completedFiles.length }}</span>
          </h2>
          <div class="files-grid">
            <TransitionGroup name="list">
              <FileCard 
                v-for="file in completedFiles" 
                :key="file.id" 
                :file="file"
                @download="handleDownload"
                @delete="handleDelete"
              />
            </TransitionGroup>
          </div>
        </section>
      </Transition>
      
      <!-- Empty State -->
      <Transition name="fade">
        <section v-if="files.length === 0" class="empty-state">
          <div class="empty-state__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
              <path d="M4 16L8.586 11.414C9.846 10.154 11.919 10.154 13.179 11.414L20 18" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>
          <h3 class="empty-state__title">No images yet</h3>
          <p class="empty-state__text">
            Upload an image to get started. Your processed files will appear here.
          </p>
        </section>
      </Transition>
    </main>
    
    <footer class="footer">
      <p class="footer__text">
        Built with Nuxt &amp; Supabase
      </p>
    </footer>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.page__bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
}

.page__gradient {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
}

.page__gradient--1 {
  top: -200px;
  right: -100px;
  background: var(--color-accent);
}

.page__gradient--2 {
  bottom: -200px;
  left: -100px;
  background: var(--color-accent-light);
}

.page__noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
}

.page__main {
  flex: 1;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header__logo {
  color: var(--color-accent);
}

.header__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.header__subtitle {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
}

.header__badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 2rem;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.header__badge-dot {
  width: 8px;
  height: 8px;
  background: var(--color-accent);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.9);
  }
}

.upload-section {
  margin-bottom: 3rem;
}

.upload-section__hint {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

:deep(.uploader--disabled) {
  opacity: 0.5;
  pointer-events: none;
}

.section {
  margin-bottom: 2.5rem;
}

.section__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section__count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  background: var(--color-surface-elevated);
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.section__count--success {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
}

.upload-list,
.processing-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  margin-bottom: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  color: var(--color-text-muted);
}

.empty-state__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.empty-state__text {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  max-width: 300px;
}

.footer {
  padding: 1.5rem;
  text-align: center;
}

.footer__text {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  opacity: 0.6;
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-move {
  transition: transform 0.3s ease;
}

@media (max-width: 640px) {
  .page__main {
    padding: 1.5rem 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .header__title {
    font-size: 1.25rem;
  }
  
  .files-grid {
    grid-template-columns: 1fr;
  }
}
</style>
