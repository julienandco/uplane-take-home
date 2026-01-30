<script setup lang="ts">
import type { UploadedFile } from '~/composables/useFileUpload'

const props = defineProps<{
  file: UploadedFile
}>()

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div class="upload-progress">
    <div class="upload-progress__icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path 
          d="M12 16V8M12 8L9 11M12 8L15 11" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
        <path 
          d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linecap="round"
        />
      </svg>
    </div>
    
    <div class="upload-progress__info">
      <div class="upload-progress__header">
        <span class="upload-progress__name">{{ file.originalName }}</span>
        <span class="upload-progress__percentage">{{ file.progress }}%</span>
      </div>
      
      <div class="upload-progress__bar">
        <div 
          class="upload-progress__fill" 
          :style="{ width: `${file.progress}%` }"
        />
      </div>
      
      <div class="upload-progress__meta">
        <span>{{ formatFileSize(file.size) }}</span>
        <span>Uploading...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-progress {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-surface);
  border-radius: 1rem;
  border: 1px solid var(--color-border);
}

.upload-progress__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  flex-shrink: 0;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.upload-progress__info {
  flex: 1;
  min-width: 0;
}

.upload-progress__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.upload-progress__name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-progress__percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-accent);
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.upload-progress__bar {
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.upload-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-light));
  border-radius: 3px;
  transition: width 0.15s ease;
}

.upload-progress__meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}
</style>
