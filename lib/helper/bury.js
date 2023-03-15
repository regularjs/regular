const env = require('../env');
function isNullOrUndefined (obj) {
  return obj === null || typeof obj === 'undefined';
}

const buriedKeys = [];
const buriedTimeKeys = [];

function buryCount(key) {
  if (!buriedKeys.includes(key)) {
    buriedKeys.push(key);
  }
  window[key] = isNullOrUndefined(window[key]) ? 1 : window[key] + 1;
}
function buryTime(key, prev) {
    if (!buriedTimeKeys.includes(key)) {
      buriedTimeKeys.push(key);
    }
    if (isNullOrUndefined(window[key])) {
      window[key] = 0;
    }
    window[key] += Date.now() - prev;
}
if (env.browser) {
  window.show = function name(params) {
    buriedKeys.forEach(key => {
      console.log(key, window[key]);
    })
  }
  if (!window.showTime) {
    window.showTime = function (params) {
      let initial = 0;
      buriedTimeKeys.forEach(key => {
        initial += window[key] || 0
        console.log(key, window[key]);
      })
      console.log('all', initial);
    }
  }
}

module.exports = {
  buryCount,
  buryTime,
}
