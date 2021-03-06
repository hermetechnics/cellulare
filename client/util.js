// aint installing no lodash
// https://stackoverflow.com/a/27078401
export const throttle = (func, wait, options = {}) => {
  var context, args, result;
  var timeout = null;
  var previous = 0;

  var later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  return function() {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

// adding more human feel to the drumming
export const randomSwing = () => (Math.random() - 0.5) / 70;

export const chooseRandomlyFrom = list => list[Math.floor(Math.random() * list.length)];

export const range = function* (start, end, step = 1) {
  let index = start;
  while (index < end) {
    yield index;
    index++;
  }
}

export const toggleFullscreen = async () => {
  const elem = document.body;

  if (!document.fullscreenElement) {
    try {
      await elem.requestFullscreen();
    } catch(e) {
      console.error(e);
    }
  } else {
    document.exitFullscreen();
  }
}
