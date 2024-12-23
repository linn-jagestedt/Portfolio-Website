---
title: Soft Body Simulation
permalink: /soft-body-simulation.html
layout: layouts/layout.liquid
shaders: ["line", "circle", "cursor"]
scripts: ["js/demos/soft-body-simulation.js"]
---

<section class="container">
  <canvas id="glcanvas">Your browser does not seem to support canvases.</canvas>
  <div class="optionsPanel">
    <button id="toggle-simulation">Start Simulation</button>

    <label for="rows">Rows:</label>
    <input id="rows" type="range" min="5" max="150" step="1" value="10">

    <label for="cols">Cols:</label>
    <input id="cols" type="range" min="5" max="150" step="1" value="10">

    <label for="springForce">Spring Force: </label>
    <input id="springForce" type="range" min="0" max="1" step="0.01" value="0.5">

    <label for="damping">Damping:</label>
    <input id="damping" type="range" min="0.1" max="1" step="0.01" value="0.5">

    <label for="maxSpringLength">Max Spring Length:</label>
    <input id="maxSpringLength" type="range" min="1" max="10" step="0.1" value="2">

    <p>Frametime: <span id="frametime"></span> ms</p>
  </div>
</section>

<article class="despription">

## Soft body simulation

Lorem ipsum odor amet, consectetuer adipiscing elit. Risus scelerisque cursus venenatis aenean proin quis. Ad lacus pulvinar placerat metus etiam volutpat. Nascetur curae adipiscing sem finibus justo varius varius. Nostra porttitor tempus porta pharetra leo velit egestas ligula. Bibendum penatibus potenti cubilia natoque mollis morbi tempor. Dis cras inceptos imperdiet purus lorem. Cubilia natoque ridiculus placerat iaculis sodales fames rutrum turpis semper. Sed sagittis augue mauris mus sagittis risus fusce.

Tortor at in condimentum pellentesque convallis habitasse maecenas consequat aenean. Ut fermentum sagittis facilisi neque facilisis vivamus laoreet fermentum. Maximus faucibus eget augue conubia ut tempor montes aliquam laoreet. Duis metus non mi amet libero, lacus semper. Taciti diam fermentum in eget natoque elementum placerat ultricies. Pellentesque natoque lectus nibh, erat dui hac viverra proin. Velit adipiscing phasellus arcu lectus metus eleifend cubilia urna odio. Aliquet montes et urna primis cursus curae donec. Elit ornare sollicitudin vitae consequat fringilla orci tempor magnis est. Nullam ipsum conubia quam himenaeos litora.

</article>
