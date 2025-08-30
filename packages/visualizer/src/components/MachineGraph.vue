<script setup lang="ts">
import { computed, onMounted, useTemplateRef, shallowRef, watch } from 'vue';
import { createMachine } from 'xstate';
import { toDirectedGraph, type DirectedGraphNode } from '@xstate/graph';
import cytoscape, {type NodeDefinition, type EdgeDefinition, type ElementsDefinition, type Core, type InputEventObject} from 'cytoscape';
import fcose, { type FcoseLayoutOptions } from 'cytoscape-fcose';
import {style} from '../cyto-style';

export type State = string | {[key: string]: string|State};

cytoscape.use(fcose);

const { actorName, definition, activeState } = defineProps<{
  actorName: string;
  definition: Parameters<typeof createMachine>[0];
  activeState: State;
}>()

const getActiveNodeIds = (activeState: State, parentId?: string): string[] => {
  const prefix = parentId ? `${parentId}.` : '';
  if (typeof activeState === 'string') {
    return [`${prefix}${activeState}`]
  }

  return Object.entries(activeState)
    .map(([key, value]) => [
      // `${prefix}${key}`,
       ...getActiveNodeIds(value, `${prefix}${key}`)
    ])
    .flat()
}

const activeNodeIds = computed(() => getActiveNodeIds(activeState, actorName))

const directedGraphToCytoscapeModel = (directedGraphNode: DirectedGraphNode, initials: string[] = []): ElementsDefinition => {
  const isFinal = directedGraphNode.stateNode.type === 'final';
  const isInitial = initials.includes(directedGraphNode.stateNode.key);
  const nodeLabelSuffix = isFinal
    ? " [final]"
    : isInitial
      ? " [initial]"
      : "";
  
  const node: NodeDefinition = {
    data: {
      id: directedGraphNode.id,
      parent: directedGraphNode.stateNode.parent?.id,
      label: `${directedGraphNode.stateNode.key}${nodeLabelSuffix}`,
      type: directedGraphNode.stateNode.type
    }
  }
  const edges: EdgeDefinition[] = directedGraphNode.edges.map(edge => ({
    data: {
      id: edge.id,
      source: edge.source.id,
      target: edge.target.id,
      label: edge.label.text
    }
  }));

  const childDefinitions = directedGraphNode.children.map(child => directedGraphToCytoscapeModel(child, directedGraphNode.stateNode.initial.target.map(t => t.key)));

  return {
    nodes: [node, ...childDefinitions.map(def => def.nodes).flat()],
    edges: [...edges, ...childDefinitions.map(def => def.edges).flat()]
  }
}

const cytoscapeModel = computed(() => {
  const machine = createMachine(definition);
  const directedGraph = toDirectedGraph(machine);
  return directedGraphToCytoscapeModel(directedGraph);
})

const cyElement = useTemplateRef('cyElement');
const cy = shallowRef<Core|null>(null);

onMounted(() => {
  const layout: FcoseLayoutOptions = {
    name: 'fcose',
    nodeDimensionsIncludeLabels: true,
    animate: false,
    idealEdgeLength: edge => edge.data('label').length * 7.5,
    nodeSeparation: 1000
  };

  cy.value = cytoscape({
    container: cyElement.value,
    elements: cytoscapeModel.value,
    style,
    layout
  });
  cy.value.on("mousemove", ({cy, originalEvent}: InputEventObject) => {
    if (originalEvent.buttons !== 2) {
      return;
    }
    cy.panBy({
      x: originalEvent.movementX,
      y: originalEvent.movementY
    });
  })
});

watch([cy, activeNodeIds], ([cy, activeNodeIds]) => {
  if(!cy) {
    return;
  }
  cy.nodes('[isActive="true"]').removeData('isActive');
  cy.filter(el => el.isNode() && activeNodeIds.includes(el.id())).data('isActive', "true");
});

const panLeft = () => {
  cy.value?.panBy({x: 5, y: 0});
};
const panRight = () => {
  cy.value?.panBy({x: -5, y: 0})
};
const panUp = () => {
  cy.value?.panBy({x: 0, y: 5});
};
const panDown = () => {
  cy.value?.panBy({x: 0, y: -5});
}
const mouseUp = () => {
  cyElement.value?.focus();
}
</script>

<template>
  <div 
    ref="cyElement"
    tabindex="0"
    @keydown.left="panLeft"
    @keydown.right="panRight"
    @keydown.up="panUp"
    @keydown.down="panDown"
    @mouseup="mouseUp"></div>
</template>

<style lang="css" scoped>
div {
  background-color: #282829;
}
</style>