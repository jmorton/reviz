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
  
  // If a node is selected, room needs to be made for N-1 nodes.
  if (this.graph.display.selection == null) {
    var count = ( (this.graph.nodeCount() ) );
  } else {
    var count = ( (this.graph.nodeCount() - 1) );
  }
  
  console.log(count);
  
  // layout all nodes in a circular fashion
  var increment = (Math.PI*2) / count;
  var radius = this.graph.display.nodeSize/2 * count;
  var step = 0;
    
  var theta;
  var x;
  var y;
  
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
  
  if (this.graph.display.selection) {
    this.graph.display.selection.x = 0;
    this.graph.display.selection.y = 0;
  }
  
  return positions;
}