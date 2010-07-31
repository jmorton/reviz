/**
 * @author Jon Morton (jon.morton@gmail.com)
 *
 */
function Graph(id) {
	this.nodes = {};
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

Graph.prototype.connect = function(node1, node2) {
	var n1 = this.nodes[node1.id];
	var n2 = this.nodes[node2.id];
	
	if ((n1 == undefined) || (n2 == undefined)) {
		return false;
	} else {
		n1.connect(n2);
	}
};

Graph.prototype.display = function() {
	return this.displayWith.draw(this);
};

Graph.prototype.layout = function() {
	return this.layoutWith.layout(this);
};

function Node(id, label) {
	this.id = id;
	this.label = label;
	this.x = 0;
	this.y = 0;
	this.adjacent = [];
}

Node.prototype.connect = function(node) {
	this.adjacent.push(node);
};

