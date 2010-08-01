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
Graph.prototype.add = function() {
	var node;
	
	for (i = 0; i < arguments.length; i++) {
		node = new Node(arguments[i]);
		if (this.nodes[node.id] == undefined) {
			this.nodes[node.id] = node;
		}
	}
	
	return this;
};

/**
 * Associates two nodes.  An edge will be drawn between these two nodes.
 * @param node1
 * @param node2
 * @returns
 */
Graph.prototype.connect = function(parentNodeId) {
	var parentNode = this.nodes[parentNodeId];
	var childNode;
	
	for (i = arguments.length; i > 0; i--) {
		childNode = this.nodes[arguments[i]];
		if (childNode != undefined) {
			this.edges.push([parentNode,childNode]);
		}
	}
	
	return this;
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

