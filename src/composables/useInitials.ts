import { computed, type Ref } from "vue"

interface User {
  name?: string
  email?: string
}

/**
 * Estrarre le iniziali di un utente in modo reattivo
 * @param userRef Ref o computed che contiene l'utente
 */
export function useInitials(userRef: Ref<User | null | undefined>) {
  const initials = computed(() => {
    const u = userRef.value
    return (
      u?.name
        ?.split(" ")
        .filter(Boolean)
        .map((n) => n[0].toUpperCase())
        .join("") || "?"
    )
  })

  return { initials }
}
