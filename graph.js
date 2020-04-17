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

function animate_graph(){
  let fps = cast(elem('fps').value, 'int');
  let frameLimit = cast(elem('frameLimit').value, 'int');
  let shouldClear = true;
  let initState = init();
  animation.animate(initState, render, frameLimit, fps, shouldClear);
}

function init(){
  let c = elem('canvas1');
  let ctx = c.getContext('2d');
  let h = c.height;
  let w = c.width;
  let state = undefined;

  add_controls(w, h);

  state = arrange_shapes(GRAPH, c.width, c.height);

  //map(draw_shape, shapes);

  // return state used for rendering
  return {h: h, w: w, frame: 0, shapes: state.shapes};
}

function arrange_shapes(graph, w, h){
  let state = {arranged: [],
               unarranged: [],
               w: w,
               h: h}

  let p = {x: Math.floor(w/2), y: Math.floor(h/2)}
  let firstKey = Object.keys(graph)[0];
  return arrange_vector(firstKey, p, graph, state);
}

function arrange_vector(key, p, graph, state){

  state.arranged.unshift({'key': key, 'point': p});

  let connections = unarranged(siblings(graph, key), state.arranged);
  connections.map(log_conn, connections);
  //let lines = {type: 'line', p1: parentPoint, p2: point};

  //return graph[key].reduce(arrangeVector, add_shapes(state, shapes))
  return [];

}

function log_conn(conn){
  console.log(`connection ${conn}`);
}

function siblings(graph, key){
  return graph[key];
}

function unarranged(keys, arranged){
  let f = k => !Object.keys(arranged).includes(k.toString());
  return keys.filter(f);
}

function siblings_sorted_by_connections(graph, key){
  return unique_concat(sorted_connected_siblings(graph, key), siblings);
}

function sorted_connected_siblings(graph, key){
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
  let acc = {'connections': new Set(), 'siblings': graph[key]};
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
  let [minKey, maxKey] = [key1, key2].sort();
  return connections.add(`${minKey}-${maxKey}`);
}

function locate_point(state, parentPoint){
  let point;
  if(state.angle == undefined){
    let x = state.w / 2;
    let y = state.y / 2;
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
  }else if(angle < (Math.PI / 2)){
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
