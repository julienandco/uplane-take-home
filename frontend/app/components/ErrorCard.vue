<script setup lang="ts">
import type { UploadedFile } from '~/composables/useFileUpload'

const props = defineProps<{
  file: UploadedFile
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const handleDelete = () => {
  emit('delete', props.file.id)
}
</script>

<template>
  <div class="error-card">
    <div class="error-card__icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>
        <path d="M12 8V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
    </div>
    
    <div class="error-card__content">
      <div class="error-card__info">
        <h4 class="error-card__name">{{ file.originalName }}</h4>
        <div class="error-card__meta">
          <span>{{ formatFileSize(file.size) }}</span>
          <span class="error-card__separator">•</span>
          <span class="error-card__error">Something went wrong</span>
        </div>
      </div>
      
      <button 
        class="error-card__btn"
        @click="handleDelete"
        title="Dismiss"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.error-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 1rem;
}

.error-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  flex-shrink: 0;
}

.error-card__content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.error-card__info {
  flex: 1;
  min-width: 0;
}

.error-card__name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-card__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.error-card__separator {
  opacity: 0.5;
}

.error-card__error {
  color: #ef4444;
  font-weight: 500;
}

.error-card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.error-card__btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
</style>
