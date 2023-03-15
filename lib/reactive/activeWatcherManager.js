const activeWatchers = [];

const activeWatcherManager = {
    push(activeWatcher) {
        activeWatchers.push(activeWatcher);
        return activeWatcher;
    },
    pop() {
        return activeWatchers.pop();
    },
    get current() {
        return activeWatchers[activeWatchers.length - 1];
    }
}

try {
  if (window && window.de) {
    window.activeWatchers = activeWatchers;
    window.activeWatcherManager = activeWatcherManager;
  }
} catch (error) {
  
}

function ignoreTrackWrap(fn) {
  return function(...args) {
    activeWatcherManager.push(undefined);
    fn.apply(this, args);
    activeWatcherManager.pop();
  }
}

function runWithoutTrack(fn) {
  activeWatcherManager.push(undefined);
  fn();
  activeWatcherManager.pop();
}

module.exports = {
  activeWatchers,
  activeWatcherManager,
  runWithoutTrack,
  ignoreTrackWrap,
}