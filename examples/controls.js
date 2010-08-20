$(function() {
	$("#layout").change(function(event) {
		changeLayout($(this).val());
	});
	
	$('#myView').load(function() {
    });
	
	$("#repulsiveForceSlider").slider({
		value: 100,
		min:   1,
		max:   500,
		step:  1,
		slide: function(event, ui) {
			$("#repulsiveForce").val(ui.value);
			g.getLayout().repulsiveForce  = ui.value;
			g.animate(g);
		}
	});
	$("#repulsiveForce").val($("#repulsiveForceSlider").slider("value"));
	
	$("#attractiveForceSlider").slider({
		value: 0.5,
		min:   0.1,
		max:   1.0,
		step:  0.1,
		slide: function(event, ui) {
			$("#attractiveForce").val(ui.value);
			g.getLayout().attractiveForce  = ui.value;
			g.animate(g);
		}
	});
	$("#attractiveForce").val($("#attractiveForceSlider").slider("value"));

	$("#attractiveEquilibriumSlider").slider({
		value: 20,
		min:   20,
		max:   500,
		step:  1,
		slide: function(event, ui) {
			$("#attractiveEquilibrium").val(ui.value);
			g.getLayout().equilibrium = ui.value;
			g.animate(g);
		}
	});
	$("#attractiveEquilibrium").val($("#attractiveEquilibriumSlider").slider("value"));

	$("#zoomSlider").slider({
		value: 1.0,
		min:   0.1,
		max:   2.0,
		step:  0.1,
		slide: function(event, ui) {
			$("#zoom").val(ui.value);
			g.display.scale = ui.value;
			g.animate(g);
		}
	});
	$("#zoom").val($("#zoomSlider").slider("value"));
	
	$("#sizeSlider").slider({
		value: 25,
		min:   10,
		max:   100,
		step:  1,
		slide: function(event, ui) {
			$("#size").val(ui.value);
			Style.Node.size = ui.value;
			g.animate(g);
		}
	});
	$("#size").val($("#sizeSlider").slider("value"));
	
	$("#depthSlider").slider({
		value: -1,
		min:   -1,
		max:   42,
		step:  1,
		slide: function(event, ui) {
			$("#depth").val(ui.value);
			g.setDepth(ui.value);
			g.animate(g);
		}
	});
	$("#depth").val($("#depthSlider").slider("value"));

});

/**
 * Causes layout to either start (if stopped) or stop (if started).
 */
function toggle() {
	if (g.isPlaying()) {
		g.stop();		
	} else {
		g.start();
	}
}

/**
 * Change the layout being applied to the graph to whatever is selected.
 */
function changeLayout(name) {
  g.stop();
  switch (name) {
    case 'force-layout' :
      g.setLayout(ForceDirectedLayout);
      break;
    case 'circular-layout' :
      g.setLayout(CircularLayout);
      break;
    default :
      g.setLayout(DefaultLayout);
      break;
  }
  if (!g.display.selection) {
    g.display.selection = g.nodes.foo;
  }
  g.start();
}

/**
 * Updates the iframe with the selected node.
 */
function changeViewer(node) {
	var iframe = document.getElementById("myView");
	if (node.url !== undefined) {
		iframe.src = node.url;
	} else {
		iframe.src = "undefined.html";
	}
}
