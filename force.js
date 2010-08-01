function ForceDirectedLayout(graph) {
	this.graph = graph;
}

ForceDirectedLayout.prototype.layout = function() {
	this.graph.eachPair(ForceDirectedLayout.repel);
	this.graph.eachEdge(ForceDirectedLayout.attract);
	return true;
};

ForceDirectedLayout.distance = function(n1,n2) {
	return Math.sqrt(Math.pow((n1.x-n2.x),2) + Math.pow((n1.y-n2.y),2));
};

ForceDirectedLayout.repel = function(n1,n2) {
	var force = repulsiveForce(n1,n2);
	n1.add(force, n2);
};

ForceDirectedLayout.attract = function(n1,n2) {
	var force = springForce(n1,n2);
	n2.add(force, n1);
};

/** Calculates the distance between to objects.
@return [float] Euclidean distance
*/
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x-p2.x, 2) + Math.pow(p1.y-p2.y, 2));
}

/** Calculate the angle between two objects.
@return [float] Angle in radians
*/
function angle(p1, p2) {
  var opposite = p1.y - p2.y;
  var adjacent = p1.x - p2.x;
  return Math.atan(opposite/adjacent);
};

/** return a point between two points */
function springForce(p1, p2, spring, equilibrium) {
  
  if (spring == undefined) {
    spring = 0.5;
  }
  
  if (equilibrium == undefined) {
    equilibrium = 120.0;
  }
  
  var magnitude = distance(p1, p2);    
  var theta = angle(p1, p2);
  
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
		force = 30.0;
	}
		
	var magnitude = (force / distance(p1,p2)) * 0.6;
	var theta = angle(p1, p2);
	
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
