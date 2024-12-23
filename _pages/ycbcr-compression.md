---
title: YCbCr compression
permalink: /ycbcr-compression.html
layout: layouts/layout.liquid
shaders: ["rgb-to-ycbcr", "ycbcr-combine"]
scripts: ["js/demos/ycbcr-compression.js"]
thumbnail: textures/palm.jpg
---

<div class="container">
	<canvas id="glcanvas">Your browser does not seem to support canvases.</canvas>
	<div class="optionsPanel">
		<button id="toggle">Toggle</button>

		<label for="y_scale">Y scale: </label>
		<input id="y_scale" type="range" min="5" max="100" value="100">

		<label for="cb_scale">Cb scale: </label>
		<input id="cb_scale" type="range" min="5" max="100" value="100">
		
		<label for="cr_scale">Cr scale: </label>
		<input id="cr_scale" type="range" min="5" max="100" value="100">

		<label for="linear">Linear: </label>
		<input type="radio" id="linear" name="filter" />

		<label for="nearest">Nearest: </label>
		<input type="radio" id="nearest" name="filter" checked />

		<p>Original Size: <span id="file_size"></span></p><p>Compressed Size: <span id="reduced_file_size"></span></p>
		<input id="imageFile" type="file" accept="image/*">
	</div>
</div>
<canvas style="display: none;" id="virtualcanvas">Your browser does not seem to support canvases.</canvas>
<img style="display: none;" id="image" src="/textures/palm.jpg"/>

<article class="despription">

## YCBCR Compression

Lorem ipsum odor amet, consectetuer adipiscing elit. Risus scelerisque cursus venenatis aenean proin quis. Ad lacus pulvinar placerat metus etiam volutpat. Nascetur curae adipiscing sem finibus justo varius varius. Nostra porttitor tempus porta pharetra leo velit egestas ligula. Bibendum penatibus potenti cubilia natoque mollis morbi tempor. Dis cras inceptos imperdiet purus lorem. Cubilia natoque ridiculus placerat iaculis sodales fames rutrum turpis semper. Sed sagittis augue mauris mus sagittis risus fusce.

Tortor at in condimentum pellentesque convallis habitasse maecenas consequat aenean. Ut fermentum sagittis facilisi neque facilisis vivamus laoreet fermentum. Maximus faucibus eget augue conubia ut tempor montes aliquam laoreet. Duis metus non mi amet libero, lacus semper. Taciti diam fermentum in eget natoque elementum placerat ultricies. Pellentesque natoque lectus nibh, erat dui hac viverra proin. Velit adipiscing phasellus arcu lectus metus eleifend cubilia urna odio. Aliquet montes et urna primis cursus curae donec. Elit ornare sollicitudin vitae consequat fringilla orci tempor magnis est. Nullam ipsum conubia quam himenaeos litora.

</article>
