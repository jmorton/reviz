var Util = {};

/**
 * Calculates the distance between to objects.
 * 
 * @return [float] Euclidean distance
 */

Util.distance = function(p1, p2) {
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

/**
 * Calculate the angle between two objects.
 * 
 * @return [float] Angle in radians
 */
Util.angle = function(p1, p2) {
	// angle = arc tangent of opposite over adjacent
	return Math.atan((p1.y - p2.y) / (p1.x - p2.x));
};
