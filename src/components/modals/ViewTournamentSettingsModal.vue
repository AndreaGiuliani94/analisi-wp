<template>
  <BaseModal
    :is-open="isOpen" 
    title="Impostazioni Torneo" 
    @close="closeModal"
  >
    <div v-if="tournament" class="flex flex-col gap-4">
      <Transition name="fade-slide" mode="out-in">
        <div v-if="!isEditing" key="view" class="grid grid-cols-2 gap-3">
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Durata Periodo</p>
            <p class="text-lg font-bold text-blue-950">{{ formattedPeriodDuration }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Numero Periodi</p>
            <p class="text-lg font-bold text-blue-950">{{ tournament.default_periods_count }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Numero Massimo di Giocatori</p>
            <p class="text-lg font-bold text-blue-950">{{ tournament.max_players }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Rigori in caso di pareggio</p>
            <p class="text-lg font-bold text-blue-950">{{ tournament.allow_final_penalties ? 'Abilitati' : 'Disabilitati' }}</p>
          </div>
        </div>

        <div v-else key="edit" class="grid grid-cols-2 gap-4">
          <BaseInput
            id="periodDuration"
            v-model="editedPeriodDuration"
            placeholder="08:00"
            label="Durata (mm:ss)"
            required/>

          <BaseInput
            id="periodCount"
            type="number"
            v-model="editedPeriodCount"
            label="Numero periodi"
            required/>

          <BaseInput
            id="maxPlayers"
            type="number"
            v-model="maxPlayers"
            label="Numero massimo di giocatori per squadra"
            required/>


          <div class="col-span-2 flex items-center gap-2 ml-1">
            <SwitchButton v-model="editedAllowTies" label="Abilita rigori in caso di pareggio" />
          </div>
        </div>
      </Transition>
    </div>
    <div v-else class="text-slate-500 text-center py-8">
      Nessuna impostazione disponibile.
    </div>
    <template #footer>
        <div class="flex gap-2">
          <template v-if="canEdit">
            <template v-if="!isEditing">
              <ActionButton
                size="md"
                color="gray"
                label="Chiudi"
                @click="closeModal"
              />
              <ActionButton
                size="md"
                color="blue"
                label="Modifica"
                @click="isEditing = true"
              />
            </template>
            <template v-else>
              <ActionButton
                size="md"
                color="gray"
                label="Annulla"
                :solid="false"
                @click="isEditing = false"
              />
              <ActionButton
                size="md"
                color="green"
                :label="loading ? 'Salvataggio...' : 'Salva'"
                @click="handleUpdate"
                :disabled="loading"
              />
            </template>
          </template>
          <ActionButton
            v-else
            size="md"
            color="gray"
            label="Chiudi"
            @click="closeModal"
          />
        </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import ActionButton from '../buttons/ActionButton.vue';
import BaseInput from '../inputs/BaseInput.vue';
import type { Tournament } from '@/interfaces/Tournament';
import { useTimeFormat } from '@/composables/useTimeFormat';
import { useTournamentStore } from '@/stores/tournamentStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'vue-toastification';
import { TournamentRole } from '@/enum/RoleType';
import SwitchButton from '../buttons/SwitchButton.vue';

const props = defineProps<{
  isOpen: boolean;
  tournament: Tournament | null;
}>();

const emit = defineEmits([ "close", "updated" ]);
const { formatMsToTimer, formatTimerToMs } = useTimeFormat();
const tournamentStore = useTournamentStore();
const authStore = useAuthStore();
const toast = useToast();

const isEditing = ref(false);
const editedPeriodDuration = ref('08:00');
const editedPeriodCount = ref('4');
const editedAllowTies = ref(false);
const maxPlayers = ref('15');
const loading = ref(false);

const canEdit = computed(() => {
  const id = authStore.user?.id;
  const participant = props.tournament?.participants?.find((p: any) => p.user_id === id);
  return participant?.role === TournamentRole.ADMIN || participant?.role === TournamentRole.EDITOR || participant?.role === TournamentRole.OWNER;
});

const formattedPeriodDuration = computed(() => {
  if (props.tournament?.default_period_length) {
    // Assumiamo che default_period_length sia in millisecondi
    return formatMsToTimer(props.tournament.default_period_length);
  }
  return 'N/A';
});

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.tournament) {
    editedPeriodDuration.value = formatMsToTimer(props.tournament.default_period_length || 0);
    editedPeriodCount.value = String(props.tournament.default_periods_count || 4);
    editedAllowTies.value = props.tournament.allow_final_penalties || false;
    maxPlayers.value = String(props.tournament.max_players || 15);
    isEditing.value = false;
  }
});

const handleUpdate = async () => {
  if (!props.tournament?.id) return;
  
  loading.value = true;
  try {
    const payload = {
      default_period_length: formatTimerToMs(editedPeriodDuration.value),
      default_periods_count: parseInt(editedPeriodCount.value),
      allow_final_penalties: editedAllowTies.value,
      max_players: parseInt(maxPlayers.value)
    };
    
    await tournamentStore.updateTournament(props.tournament.id, payload);
    toast.success('Impostazioni aggiornate con successo!');
    isEditing.value = false;
    emit('updated');
  } catch (e: any) {
    toast.error(e.message || "Errore durante l'aggiornamento");
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  isEditing.value = false;
  emit("close");
};
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
