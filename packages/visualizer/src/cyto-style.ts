import type { StylesheetJson } from "cytoscape"

export const style: StylesheetJson = [
      {
        selector: 'node',
        css: {
          "background-color": "#282829",
          "border-color": "#fff",
          "border-width": "1px",
          color: "white",
          content: "data(label)",
          "font-size": "10px",
          height: "label",
          "padding-bottom": "5px",
          "padding-left": "5px",
          "padding-right": "5px",
          "padding-top": "5px",
          shape: "roundrectangle",
          "text-background-padding": "15px",
          "text-halign": "center",
          "text-valign": "center",
          width: "label"
        }
      },
      {
        selector: 'node[isActive="true"]',
        css: {
          "background-color": "green",
        }
      },
      {
        selector: ':parent',
        css: {
          "padding-bottom": "10px",
          "padding-left": "10px",
          "padding-right": "10px",
          "padding-top": "10px",
          "text-halign": "center",
          "text-valign": "top"
        }
      },
      {
        selector: 'edge',
        css: {
          color: "#fff",
          "curve-style": "bezier",
          "font-size": "9px",
          "font-weight": "bold",
          label: "data(label)",
          "line-color": "white",
          "target-arrow-color": "white",
          "target-arrow-shape": "triangle",
          "target-distance-from-node": "2px",
          "text-background-color": "#282829",
          "text-background-opacity": 1,
          "text-background-padding": "3px",
          "text-wrap": "wrap",
          width: "1px",
          "z-index": 100
        }
      }
];