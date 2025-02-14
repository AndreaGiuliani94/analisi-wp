import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('È disponibile un aggiornamento! Vuoi ricaricare?')) {
      window.location.reload()
    }
  },
  onOfflineReady() {
    console.log('L\'app è pronta per l\'uso offline.')
  }
})
