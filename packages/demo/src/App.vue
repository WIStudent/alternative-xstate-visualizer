<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue';
import { createMachine, createActor } from 'xstate';
import { createBrowserInspector } from '@statelyai/inspect';

export type StateNodeConfig = Omit<Parameters<typeof createMachine>[0], 'context'>

const iframe = useTemplateRef('iframe');

onMounted(() => {

  const createInnerMachineDefinition = (): StateNodeConfig => ({
      initial: 'Inner1',
      states: {
        Inner1: {
          on: { next:  {
            target: 'Inner2'
          }}
        },
        Inner2: {
          on: { next: 'Inner3'}
        },
        Inner3: {
          on: { next: 'Inner4'}
        },
        Inner4: {
          on: { next: 'Inner5'}
        },
        Inner5: {
          type: 'final'
        },
      }
  })

  const machine = createMachine({
    id: 'outer',
    initial: 'Outer1',
    states: {
      Outer1: {
        onDone: {
          target: 'Outer2'
        },
        ...createInnerMachineDefinition()
      },
      Outer2: {
        onDone: {
          target: 'Outer1'
        },
        ...createInnerMachineDefinition()
      }
    },
  });
  const inspector = createBrowserInspector({
    iframe: iframe.value,
    url: 'http://localhost:5174/'
  });
  const actor = createActor(machine, { inspect: inspector.inspect });
  actor.start();
  setInterval(() => {
    actor.send({type: 'next'})
  }, 2000);
});

</script>

<template>
  <iframe ref="iframe"></iframe>
</template>

<style scoped>
  iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    box-sizing: border-box;
  }
</style>
