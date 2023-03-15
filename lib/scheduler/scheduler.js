let dirtyDeps = [];
let update_scheduled = false;
const resolved_promise = Promise.resolve();
let flushidx = 0;
function updateDeps(depsArr) {
  let needUpdate = false;
  depsArr.forEach(deps => {
    if (deps) {
      needUpdate = true;
      deps.forEach(dep => {
        if (!dirtyDeps.includes(dep)) {
          dirtyDeps.push(dep);
        }
      })
    }
  })
  if (needUpdate) {
    schedule_update();
  }
}
const needRemovedWatchers = [];
function updateWatcher(watcher) {
  if (watcher.removed) {
    needRemovedWatchers.push(watcher);
  } else if (watcher.host.$phase !== 'destroyed') {
    watcher.host._checkSingleWatch(watcher);
  }
}
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function update_immediately() {
  flush();
}
function flush() {
  // Do not reenter flush while dirty components are updated, as this can
  // result in an infinite loop. Instead, let the inner flush handle it.
  // Reentrancy is ok afterwards for bindings etc.
  if (flushidx !== 0) {
      return;
  }
  do {
      // first, call beforeUpdate functions
      // and update components
      try {
          while (flushidx < dirtyDeps.length) {
              const dirtyDep = dirtyDeps[flushidx];
              flushidx++;
              updateWatcher(dirtyDep);
          }
      }
      catch (e) {
          // reset dirty state to not end up in a deadlocked state and then rethrow
          dirtyDeps.length = 0;
          flushidx = 0;
          throw e;
      }
      dirtyDeps.length = 0;
      flushidx = 0;
  } while (dirtyDeps.length);
  update_scheduled = false;
}

module.exports = {
  update_immediately,
  updateDeps,
};