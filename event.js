"use strict";

function graph_from_links(links){
  return links.reduce(add_link, new Map());
}

function add_link(map, {source, target}){
  if(map.has(source) && !has_target(map, source, target)){
    map.get(source).push(target);
  }else if(!map.has(source)){
    map.set(source, [target]);
  }
  return map
}

function has_target(map, source, target){
  return map.get(source).includes(target);
}

function filter_events(events){
  let filters = [has_type, not_link, not_populate];
  return filters.reduce(apply_filter, events);
}

function apply_filter(acc, filter){
  return acc.filter(filter);
}

function has_type(obj){
  return obj.hasOwnProperty('event_type');
}

function not_link(obj){
  return !is_link(obj);
}

function is_link(obj){
  return obj.hasOwnProperty('event_type') && obj.event_type == 'link';
}

function not_populate(obj){
  return !obj.hasOwnProperty('event_type') || obj.event_type != 'populate';
}

function link_events(events){
  return events.filter(is_link).map(format_link);
}

function drawable_event({pid, process}){
  if(pid == undefined){
    pid = process;
  }
  const point = keyPoints.get(pid);
  return {pid: pid, point: point};
}

function strip_pid(pid){
  let re = /<0\.(\d+)\.0>/;
  let match = re.exec(pid);
  return match[1];
}

function format_link({source, target}){
  return {source: strip_pid(source), target: strip_pid(target)};
}
