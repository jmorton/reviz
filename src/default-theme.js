/**
 * Theme abstracts drawing and shading of nodes and edges.
 * 
 * Drawing a node is a matter of:
 * 1. Creating path
 * 2. Filling and outlining a shape
 * 3. Drawing a label
 */
var DefaultTheme = {};

DefaultTheme.drawNode = function(node, context) {
	// Drawing a node may shift the canvas around.  Saving and
	// subsequently restoring the canvas is needed to make the
	// layout display properly. 
	context.save();

	// Use the the node's explicitly assigned styles or else use
	// the default font/fill/outline settings.
	if (node.style) {
		var custom = node.style || Style.Node;
	}

	// Apply the default values now and override them subsequently.
	context.font = Style.Node.font;
	context.fillStyle    = (custom || Style.Node).fill;
	context.strokeStyle  = (custom || Style.Node).stroke;
	context.lineWidth    = Style.Node.lineWidth;
	context.font         = Style.Node.font;

	if (node.selected) {
		context.fillStyle    = Style.Node.select.fill;
		context.strokeStyle  = Style.Node.select.stroke;
		context.font         = Style.Node.font;
	} else if (node.dragged) {
		context.fillStyle    = Style.Node.drag.fill;
		context.strokeStyle  = Style.Node.drag.stroke;
		context.font         = Style.Node.drag.font;
	} else if (node.hovered) {
		console.log(node.hovered);
		context.fillStyle    = Style.Node.hover.fill;
		context.strokeStyle  = Style.Node.hover.stroke;
		context.font         = Style.Node.hover.font;
	}

	// Center the x/y of the node so that drawing the shape
	// doesn't have to calculate relative x/y coordinates
	context.translate(node.x, node.y);
	DefaultTheme.drawPath(node, context);
	context.stroke();
	context.fill();

	DefaultTheme.drawLabel(node, context);

	context.restore();
};

/**
 * Creates the path without actually filling it in or adding an outline.
 *
 * @param node
 * @param context
 */
DefaultTheme.drawPath = function(node, context) {
	context.beginPath();
	context.arc(0, 0, Style.Node.size, 0, Math.PI * 2, false);
	context.closePath();
};

/**
 * Creates a label for the node.
 *
 * @param node
 * @param context
 */
DefaultTheme.drawLabel = function(node, context) {

	if (node.selected) {
		context.fillStyle = Style.Node.select.fontColor;
	} else if (node.dragged) {
		context.fillStyle = Style.Node.drag.fontColor;
	} else if (node.hovered) {
		context.fillStyle = Style.Node.hover.fontColor;
	} else {
		context.fillStyle = Style.Node.fontColor;
	}

	context.textAlign = Style.Node.textAlign;
	context.textBaseline = Style.Node.textBaseline;
	context.fillText(node.label || node.id, 0, 0);
};

/**
 * Creates a line between two nodes.
 *
 * @param node1
 * @param node2
 * @param context
 */
DefaultTheme.drawEdge = function(node1, node2, context) {
	context.save();
	context.beginPath();
	if (node1.selected || node2.selected) {
		context.strokeStyle = "rgb(255,255,255)";
	} else if (node1.hovered || node2.hovered) {
		context.strokeStyle = "rgb(192,192,192)";
	} else {
		context.strokeStyle = Style.Edge.stroke;
	}
	context.lineWidth = Style.Edge.lineWidth;
	context.lineTo(node1.x, node1.y);
	context.lineTo(node2.x, node2.y);
	context.closePath();
	context.stroke();
	context.restore();
};

var Style = {
	Scene : {
		background : "rgb(112,112,112)"
	},

	Node : {
		size : 25,
		textAlign : "center",
		textBaseline : "middle",
		fill : "rgba(210,210,210,0.8)",
		stroke : "rgba(55,55,55,0.9)",
		lineWidth : 3,
		font : '600 14px/2 "Android Sans", "Lucida Grande", sans-serif',
		fontColor : "rgba(0,0,0,0.9)",
		drag : {
			fill : "rgba(225,225,225,0.9)",
			stroke : "rgba(128,128,128,0.9)",
			fontColor : "rgb(0,0,0)"
		},
		hover : {
			fill : "rgba(225,225,225,0.9)",
			stroke : "rgba(255,255,255,0.9)",
			font : '800 14px/2 "Android Sans", "Lucida Grande", sans-serif',
			fontColor : "rgb(0,0,0)"
		},
		select : {
			fill : "rgba(255,255,255,1.0)",
			stroke : "rgba(255,255,255,1.0)",
			fontColor : "rgba(0,0,0,0.9)"
		},
		collapse : {
			strokeStyle : "rgba(255,255,255,0.5)",
			lineWidth : 1
		}
	},

	Edge : {
		lineWidth : 2,
		stroke : "rgba(77,77,77,0.7)"
	}

};
