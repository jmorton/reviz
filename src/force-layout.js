function ForceDirectedLayout(graph) {
	this.graph = graph;
	ForceDirectedLayout.attractiveForce = 1.0;
	ForceDirectedLayout.equilibrium = 100;
	ForceDirectedLayout.repulsiveForce = 100;
};

/**
 * Arranges the nodes in a layout by gradually moving connected nodes closer to
 * each other, and unconnected nodes away from each other.
 * 
 * ForceDirectedLayout follows the Layout protocol: - It expects layout to be
 * called with a reference to a graph - It invokes eachPair and eachEdge on the
 * graph and specifies the methods it wants to apply to each pair and each node. -
 * #repel and #attract follow the
 * 
 * Basic overview: 1. Repel each node from every other node. 2. Attract each
 * node to every other connected node.
 * 
 * @param graph
 *            {Graph}
 * @returns
 */
ForceDirectedLayout.prototype.layout = function() {
	this.graph.eachPair(ForceDirectedLayout.repel);
	this.graph.eachEdge(ForceDirectedLayout.attract);
	return true;
};

// this refers to the display
ForceDirectedLayout.repel = function(repelor, repelee) {
	var f;

	if ((this.dragged == repelor) || (this.selection == repelor)) {
		return false;
	}

	f = ForceDirectedLayout.force(repelor, repelee, function(magnitude) {
		return ForceDirectedLayout.repulsiveForce / magnitude;
	});

	repelor.add(f);
};

// this refers to the display.
ForceDirectedLayout.attract = function(attractor, attracted) {
	var f;

	if ((this.dragged == attracted) || (this.selection == attracted)) {
		return false;
	}

	f = ForceDirectedLayout.force(attractor, attracted, function(magnitude) {
		return -(ForceDirectedLayout.equilibrium - magnitude)
				* ForceDirectedLayout.attractiveForce;
	});

	attracted.add(f);
};

ForceDirectedLayout.force = function(p1, p2, curry) {
	var magnitude = Util.distance(p1, p2);
	var theta = Util.angle(p1, p2);

	if (magnitude < 0.1) {
		return {
			x : 0,
			y : 0
		};
	}

	var delta = curry(magnitude);
	var dx = delta * Math.cos(theta);
	var dy = delta * Math.sin(theta);

	if (p1.x < p2.x) {
		dx = -dx;
		dy = -dy;
	}

	return {
		x : dx,
		y : dy
	};
};
