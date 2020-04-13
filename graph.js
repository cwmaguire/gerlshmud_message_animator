"use strict";

let VERTEX_RADIUS = 10;
let EDGE_LENGTH = 100;

/*
 *     2
 *    /
 *   /
 *  1--3
 *   \ |
 *    \|
 *     4
 *
 */


const GRAPH = {1: [2, 3, 4, 6],
               2: [1, 3],
               3: [1, 2],
               4: [1, 5],
               5: [4, 6],
               6: [1, 5]};

function scriptDesc(){
  return 'Draw a graph';
}

function should_clear(){
  return true;
}

function init(){
  let c = elem('canvas1');
  let ctx = c.getContext('2d');
  let h = c.height;
  let w = c.width;
  let state = undefined;

  add_controls(w, h);

  shapes = arrange_shapes(GRAPH, c.width, c.height);


  // return state used for rendering
  return state;
}

function arrange_shapes(graph, w, h){
  let state = {parent: undefined,
               angle: undefined,
               remaining: {},
               connections: {},
               locations: {},
               w: w,
               h: h}

  let firstKey = Object.keys(graph)[0];
  arrange_vector(graph, state, firstKey);
}

function arrange_vector(graph, state, key){
  parentPoint = state.parent_point;
  point = locate_point(state.angle, parentPoint);
  line = {type: 'line', p1: parentPoint, p2: point};

  connections = siblings_sorted_by_connections(graph, key);
  // find sibling-to-sibling connections
  //   e.g. [2-3, 3-2, 3-4, 5-6]
  // take the next pair
  //   add them to the list: [2, 3]
  //   remove 2-3 and 3-2: [3-4, 5-6]
  // recurse with [2, 3] and [3-4, 5-6]
  // take the next pair ... Nope, that would give me [2, 3, 3, 4]

  // Start with first element of first pair
  // pairs: [2-3, 3-2, 3-4, 5-6]
  // first element of first pair: 2
  // call with (2, [], [2-3, 3-2, 3-4, 5-6])
  // get connected element: 3
  // remove connection to 3: [3-2, 3-4, 5-6]
  // remove opposite connection: [3-4, 5-6]
  // call with (3, [2], [3-4, 5-6]
  // get connected element: 4
  // remove connection to 4: [5-6]
  // remove opposite connection: [5-6]
  // call with (4, [2, 3], [5-6])
  // get connected element: None
  // get first element of next pair: 5
  // call with (5, [2, 3, 4], [5-6])
  // get connected element: 6
  // remove connection to 6: []
  // remove opposite connection: []
  // call with (6, [2, 3, 4, 5], [])
  // get connected element: None
  // return [2, 3, 4, 5, 6]

  return .reduce(arrangeVector, add_shapes(state, shapes))

}

function siblings_sorted_by_connections(graph, key){
  return unique_concat(sorted_connected_siblings(graph, key), siblings);

function sorted_connected_siblings(graph, key)
  let reducer = function(conn, siblings){
    let connSiblings = conn.split('-').map(i => parseInt(i))
    return unique_concat(siblings, connSiblings);
  }
  let orderedConnectedSiblings = get_sibling_connections(graph, key).sort().reduce(reducer, []);
}

function unique_concat(arr1, arr2){
  return arr1.concat(arr2.filter(i => !arr1.includes(i)));
}

function get_sibling_connections(graph, key){
  let acc = {connections: new Set(), siblings = graph[key]};
  return graph[key].reduce(add_sibling_connections, acc);
}

function add_sibling_connections(acc, key1){
  let reducer = function (acc, key2) {
    add_unique_conn_strings(acc, key1, key2);
  }
  filter = key => acc.siblings.includes(key);
  return graph[key].filter(filter).reduce(reducer, acc);
}

function add_unique_conn_strings(acc, key1, key2){
  [minKey, maxKey] = [key1, key2].sort();
  return connections.add(`${minKey}-${maxKey}`);
}

function locate_point(angle, parentPoint){
  let point;
  if(state.angle == undefined){
    x = state.w / 2;
    y = state.y / 2;
    point = {type: 'point', x: x, y: y}
  }else{
    point = point_from_angle(state.angle, parentPoint);
  }

  return point;
}

function point_from_angle(angle, start){
  let x, y, point
  if(angle == 0 || angle == Math.PI * 2){
    point = {x: start.x + EDGE_LENGTH, y: start.y}
  if(angle < (Math.PI / 2)){
    point = quad_1_point(angle, start);
  }else if(angle == Math.PI / 2){
    point = {x: start.x, y: start.y - EDGE_LENGTH}
  }else if(angle > (Math.PI / 2) && angle < Math.PI){
    point = quad_2_point(angle, start);
  }else if(angle == Math.PI){
    point = {x: start.x - EDGE_LENGTH, y: start.y}
  }else if(angle > Math.PI && angle < (3 / 2 * Math.PI)){
    point = quad_3_point(angle, start);
  }else if(angle == (3 / 2 * Math.PI)){
    point = {x: start.x, y: start.y + EDGE_LENGTH}
  }else if(angle > (3 / 2 * Math.PI) && angle < (2 * Math.PI)){
    point = quad_4_point(angle, start);
  }
  return point;
}

function quad_1_point(angle, start){
  xd = Math.cos(angle) * EDGE_LENGTH;
  x = start.x + xd;
  yd = Math.sin(angle) * EDGE_LENGTH;
  y = start.y - yd;
  return {x: x, y: y};
}

function quad_2_point(angle, start){
  xd = Math.cos(Math.PI - angle) * EDGE_LENGTH;
  x = start.x - xd;
  yd = Math.sin(Math.PI - angle) * EDGE_LENGTH;
  y = start.y - yd;
  return {x: x, y: y};
}

function quad_3_point(angle, start){
  xd = Math.cos(angle - Math.PI) * EDGE_LENGTH;
  x = start.x - xd;
  yd = Math.sin(angle - Math.PI) * EDGE_LENGTH;
  y = start.y + yd;
  return {x: x, y: y};
}

function quad_4_point(angle, start){
  xd = Math.cos(2 * Math.PI - angle) * EDGE_LENGTH;
  x = start.x + xd;
  yd = Math.sin(2 * Math.PI - angle) * EDGE_LENGTH;
  y = start.y + yd;
  return {x: x, y: y};
}

function add_shapes(state, shapes){
  newShapes = state.shapes.concat(shapes);
  return {parent_point: state.parent_point,
          shapes: newShapes};
}

function render({context: ctx, state: {h, w, frame, shapes}}){
  for(const shape of shapes){
    draw_shape(ctx, shape);
  }
  return {h: h, w: w, frame: frame, shapes: shapes};
}

function add_controls(w, h){
  add_slider('vertex_radius', '0', '100', '5', VERTEX_RADIUS);
  add_slider('edge_length', '0', '200', '5', EDGE_LENGTH);
}

function add_slider(name, min, max, step, value){
  let controlSpan = elem('controls');
  let slider = document.createElement('INPUT');
  slider.type = 'range';
  slider.id = name;
  slider.name = name;
  slider.value = value;
  slider.min = min;
  slider.max = max;
  slider.step = step;

  let label = document.createElement('LABEL');
  label.id = name + '_label';
  label.innerText = name;
  label.for = name;

  let text = document.createElement('INPUT');
  text.type = 'text';
  text.id = name + '_text';
  text.name = name + '_text';
  let sliderOnchange =
    function(event){
      text.value = event.target.value;
    };
  slider.addEventListener('change', sliderOnchange);

  controlSpan.appendChild(slider);
  controlSpan.appendChild(label);
  controlSpan.appendChild(text);
  controlSpan.appendChild(document.createElement('BR'));
}

function draw_shape(ctx, shape){
  let debug = 'draw_shape()';
  for(let prop in shape){
    debug += ` shape.${prop}: ${shape[prop]}`;
  }
  console.log(debug);

  if(shape.type == 'vertex'){
    draw_vertex(ctx, shape);
  }else if(shape.type == 'edge'){
    draw_edge(ctx, shape);
  }
}

function draw_vertex(ctx, vertex){
  const radius = get_control_value('vertex_radius', 'int');
  const rotation = 0;
  const startAngle = 0;
  const endAngle = Math.PI * 2;
  const gradient = ctx.createLinearGradient(vertex.x - 20, vertex.y - 20, vertex.x + 20, vertex.y + 20);
  gradient.addColorStop(0.0, 'black');
  gradient.addColorStop(1.0, '#9090FF');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(vertex.x, vertex.y, radius, radius, rotation, startAngle, endAngle);
  ctx.closePath();
  ctx.fill();

  const textOffsetX = vertex.x - radius / 2;
  const textOffsetY = vertex.y + radius / 2;
  ctx.fillStyle = 'white';
  ctx.font = '16pt serif';
  ctx.fillText(vertex.id, textOffsetX, textOffsetY);
}

function draw_edge(ctx, edge){
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(edge.x1, edge.y1);
  ctx.lineTo(edge.x2, edge.y2);
  ctx.closePath();
  ctx.stroke();

  const width = edge.x2 - edge.x1;
  const textOffsetX = edge.x1 + width / 2 - 20;
  const height = edge.y1 - edge.y2;
  const textOffsetY = edge.y1 - height / 2;
  //console.log(`Width: ${width}, textOffsetX: ${textOffsetX}, height: ${height}, textOffsetY: ${textOffsetY}`);
  ctx.fillStyle = 'black';
  ctx.font = '16pt serif';
  ctx.fillText(edge.id, textOffsetX, textOffsetY);
}
