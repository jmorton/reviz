/**
 * Component for abstracting the layout of the graph.  Very basic tiled layout.
 * 
 * @param graph
 * @returns
 */
function DefaultLayout(graph) {
	this.graph = graph;
	this.width = 5;
}

DefaultLayout.prototype.layout = function() {
	var increment = this.graph.display.nodeSize * 2.5;
	var wrapAt = increment * this.width;
	var row = 0;
	var col = 0;
	
	for (ix in this.graph.reachable) {
		this.graph.reachable[ix].x = col;
		this.graph.reachable[ix].y = row;
		col += increment;
		if (col > wrapAt) {
		  row += increment;
		  col  = 0;
		}
	}
	
};