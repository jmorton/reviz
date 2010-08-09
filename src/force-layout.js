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
ForceDirectedLayout.repel = function(attractor, attracted) {
	var f;

	if ((this.dragged == attractor) || (this.selection == attractor)) {
		return false;
	}

	f = ForceDirectedLayout.force(attractor, attracted, function(magnitude) {
		return ForceDirectedLayout.repulsiveForce / magnitude;
	});

	attractor.add(f);
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

/**
 * Calculates the distance between to objects.
 * 
 * @return [float] Euclidean distance
 */
ForceDirectedLayout.distance = function(p1, p2) {
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

/**
 * Calculate the angle between two objects.
 * 
 * @return [float] Angle in radians
 */
ForceDirectedLayout.angle = function(p1, p2) {
	// angle = arc tangent of opposite over adjacent
	return Math.atan((p1.y - p2.y) / (p1.x - p2.x));
};

ForceDirectedLayout.force = function(p1, p2, curry) {
	var magnitude = ForceDirectedLayout.distance(p1, p2);
	var theta = ForceDirectedLayout.angle(p1, p2);

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
}
