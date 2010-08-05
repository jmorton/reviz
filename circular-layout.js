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
  
  if (this.graph.selected == null) {
    // layout all nodes in a circular fashion
    var radius = 250;
    var step = 0;
    var increment = ((Math.PI*2)/ (this.graph.nodeCount()) );
    
    var theta;
    var x;
    var y;
    
    for (key in this.graph.nodes) {
      theta = step * increment;
      x = radius * Math.cos(theta);
      y = radius * Math.sin(theta);
      positions.push({x:x,y:y});
      this.graph.nodes[key].x = x;
      this.graph.nodes[key].y = y;
      step++;
    }
  }
  
  return positions;
}