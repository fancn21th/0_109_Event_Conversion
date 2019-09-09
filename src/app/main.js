var eleTop = document.getElementById("top");
var eleBottom = document.getElementById("bottom");
var previousTargets = {},
  lastHwTimestamp = 0,
  logToConsole = true,
  touchesWrapper,
  changedTouchesWrapper,
  targetTouchesWrapper;

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

function log(s) {
  if (logToConsole) {
    console.log(s.toString());
  }
}

function checkPreventDefault(node) {
  while (node && !node.handJobjs_forcePreventDefault) {
    node = node.parentNode;
  }
  return !!node || window.handJobjs_forcePreventDefault;
}

function TouchListWrapper() {
  var touchList = []; // an array of W3C compliant Touch objects.

  // constructor for W3C compliant touch object
  // http://www.w3.org/TR/touch-events/
  function Touch(
    identifier,
    target,
    screenX,
    screenY,
    clientX,
    clientY,
    pageX,
    pageY
  ) {
    this.identifier = identifier;
    this.target = target;
    this.screenX = screenX;
    this.screenY = screenY;
    this.clientX = clientX;
    this.clientY = clientY;
    this.pageX = pageX;
    this.pageY = pageY;
  }

  // Search the TouchList for a Touch with the given identifier.
  // If it is found, return it.  Otherwise, return null;
  function getTouch(identifier) {
    var i;
    for (i = 0; i < touchList.length; i += 1) {
      if (touchList[i].identifier === identifier) {
        return touchList[i];
      }
    }
  }

  // If this is a new touch, add it to the TouchList.
  // If this is an existing touch, update it in the TouchList.
  function addUpdateTouch(touch) {
    var i;
    for (i = 0; i < touchList.length; i += 1) {
      if (touchList[i].identifier === touch.identifier) {
        touchList[i] = touch;
        return;
      }
    }
    // If we finished the loop, then this is a new touch.
    touchList.push(touch);
  }

  function removeTouch(identifier) {
    var i;
    for (i = 0; i < touchList.length; i += 1) {
      if (touchList[i].identifier === identifier) {
        touchList.splice(i, 1);
      }
    }
  }

  function clearTouches() {
    // According to http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript
    // this is the fastest way to clear the array.
    while (touchList.length > 0) {
      touchList.pop();
    }
  }

  // Return true if the current TouchList object contains a touch at the specified screenX, clientY.
  // Returns false otherwise.
  // This is used to differentiate touches that have moved from those that haven't.
  function containsTouchAt(screenX, screenY) {
    var i;

    for (i = 0; i < touchList.length; i += 1) {
      if (
        touchList[i].screenX === screenX &&
        touchList[i].screenY === screenY
      ) {
        return true;
      }
    }

    return false;
  }

  // touchList is the actual W3C compliant TouchList object being emulated.
  this.touchList = touchList;

  this.Touch = Touch;
  this.getTouch = getTouch;
  this.addUpdateTouch = addUpdateTouch;
  this.removeTouch = removeTouch;
  this.clearTouches = clearTouches;
  this.containsTouchAt = containsTouchAt;
}

function ignorePointerEvent(event) {
  // Don't interpret mouse pointers as touches
  if (event.pointerType === "mouse") {
    return true;
  }
  // Don't interpret pointerdown events on the scrollbars as touch events.
  // It appears to be the case that when the event is on the scrollbar in IE,
  // event.x === 0 and event.y === 0
  if (event.type === "pointerdown" && event.x === 0 && event.y === 0) {
    return true;
  }
  // A user reported that when the input type is 'pen', the pointermove event fires with a pressure of 0
  // before the pen touches the screen.  We want to ignore this.
  if (
    event.pointerType === "pen" &&
    event.pressure === 0 &&
    event.type === "pointermove"
  ) {
    return true;
  }
  return false;
}

function generateTouchEventProxyIfRegistered(
  eventName,
  touchPoint,
  target,
  eventObject,
  canBubble,
  relatedTarget
) {
  generateTouchEventProxy(
    eventName,
    touchPoint,
    target,
    eventObject,
    canBubble,
    relatedTarget
  );
}

function generateTouchEventProxy(
  name,
  touchPoint,
  target,
  eventObject,
  canBubble,
  relatedTarget
) {
  generateTouchClonedEvent(touchPoint, name, canBubble, target, relatedTarget);
}

function generateTouchClonedEvent(
  sourceEvent,
  newName,
  canBubble,
  target,
  relatedTarget
) {
  var evObj, oldTouch, oldTarget;

  // Updates the targetTouches so that it contains the touches from the "touches" TouchList
  // that have the same target as the touch that triggered this event.
  function updateTargetTouches(thisTouchTarget, touchesTouchList) {
    var i, touch;

    targetTouchesWrapper.clearTouches();

    for (i = 0; i < touchesTouchList.length; i++) {
      touch = touchesTouchList[i];
      if (touch.target.isSameNode(thisTouchTarget)) {
        targetTouchesWrapper.addUpdateTouch(touch);
      }
    }
  }

  function touchHandler(event) {
    var eventType, oldTouch, touch, touchEvent, isTouchChanged;

    log("touch!");

    if (event.type === "pointerdown") {
      eventType = "touchstart";
    } else if (event.type === "pointermove") {
      eventType = "touchmove";
    } else {
      throw new Error(
        "touchHandler received invalid event type: " +
          eventType +
          ". Valid event types are pointerdown and pointermove"
      );
    }
    log(eventType);

    touch = new touchesWrapper.Touch(
      event.pointerId,
      event.type === "pointerdown" ? event.target : oldTarget,
      event.screenX,
      event.screenY,
      event.clientX,
      event.clientY,
      event.pageX,
      event.pageY
    );

    // Remove, from changedTouches, any Touch that is no longer being touched, or is being touched
    // in exactly the same place.
    // In order to make sure that simultaneous touches don't kick each other off of the changedTouches array
    // (because they are processed as different pointer events), skip this if the lastHwTimestamp hasn't increased.
    if (event.hwTimestamp > lastHwTimestamp) {
      (function() {
        var i, changedTouchList, changedTouch, matchingTouch, identifier;
        changedTouchList = changedTouchesWrapper.touchList;
        for (i = 0; i < changedTouchList.length; i += 1) {
          changedTouch = changedTouchList[i];
          identifier = changedTouch.identifier;
          matchingTouch = touchesWrapper.getTouch(identifier);

          if (
            !matchingTouch ||
            touchesAreAtSameSpot(matchingTouch, changedTouch)
          ) {
            changedTouchesWrapper.removeTouch(identifier);
          }
        }
      })();
    }

    log("generating touch cloned");

    touchesWrapper.addUpdateTouch(touch);
    changedTouchesWrapper.addUpdateTouch(touch);
    updateTargetTouches(touch.target, touchesWrapper.touchList);

    event.type = eventType;
    touchEvent = new CustomEvent(eventType, {
      bubbles: true,
      cancelable: true
    });

    touchEvent.touches = touchesWrapper.touchList;
    touchEvent.changedTouches = changedTouchesWrapper.touchList;
    touchEvent.targetTouches = targetTouchesWrapper.touchList;
    touchEvent.type = eventType;

    // Awesomely, I figured out how to keep track of the touches in the "Touches" TouchList using an array.
    // TODO: Do the same thing for the changedTouches and targetTouches properties of the TouchEvent.
    // TODONE! changedTouches is implemented.
    // TODONE! targetTouches is implemented.

    // The other members of the TouchEvent are altKey, metaKey, ctrlKey, and shiftKey

    return touchEvent;
  }

  function touchChangedHandler(event) {
    var eventType, touch, touchEvent;

    log("touchchanged!");
    event.changedTouches = [];
    event.changedTouches.length = 1;
    event.changedTouches[0] = event;
    event.changedTouches[0].identifier = event.pointerId;

    if (event.type === "pointerup") {
      eventType = "touchend";
    } else if (event.type === "pointercancel") {
      eventType = "touchcancel";
    } else if (event.type === "pointerleave") {
      eventType = "touchleave";
    }

    touch = new touchesWrapper.Touch(
      event.pointerId,
      oldTarget,
      event.screenX,
      event.screenY,
      event.clientX,
      event.clientY,
      event.pageX,
      event.pageY
    );

    // This is a new touch event if it happened at a greater time than the last touch event.
    // If it is a new touch event, clear out the changedTouches TouchList.
    if (event.hwTimestamp > lastHwTimestamp) {
      changedTouchesWrapper.clearTouches();
    }

    touchesWrapper.removeTouch(touch.identifier);
    changedTouchesWrapper.addUpdateTouch(touch);
    updateTargetTouches(touch.target, touchesWrapper.touchList);

    event.type = eventType;
    touchEvent = new CustomEvent(eventType, {
      bubbles: true,
      cancelable: true
    });
    touchEvent.touches = touchesWrapper.touchList;
    touchEvent.changedTouches = changedTouchesWrapper.touchList;
    touchEvent.targetTouches = targetTouchesWrapper.touchList;
    touchEvent.type = eventType;

    return touchEvent;
  }

  // An important difference between the MS pointer events and the W3C touch events
  // is that for pointer events except for pointerdown, all target the element that the touch
  // is over when the event is fired.
  // The W3C touch events target the element where the touch originally started.
  // Therefore, when these events are fired, we must make this change manually.
  if (sourceEvent.type !== "pointerdown") {
    oldTouch = touchesWrapper.getTouch(sourceEvent.pointerId);
    oldTarget = oldTouch.target;
    sourceEvent.target = oldTarget;
  }

  if (
    sourceEvent.type === "pointerdown" ||
    sourceEvent.type === "pointermove"
  ) {
    evObj = touchHandler(sourceEvent);
  } else {
    evObj = touchChangedHandler(sourceEvent);
  }

  // PreventDefault
  evObj.preventDefault = function() {
    if (sourceEvent.preventDefault !== undefined) {
      sourceEvent.preventDefault();
    }
  };

  // Fire event
  log("dispatching!");

  target.dispatchEvent(evObj);

  lastHwTimestamp = event.hwTimestamp;
}

(function() {
  touchesWrapper = new TouchListWrapper();
  changedTouchesWrapper = new TouchListWrapper();
  targetTouchesWrapper = new TouchListWrapper();

  // mouse down events
  // eleTop.addEventListener("mousedown", function(e) {
  //   stopPropagation(e);
  // });

  // eleBottom.addEventListener("mousedown", function(e) {
  //   stopPropagation(e);
  // });

  // touch start events
  // eleTop.addEventListener("touchstart", function(e) {
  //   console.log(e);
  //   stopPropagation(e);
  //   printEvent(e);
  // });

  eleBottom.addEventListener("touchstart", function(e) {
    stopPropagation(e);
    printEvent(e);
  });

  // touch move events
  eleBottom.addEventListener("touchmove", function(e) {
    stopPropagation(e);
    printEvent(e);
  });

  // pointer down events
  eleTop.addEventListener("pointerdown", function(eventObject) {
    stopPropagation(eventObject);
    var touchPoint = eventObject;
    if (ignorePointerEvent(eventObject)) {
      return;
    }
    // previousTargets[touchPoint.identifier] = touchPoint.target;
    generateTouchEventProxyIfRegistered(
      "touchstart",
      touchPoint,
      eleBottom,
      eventObject,
      true
    );
  });

  // pointer move events
  eleTop.addEventListener("pointermove", function(eventObject) {
    stopPropagation(eventObject);

    var touchPoint = eventObject,
      // currentTarget = previousTargets[touchPoint.identifier];
      currentTarget = touchPoint.target;

    if (ignorePointerEvent(eventObject)) {
      return;
    }
    // pointermove fires over and over when a touch-point stays stationary.
    // This is at odds with the other browsers that implement the W3C standard touch events
    // which fire touchmove only when the touch-point actually moves.
    // Therefore, return without doing anything if the pointermove event fired for a touch
    // that hasn't moved.
    if (
      touchesWrapper.containsTouchAt(eventObject.screenX, eventObject.screenY)
    ) {
      return;
    }

    // If force preventDefault
    if (currentTarget && checkPreventDefault(currentTarget) === true) {
      eventObject.preventDefault();
    }

    generateTouchEventProxyIfRegistered(
      "touchmove",
      touchPoint,
      eleBottom,
      eventObject,
      true
    );
  });
})();
