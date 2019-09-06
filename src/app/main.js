var top = document.getElementById("top");
var bottom = document.getElementById("bottom");

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

var simulateTouchEvent = function(eventType, e, element) {
  try {
    let touchEvent = new TouchEvent(eventType, {
      touches: e.touches,
      targetTouches: e.targetTouches,
      changedTouches: e.changedTouches
    });
    touchEvent.fromBorder = true;
    element.dispatchEvent(touchEvent);
  } catch (err) {
    let touchEvent = document.createEvent("Event");
    touchEvent.initEvent(eventType, true, true);
    touchEvent.touches = e.touches;
    touchEvent.targetTouches = e.targetTouches;
    touchEvent.changedTouches = e.changedTouches;
    touchEvent.fromBorder = true;
    element.dispatchEvent(touchEvent);
  }
};

top.addEventListener("mousedown", function(e) {
  stopPropagation(e);
  console.log("mousedown", e.target);
});

top.addEventListener("touchstart", function(e) {
  stopPropagation(e);
  console.log("touch start", e.target);
  simulateTouchEvent("touchstart", e, bottom);
});

bottom.addEventListener("mousedown", function(e) {
  stopPropagation(e);
  console.log("mousedown", e.target);
});

bottom.addEventListener("touchstart", function(e) {
  stopPropagation(e);
  console.log("touch start", e.target);
});
