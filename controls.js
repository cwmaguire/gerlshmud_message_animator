function add_controls(w, h){
  add_slider('child_spread', '0', '6.56', '0.032', CHILD_SPREAD);
  add_slider('vertex_radius', '0', '100', '1', VERTEX_RADIUS);
  add_slider('vertex_buffer_ratio', '0', '200', '0.1', VERTEX_BUFFER_RATIO);
  add_slider('angle_buffer', '0', '6.56', '0.032', ANGLE_BUFFER);
  add_slider('edge_length', '0', '200', '5', EDGE_LENGTH);
  add_slider('move_amount', '1', '200', '1', MOVE_AMOUNT);
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
  text.value = value;
  slider.addEventListener('change', sliderOnchange);

  controlSpan.appendChild(slider);
  controlSpan.appendChild(label);
  controlSpan.appendChild(text);
  controlSpan.appendChild(document.createElement('BR'));
}

function clear_controls(){
  let span = elem('controls');

  for(let i = span.children.length - 1; i >= 0 ; i--){
    let child = span.children[i];
    child.remove();
  }
}

function get_control_value(controlName, type='int'){
  let e = elem(controlName);
  let value = cast(e.value, type);
  return value;
}
