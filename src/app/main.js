var top = document.getElementById("top");
var bottom = document.getElementById("bottom");

bottom.addEventListener(
  "mousedown",
  function(e) {
    e.stopPropagation();
    console.log(e.target);
  },
  true
);

top.addEventListener(
  "mousedown",
  function(e) {
    e.stopPropagation();
    console.log(e.target);
  },
  true
);
