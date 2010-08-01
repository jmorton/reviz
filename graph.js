/**
 * @author Jon Morton (jon.morton@gmail.com)
 *
 */
function Graph(id) {
	this.nodes = {};
	this.edges = [];
	this.layoutWith = new DefaultLayout(this);
	this.displayWith = new DefaultRenderer(id, this);
}

/**
 * Puts a node into the graph.
 * 
 * @param arg
 * @returns
 */
Graph.prototype.add = function(id) {
	var node = new Node(id);
	if (this.nodes[id] == undefined) {
		this.nodes[id] = node;
	}
	return this;
};

/**
 * Associates two nodes.  An edge will be drawn between these two nodes.
 * @param node1
 * @param node2
 * @returns
 */
Graph.prototype.connect = function(node1, node2) {
	var n1 = this.nodes[node1];
	var n2 = this.nodes[node2];
	
	if ((n1 == undefined) || (n2 == undefined)) {
		return false;
	} else {
		this.edges.push([n1,n2]);
	}
};

Graph.prototype.display = function() {
	return this.displayWith.redraw();
};

Graph.prototype.layout = function() {
	return this.layoutWith.layout();
};

Graph.prototype.animate = function(g) {
	g.layout();
	g.display();
};

Graph.prototype.start = function() {
	this.playInterval = window.setInterval(this.animate, 25, this);
	return true;
};

Graph.prototype.stop = function() {
	window.clearInterval(this.playInterval);
	this.playInterval = null;
	return true;
};

Graph.prototype.isPlaying = function() {
	return (this.playInterval != undefined) && (this.playInterval != null);
};

Graph.prototype.eachPair = function(curry) {
	var node1, node2;
	for (i1 in this.nodes) {
		node1 = this.nodes[i1];
		for (i2 in this.nodes) {
			node2 = this.nodes[i2];
			if (i1 != i2) {
				curry.call(this, node1, node2);
			}
		}
	}
	return true;
};

Graph.prototype.eachEdge = function(curry) {
	var pair;
	for (index in this.edges) {
		pair = this.edges[index];
		curry.call(this, pair[0], pair[1]);
	}
	return true;
};

function Node(id, label) {
	this.id = id;
	this.label = label;
	this.x = 0;
	this.y = 0;
	this.adjacent = [];
}

Node.prototype.add = function(force) {
	this.x += force.x;
	this.y += force.y;
}

Node.prototype.connect = function(node) {
	this.adjacent.push(node);
};

