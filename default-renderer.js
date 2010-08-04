/**
 * Component for abstracting the rendering of the graph.
 * 
 * @param id
 * @returns {DefaultGraphDrawer}
 */
function DefaultRenderer(graph) {
	this.graph = graph;
	this.width = 100;
	this.height = 30;
	this.nodeSize = 20;
	this.scale = 1.0;
	this.offset = { x: 0, y: 0 };
	this.hovered = null;
	this.dragged = null;
	this.dragging = false;
	this.listen();
};

DefaultRenderer.prototype = {
	set graph(value) {
		this._graph = value;
		this.canvas = value.canvas;
		this.context = value.canvas.getContext('2d');
	},
	get graph() {
		return this._graph;
	}
};

/**
 * Clears the viewing area.
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
	
	// Move the canvas to wherever it has been dragged.
	this.context.translate(this.offset.x, this.offset.y);
	this.context.scale(this.scale, this.scale);
	
	// Draw edges between reachable nodes
	for (index in this.graph.reachable) {
		var fromNode = this.graph.reachable[index];
		for (i2 in fromNode.adjacent) {
			var toNode = fromNode.adjacent[i2];
			if (fromNode.reachable && toNode.reachable) {
				this.drawEdge(fromNode,toNode);
			}
		}
	}
	
	// Draw reachable nodes
	for (index in this.graph.reachable) {
		this.drawNode(this.graph.nodes[index]);
	}
	
	// Draw hovered nodes
	if (this.hovered) {
	  this.drawNode(this.hovered);
	}
	
	this.context.restore();

	return this;
};

DefaultRenderer.prototype.drawNode = function(node) {
	this.context.save();
	
	this.context.fillStyle = Style.Node.fill;
	this.context.strokeStyle = Style.Node.stroke;
	this.context.lineWidth = Style.Node.lineWidth;
	this.context.font = Style.Node.font;
	
	if (this.dragged == node) {
		this.context.fillStyle = Style.Node.drag.fill;
		this.context.strokeStyle = Style.Node.drag.stroke;
	} else if (this.hovered == node) {
		this.context.fillStyle = Style.Node.hover.fill;
		this.context.strokeStyle = Style.Node.hover.stroke;
		this.context.font = Style.Node.hover.font;
	}
	
	// Center the x/y of the node
	this.context.translate(node.x, node.y);
	
	this.drawPath(node);
	this.context.stroke(0, 0, this.width, this.height);
	this.context.fill();
	
	if (node.isHidingChildren()) {
		this.context.strokeStyle = Style.Node.collapse.strokeStyle;
		this.context.lineWidth = Style.Node.collapse.lineWidth;
    	this.context.arc(0, 0, (node.getWeight() * this.nodeSize) + 4, 0, 2*Math.PI, false);
    	this.context.stroke(0, 0, this.width, this.height);
    }
	
	this.drawLabel(node);
	
	this.context.restore();
	
};

DefaultRenderer.prototype.drawPath = function(node) {
  with(this.context) {
    beginPath();
    arc(0, 0, node.getWeight() * this.nodeSize, 0, Math.PI*2, false);
    closePath();
  }
};

DefaultRenderer.prototype.drawLabel = function(node) {
	if (this.scale < 0.4) {
		return false;
	}
	
	with(this.context) {
		fillStyle = Style.Node.fontColor;
		textAlign = 'center';
		textBaseline = 'middle';
		fillText(node.text, 0, 0);
	}
};

DefaultRenderer.prototype.drawEdge = function(node1, node2) {
	this.context.save();
	this.context.beginPath();
	this.context.strokeStyle = Style.Edge.stroke;
	this.context.lineWidth = Style.Edge.lineWidth;
	this.context.lineTo(node1.x, node1.y);
	this.context.lineTo(node2.x, node2.y);
	this.context.closePath();
	this.context.stroke();
	this.context.restore();
};

DefaultRenderer.prototype.redraw = function() {
	this.blank();
	this.draw();
};

DefaultRenderer.prototype.listen = function() {
	var renderer = this;
	
	this.canvas.addEventListener('mousedown', function(event) {
		renderer.startDragging(event);
	}, false);
	
	this.canvas.addEventListener('mouseup', function(event) {
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
		// Only redraw if the graph is not playing.  Otherwise,
		// performance will suffer during mouse over.
		if (!renderer.graph.isPlaying()) {
			renderer.redraw();
		}
	}, false);
	
	this.canvas.addEventListener('dblclick', function(event) {
		var target = DefaultRenderer.topMost(renderer.containing(event));
		
		// Expand or collapse a node...
		if (target != null) {
			target.toggle();
			renderer.graph.cacheReachableNodes();
			
		// Start/stop animation...
		} else {
			if (renderer.graph.isPlaying()) {
				renderer.graph.stop();
			} else {
				renderer.graph.start();
			}			
		}
	}, false);
	
	// Mozilla handles mouse events differently than webkit.
	if (window.addEventListener) {
		
		this.canvas.addEventListener('DOMMouseScroll', 
			function(event) {
				var delta = event.detail * 10;
				renderer.zoom(delta);
				renderer.redraw();
		}, false);
		
		this.canvas.addEventListener('mousewheel',
			function() {
				var delta = event.wheelDelta;
				renderer.zoom(delta);
				renderer.redraw();
			}, false);
		
	}
};

DefaultRenderer.prototype.startDragging = function(e) {
	this.lastPoint = e;
	this.dragging  = true;
	this.dragged   = DefaultRenderer.topMost(this.containing(e));
};

DefaultRenderer.prototype.stopDragging = function(e) {
	this.dragging  = false;
	this.lastPoint = null;
	this.dragged   = null;
};

DefaultRenderer.prototype.dragScene = function(e) {
	if (this.lastPoint != undefined) {
		this.offset.x += (e.clientX - this.lastPoint.clientX);
		this.offset.y += (e.clientY - this.lastPoint.clientY);
	}
	this.lastPoint = e;
};

DefaultRenderer.prototype.dragNode = function(e) {
	this.dragged.x += (e.clientX - this.lastPoint.clientX) / this.scale;
	this.dragged.y += (e.clientY - this.lastPoint.clientY) / this.scale;
	this.lastPoint = e;
};

DefaultRenderer.prototype.hovering = function(e) {
	// I've decided to use a separate list so that we don't have
	// to iterate over all nodes in order to get a subset of them.
	// Also, it makes it easier to 'dehover' a node. Instead
	// of iterating over a list and setting a property, the list
	// is destroyed/emptied. If it makes more sense to iterate
	// (and/or performant) then this approach should be changed.
	this.hovered = DefaultRenderer.topMost(this.containing(e));
};

DefaultRenderer.prototype.zoom = function(delta) {
	this.scale += 0.001 * delta;
	this.scale = Math.max( this.scale, 0.25 );
	this.scale = Math.min( this.scale, 5.0 );
};

DefaultRenderer.prototype.focus = function(event) {
	this.focused = this.containing(e);
	return true;
};

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
		x: ((event.clientX - event.target.offsetLeft) - this.offset.x) / this.scale,
		y: ((event.clientY - event.target.offsetTop) - this.offset.y) / this.scale
	};
};

/**
 * Create the node path and determine if it actually contains the specified
 * point. The renderer should handle this because the node doesn't know how to
 * draw itself.
 */
DefaultRenderer.prototype.isPointInNode = function(point, node) {
	/*
	 * var result; this.context.save(); this.drawPath(node); result =
	 * this.context.isPointInPath(point.x, point.y); this.context.restore();
	 * return result;
	 */
	var result;
	
	result = Graph.distance(point, node) < (node.getWeight() * this.nodeSize);
	
	return result;
};

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
  		stroke:   "rgba(128,128,128,0.9)"
  	},
  	hover : {
  		fill: 	 "rgba(225,225,225,0.9)",
  		stroke:  "rgba(255,255,255,0.9)",
  		font:    '800 14px/2 "Android Sans", "Lucida Grande", sans-serif'
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
