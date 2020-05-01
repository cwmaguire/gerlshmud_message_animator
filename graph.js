"use strict";

const VERTEX_RADIUS = 10;
const EDGE_LENGTH = 50;
const CHILD_SPREAD = 0.75 * Math.PI;

const GRAPH = new Map([[1, [2, 3, 4, 6]],
                       [2, [1, 3]],
                       [3, [1, 2, 7]],
                       [4, [1, 5, 7]],
                       [5, [4, 6, 7]],
                       [6, [1, 5]],
                       [7, [3, 4, 5, 8, 9, 10]],
                       [8, [7]],
                       [9, [7]],
                       [10, [6, 7]],
                      ]);

function scriptDesc(){
  return 'Draw a graph';
}

function should_clear(){
  return true;
}

function animate_graph(){
  const fps = cast(elem('fps').value, 'int');
  const frameLimit = cast(elem('frameLimit').value, 'int');
  const shouldClear = true;
  const initState = init();
  animation.animate(initState, render, frameLimit, fps, shouldClear);
}

function init(){
  const c = elem('canvas1');
  const ctx = c.getContext('2d');
  const h = c.height;
  const w = c.width;
  const {shapes} = arrange_shapes(GRAPH, c.width, c.height);
  const renderingState = {h: h, w: w, frame: 0, shapes: shapes};
  add_controls(w, h);
  return renderingState;
}

function arrange_shapes(graph, w, h){
  const xCenter = Math.floor(w/2);
  const yCenter = Math.floor(h/2);
  const p = {x: xCenter, y: yCenter};
  const [originKey] = graph.keys();
  const parentKey = undefined;
  const parentPoint = undefined;
  const parentAngle = undefined;
  const originVertex = {key: originKey,
                        pkey: parentKey,
                        p0: parentPoint,
                        p1: p,
                        angle: parentAngle};

  const state = {arranged_keys: [],
                 arranged_connections: [],
                 shapes: [],
                 key_vertex_points: new Map([[originKey, p]]),
                 w: w,
                 h: h,
                 graph: graph}

  return arrange_shapes_(state, [originVertex]);
}

function arrange_shapes_(state, vertices){

  if(vertices.length == 0){ return state; }

  const [vertex, ...rest] = vertices;
  const {key: key, pkey: pkey, p0: p0, p1: p1, angle: angle} = vertex;
  const nextVertices = next_vertices(key, p1, angle, rest, state);

  let newConnection = {p1: p0, p2: p1, k1: pkey, k2: key};
  const vertexExists = state.arranged_keys.includes(key)
  if(!vertexExists){
    state.arranged_keys.unshift(key);
    state.shapes.unshift(vertex_shape(key, pkey, p1));
    state.key_vertex_points.set(key, p1);
  }else{
    const preexistingVertexPoint = state.key_vertex_points.get(key);
    newConnection = {p1: p0, p2: preexistingVertexPoint, k1: pkey, k2: key};
  }

  const isOriginVertex = p0 == undefined;
  const connectionExists = does_connection_exist(state.arranged_connections, newConnection);
  if(!isOriginVertex && !connectionExists){
    state.arranged_connections.unshift(newConnection);
    state.shapes.unshift(edge_shape(newConnection));
  }

  const backConnections = back_connections(key, state);
  const backShapes = backConnections.map(edge_shape);
  state.shapes = backShapes.concat(state.shapes);

  console.log(`${key} (${pkey}): ${state.graph.get(key).join()}`);
  console.log(`${state_to_string(state)}`);
  console.log(`${vertices_to_strings(nextVertices)}`);
  console.log('');

  return arrange_shapes_(state, nextVertices);
}

function next_vertices(key, point, angle, vertices, state){
  const siblingKeys = siblings(state.graph, key);
  const unarrangedKeys = unarranged(siblingKeys, state.arranged_keys);
  const unqueuedKeys = unqueued(unarrangedKeys, vertices);
  const keyAngles = key_angles(unqueuedKeys, angle);
  const siblingKeyAngles = zip(unqueuedKeys, keyAngles);
  const vertexFun = vertex_fun(state.w, state.h, key, point);
  const newVertices = map(vertexFun, siblingKeyAngles);
  const nextVertices = vertices.concat(newVertices);
  return nextVertices;
}

function back_connections(key, state){
  const siblingKeys = siblings(state.graph, key);
  const arrangedKeys = arranged(siblingKeys, state.arranged_keys);
  function connection_(k2){
    return connection(k2, key, state);
  }
  const connections = arrangedKeys.map(connection_);
  function exists(c1) {
    function connection_equals(c2){
      return points_equal(c1.p1, c2.p1) &&
             points_equal(c1.p2, c2.p2) &&
             c1.k1 == c2.k1 &&
             c1.k2 == c2.k2;
    }
    return !state.arranged_connections.some(connection_equals);
  }
  return connections.filter(exists);
}

function connection(key1, key2, state){
  const p1 = state.key_vertex_points.get(key1);
  const p2 = state.key_vertex_points.get(key2);
  const p1s = p1 == undefined ? '_' : point_to_string(p1);
  const p2s = p2 == undefined ? '_' : point_to_string(p2);
  return {p1: p1, p2: p2, k1: key1, k2: key2};
}


function does_connection_exist(connections, conn1){
  function conns_equal(conn0){
    return points_equal(conn0.p1, conn1.p1) && points_equal(conn0.p2, conn1.p2);
  }
  return connections.some(points_equal);
}

function points_equal(p1, p2){
  return p1.x == p2.x && p1.y == p2.y;
}

function vertex_fun(w, h, pkey, p0){
  return function([key, angle]){
    let {x: x, y: y} = point_from_angle(angle, p0, EDGE_LENGTH);
    return {key: key, pkey: pkey, p0: p0, p1: {x: Math.floor(x), y: Math.floor(y)}, angle: angle}
  }
}

function key_angles(keys, inAngle){
  let outAngles;
  if(keys.length == 0){
    outAngles = [];
  }else if(inAngle == undefined){
    const numAngles = keys.length;
    const spreadAngle = 2 * Math.PI / numAngles
    outAngles = map(i => i * spreadAngle, seq(numAngles))
  }else if(keys.length == 1){
    outAngles = [inAngle];
  }else{
    const numAngles = keys.length;
    const halfSpread = CHILD_SPREAD / 2;
    const startAngle = inAngle - halfSpread;
    const spreadAngle = CHILD_SPREAD / numAngles
    outAngles = map(i => startAngle + (i * spreadAngle), seq(0, numAngles - 1))
  }
  return outAngles;
}

function vertex_shape(key, pkey, p){
  return {type: 'vertex', id: key, pkey: pkey, x: p.x, y: p.y};
}

function edge_shape({p1, p2, k1, k2}){
  let edgeId = ''; // `(${p0.x}, ${p0.y})->(${p1.x}, ${p1.y})`;
  return {type: 'edge', id: edgeId, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, k1: k1, k2: k2};
}

function siblings(graph, key){
  return graph.get(key);
}

function arranged(keys, arranged){
  const f = k => arranged.includes(k);
  let arrangedKeys = keys.filter(f);
  return arrangedKeys;
}

function unarranged(keys, arranged){
  const f = k => !arranged.includes(k);
  let unarrangedKeys = keys.filter(f);
  return unarrangedKeys;
}

function unqueued(keys, queuedVertices){
  const queuedKeys = queuedVertices.map(v => v.key);
  const f = (k => !queuedKeys.includes(k));
  const unqueuedKeys = keys.filter(f);
  return unqueuedKeys;

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
  if(shapes instanceof Array){
    console.log(`shapes (${shapes}) is an Array`);
  }
  console.log(`${shapes[0]}`);
  function spread_shapes_(shape){
    spread_shapes(shapes, shape);
  }
  shapes.filter(({type}) => type == 'vertex').map(spread_shapes_);
  function draw_shape_(shape){
    draw_shape(ctx, shape);
  }
  shapes.map(draw_shape_);
  return {h: h, w: w, frame: frame, shapes: shapes};
}

function is_edge({type}){
  return type == 'edge';
}

function is_vertex({type}){
  return type == 'vertex';
}

function spread_shapes(shapes, v1){
  const edges = shapes.filter(is_edge);
  const vertices = shapes.filter(is_vertex);
  var i = 1;

  function overlaps(edge){
    console.log(`Overlaps ${i} ${edge.id}\n\n`);
    i += 1;

    const otherVertices = subtract_vertices_by_id(vertices, [edge.k1, edge.k2]);
    console.log(`${otherVertices.map(x => x.id)}`);
    const [v1] = vertices.filter(({id}) => id == edge.k1);
    const [v2] = vertices.filter(({id}) => id == edge.k2);

    function does_overlap_(vertex){
      return does_overlap(v1, v2, vertex);
    }
    return {edge: edge, vertices: otherVertices.filter(does_overlap_)};
  }

  const allOverlaps = edges.map(overlaps)
  console.log(`Overlaps: [${allOverlaps.map(edge_overlaps_to_string).join()}]`);
}

function edge_overlaps_to_string({edge: {k1, k2}, vertices}){
  return `${k1}-${k2}: [${vertices.map(({id}) => id).join()}]`;
}

function subtract_vertices_by_id(vs, ids){
  return vs.filter(({id}) => !ids.includes(id));
}

function flatten(arrayOfArrays){
  return arrayOfArrays.reduce((a, acc) => acc.concat(a), []);
}

function does_overlap(edgeVertex1, edgeVertex2, maybeOverlappedVertex){
  const ev1 = edgeVertex1;
  const ev2 = edgeVertex2;
  const ov = maybeOverlappedVertex;

  const r = VERTEX_RADIUS;

  const SAME_Y = ev1.y == ov.y;
  const SAME_X = ev1.x == ov.x;

  const EV_ABOVE_OV = ev1.y < ov.y;
  const EV_BELOW_OV = ev1.y > ov.y;
  const EV_LEFT_OF_OV = ev1.x < ov.x;
  const EV_RIGHT_OF_OV = ev1.x < ov.x;

  const EV_DIRECTLY_ABOVE_OV = SAME_X && EV_ABOVE_OV;
  const EV_DIRECTLY_BELOW_OV = SAME_X && EV_BELOW_OV;
  const EV_DIRECTLY_LEFT_OF_OV = SAME_Y && EV_LEFT_OF_OV;
  const EV_DIRECTLY_RIGHT_OF_OV = SAME_Y && EV_RIGHT_OF_OV;

  const OV_IN_QUAD_1 = EV_BELOW_OV && EV_LEFT_OF_OV;
  const OV_IN_QUAD_2 = EV_BELOW_OV && EV_RIGHT_OF_OV;
  const OV_IN_QUAD_3 = EV_ABOVE_OV && EV_RIGHT_OF_OV;
  const OV_IN_QUAD_4 = EV_ABOVE_OV && EV_LEFT_OF_OV;

  const ABS_X = Math.abs(ev1.x - ov.x);
  const ABS_Y = Math.abs(ev1.y - ov.y);

  const ANGLE_EV_TO_OV = Math.atan(ABS_Y / ABS_X);

  const OV_PLUS_R_XD = r * Math.sin(ANGLE_EV_TO_OV);
  const OV_PLUS_R_YD = r * Math.cos(ANGLE_EV_TO_OV);

  const OV_X_1 = ABS_X + OV_PLUS_R_XD;
  const OV_Y_1 = ABS_Y - OV_PLUS_R_YD;
  const OV_X_2 = ABS_X - OV_PLUS_R_XD;
  const OV_Y_2 = ABS_Y + OV_PLUS_R_YD;

  let angleOv1;
  let angleOv2;

  if(EV_DIRECTLY_BELOW_OV){
      angleOv1 = Math.atan(ABS_Y / r);
      angleOv2 = Math.atan(r / ABS_Y);
  }else if(EV_DIRECTLY_ABOVE_OV){
      angleOv1 = Math.atan(ABS_Y / r) + Math.PI;
      angleOv2 = Math.atan(r / ABS_Y) + (Math.PI * 1.5);
  }else if(EV_DIRECTLY_RIGHT_OF_OV){
      angleOv1 = Math.atan(ABS_X / r) + (Math.PI / 2);
      angleOv2 = Math.atan(r / ABS_X) + Math.PI;
  }else if(EV_DIRECTLY_LEFT_OF_OV){
      angleOv1 = Math.atan(ABS_X / r) + (Math.PI * 1.5);
      angleOv2 = Math.atan(r / ABS_X) + Math.PI;
  }else if(OV_IN_QUAD_1){
    if(OV_Y_1 < 0){
      angleOv1 = 2 * Math.PI - (Math.atan(-OV_Y_1 / OV_X_1));
    }else{
      angleOv1 = Math.atan(OV_Y_1 / OV_X_1);
    }
    if(OV_X_2 < 0){
      angleOv2 = (Math.PI / 2) + (Math.atan(OV_Y_2 / -OV_X_2));
    }else{
      angleOv2 = Math.atan(OV_Y_2 / OV_X_2);
    }
  }else if(OV_IN_QUAD_2){
    if(OV_Y_1 < 0){
      angleOv1 = Math.PI + (Math.atan(-OV_Y_1 / OV_X_1));
    }else{
      angleOv1 = Math.atan(OV_Y_1 / OV_X_1);
    }
    if(OV_X_2 < 0){
      angleOv2 = (Math.PI / 2) - (Math.atan(OV_Y_2 / -OV_X_2));
    }else{
      angleOv2 = Math.atan(OV_Y_2 / OV_X_2);
    }
  }else if(OV_IN_QUAD_3){
    if(OV_Y_1 < 0){
      angleOv1 = Math.PI - (Math.atan(-OV_Y_1 / OV_X_1));
    }else{
      angleOv1 = Math.atan(OV_Y_1 / OV_X_1);
    }
    if(OV_X_2 < 0){
      angleOv2 = (3 * Math.PI / 2) + (Math.atan(OV_Y_2 / -OV_X_2));
    }else{
      angleOv2 = Math.atan(OV_Y_2 / OV_X_2);
    }
  }else if(OV_IN_QUAD_4){
    if(OV_Y_1 < 0){
      angleOv1 = Math.atan(-OV_Y_1 / OV_X_1);
    }else{
      angleOv1 = Math.atan(OV_Y_1 / OV_X_1);
    }
    if(OV_X_2 < 0){
      angleOv2 = (3 * Math.PI / 2) - (Math.atan(OV_Y_2 / -OV_X_2));
    }else{
      angleOv2 = Math.atan(OV_Y_2 / OV_X_2);
    }
  }

  let angleEv1Ev2;

  const ABS_EV2_X = Math.abs(ev1.x - ev2.x);
  const ABS_EV2_Y = Math.abs(ev1.y - ev2.y);

  const SAME_EV1_EV2_X = ev1.x == ev2.x;
  const SAME_EV1_EV2_Y = ev1.y == ev2.y;

  const EV1_ABOVE_EV2 = ev1.y < ev2.y;
  const EV1_BELOW_EV2 = ev1.y > ev2.y;
  const EV1_LEFT_OF_EV2 = ev1.x < ev2.x;
  const EV1_RIGHT_OF_EV2 = ev1.x < ev2.x;

  const EV1_DIRECTLY_ABOVE_EV2 = SAME_EV1_EV2_X && EV1_ABOVE_EV2;
  const EV1_DIRECTLY_BELOW_EV2 = SAME_EV1_EV2_X && EV1_BELOW_EV2;
  const EV1_DIRECTLY_LEFT_OF_EV2 = SAME_EV1_EV2_Y && EV1_LEFT_OF_EV2;
  const EV1_DIRECTLY_RIGHT_OF_EV2 = SAME_EV1_EV2_Y && EV1_RIGHT_OF_EV2;

  const ABS_EV1_EV2_X = Math.abs(ev1.x - ev2.x);
  const ABS_EV1_EV2_Y = Math.abs(ev1.y - ev2.y);

  const EV2_IN_QUAD_1 = EV1_BELOW_EV2 && EV1_LEFT_OF_EV2;
  const EV2_IN_QUAD_2 = EV1_BELOW_EV2 && EV1_RIGHT_OF_EV2;
  const EV2_IN_QUAD_3 = EV1_ABOVE_EV2 && EV1_RIGHT_OF_EV2;
  const EV2_IN_QUAD_4 = EV1_ABOVE_EV2 && EV1_LEFT_OF_EV2;

  if(EV1_DIRECTLY_ABOVE_EV2){
    angleEv1Ev2 = Math.PI * 1.5;
  }else if(EV1_DIRECTLY_BELOW_EV2){
    angleEv1Ev2 = Math.PI / 2;
  }else if(EV1_DIRECTLY_RIGHT_OF_EV2){
    angleEv1Ev2 = Math.PI;
  }else if(EV1_DIRECTLY_LEFT_OF_EV2){
    angleEv1Ev2 = 0;
  }else if(EV2_IN_QUAD_1){
    angleEv1Ev2 = Math.atan(ABS_EV2_Y / ABS_EV2_X);
  }else if(EV2_IN_QUAD_2){
    angleEv1Ev2 = Math.PI - Math.atan(ABS_EV2_Y / ABS_EV2_X);
  }else if(EV2_IN_QUAD_3){
    angleEv1Ev2 = Math.PI + Math.atan(ABS_EV2_Y / ABS_EV2_X);
  }else if(EV2_IN_QUAD_4){
    angleEv1Ev2 = (2 * Math.PI) - Math.atan(ABS_EV2_Y / ABS_EV2_X);
  }

  var isOverlapping;

  if(Math.abs(angleOv1 - angleOv2) > Math.PI){
    isOverlapping = angleEv1Ev2 < angleOv2 || angleEv1Ev2 > angleOv1;
  }else{
    isOverlapping = angleOv1 < angleEv1Ev2 && angleOv2 > angleEv1Ev2;
  }

  return isOverlapping;
}

function point_delta({x: x1, y: y1}, {x: x2, y: y2}){
  return [Math.abs(x1 - x2), Math.abs(y1 - y2)];
}

function state_to_string(state){
  const keys = state.arranged_keys.join();
  const kvps = [...state.key_vertex_points.entries()].map(kvp_to_string).join();
  const conns = state.arranged_connections.map(connection_to_string).join();
  const shapes = state.shapes.map(shape_to_string).join();

  return `k: [${keys}]
p: [${kvps}]
c: [${conns}]
s: [${shapes}]`;
}

function kvp_to_string([key, point]){
  const pointString = point == undefined ? '_' : point_to_string(point);
  return `{${key}, ${pointString}}`;
}

function shape_to_string(shape){
  if(shape.type === 'vertex'){
    return vertex_shape_to_string(shape);
  }else{
    return edge_shape_to_string(shape);
  }
}

function vertex_shape_to_string({id, pkey, x, y}){
  const point = {x: x, y: y};
  return `{vs:${id},${pkey},${point_to_string(point)}}`;
}

function edge_shape_to_string({id, x1, y1, x2, y2, k1, k2}){
  const point1s = point_to_string({x: x1, y: y1});
  const point2s = point_to_string({x: x2, y: y2});
  return `{es:${k1}-${k2},${point1s},${point2s}}`;
}

function vertices_to_strings(vertices){
  return `v: ${vertices.map(vertex_to_string).join()}`;
}

function vertex_to_string({key, pkey, p0, p1, angle}){
  const angleString = angle.toString().substr(0,5);
  let p0s = '[undef]';
  if(p0 != undefined){
    p0s = point_to_string(p0);
  }
  const p1s = point_to_string(p1);
  return `{v:${key},${pkey},${p0s},${p1s},<${angleString}}`;
}

function connection_to_string({p1, p2, k1, k2}){
  const k1s = k1 == undefined ? '_' : k1;
  const k2s = k2 == undefined ? '_' : k2;
  const p1s = p1 == undefined ? '_' : point_to_string(p1);
  const p2s = p2 == undefined ? '_' : point_to_string(p2);
  return `{${k1s}->${k2s}|${p1s}->${p2s}}`;
}

function point_to_string({x, y}){
  return `[${x},${y}]`;
}
