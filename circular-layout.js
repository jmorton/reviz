/**
 * Takes a single node, the innermost circle are things one degree away, the
 * second inner circle, two degrees, and so on.
 * 
 */
 
function CircularLayout(graph) {
  this.graph = graph;
}

CircularLayout.prototype.layout = function() {
  var positions = [];
  
  // If a node is selected, only enough room needs to be made
  // for N-1 nodes.
  if (this.graph.display.selection == null) {
    var count = ( (this.graph.nodeCount() ) );
  } else {
    var count = ( (this.graph.nodeCount() - 1) );
  }
  
  // Decide the increment amount and a radius relative to the
  // number of nodes to display.
  var increment = (Math.PI*2) / count;
  var radius = this.graph.display.nodeSize/2.5 * count;
  var step = 0;
    
  var theta;
  var x;
  var y;
  
  // Place each node on the edge of a circle, taking care to skip over
  // the selected node without leaving a gap in it's place.
  for (key in this.graph.reachable) {
    if (this.graph.display.selection != this.graph.reachable[key]) {
      theta = step * increment;
      x = radius * Math.cos(theta);
      y = radius * Math.sin(theta);
      this.graph.nodes[key].x = x;
      this.graph.nodes[key].y = y;
      step++;
    }
  }
  
  // Place the selected node in the center of the circle
  if (this.graph.display.selection) {
    this.graph.display.selection.x = 0;
    this.graph.display.selection.y = 0;
  }
  
  return positions;
}