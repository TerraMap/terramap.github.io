interface JQueryEventObject {
  deltaX?: number;
  deltaY?: number;
  deltaFactor?: number;
}

interface JQuery {
  mousewheel(handler: (event: JQueryEventObject) => void): JQuery;
  unmousewheel(handler: (event: JQueryEventObject) => void): JQuery;
}
