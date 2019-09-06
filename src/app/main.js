var top = document.getElementById("top");
var bottom = document.getElementById("bottom");

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

top.addEventListener(
  "mousedown",
  function(e) {
    e.stopPropagation();
    console.log(e.target);
  },
  true
);

top.addEventListener(
  "touchstart",
  function(e) {
    e.stopPropagation();
    console.log("touch start", e.target);
    simulateTouchEvent("touchstart", e, bottom);
  },
  true
);

bottom.addEventListener(
  "mousedown",
  function(e) {
    e.stopPropagation();
    console.log(e.target);
  },
  true
);

bottom.addEventListener(
  "touchstart",
  function(e) {
    e.stopPropagation();
    console.log("touch start", e.target);
  },
  true
);
