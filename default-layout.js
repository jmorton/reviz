/**
 * Component for abstracting the layout of the graph.  Very basic tiled layout.
 * 
 * @param graph
 * @returns
 */
function DefaultLayout(graph) {
	this.graph = graph;
}

DefaultLayout.prototype.layout = function() {
	var p = 10;
	for (ix in this.graph.nodes) {
		this.graph.nodes[ix].x = p*10;
		this.graph.nodes[ix].y = p*10;
		p += 1;
	}
};