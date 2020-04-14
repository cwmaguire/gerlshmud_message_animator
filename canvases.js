"use strict";

let canvases = {
  canvasProps: ['height', 'width'],
  canvasStyleProps: ['top', 'left', 'height', 'width', 'border'],
  canvases: [{id: 'canvas1', canvas: {style: {}}},
             {id: 'canvas2', canvas: {style: {}}}],

  save_canvas_states:
    function(){
      for(let c of canvases.canvases){
        canvases.save_canvas_state(c);
      }
    },

  save_canvas_state:
    function ({id, canvas}){
      let c = elem(id);

      canvases.canvasStyle = {top: c.style.top,
                              left: c.style.left,
                              height: c.style.height,
                              width: c.style.width,
                              border: c.style.border};
      for(let p of canvases.canvasProps){
        canvas[p] = c[p];
      }
      for(let p of canvases.canvasStyleProps){
        canvas.style[p] = c.style[p];
      }
    },

  reset_canvases:
    function(){
      for(let c of canvases.canvases){
        canvases.reset_canvas(c);
      }
    },

  reset_canvas:
    function ({id, canvas}){
      let c = elem(id);
      for(let p of canvases.canvasProps){
        c[p] = canvas[p];
      }
      for(let p of canvases.canvasStyleProps){
        c.style[p] = canvas.style[p];
      }
    }
}

function out(field, text){
  document.getElementById(field).value = text;
}

function get_control_value(controlName, type){
  let e = elem(controlName);
  let value = cast(e.value, type);
  return value;
}
