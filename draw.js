function draw_shape(ctx, shape){
  let debug = 'draw_shape()';
  for(let prop in shape){
    debug += ` shape.${prop}: ${shape[prop]}`;
  }
  //console.log(debug);

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

  const textOffsetX = vertex.x - radius / 2 - 1;
  const textOffsetY = vertex.y + radius / 2 - 4;
  ctx.fillStyle = 'white';
  ctx.font = '8pt serif';
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
  ctx.font = '8pt serif';
  ctx.fillText(edge.id, textOffsetX, textOffsetY);
}

function draw_event(ctx, {id, x, y, w, h}){
  ctx.strokeStyle = 'black';

  ctx.strokeRect(x, y, w, h);

  const textOffsetX = x + 10;
  const textOffsetY = y + 10;
  //console.log(`Width: ${width}, textOffsetX: ${textOffsetX}, height: ${height}, textOffsetY: ${textOffsetY}`);
  ctx.fillStyle = 'black';
  ctx.font = '8pt serif';
  ctx.fillText(id, textOffsetX, textOffsetY);

}

function draw_move_line(ctx, p1, p2){
  ctx.strokeStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();
  ctx.stroke();

  const radius = 2;
  const rotation = 0;
  const startAngle = 0;
  const endAngle = Math.PI * 2;

  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.ellipse(p2.x, p2.y, radius, radius, rotation, startAngle, endAngle);
  ctx.closePath();
  ctx.fill();
}
