/**
 * @author Jon Morton (jon.morton@gmail.com)
 * 
 */
function Graph(canvasId) {
	this.nodes = {};
	this.edges = [];
	this.setCanvas(canvasId);
	this.setLayout(DefaultLayout);
	this.setDisplay(DefaultDisplay);
	this.setTheme(DefaultTheme);
	this.setDepth(-1);
	this.callbacks = {};
}

Graph.prototype = {
	setCanvas : function(id) {
		this.canvas = document.getElementById(id);
	},
	getCanvas : function() {
		return this.canvas;
	},
	setLayout : function(value) {
		this.layoutWith = new value(this);
	},
	getLayout : function() {
		return this.layoutWith;
	},
	setDisplay : function(value) {
		this.display = new value(this);
	},
	getDisplay : function() {
		return this.display;
	},
	setDepth : function(value) {
		this._depth = value;
		this.cacheReachableNodes();
	},
	getDepth : function() {
		return this._depth;
	},
	setTheme : function(theme) {
		this.theme = new theme(this);
	},
	getTheme : function() {
		return this.theme;
	},
	setRoot : function(node) {
		if (node !== undefined) {
			this.root = node;
			this.cacheReachableNodes();
		}
	}
};

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

	if (this.root == undefined) {
		this.root = node;
	}

	// Any time a node is added to the graph, we need to determine
	// if the node can be reached. Revisit this approach if
	// performance becomes an issue. Right now, the entire graph
	// is recalculated.
	this.cacheReachableNodes();

	return this;
};

/**
 * Associates two nodes. An edge will be drawn between these two nodes.
 * 
 * @param node1
 * @param node2
 * @returns
 */
Graph.prototype.connect = function(parentNodeId) {
	var parentNode = this.nodes[parentNodeId];
	var childNode;

	for (i = arguments.length - 1; i >= 0; i--) {
		// Attempt to create a node if it doesn't exist.
		// This is for convenience during development,
		// it might make sense to drop this functionality
		// since it isn't obvious.
		childNode = this.nodes[arguments[i]];
		if (childNode == undefined) {
			childNode = new Node(arguments[i]);
			this.nodes[childNode.id] = childNode;
		}
		// IMPORTANT: The graph is implemented as
		// a directed graph, but in order to have
		// simplified depth controls, two edges
		// are formed.
		parentNode.connect(childNode);
		childNode.connect(parentNode);
		this.edges.push( [ parentNode, childNode ]);
		this.edges.push( [ childNode, parentNode ]);
	}

	this.cacheReachableNodes();

	return this;
};

Graph.prototype.nodeCount = function() {
	var count = 0;
	for (key in this.nodes)
		if (this.reachable.hasOwnProperty(key))
			count++;
	return count;
};

Graph.prototype.applyDisplay = function() {
	return this.display.redraw();
};

Graph.prototype.applyLayout = function() {
	return this.layoutWith.layout();
};

Graph.prototype.animate = function(g) {
	g.applyLayout();
	g.applyDisplay();
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

Graph.prototype.activeNodes = function() {
	var activeNodes = [];
	// nodes that aren't immune
	return activeNodes;
};

Graph.prototype.visibleNodes = function() {
};

Graph.prototype.eachPair = function(curry,context) {
	// this isn't right. it's doing each pair twice.
	var node1, node2;
	for (i1 in this.reachable) {
		node1 = this.reachable[i1];
		for (i2 in this.reachable) {
			node2 = this.reachable[i2];
			if (node1 != node2) {
				curry.call(this.getLayout(), node1, node2);
			}
		}
	}
	return true;
};

Graph.prototype.eachEdge = function(curry,context) {
	var pair;
	for (index in this.edges) {
		pair = this.edges[index];
		curry.call(this.getLayout(), pair[0], pair[1]);
	}
	return true;
};

/**
 * Any time the selected node changes, a node is connected or disconnected, the
 * visible nodes should be recalculated.
 */
Graph.prototype.cacheReachableNodes = function() {
	if ((this.nodes == undefined) || (this.root == undefined)) {
		this.reachable = [];
		return [];
	}

	// Mark all nodes as unreachable.
	for (ix in this.nodes) {
		this.nodes[ix].reachable = false;
	}

	// If the depth is actually specified then traverse, otherwise we assume
	// all nodes should be displayed.
	if (this.getDepth() >= 0) {
		this.reachable = this.root.traverse( {}, this.getDepth());
	} else {
		this.reachable = this.nodes;
	}

	for (ix in this.reachable) {
		this.nodes[ix].reachable = true;
	}

	return this.reachable;
};

Graph.prototype.handleEvent = function(type, source) {
	if (this.callbacks[type]) {
		this.callbacks[type].call(this, source);
	}
};

Graph.prototype.onNodeSelect = function(callback) {
	this.callbacks['select'] = callback;
};

Graph.prototype.save = function() {
	var mime = 'image/octet-stream';
	var data = this.display.canvas.toDataURL();
	document.location.href = data.replace('image/png', mime);
	return true;
};

/**
 * Utility function for calculating the magnitude between two points. It does
 * not handle direction though.
 */
Graph.distance = function(p1, p2) {
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};
