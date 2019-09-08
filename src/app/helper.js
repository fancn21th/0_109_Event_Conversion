var getEvent = function(event) {
  return event ? event : window.event;
};

var getTarget = function(event) {
  return event.target || event.srcElement;
};

var preventDefault = function(event) {
  if (event.preventDefault) {
    event.preventDefault();
  } else {
    event.returnValue = false;
  }
};

var stopPropagation = function(event) {
  if (event.stopPropagation) {
    event.stopPropagation();
  } else {
    event.cancelBubble = true;
  }
};

var printEvent = function(event) {
  console.log(
    "event type",
    event.type,
    " | ",
    "pointer type",
    event.pointerType,
    "element",
    getTarget(event)
  );
};
