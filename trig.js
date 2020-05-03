function point_from_angle(angle, start, length){
  let x, y, point;
  if(angle == 0 || angle == Math.PI * 2){
    point = {x: start.x + length, y: start.y}
  }else if (angle < (Math.PI / 2)){
    point = quad_1_point(angle, start, length);
  }else if(angle == Math.PI / 2){
    point = {x: start.x, y: start.y - length}
  }else if(angle > (Math.PI / 2) && angle < Math.PI){
    point = quad_2_point(angle, start, length);
  }else if(angle == Math.PI){
    point = {x: start.x - length, y: start.y}
  }else if(angle > Math.PI && angle < (3 / 2 * Math.PI)){
    point = quad_3_point(angle, start, length);
  }else if(angle == (3 / 2 * Math.PI)){
    point = {x: start.x, y: start.y + length}
  }else if(angle > (3 / 2 * Math.PI)){
    point = quad_4_point(angle, start, length);
  }
  if(point == undefined){
    console.log(`point_from_angle(${angle}, ${start}, ${length}) - point is undefined`);
  }
  return point;
}


function quad_1_point(angle, start, length){
  xd = Math.cos(angle) * length;
  x = start.x + xd;
  yd = Math.sin(angle) * length;
  y = start.y - yd;
  return {x: x, y: y};
}

function quad_2_point(angle, start, length){
  xd = Math.cos(Math.PI - angle) * length;
  x = start.x - xd;
  yd = Math.sin(Math.PI - angle) * length;
  y = start.y - yd;
  return {x: x, y: y};
}

function quad_3_point(angle, start, length){
  xd = Math.cos(angle - Math.PI) * length;
  x = start.x - xd;
  yd = Math.sin(angle - Math.PI) * length;
  y = start.y + yd;
  return {x: x, y: y};
}

function quad_4_point(angle, start, length){
  xd = Math.cos(2 * Math.PI - angle) * length;
  x = start.x + xd;
  yd = Math.sin(2 * Math.PI - angle) * length;
  y = start.y + yd;
  return {x: x, y: y};
}
