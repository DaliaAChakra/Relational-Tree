var data = {
  name: "Root",
  image: "path-to-image",
  children: [
    // child 1 of root (parent 1)
      {
          name: "Person1",
          image: "path-to-image",
          children: [
             // child 1 of parent 1
              {
                name: "Person2",
                image: "path-to-image"
              },
              // child 2 of parent 1
              {
                name: "Person3",
                image: "path-to-image"
              },
              // child 3 of parent 1
              { 
                name: "Person4",
                image: "path-to-image", 
                children: [
                    // child 1 of of parent 1's child 3
                    {
                      name: "Person5",
                      image: "path-to-image"
                    }, 
                    // child 1 of of parent 1's child 3
                    {
                      name: "Person6",
                      image: "path-to-image"
                    }, 

                ] 
              },
              // child 4 of parent 1
              {
                name: "Person7",
                image: "path-to-image",
                children: [
                  // child 1 of parent 1's child 4
                  {
                    name: "Person8",
                    image: "path-to-image"
                  }

                ]
              },
              // child 5 of parent 1
              {
                name: "Person9",
                image: "path-to-image"
              }
          ]
      },
      // child 2 of root (parent 2)
      {
          name: "Person",
          image: "path-to-image",
          children: [
              { name: "Person12", image: "path-to-image" },
              { name: "Person13", image: "path-to-image" },
              { name: "Person14", image: "path-to-image" }
          ]
      },
  ]
};

// Manually create a link between Rami and Maya
var link = { source: data.children[0].children[1], target: data.children[1] };

var diameter = 1000;

var margin = { top: 20, right: 120, bottom: 20, left: 120 },
  width = diameter,
  height = diameter;

var i = 0,
  duration = 350,
  root;

var tree = d3.layout
  .tree()
  .size([360, diameter / 2 - 80])
  .separation(function (a, b) {
    return (a.parent == b.parent ? 1 : 10) / a.depth;
  });

var diagonal = d3.svg.diagonal.radial().projection(function (d) {
  return [d.y, (d.x / 180) * Math.PI];
});

var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

root = data;
root.x0 = height / 2;
root.y0 = 0;

update(root);

d3.select(self.frameElement).style("height", "800px");

function update(source) {
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
      d.y = d.depth * 150; // Adjust the distance between nodes as needed
  });

  // Update the nodes…
  var node = svg.selectAll("g.node").data(nodes, function(d) {
      return d.id || (d.id = ++i);
  });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter()
      .append("g")
      .attr("class", "node")
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });

  // Define the clip path for circular images
  svg.append("defs")
  .append("clipPath")
  .attr("id", "imageClip")
  .append("circle")
  .attr("r", 20); // Adjust the radius as needed

  // Update the image elements to apply the clip path
  nodeEnter.append("image")
  .attr("xlink:href", function(d) { return d.image; })
  .attr("clip-path", "url(#imageClip)") // Apply the circular clip path
  .attr("x", -20) // Adjust position as needed
  .attr("y", -20) // Adjust position as needed
  .attr("width", 40) // Adjust size as needed
  .attr("height", 40); // Adjust size as needed


  nodeEnter.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text(function(d) {
          return d.name;
      })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition().duration(duration)
      .attr("transform", function(d) {
          return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
      });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });

  nodeUpdate.select("text")
      .style("fill-opacity", 1)
      .attr("transform", function(d) {
          return "translate(0, 25)"; // Position the text below the node
      });

  var nodeExit = node.exit().transition().duration(duration).remove();

  nodeExit.select("circle").attr("r", 1e-6);

  nodeExit.select("text").style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link").data(links, function(d) {
      return d.target.id;
  });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
          var o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
      });

  // Transition links to their new position.
  link.transition().duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition().duration(duration)
      .attr("d", function(d) {
          var o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
  });
}

function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    if (d._children) {
      d.children = d._children;
      d._children = null;
    }
  }
  update(d);
}
