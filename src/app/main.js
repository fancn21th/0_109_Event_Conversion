var top = document.getElementById("top");
var bottom = document.getElementById("bottom");

var simulateTouchEvent = function(eventType, e, element) {
  console.log(JSON.stringify(e));
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
  printEvent(e);
});

top.addEventListener("touchstart", function(e) {
  stopPropagation(e);
  printEvent(e);
  simulateTouchEvent("touchstart", e, bottom);
});

bottom.addEventListener("mousedown", function(e) {
  stopPropagation(e);
  printEvent(e);
});

bottom.addEventListener("touchstart", function(e) {
  stopPropagation(e);
  printEvent(e);
});
