<script setup lang="ts">
const emit = defineEmits<{
  fileSelected: [file: File]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const maxSizeMB = 10

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  
  const file = e.dataTransfer?.files[0]
  if (file) {
    validateAndEmit(file)
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    validateAndEmit(file)
  }
  // Reset input so the same file can be selected again
  if (target) target.value = ''
}

const validateAndEmit = (file: File) => {
  if (!acceptedTypes.includes(file.type)) {
    alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
    return
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    alert(`File size must be less than ${maxSizeMB}MB`)
    return
  }
  
  emit('fileSelected', file)
}

const triggerFileInput = () => {
  fileInput.value?.click()
}
</script>

<template>
  <div
    class="uploader"
    :class="{ 'uploader--dragging': isDragging }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="triggerFileInput"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="uploader__input"
      @change="handleFileSelect"
    />
    
    <div class="uploader__content">
      <div class="uploader__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      
      <div class="uploader__text">
        <p class="uploader__title">
          <span v-if="isDragging">Release to upload</span>
          <span v-else>Drop your image here</span>
        </p>
        <p class="uploader__subtitle">
          or <span class="uploader__link">browse</span> to choose a file
        </p>
      </div>
      
      <div class="uploader__hint">
        <span>JPEG, PNG, GIF, WebP</span>
        <span class="uploader__separator">•</span>
        <span>Max {{ maxSizeMB }}MB</span>
      </div>
    </div>
    
    <div class="uploader__glow" />
  </div>
</template>

<style scoped>
.uploader {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  border: 2px dashed var(--color-border);
  border-radius: 1.5rem;
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.uploader:hover,
.uploader--dragging {
  border-color: var(--color-accent);
  background: var(--color-surface-elevated);
}

.uploader--dragging {
  transform: scale(1.01);
}

.uploader--dragging .uploader__glow {
  opacity: 1;
}

.uploader__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.uploader__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  z-index: 1;
}

.uploader__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  border-radius: 1rem;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  transition: all 0.3s ease;
}

.uploader:hover .uploader__icon,
.uploader--dragging .uploader__icon {
  transform: translateY(-4px);
  background: var(--color-accent);
  color: var(--color-bg);
}

.uploader__text {
  text-align: center;
}

.uploader__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.uploader__subtitle {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
}

.uploader__link {
  color: var(--color-accent);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.uploader__hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  opacity: 0.8;
}

.uploader__separator {
  opacity: 0.5;
}

.uploader__glow {
  position: absolute;
  inset: -50%;
  background: radial-gradient(
    circle at center,
    var(--color-accent-glow) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.uploader:hover .uploader__glow {
  opacity: 0.5;
}
</style>
