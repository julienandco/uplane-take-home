<script setup lang="ts">
import type { UploadedFile } from '~/composables/useFileUpload'

const props = defineProps<{
  file: UploadedFile
}>()

const funFacts = [
  'Did you know? The first digital camera was invented in 1975.',
  'Fun fact: Humans blink about 15-20 times per minute.',
  'The average cloud weighs about 1.1 million pounds.',
  'Honey never spoils. Archaeologists found 3000-year-old honey still edible.',
  'Octopuses have three hearts and blue blood.',
  'A group of flamingos is called a "flamboyance".',
  'The shortest war in history lasted 38 to 45 minutes.',
  'Bananas are berries, but strawberries aren\'t.',
]

const currentFactIndex = ref(0)
const currentFact = computed(() => funFacts[currentFactIndex.value])

// Rotate through facts
let factInterval: ReturnType<typeof setInterval>

onMounted(() => {
  factInterval = setInterval(() => {
    currentFactIndex.value = (currentFactIndex.value + 1) % funFacts.length
  }, 4000)
})

onUnmounted(() => {
  clearInterval(factInterval)
})

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div class="processing">
    <div class="processing__visual">
      <div class="processing__rings">
        <div class="processing__ring processing__ring--1" />
        <div class="processing__ring processing__ring--2" />
        <div class="processing__ring processing__ring--3" />
      </div>
      
      <div class="processing__center">
        <svg class="processing__icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path 
            d="M4 16L4.586 15.414C5.846 14.154 7.919 14.154 9.179 15.414C10.439 16.674 12.511 16.674 13.772 15.414L14.828 14.358C15.954 13.232 17.773 13.166 18.976 14.206L20 15.063" 
            stroke="currentColor" 
            stroke-width="1.5" 
            stroke-linecap="round"
          />
          <rect 
            x="3" 
            y="6" 
            width="18" 
            height="13" 
            rx="2" 
            stroke="currentColor" 
            stroke-width="1.5"
          />
          <circle cx="8" cy="10" r="1.5" fill="currentColor" />
        </svg>
      </div>
    </div>
    
    <div class="processing__info">
      <h3 class="processing__title">Processing your image</h3>
      <p class="processing__filename">{{ props.file.originalName }}</p>
      <p class="processing__size">{{ formatFileSize(props.file.size) }}</p>
    </div>
    
    <div class="processing__progress">
      <div class="processing__bar">
        <div class="processing__fill" />
      </div>
    </div>
    
    <div class="processing__fact">
      <div class="processing__fact-icon">💡</div>
      <Transition name="fade" mode="out-in">
        <p :key="currentFactIndex" class="processing__fact-text">
          {{ currentFact }}
        </p>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 3rem 2rem;
  background: var(--color-surface);
  border-radius: 1.5rem;
  border: 1px solid var(--color-border);
}

.processing__visual {
  position: relative;
  width: 120px;
  height: 120px;
}

.processing__rings {
  position: absolute;
  inset: 0;
}

.processing__ring {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: 50%;
}

.processing__ring--1 {
  border-top-color: var(--color-accent);
  animation: spin 1.2s linear infinite;
}

.processing__ring--2 {
  inset: 12px;
  border-right-color: var(--color-accent);
  opacity: 0.7;
  animation: spin 1.8s linear infinite reverse;
}

.processing__ring--3 {
  inset: 24px;
  border-bottom-color: var(--color-accent);
  opacity: 0.4;
  animation: spin 2.4s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.processing__center {
  position: absolute;
  inset: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent-soft);
  border-radius: 50%;
  color: var(--color-accent);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.processing__info {
  text-align: center;
}

.processing__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.processing__filename {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.processing__size {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  opacity: 0.7;
}

.processing__progress {
  width: 100%;
  max-width: 280px;
}

.processing__bar {
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.processing__fill {
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-light));
  border-radius: 2px;
  animation: progress 1.5s ease-in-out infinite;
}

@keyframes progress {
  0% {
    width: 0%;
    margin-left: 0%;
  }
  50% {
    width: 40%;
    margin-left: 30%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
  }
}

.processing__fact {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--color-surface-elevated);
  border-radius: 0.75rem;
  max-width: 400px;
}

.processing__fact-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.processing__fact-text {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
