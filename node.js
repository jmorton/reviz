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
