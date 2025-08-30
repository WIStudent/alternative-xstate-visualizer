<script setup lang="ts">
import {onMounted, ref} from 'vue';
import MachineGraph, {type State} from './components/MachineGraph.vue';

const sessionId = ref<string|null>(null);
const actorName = ref("");
const definition = ref<unknown>();
const activeState = ref<State>('');

window.addEventListener('message', (ev) => {
  if (ev.data?.type === '@xstate.actor' && sessionId.value === null) {
    sessionId.value = ev.data.sessionId;
    actorName.value = ev.data.name ?? "(machine)";
    definition.value = JSON.parse(ev.data.definition);
    activeState.value = ev.data.snapshot.value;
  } else if (ev.data?.type === '@xstate.snapshot' && ev.data.sessionId === sessionId.value) {
    activeState.value = ev.data.snapshot.value;
  } else if ((ev.data?.type === '@xstate.event')) {
    // TODO Display event histroy
  }
  
})

onMounted(() => {
  const targetWindow: Window = window.opener ?? window.parent;
  targetWindow.postMessage({type: '@statelyai.connected'}, '*')
})


</script>

<template>
  <div>
    <MachineGraph
      v-if="definition"
      class="machine-graph"
      :actor-name="actorName"
      :definition="definition"
      :active-state="activeState"/>
    <p v-else>Waiting for xstate machine to connect to visualizer...</p>
  </div>
 
</template>

<style scoped>
div {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.machine-graph {
  flex-grow: 1;
}
</style>
