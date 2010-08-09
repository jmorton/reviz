/**
 * Component for abstracting the rendering of the graph.
 *
 * @param graph
 * @returns {DefaultDisplay}
 */
function DefaultDisplay(graph) {
  
  // The renderer needs to be able to reference the graph
  // so that it can access node data.
	this.setGraph(graph);
	
	// A default node size (radius) used for drawing nodes.
	this.nodeSize = 20;
	
	// Scale is used to keep track of zoom-in and zoom-out
	this.scale = 1.0;
	
	// Offset is used to keep track of panning
	this.offset = { x: 0, y: 0 };
	
	// The node that the cursor is over
	this.setHovered(null);
	
	// The node that is being dragged
	this.dragged = null;
	
	// Keep track of whether or not dragging is currently happening
	this.dragging = false;
	
	// Setup mouse (and eventually other) listeners/handlers
	this.listen();
};

DefaultDisplay.prototype = {
	setGraph: function(value) {
		this.graph = value;
		this.canvas = value.canvas;
		this.context = value.canvas.getContext('2d');
	},
	getGraph: function() {
		return this.graph;
	},
	setSelection: function(value) {
		// Don't handle the selection unless what is selected
		// is actually a new value.
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
		// Don't handle the selection unless what is selected
		// is actually a new value.
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
DefaultDisplay.prototype.blank = function() {
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
DefaultDisplay.prototype.draw = function() {
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
				this.graph.theme.drawEdge(fromNode, toNode, this.context);
			}
		}
	}
	
	// Draw reachable nodes
	for (index in this.graph.reachable) {
		this.graph.theme.drawNode(this.graph.nodes[index], this.context);
	}
	
	// Draw hovered nodes
	if (this.hovered) {
		this.graph.theme.drawNode(this.hovered, this.context);
	}
	
	this.context.restore();

	return this;
};

/**
 * Clear the viewing area and draw nodes, edges, and labels.
 */
DefaultDisplay.prototype.redraw = function() {
	this.blank();
	this.draw();
};

/**
 * Create and register mouse event handlers.
 */
DefaultDisplay.prototype.listen = function() {
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
		// Only redraw if the graph is not playing.  Otherwise,
		// performance will suffer during mouse over.
		if (!renderer.graph.isPlaying()) {
			renderer.redraw();
		}
	}, false);
	
	this.canvas.addEventListener('dblclick', function(event) {
		var target = DefaultDisplay.topMost(renderer.containing(event));
		
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
				DefaultDisplay.cancelEvent(event);
		}, false);
		
		this.canvas.addEventListener('mousewheel',
			function() {
				var delta = event.wheelDelta;
				renderer.zoom(delta);
				renderer.redraw();
				DefaultDisplay.cancelEvent(event);
			}, false);
		
	}
};

DefaultDisplay.cancelEvent = function(event) {
	// jaG.
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
DefaultDisplay.prototype.makeSelection = function(e) {
	this.setSelection(DefaultDisplay.topMost(this.containing(e)));
};

/**
 * Determine the "top most" node and make it the node being dragged.
 *
 * @param e
 */
DefaultDisplay.prototype.startDragging = function(e) {
	this.lastPoint = e;
	this.dragging  = true;
	this.dragged   = DefaultDisplay.topMost(this.containing(e));
	this.noDragDetected = true;
};

/**
 * Release the node being dragged.
 * @param e
 */
DefaultDisplay.prototype.stopDragging = function(e) {
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
DefaultDisplay.prototype.dragScene = function(e) {
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
DefaultDisplay.prototype.dragNode = function(e) {
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
DefaultDisplay.prototype.hovering = function(e) {
	// I've decided to use a separate list so that we don't have
	// to iterate over all nodes in order to get a subset of them.
	// Also, it makes it easier to 'dehover' a node. Instead
	// of iterating over a list and setting a property, the list
	// is destroyed/emptied. If it makes more sense to iterate
	// (and/or performant) then this approach should be changed.
	this.setHovered(DefaultDisplay.topMost(this.containing(e)));
};

/**
 * Zoom in or out a linear amount relative to the delta.  This is capped
 * by a zoom factor of 1/4 up to 5x.
 *
 * @param delta
 */
DefaultDisplay.prototype.zoom = function(delta) {
	this.scale += 0.001 * delta;
	this.scale = Math.max( this.scale, 0.1 );
	this.scale = Math.min( this.scale, 2.5 );
};

/**
 * Find all of the nodes that contain the point contained by the event.
 *
 * @param event
 */
DefaultDisplay.prototype.containing = function(event) {
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
DefaultDisplay.prototype.relativePoint = function(event) {
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
DefaultDisplay.prototype.isPointInNode = function(point, node) {
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
DefaultDisplay.prototype.lookAt = function(point) {
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
DefaultDisplay.topMost = function(list) {
  if ((list == undefined) || (list.length < 0)) {
    return null;
  } else {
    return list[list.length-1];
  }
};

