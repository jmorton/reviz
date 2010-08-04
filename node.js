function Node(id, label) {
	this.id = id;
	this.label = label;
	this.x = 0;
	this.y = 0;
	this.adjacent = [];
}

Node.prototype = {
	get text() {
		return this.label || this.id;
	}
};

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
	return 1 + (this.adjacent.length * 0.1);
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
	
	// Don't overwrite nodes that have already been visited
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

Node.prototype.isHidingChildren = function() {
	return (this.collapsed() && (this.adjacent.length > 0));
}
