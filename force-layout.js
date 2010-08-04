function ForceDirectedLayout(graph) {
	this.graph = graph;
};

/**
 * Arranges the nodes in a layout by gradually moving connected nodes
 * closer to each other, and unconnected nodes away from each other.
 * 
 * ForceDirectedLayout follows the Layout protocol:
 * - It expects layout to be called with a reference to a graph
 * - It invokes eachPair and eachEdge on the graph and specifies
 *   the methods it wants to apply to each pair and each node.
 * - #repel and #attract follow the  
 * 
 * Basic overview:
 * 1. Repel each node from every other node.
 * 2. Attract each node to every other connected node.
 * 
 * @param graph {Graph}
 * @returns
 */ForceDirectedLayout.prototype.layout = function() {
	this.graph.eachPair(ForceDirectedLayout.repel);
	this.graph.eachEdge(ForceDirectedLayout.attract);
	return true;
};

// this refers to the display 
ForceDirectedLayout.repel = function(attractor,n2) {
	if ((this.dragged == attractor) ||
		(this.selection == attractor)) {
		return false;
	}
	attractor.add(repulsiveForce(attractor,n2));
};

// this refers to the display. 
ForceDirectedLayout.attract = function(attractor,attracted) {
	if ((this.dragged == attracted) || (this.selection == attracted)) {
		return false;
	}
	attracted.add(springForce(attractor,attracted));
};

/** Calculates the distance between to objects.
@return [float] Euclidean distance
*/
ForceDirectedLayout.distance = function(p1, p2) {
	return Math.sqrt(Math.pow(p1.x-p2.x, 2) + Math.pow(p1.y-p2.y, 2));
};

/** Calculate the angle between two objects.
@return [float] Angle in radians
*/
ForceDirectedLayout.angle = function(p1, p2) {
	// angle = arc tangent of opposite over adjacent
	return Math.atan((p1.y - p2.y) / (p1.x - p2.x));
};

/**
 * Calculates the vector of force between two points
 * 
 * @param p1
 * @param p2
 * @param spring
 * @param equilibrium
 * @returns {Vector}
 */
function springForce(p1, p2, spring, equilibrium) {
  
  if (spring == undefined) {
    spring = 0.7;
  }
  
  if (equilibrium == undefined) {
    equilibrium = 100.0;
  }
  
  var magnitude = ForceDirectedLayout.distance(p1, p2);    
  var theta = ForceDirectedLayout.angle(p1, p2);
  
  if (magnitude < equilibrium) {
    return { x:0, y:0 };
  }
  
  var delta = - (equilibrium - magnitude) * spring * 0.6;
  
  var dx = delta * Math.cos(theta);
  var dy = delta * Math.sin(theta);
  
  if (p1.x < p2.x) {
    dx = -dx;
    dy = -dy;
  }
    
  return {
    x: dx,
    y: dy
  };
  
}

/**
 * 
 * @param p1
 * @param p2
 * @returns {x:,y:}
 */
function repulsiveForce(p1, p2, force) {
	
	if (force == undefined) {
		force = 50.0;
	}
		
	var magnitude = (force / ForceDirectedLayout.distance(p1,p2)) * 0.6;
	var theta = ForceDirectedLayout.angle(p1, p2);
	
	if (magnitude < 0.1) {
		return { x:0, y:0 };
	}
  
	var dx = magnitude * Math.cos(theta);
	var dy = magnitude * Math.sin(theta);
	
	if (p1.x < p2.x) {
		dx = -dx;
		dy = -dy;
	}
	
	return {
		x: dx,
		y: dy
	};
}
