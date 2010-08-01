/**
 * Component for abstracting the rendering of the graph.
 * 
 * @param id
 * @returns {DefaultGraphDrawer}
 */
function DefaultRenderer(id, graph) {
	this.canvas = document.getElementById(id);
	this.context = this.canvas.getContext('2d');
	this.graph = graph;
	this.width = 100;
	this.height = 30;
	this.scale = 1.0;
	this.offset = { x: 0, y: 0 };
	this.dragged = [];
	this.hovered = [];
	this.dragging = false;
	this.listen();
};

/**
 * Clears the viewing area.
 * 
 * @returns
 */
DefaultRenderer.prototype.blank = function() {
	this.context.save();
	this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
	this.context.restore();
};

/**
 * Render the nodes and edges in a graph to the context.
 * @param graph
 * @returns
 */
DefaultRenderer.prototype.draw = function() {
	this.context.save();
	
	// Move the canvas to wherever it has been dragged.
	this.context.translate(this.offset.x, this.offset.y);
	this.context.scale(this.scale, this.scale);
	
	for (index in this.graph.edges) {
		this.drawEdge(
			this.graph.edges[index][0],
			this.graph.edges[index][1]);
	}
	
	for (index in this.graph.nodes) {
		this.drawNode(this.graph.nodes[index]);
	}
	
	this.context.restore();

	return this;
};

DefaultRenderer.prototype.drawNode = function(node) {
	this.context.save();
	
	this.context.fillStyle = Style.fill;
	this.context.strokeStyle = Style.stroke;
	
	if (this.dragged.indexOf(node) > -1) {
		this.context.fillStyle = Style.drag.fill; 		
		this.context.strokeStyle = Style.drag.stroke;
	} else if ((this.hovered.indexOf(node) > -1)) {
		this.context.fillStyle = Style.hover.fill;
		this.context.strokeStyle = Style.hover.stroke;
	}
	
	// Center the x/y of the node
	this.drawPath(node);
	this.context.stroke(0, 0, this.width, this.height);
	this.context.fill();
	this.context.restore();
};

DefaultRenderer.prototype.drawPath = function(node) {
	this.context.translate(node.x-this.width/2, node.y-this.height/2);
	this.context.beginPath();
	this.context.rect(0, 0, this.width, this.height);
	this.context.closePath();
};

DefaultRenderer.prototype.drawEdge = function(node1, node2) {
	this.context.save();
	this.context.beginPath();
	this.context.strokeStyle = Style.stroke;
	this.context.lineWidth = 2;
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
			if (renderer.dragged.length < 1) {
				renderer.dragScene(event);
			} else {
				renderer.dragNode(event);
			}
		} else {
			renderer.hovering(event);
		}
		renderer.redraw();
	}, false);
	
	this.canvas.addEventListener('dblclick', function(event) {
		if (renderer.graph.isPlaying()) {
			renderer.graph.stop();
		} else {
			renderer.graph.start();
		}
	}, false);
	
	this.canvas.addEventListener('mousewheel', function(event) {
		renderer.zoom(event);
		renderer.redraw();
	});

};

DefaultRenderer.prototype.startDragging = function(e) {
	this.lastPoint = e;
	this.dragging  = true;
	this.dragged   = this.containing(e);
};

DefaultRenderer.prototype.stopDragging = function(e) {
	this.dragging  = false;
	this.lastPoint = null;
	this.dragged   = [];
};

DefaultRenderer.prototype.dragScene = function(e) {
	if (this.lastPoint != undefined) {
		this.offset.x += (e.clientX - this.lastPoint.clientX);
		this.offset.y += (e.clientY - this.lastPoint.clientY);
	}
	this.lastPoint = e;
};

DefaultRenderer.prototype.dragNode = function(e) {
	for (index in this.dragged) {
		this.dragged[index].x += (e.clientX - this.lastPoint.clientX) / this.scale;
		this.dragged[index].y += (e.clientY - this.lastPoint.clientY) / this.scale;
	}
	this.lastPoint = e;
};

DefaultRenderer.prototype.dragging = function(e) {
//	this.hovered = this.containing(e);
	return true;
};

DefaultRenderer.prototype.hovering = function(e) {
	// I've decided to use a separate list so that we don't have
	// to iterate over all nodes in order to get a subset of them.
	// Also, it makes it easier to 'dehover' a node.  Instead
	// of iterating over a list and setting a property, the list
	// is destroyed/emptied.  If it makes more sense to iterate
	// (and/or performant) then this approach should be changed.
	this.hovered = this.containing(e);
};

DefaultRenderer.prototype.zoom = function(e) {
	this.scale += 0.001 * e.wheelDelta;
	this.scale = Math.max( this.scale, 0.5 );
	this.scale = Math.min( this.scale, 5.0 );
};

DefaultRenderer.prototype.focus = function(event) {
	this.focused = this.containing(e);
	return true;
};

DefaultRenderer.prototype.containing = function(event) {
	var relativePoint = this.relativePoint(event);
	var nodes = [];
	for (index in this.graph.nodes) {
		if (this.isPointInNode(relativePoint, this.graph.nodes[index])) {
			nodes[nodes.length] = this.graph.nodes[index];
		}
	}
	
	return nodes;
};

/**
 * Get the relative coordinates of a click.  Takes into account the
 * position of the canvas and the renderer offset that occurs during
 * dragging and scaling.
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
 * Create the node path and determine if it actually contains the
 * specified point.  The renderer should handle this because the
 * node doesn't know how to draw itself.
 */
DefaultRenderer.prototype.isPointInNode = function(point, node) {
	var result;
	this.context.save();
	this.drawPath(node);
	result = this.context.isPointInPath(point.x, point.y);
	this.context.restore();
	return result;
};

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

var Style = {
	fill:		"rgba(192,192,192,1.0)",
	stroke: 	"rgba(225,225,225,0.7)",
	drag : {
		fill: 	"rgba(225,225,225,0.9)",
		stroke: "rgba(128,128,128,0.9)"
	},
	hover : {
		fill: 	"rgba(225,225,225,0.9)",
		stroke: "rgba(128,128,128,0.9)"
	}
};
