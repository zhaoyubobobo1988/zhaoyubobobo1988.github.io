import { ref, onUnmounted } from 'vue'

export function useTypewriter(text: string, speed: number) {
  const display = ref('')
  const done = ref(false)
  const timers: ReturnType<typeof setTimeout>[] = []

  function start() {
    display.value = ''
    done.value = false
    for (let i = 0; i <= text.length; i++) {
      const t = setTimeout(() => {
        display.value = text.slice(0, i)
        if (i === text.length) done.value = true
      }, i * speed)
      timers.push(t)
    }
  }

  function finish() {
    timers.forEach(clearTimeout)
    timers.length = 0
    display.value = text
    done.value = true
  }

  onUnmounted(() => { timers.forEach(clearTimeout) })

  return { display, done, start, finish }
}
