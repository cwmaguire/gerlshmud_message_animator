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

function clear_controls(){
  let span = elem('controls');

  for(let i = span.children.length - 1; i >= 0 ; i--){
    let child = span.children[i];
    child.remove();
  }
}

function get_control_value(controlName, type){
  let e = elem(controlName);
  let value = cast(e.value, type);
  return value;
}
