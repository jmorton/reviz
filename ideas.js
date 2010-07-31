var graph;

// Initializing a canvas and a graph
graph.display();

// Graph node/edge related functions
graph.add(node)
graph.connect(thisNode, thatNode)
graph.disconnect(thisNode, thatNode)
graph.nodes
graph.edges

// Getting graph components
graph.at(point)
graph.nodesAt(point)
graph.edgesAt(point)
graph.within(path)

// Interaction related
graph.select(point)
graph.selected
graph.focus(point) // look at this node, center
graph.focused

// Display related
graph.layout()
graph.draw()
graph.clear()
graph.play()
graph.pause()

// Advanced -- these are called by default
graph.drawWith(BoxNode);
graph.layoutWith(ForceDirectedGraph2D);
graph.addFilter(TimeWindow, GraphDepth);

// Node dynamics
node.moveTo(point)
node.moveBy(vector)
node.disable() // does not participate in layout
node.visible() // not drawn

// Node
var Node = {
  id    : 1,           // used to identify node in sets, unique
  label : 'Ahoy',      //
  point : { x : Number, y : Number }
};


with(graph) {
  add('foo', 'bar', 'baz')
  connect('foo', 'bar')
  connect('bar', 'baz')
  
}

{
	this.layout.apply(graph);
	this.drawer.apply(graph);
}

  
  
  




