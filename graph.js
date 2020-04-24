"use strict";

let VERTEX_RADIUS = 10;
let EDGE_LENGTH = 50;
let CHILD_SPREAD = 0.75 * Math.PI;

/*
 *         3
 *         |\
 *         | \
 *   5--4--1--2
 *    \    |
 *     \   |
 *      \  |
 *       \ |
 *        \|
 *         6
 */


const GRAPH = new Map([[1, [2, 3, 4, 6]],
                       [2, [1, 3]],
                       [3, [1, 2]],
                       [4, [1, 5]],
                       [5, [4, 6]],
                       [6, [1, 5]]]);

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
  let p = {x: Math.floor(w/2), y: Math.floor(h/2)};
  let firstKey = graph.keys().next().value;
  let firstVertex = {key: firstKey, p0: undefined, p1: p, angle: undefined};

  let state = {arranged_keys: [],
               arranged_connections: [],
               shapes: [],
               key_vertex_points: new Map([[firstKey, p]]),
               w: w,
               h: h,
               graph: graph}

  return arrange_shapes_(state, [firstVertex]);
}

function arrange_shapes_(state, verteces){

  if(verteces.length == 0){ return state; }

  let [vertex, ...rest] = verteces;
  let {key: key, p0: p0, p1: p1, angle: angle} = vertex;

  let childKeys = unarranged(siblings(state.graph, key), state.arranged_keys);
  let keyAngles = key_angles(childKeys, angle);
  let childKeyAngles = zip(childKeys, keyAngles);
  let vertexFun = vertex_fun(state.w, state.h, p1);
  let newVerteces = map(vertexFun, childKeyAngles);
  let remainingVerteces = rest.concat(newVerteces);

  let newConnection = {p1: p0, p2: p1};
  let vertexExists = state.arranged_keys.includes(key)
  if(!vertexExists){
    state.arranged_keys.unshift(key);
    state.shapes.unshift(vertex_shape(key, p1));
    state.key_vertex_points.set(key, p1);
  }else{
    let preexistingVertexPoint = state.key_vertex_points.get(key);
    newConnection = {p1: p0, p2: preexistingVertexPoint};
  }

  if(p0 != undefined && !has_connection(state.arranged_connections, newConnection)){
    state.arranged_connections.unshift(newConnection);
    state.shapes.unshift(edge_shape(newConnection));
  }

  console.log(`${key}: ${state.graph.get(key).join()}`);
  console.log(`${state_to_string(state)}`);
  console.log(`${verteces_to_strings(remainingVerteces)}`);
  console.log('');

  return arrange_shapes_(state, remainingVerteces);
}

function has_connection(connections, conn1){
  function conns_equal(conn0){
    return points_equal(conn0.p1, conn1.p1) && points_equal(conn0.p2, conn1.p2);
  }
  return connections.some(points_equal);
}

function points_equal(p1, p2){
  return p1.x = p2.x && p1.y == p2.y;
}

function vertex_fun(w, h, p0){
  return function([key, angle]){
    let {x: x, y: y} = point_from_angle(angle, p0, EDGE_LENGTH);
    return {key: key, p0: p0, p1: {x: Math.floor(x), y: Math.floor(y)}, angle: angle}
  }
}

function key_angles(keys, inAngle){
  let outAngles;
  if(keys.length == 0){
    outAngles = [];
  }else if(inAngle == undefined){
    let numAngles = keys.length;
    let spreadAngle = 2 * Math.PI / numAngles
    outAngles = map(i => i * spreadAngle, seq(numAngles))
  }else if(keys.length == 1){
    outAngles = [inAngle];
  }else{
    let numAngles = keys.length;
    let halfSpread = CHILD_SPREAD / 2;
    let startAngle = inAngle - halfSpread;
    let spreadAngle = CHILD_SPREAD / numAngles
    outAngles = map(i => startAngle + (i * spreadAngle), seq(0, numAngles - 1))
  }
  return outAngles;
}

function vertex_shape(key, p){
  return {type: 'vertex', id: key, x: p.x, y: p.y};
}

function edge_shape({p1, p2}){
  let edgeId = ''; // `(${p0.x}, ${p0.y})->(${p1.x}, ${p1.y})`;
  return {type: 'edge', id: edgeId, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y};
}

function siblings(graph, key){
  return graph.get(key);
}

function unarranged(keys, arranged){
  console.log(`unarranged([${keys}], [${arranged}])`);
  const f = k => !arranged.includes(k);
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

function add_shapes(state, shapes){
  newShapes = state.shapes.concat(shapes);
  return {shapes: newShapes};
}

function render({context: ctx, state: {h, w, frame, shapes}}){
  for(const shape of shapes){
    draw_shape(ctx, shape);
  }
  return {h: h, w: w, frame: frame, shapes: shapes};
}

function state_to_string(state){
  let output = '';
  let keys = state.arranged_keys.join();
  let conns = state.arranged_connections.map(connection_to_string).join();
  let shapes = state.shapes.map(shape_to_string).join();

  return `k: [${keys}]
c: [${conns}]
s: [${shapes}]`;
}

function shape_to_string(shape){
  if(shape.type === 'vertex'){
    return vertex_shape_to_string(shape);
  }else{
    return edge_shape_to_string(shape);
  }
}

function vertex_shape_to_string({id, x, y}){
  let point = {x: x, y: y};
  return `{vs:${id},${point_to_string(point)}}`;
}

function edge_shape_to_string({id, x1, y1, x2, y2}){
  let point1s = point_to_string({x: x1, y: y1});
  let point2s = point_to_string({x: x2, y: y2});
  return `{es:'${id}',${point1s},${point2s}}`;
}

function verteces_to_strings(verteces){
  return `vvs: ${verteces.map(vertex_to_string).join()}`;
}

function vertex_to_string({key, p0, p1, angle}){
  let angleString = angle.toString().substr(0,5);
  let p0s = '[undef]';
  if(p0 != undefined){
    p0s = point_to_string(p0);
  }
  let p1s = point_to_string(p1);
  return `{v:${key},${p0s},${p1s},<${angleString}}`;
}

function connection_to_string({p1, p2}){
  let p1String = point_to_string(p1);
  let p2String = point_to_string(p2);
  return `{${p1String}->${p2String}}`;
}

function point_to_string({x, y}){
  return `[${x},${y}]`;
}
