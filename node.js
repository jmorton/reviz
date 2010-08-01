Node.prototype.add = function(force) {
	this.x += force.x;
	this.y += force.y;
};

Node.prototype.connect = function(node) {
	this.adjacent.push(node);
};
