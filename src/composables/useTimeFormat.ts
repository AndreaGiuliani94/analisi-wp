export function useTimeFormat() {
  const formatMsToTimer = (totalMs: number, isGlobalTimer: boolean = false): string => {
    if (totalMs < 0) totalMs = 0;
    
    // Calcoliamo le unità
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    if(isGlobalTimer) {
        // Otteniamo il decimo di secondo (es. 9 da 900ms)
        const tenths = Math.floor((totalMs % 1000) / 100);
        const cenths = Math.floor((totalMs % 100) / 10);

        // LA MAGIA: Se manca meno di 1 minuto (60000 ms) e i minuti sono 0...
        if (totalMs < 60000) {
          // Formato: "59.8" (Secondi . Decimi)
          // Nota: potresti anche mostrare i centesimi se preferisci (es. 59.85)
          return `${paddedSeconds}.${tenths}${cenths}`; 
        }
    }

    // Formato Standard: "08:00"
    return `${paddedMinutes}:${paddedSeconds}`;
  };

  const formatTimerToMs = (timerString: string): number => {
    if (!timerString) return 0;
    const parts = timerString.split(':').map(Number);
    const minutes = parts.length > 1 ? parts[0] : 0;
    const seconds = parts.length > 1 ? parts[1] : parts[0];
    return (minutes * 60 + (seconds || 0)) * 1000;
  };

  return {
    formatMsToTimer,
    formatTimerToMs
  };
}