var eleTop = document.getElementById("top");
var eleBottom = document.getElementById("bottom");

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

eleTop.addEventListener("mousedown", function(e) {
  stopPropagation(e);
  printEvent(e);
});

eleBottom.addEventListener("mousedown", function(e) {
  stopPropagation(e);
  printEvent(e);
});

eleTop.addEventListener("touchstart", function(e) {
  stopPropagation(e);
  printEvent(e);
  simulateTouchEvent("touchstart", e, bottom);
});

eleBottom.addEventListener("touchstart", function(e) {
  stopPropagation(e);
  printEvent(e);
});
