/**
 * Layout that scales nodes relative to the number of edges
 * connecting them to other nodes.
 */
function BubbleLayout(graph) {
	this.graph = graph;
};

BubbleLayout.prototype.layout = function() {
	
	var increment = this.graph.display.nodeSize * 2.5;
	var wrapAt = increment * this.width;
	var row = 0;
	var col = 0;
	
	for (ix in this.graph.reachable) {
		var node = this.graph.reachable[ix];
		node.x = col;
		node.y = row;
		node.nodeSize = node.adjacent.length;
			
		col += increment;
		if (col > wrapAt) {
		  row += increment;
		  col  = 0;
		}
	}
	
	return this;
};