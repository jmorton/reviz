function ForceDirectedLayout(graph) {
	this.graph = graph;
	this.attractiveForce = 1.0;
	this.equilibrium = 100;
	this.repulsiveForce = 100;
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
	this.graph.eachPair(this.repel);
	this.graph.eachEdge(this.attract);
	return true;
};

ForceDirectedLayout.prototype.repel = function(repelor, repelee) {
	var vector, repulsion;

	if (repelor.selected || repelor.dragged) {
		return false;
	}

	// needed in order to make a property of this available to the
	// anonymous function passed to force.
	repulsion = this.repulsiveForce;

	vector = this.force(repelor, repelee, function(magnitude) {
		return repulsion / magnitude;
	});

	repelor.add(vector);
};

ForceDirectedLayout.prototype.attract = function(attractor, attracted) {
	var vector, equilibrium, attraction;

	if (attracted.selected || attracted.dragged) {
		return false;
	}
	
	// needed in order to make a property of this available to the
	// anonymous function passed to force.
	equilibrium = this.equilibrium;
	attraction = this.attractiveForce;
	
	vector = this.force(attractor, attracted, function(magnitude) {
		return -(equilibrium - magnitude) * attraction;
	});

	attracted.add(vector);
};

ForceDirectedLayout.prototype.force = function(p1, p2, curry) {
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
