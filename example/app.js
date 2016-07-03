'use strict';

// expeditious itself - we use this to create instances for caching
var expeditious = require('../lib/cache.js');

// an in memory engine for expeditious
var memoryEngine = require('expeditious-engine-memory');

// Key we will use for caching; this example is simple so one key is fine
var CACHE_KEY = 'testkey';
var MAX_DELAY = 2000;

// Our cache instance, we use this perform read/write to the cache engine
var testCache = expeditious({
  namespace: 'testCache',
  defaultTtl: 1000,
  engine: memoryEngine()
});

// An example of a slow running function we don't want to wait for each time
function slowRunningFunction (callback) {
  setTimeout(function () {
    callback(null, 'test data');
  }, Math.random() * MAX_DELAY);
}

// Wrapper function that hits the cache before it hits a slow function
function getData (callback) {
  testCache.get(CACHE_KEY, function (err, value) {
    if (value) {
      callback(null, value);
      console.error('failed to get item from cache');
    } else {
      if (err) {
        console.warn('there was an error hitting the cache');
      }

      slowRunningFunction(callback);
    }
  });
}

function timedGetData () {
  var start = Date.now();

  getData(function onData (err, data) {
    if (err) {
      console.log('error getting data', err);
    } else {
      console.log('time to get data "%s" was', data, Date.now() - start);
    }
  });
}


getData(timedGetData);
setTimeout(timedGetData, MAX_DELAY);
