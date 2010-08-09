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

  var count = ( (this.graph.nodeCount() ) );
  var increment = (Math.PI*2) / count;
  var radius = this.graph.display.nodeSize/2.5 * count;
  var step = 0;

  var theta;
  var x;
  var y;

  for (key in this.graph.reachable) {
    theta = step * increment;
    x = radius * Math.cos(theta);
    y = radius * Math.sin(theta);
    this.graph.nodes[key].x = x;
    this.graph.nodes[key].y = y;
    step++;
  }

  if (this.graph.display.selection) {
    this.graph.display.selection.x = 0;
    this.graph.display.selection.y = 0;
  }

  return positions;
};
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
/**
 * Component for abstracting the rendering of the graph.
 *
 * @param graph
 * @returns {DefaultRenderer}
 */
function DefaultRenderer(graph) {

	this.setGraph(graph);

	this.nodeSize = 20;

	this.scale = 1.0;

	this.offset = { x: 0, y: 0 };

	this.setHovered(null);

	this.dragged = null;

	this.dragging = false;

	this.listen();
};

DefaultRenderer.prototype = {
	setGraph: function(value) {
		this.graph = value;
		this.canvas = value.canvas;
		this.context = value.canvas.getContext('2d');
	},
	getGraph: function() {
		return this.graph;
	},
	setSelection: function(value) {
		if (this.selection == value) {
			return;
		}
		if (this.selection != undefined) {
			this.selection.selected = false;
		}
		this.selection = value;
		if (value != undefined) {
			this.selection.selected = true;
			this.graph.handleEvent('select', this.selection);
		}
	},
	getSelection: function() {
		return this.selection;
	},
	setHovered: function(value) {
		if (this.hovered == value) {
			return;
		}
		if (this.hovered != undefined) {
			this.hovered.hovered = false;
		}
		this.hovered = value;
		if (value != undefined) {
			this.hovered.hovered = true;
			this.graph.handleEvent('select', this.hovered);
		}
	},
	getHovered: function() {
		return this.hovered;
	}
};

/**
 * Clears the viewing area and sets it to the scene background color.
 *
 * @returns
 */
DefaultRenderer.prototype.blank = function() {
	this.context.save();
	this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
	this.context.fillStyle = Style.Scene.background;
	this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
	this.context.restore();
};

/**
 * Render the nodes and edges in a graph to the context.
 *
 * @param graph
 * @returns
 */
DefaultRenderer.prototype.draw = function() {
	this.context.save();

	this.context.translate(this.offset.x, this.offset.y);
	this.context.scale(this.scale, this.scale);

	for (index in this.graph.reachable) {
		var fromNode = this.graph.reachable[index];
		for (i2 in fromNode.adjacent) {
			var toNode = fromNode.adjacent[i2];
			if (fromNode.reachable && toNode.reachable) {
				this.drawEdge(fromNode,toNode);
			}
		}
	}

	for (index in this.graph.reachable) {
		this.drawNode(this.graph.nodes[index]);
	}

	if (this.hovered) {
	  this.drawNode(this.hovered);
	}

	this.context.restore();

	return this;
};

/**
 * Draws the node and label.
 *
 * @param node
 */
DefaultRenderer.prototype.drawNode = function(node) {
	with (this.context) {
		save();

		if (node.style) {
			var custom = node.style || Style.Node;
		}

		font             = Style.Node.font;
		fillStyle        = (custom || Style.Node).fill;
		strokeStyle      = (custom || Style.Node).stroke;
		lineWidth        = Style.Node.lineWidth;
		font             = Style.Node.font;

		if (this.selection == node) {
			fillStyle    = Style.Node.select.fill;
			strokeStyle  = Style.Node.select.stroke;
			font         = Style.Node.font;

		} else if (this.dragged == node) {
			fillStyle    = Style.Node.drag.fill;
			strokeStyle  = Style.Node.drag.stroke;

		} else if (this.hovered == node) {
			fillStyle    = Style.Node.hover.fill;
			strokeStyle  = Style.Node.hover.stroke;
			font         = Style.Node.hover.font;

		}

		translate(node.x, node.y);
		this.drawPath(node);
		stroke();
		fill();

		this.drawLabel(node);

		restore();
	}
};

/**
 * Creates the path without actually filling it in or adding an outline.
 *
 * @param node
 */
DefaultRenderer.prototype.drawPath = function(node) {
  with(this.context) {
    beginPath();
    arc(0, 0, node.getWeight() * this.nodeSize, 0, Math.PI*2, false);
    closePath();
  }
};

/**
 * Creates a label for the node.
 *
 * @param node
 */
DefaultRenderer.prototype.drawLabel = function(node) {
	if (this.scale < 0.4) {
		return false;
	}

  if (this.selection == node) {
		this.context.fillStyle = Style.Node.select.fontColor;
	} else if (this.dragged == node) {
		this.context.fillStyle = Style.Node.drag.fontColor;
	} else if (this.hovered == node) {
		this.context.fillStyle = Style.Node.hover.fontColor;
	} else {
	  this.context.fillStyle = Style.Node.fontColor;
	}

	with(this.context) {
		textAlign = 'center';
		textBaseline = 'middle';
		fillText(node.label || node.id, 0, 0);
	}
};

/**
 * Creates a line between two nodes.
 *
 * @param node1
 * @param node2
 */
DefaultRenderer.prototype.drawEdge = function(node1, node2) {
  with(this.context) {
  	save();
  	beginPath();
  	if (node1.selected || node2.selected) {
  	  this.context.strokeStyle = "rgb(255,255,255)";
  	} else if (node1.hovered || node2.hovered) {
  	  this.context.strokeStyle = "rgb(192,192,192)";
  	} else {
  	  this.context.strokeStyle = Style.Edge.stroke;
  	}
  	lineWidth = Style.Edge.lineWidth;
  	lineTo(node1.x, node1.y);
  	lineTo(node2.x, node2.y);
  	closePath();
  	stroke();
  	restore();
  }
};

/**
 * Clear the viewing area and draw nodes, edges, and labels.
 */
DefaultRenderer.prototype.redraw = function() {
	this.blank();
	this.draw();
};

/**
 * Create and register mouse event handlers.
 */
DefaultRenderer.prototype.listen = function() {
	var renderer = this;

	this.canvas.addEventListener('mousedown', function(event) {
		renderer.startDragging(event);
	}, false);

	this.canvas.addEventListener('mouseup', function(event) {
		if (renderer.noDragDetected) {
			renderer.makeSelection(event);
		}
		renderer.stopDragging(event);
		renderer.redraw();
	}, false);

	this.canvas.addEventListener('mousemove', function(event) {
		if (renderer.dragging) {
			if (renderer.dragged == null) {
				renderer.dragScene(event);
			} else {
				renderer.dragNode(event);
			}
		} else {
			renderer.hovering(event);
		}
		if (!renderer.graph.isPlaying()) {
			renderer.redraw();
		}
	}, false);

	this.canvas.addEventListener('dblclick', function(event) {
		var target = DefaultRenderer.topMost(renderer.containing(event));

		if (target != null) {
			target.toggle();
			renderer.graph.cacheReachableNodes();

		} else {
			if (renderer.graph.isPlaying()) {
				renderer.graph.stop();
			} else {
				renderer.graph.start();
			}
		}
	}, false);

	if (window.addEventListener) {

		this.canvas.addEventListener('DOMMouseScroll',
			function(event) {
				var delta = event.detail * 10;
				renderer.zoom(delta);
				renderer.redraw();
				DefaultRenderer.cancelEvent(event);
		}, false);

		this.canvas.addEventListener('mousewheel',
			function() {
				var delta = event.wheelDelta;
				renderer.zoom(delta);
				renderer.redraw();
				DefaultRenderer.cancelEvent(event);
			}, false);

	}
};

DefaultRenderer.cancelEvent = function(event) {
    event = event ? event : window.event;

    if (event.stopPropagation) {
        event.stopPropagation();
    }
    if (event.preventDefault) {
        event.preventDefault();
    }
    event.cancelBubble = true;
    event.cancel = true;
    event.returnValue = false;

    return false;
};

/**
 * Determine the "top most" node and make it the current selection.
 *
 * @param e
 */
DefaultRenderer.prototype.makeSelection = function(e) {
	this.setSelection(DefaultRenderer.topMost(this.containing(e)));
};

/**
 * Determine the "top most" node and make it the node being dragged.
 *
 * @param e
 */
DefaultRenderer.prototype.startDragging = function(e) {
	this.lastPoint = e;
	this.dragging  = true;
	this.dragged   = DefaultRenderer.topMost(this.containing(e));
	this.noDragDetected = true;
};

/**
 * Release the node being dragged.
 * @param e
 */
DefaultRenderer.prototype.stopDragging = function(e) {
	this.dragging  = false;
	this.actuallyDragged = false;
	this.lastPoint = null;
	this.dragged   = null;
};

/**
 * Pan the scene without actually moving any nodes.
 *
 * @param e
 */
DefaultRenderer.prototype.dragScene = function(e) {
	if (this.lastPoint != undefined) {
		this.offset.x += (e.clientX - this.lastPoint.clientX);
		this.offset.y += (e.clientY - this.lastPoint.clientY);
	}
	this.lastPoint = e;
	this.noDragDetected = false;
};

/**
 * Move nodes within the scene.
 *
 * @param e
 */
DefaultRenderer.prototype.dragNode = function(e) {
	this.dragged.x += (e.clientX - this.lastPoint.clientX) / this.scale;
	this.dragged.y += (e.clientY - this.lastPoint.clientY) / this.scale;
	this.lastPoint = e;
	this.noDragDetected = false;
};

/**
 * Determine the "top most" node being hovered so that it can be
 * highlighted during drawing.
 *
 * @param e
 */
DefaultRenderer.prototype.hovering = function(e) {
	this.setHovered(DefaultRenderer.topMost(this.containing(e)));
};

/**
 * Zoom in or out a linear amount relative to the delta.  This is capped
 * by a zoom factor of 1/4 up to 5x.
 *
 * @param delta
 */
DefaultRenderer.prototype.zoom = function(delta) {
	this.scale += 0.001 * delta;
	this.scale = Math.max( this.scale, 0.1 );
	this.scale = Math.min( this.scale, 2.5 );
};

/**
 * Find all of the nodes that contain the point contained by the event.
 *
 * @param event
 */
DefaultRenderer.prototype.containing = function(event) {
	var relativePoint = this.relativePoint(event);
	var nodes = [];
	for (index in this.graph.reachable) {
		if (this.isPointInNode(relativePoint, this.graph.reachable[index])) {
			nodes[nodes.length] = this.graph.reachable[index];
		}
	}

	return nodes;
};

/**
 * Get the relative coordinates of a click. Takes into account the position of
 * the canvas and the renderer offset that occurs during dragging and scaling.
 *
 * @param event
 * @returns
 */
DefaultRenderer.prototype.relativePoint = function(event) {
	return {
		x: ((event.pageX - event.target.offsetLeft) - this.offset.x) / this.scale,
		y: ((event.pageY - event.target.offsetTop) - this.offset.y) / this.scale
	};
};

/**
 * Create the node path and determine if it actually contains the specified
 * point. The renderer should handle this because the node doesn't know how to
 * draw itself.
 *
 * @param point
 * @param node
 */
DefaultRenderer.prototype.isPointInNode = function(point, node) {
	/*
	 * var result; this.context.save(); this.drawPath(node); result =
	 * this.context.isPointInPath(point.x, point.y); this.context.restore();
	 * return result;
	 */
	var result;

	result = Graph.distance(point, node) < (this.nodeSize);

	return result;
};

/**
 * Place the center of the specified point in the scene at the center
 * of the viewing area.
 */
DefaultRenderer.prototype.lookAt = function(point) {
  var centerX = this.context.canvas.width / 2;
  var centerY = this.context.canvas.height / 2;
  this.offset.x = (centerX - point.x);
  this.offset.y = (centerY - point.y);
  this.redraw();
};

/**
 * Get the "top most" node in a list.  Right now, this is just the last
 * node because of the way drawing and containment occurs.  The #containing
 * function iterates over all the reachable nodes in order.  If this
 * changes, then topMost will need to be reworked.
 *
 * @param list
 */
DefaultRenderer.topMost = function(list) {
  if ((list == undefined) || (list.length < 0)) {
    return null;
  } else {
    return list[list.length-1];
  }
};


var Style = {

  Scene : {
    background: "rgb(112,112,112)"
  },

  Node : {
  	fill:		  "rgba(210,210,210,0.8)",
  	stroke: 	  "rgba(55,55,55,0.9)",
  	lineWidth:    3,
  	font:         '600 14px/2 "Android Sans", "Lucida Grande", sans-serif',
  	fontColor:    "rgba(0,0,0,0.9)",
  	drag : {
  		fill: 	  "rgba(225,225,225,0.9)",
  		stroke:   "rgba(128,128,128,0.9)",
    	fontColor:  "rgb(0,0,0)"
  	},
  	hover : {
  		fill: 	    "rgba(225,225,225,0.9)",
  		stroke:     "rgba(255,255,255,0.9)",
  		font:       '800 14px/2 "Android Sans", "Lucida Grande", sans-serif',
    	fontColor:  "rgb(0,0,0)"
  	},
  	select : {
  		fill:	     "rgba(255,255,255,1.0)",
  		stroke:      "rgba(255,255,255,1.0)",
  		fontColor:   "rgba(0,0,0,0.9)"
  	},
  	collapse : {
  		strokeStyle: "rgba(255,255,255,0.5)",
  		lineWidth: 1
  	}
  },

	Edge  : {
	  lineWidth:  2,
	  stroke:    "rgba(77,77,77,0.7)"
	}

};
function ForceDirectedLayout(graph) {
	this.graph = graph;
	ForceDirectedLayout.attractiveForce = 1.0;
	ForceDirectedLayout.equilibrium     = 100;
	ForceDirectedLayout.repulsiveForce  = 100;
};

/**
 * Arranges the nodes in a layout by gradually moving connected nodes
 * closer to each other, and unconnected nodes away from each other.
 *
 * ForceDirectedLayout follows the Layout protocol:
 * - It expects layout to be called with a reference to a graph
 * - It invokes eachPair and eachEdge on the graph and specifies
 *   the methods it wants to apply to each pair and each node.
 * - #repel and #attract follow the
 *
 * Basic overview:
 * 1. Repel each node from every other node.
 * 2. Attract each node to every other connected node.
 *
 * @param graph {Graph}
 * @returns
 */
ForceDirectedLayout.prototype.layout = function() {
	this.graph.eachPair(ForceDirectedLayout.repel);
	this.graph.eachEdge(ForceDirectedLayout.attract);
	return true;
};

ForceDirectedLayout.repel = function(attractor,attracted) {
	if ((this.dragged == attractor) ||
		(this.selection == attractor)) {
		return false;
	}
	attractor.add(repulsiveForce(attractor,attracted,ForceDirectedLayout.repulsiveForce));
};

ForceDirectedLayout.attract = function(attractor,attracted) {
	if ((this.dragged == attracted) || (this.selection == attracted)) {
		return false;
	}
	attracted.add(springForce(attractor,attracted,ForceDirectedLayout.attractiveForce,ForceDirectedLayout.equilibrium));
};

/** Calculates the distance between to objects.
@return [float] Euclidean distance
*/
ForceDirectedLayout.distance = function(p1, p2) {
	return Math.sqrt(Math.pow(p1.x-p2.x, 2) + Math.pow(p1.y-p2.y, 2));
};

/** Calculate the angle between two objects.
@return [float] Angle in radians
*/
ForceDirectedLayout.angle = function(p1, p2) {
	return Math.atan((p1.y - p2.y) / (p1.x - p2.x));
};

/**
 * Calculates the vector of force between two points
 *
 * @param p1
 * @param p2
 * @param spring
 * @param equilibrium
 * @returns {Vector}
 */
function springForce(p1, p2, spring, equilibrium) {

  var magnitude = ForceDirectedLayout.distance(p1, p2);
  var theta = ForceDirectedLayout.angle(p1, p2);

  if (magnitude < equilibrium) {
    return { x:0, y:0 };
  }

  var delta = - (equilibrium - magnitude) * spring;

  var dx = delta * Math.cos(theta);
  var dy = delta * Math.sin(theta);

  if (p1.x < p2.x) {
    dx = -dx;
    dy = -dy;
  }

  return {
    x: dx,
    y: dy
  };

}

/**
 *
 * @param p1
 * @param p2
 * @returns {x:,y:}
 */
function repulsiveForce(p1, p2, force) {

	var magnitude = (force / ForceDirectedLayout.distance(p1,p2)) * 0.6;
	var theta = ForceDirectedLayout.angle(p1, p2);

	if (magnitude < 0.1) {
		return { x:0, y:0 };
	}

	var dx = magnitude * Math.cos(theta);
	var dy = magnitude * Math.sin(theta);

	if (p1.x < p2.x) {
		dx = -dx;
		dy = -dy;
	}

	return {
		x: dx,
		y: dy
	};
}
/**
 * @author Jon Morton (jon.morton@gmail.com)
 *
 */
function Graph(canvasId) {
	this.nodes = {};
	this.edges = [];
	this.setCanvas(canvasId);
	this.setLayout(new DefaultLayout(this));
	this.setDisplay(new DefaultRenderer(this));
	this.setDepth(2);
	this.callbacks = {};
}

Graph.prototype = {
	setCanvas: function(id) {
		this.canvas = document.getElementById(id);
	},
	getCanvas: function() {
		return this.canvas;
	},
	setLayout: function(value) {
		this.layoutWith = value;
		this.layoutWith.graph = this;
	},
	getLayout: function() {
		return this.layoutWith;
	},
	setDisplay: function(value) {
		this.display = value;
		this.display.graph = this;
	},
	getDisplay: function() {
		return this.display;
	},
	setDepth: function(value) {
		this._depth = value;
		this.cacheReachableNodes();
	},
	getDepth: function() {
		return this._depth;
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

	if (this.rootNode == undefined) {
		this.rootNode = node;
	}

	this.cacheReachableNodes();

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

	for (i = arguments.length-1; i >= 0; i--) {
		childNode = this.nodes[arguments[i]];
		if (childNode == undefined) {
			childNode = new Node(arguments[i]);
			this.nodes[childNode.id] = childNode;
		}
		parentNode.connect(childNode);
		childNode.connect(parentNode);
		this.edges.push([parentNode,childNode]);
		this.edges.push([childNode,parentNode]);
	}

	this.cacheReachableNodes();

	return this;
};

Graph.prototype.nodeCount = function() {
  var count = 0;
  for (key in this.nodes) if (this.reachable.hasOwnProperty(key)) count++;
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
	return activeNodes;
};

Graph.prototype.visibleNodes = function() {
};

Graph.prototype.eachPair = function(curry) {
	var node1, node2;
	for (i1 in this.reachable) {
		node1 = this.reachable[i1];
		for (i2 in this.reachable) {
			node2 = this.reachable[i2];
			if (node1 != node2) {
				curry.call(this.display, node1, node2);
			}
		}
	}
	return true;
};

Graph.prototype.eachEdge = function(curry) {
	var pair;
	for (index in this.edges) {
		pair = this.edges[index];
		curry.call(this.display, pair[0], pair[1]);
	}
	return true;
};

/**
 * Any time the selected node changes, a node is connected or disconnected,
 * the visible nodes should be recalculated.
 */
Graph.prototype.cacheReachableNodes = function() {
	if ((this.nodes == undefined) || (this.rootNode == undefined)) {
		this.reachable = [];
		return [];
	}

	for(ix in this.nodes) {
		this.nodes[ix].reachable = false;
	}

	if (this.getDepth() >= 0) {
	  this.reachable = this.rootNode.traverse({}, this.getDepth());
  } else {
    this.reachable = this.nodes;
  }

	for(ix in this.reachable) {
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

/**
 * Utility function for calculating the magnitude between two
 * points.  It does not handle direction though.
 */
Graph.distance = function(p1, p2) {
	return Math.sqrt(Math.pow(p1.x-p2.x, 2) + Math.pow(p1.y-p2.y, 2));
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
};

Node.prototype.connect = function(node) {
	this.adjacent.push(node);
};

Node.prototype.mass = function(node) {
	this.node.children.length;
};

Node.prototype.getWeight = function(node) {
	return 1;
};

/**
 * Recursive function for visiting a node and it's adjacent nodes.
 *
 * @param accumulator
 * @param limit
 * @param depth
 * @returns
 */
Node.prototype.traverse = function(accumulator, limit, depth) {

	if (accumulator[this.id] == undefined) {
		accumulator[this.id] = this;
		if (depth == undefined) {
			this.depth = 1;
		} else {
			this.depth = depth;
		}
		if (limit > 0 && true && this.expanded()) {
			for (ix in this.adjacent) {
				accumulator = this.adjacent[ix].traverse(accumulator, limit-1, depth+1);
			}
		}
	}
	return accumulator;
};

Node.prototype.collapse = function() {
	this._collapsed = true;
};

Node.prototype.collapsed = function() {
	return this._collapsed == true;
};

Node.prototype.expand = function() {
	this._collapsed = false;
};

Node.prototype.expanded = function() {
	return this._collapsed != true;
};

Node.prototype.toggle = function() {
	this._collapsed = ! this._collapsed;
};

/**
 * True if the node is collapsed and has children.  Useful for determining
 * if something should indicate that it can be expanded.  Of course, nodes
 * without children can't be expanded.
 * @returns {Boolean}
 */
Node.prototype.isHidingChildren = function() {
	return (this.collapsed() && (this.adjacent.length > 0));
};
