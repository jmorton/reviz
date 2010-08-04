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
		if (limit > 0) {
			for (ix in this.adjacent) {
				accumulator = this.adjacent[ix].traverse(accumulator, limit-1, depth+1);
			}
		}
	}
	return accumulator;
};