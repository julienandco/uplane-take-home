<script setup lang="ts">
import type { UploadedFile } from '~/composables/useFileUpload'

const props = defineProps<{
  file: UploadedFile
}>()

const emit = defineEmits<{
  download: [id: string]
  delete: [id: string]
}>()

const isDeleting = ref(false)
const showDeleteConfirm = ref(false)

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

const handleDownload = () => {
  emit('download', props.file.id)
}

const handleDelete = () => {
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  isDeleting.value = true
  emit('delete', props.file.id)
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}
</script>

<template>
  <div class="file-card" :class="{ 'file-card--deleting': isDeleting }">
    <div class="file-card__preview">
      <img 
        v-if="file.url" 
        :src="file.url" 
        :alt="file.originalName"
        class="file-card__image"
      />
      <div v-else class="file-card__placeholder">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
          <path d="M4 16L8.586 11.414C9.846 10.154 11.919 10.154 13.179 11.414L20 18" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </div>
      
      <div class="file-card__status-badge">
        <span class="file-card__status-dot" />
        Ready
      </div>
    </div>
    
    <div class="file-card__content">
      <div class="file-card__info">
        <h4 class="file-card__name">{{ file.originalName }}</h4>
        <div class="file-card__meta">
          <span>{{ formatFileSize(file.size) }}</span>
          <span class="file-card__separator">•</span>
          <span>{{ formatDate(file.createdAt) }}</span>
        </div>
      </div>
      
      <div class="file-card__actions">
        <button 
          class="file-card__btn file-card__btn--download"
          @click="handleDownload"
          title="Download processed file"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 8V16M12 16L9 13M12 16L15 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Download</span>
        </button>
        
        <button 
          class="file-card__btn file-card__btn--delete"
          @click="handleDelete"
          title="Delete file"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 7H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M10 11V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M14 11V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M5 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L19 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
          <div class="modal">
            <div class="modal__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 8V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
            </div>
            <h3 class="modal__title">Delete this image?</h3>
            <p class="modal__text">
              This will permanently delete <strong>{{ file.originalName }}</strong> from your storage.
            </p>
            <div class="modal__actions">
              <button class="modal__btn modal__btn--cancel" @click="cancelDelete">
                Cancel
              </button>
              <button 
                class="modal__btn modal__btn--delete" 
                @click="confirmDelete"
                :disabled="isDeleting"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.file-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: 1rem;
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all 0.3s ease;
}

.file-card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.file-card--deleting {
  opacity: 0.5;
  pointer-events: none;
}

.file-card__preview {
  position: relative;
  aspect-ratio: 16 / 10;
  background: var(--color-surface-elevated);
  overflow: hidden;
}

.file-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--color-text-muted);
  opacity: 0.5;
}

.file-card__status-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
}

.file-card__status-dot {
  width: 6px;
  height: 6px;
  background: #34d399;
  border-radius: 50%;
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.file-card__content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-card__info {
  flex: 1;
  min-width: 0;
}

.file-card__name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-card__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.file-card__separator {
  opacity: 0.5;
}

.file-card__actions {
  display: flex;
  gap: 0.5rem;
}

.file-card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-card__btn--download {
  flex: 1;
  background: var(--color-accent);
  color: var(--color-bg);
}

.file-card__btn--download:hover {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
}

.file-card__btn--delete {
  padding: 0.625rem;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.file-card__btn--delete:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--color-surface);
  border-radius: 1rem;
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.modal__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  color: #ef4444;
}

.modal__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.modal__text {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.modal__text strong {
  color: var(--color-text);
}

.modal__actions {
  display: flex;
  gap: 0.75rem;
}

.modal__btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal__btn--cancel {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.modal__btn--cancel:hover {
  background: var(--color-border);
}

.modal__btn--delete {
  background: #ef4444;
  color: #fff;
}

.modal__btn--delete:hover:not(:disabled) {
  background: #dc2626;
}

.modal__btn--delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95);
}
</style>
