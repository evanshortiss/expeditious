expeditious
===========
![TravisCI](https://travis-ci.org/evanshortiss/expeditious.svg) [![npm version](https://badge.fury.io/js/expeditious.svg)](https://badge.fury.io/js/expeditious) [![Coverage Status](https://coveralls.io/repos/github/evanshortiss/expeditious/badge.svg?branch=master)](https://coveralls.io/github/evanshortiss/expeditious?branch=master)

expeditious is a generic caching API that can read/write key value pairs
from/to compatible caching "engines". Engines enable you to easily switch cache
storage providers e.g from in node.js memory cache to redis, if desired.


## Install
You know the drill...

```
npm install expeditious --save
```

## Example

```js
var expeditious = require('expeditious');

var words = expeditious({
  namespace: 'words',
  engine: require('expeditious-engine-memory')(),
  defaultTtl: (60 * 1000)
});

words.set({
  key: 'fáilte',
  value: 'An Irish Gaelic word meaning "hello"'
}, function (err) {
  if (err) {
    console.error('failed to set item in the words cache');
  } else {
    console.log('added an item to the words cache')
  }
});
```

## Debugging
If you need some debug logging from this module then it can be enabled using
a `DEBUG` environment variable. This is because we use the `debug` module for
logging.

Here's the general format:

```
export DEBUG=expeditious@$EXPEDITIOUS_VERSION-$NAMESPACE
```

For example, if you were using expeditious 0.2.0 had a logger with the namespace
_users_ then the following would allow it to write debug logs:

```
export DEBUG=expeditious@0.2.0-users
```

Alternatively you can enable logging for all 0.2.0 loggers like so:

```
export DEBUG=expeditious@0.2.0-*
```

## API

### expeditious.ExpeditiousEngine
The base class/constructor that can be used to create your own engines. More
info is provided below in the _Custom Storage Engines_ section.

### expeditious(opts)
_require-ing_ expeditious returns a factory function that can be called to
create an expeditious instance. _opts_ must be an Object and can contain the
following keys:

* namespace  ([String] Required) - namespace for keys. Used to avoid clashes
with other expeditious instances that might be using the same _opts.engine_.
* engine     ([String] Required) - _ExpeditiousEngine_ that communicates with
the underlying cache datastore
* defaultTtl ([Number] Required) - number of milliseconds to wait before
considering an entry expired
* objectMode ([Boolean] Optional) - Determines if this expeditious instance
should automatically attempt to _JSON.parse_ and _JSON.stringify_ entries on
_set_ and _get_ calls. This will be performed safely, so if an exception occurs
it will be returned as the _err_ param.

### instance
Every instance function accepts a params Object. set/get/del/ttl functions require _params.key_. Each function
accepts a callback that is called with the typical _fn(err, res)_ pattern in
node.js.

#### instance.set(params[, callback])
Set an item in the underlying cache store, having an optional callback
triggered on success or failure. _params.key_ should be a String and
_params.val_ should be an Object or String depending on the _objectMode_ flag.

#### instance.get(params, callback)
Get an item from the cache. _params_ requires a _key_ option that should be a
String.

#### instance.keys(params, callback)
Fetch all keys in the cache. No params are supported yet, but we include it for
future support.

#### instance.ttl(params, callback)
Get the remaining milliseconds before the cache entry identified by
_params.key_ expires. Returns null as the result if _params.key_ does not exist.

#### instance.flush(params[, callback])
Flush all keys from the cache. Similar to _instance.keys_, no params are
supported yet, but we include it for future support.

#### instance.del(params[, callback])
Delete a cache entry identified by _params.key_. Callback will be passed an
Error if one occurred.


## Examples

### String Mode
By default expeditious expects to receive String values to _set_ calls, and it
will return _String_ values too. An example is below:

```js
var expeditious = require('expeditious');

var words = expeditious({
  // Namespace cache entries to minimise (hopefully completely avoid) conflicts
  namespace: 'words',

  // The engine used to cache items. Here we use an engine that stores
  // items in process memory - in production you might use redis etc.
  engine: require('expeditious-engine-memory')(),

  // The default timeout for items written to cache. 1 minute here (60 seconds)
  defaultTtl: (60 * 1000)
});

words.set({
  key: 'fáilte',
  value: 'An Irish Gaelic word meaning "hello"'
}, onItemSet);

function onItemSet (err) {
  if (err) {
    console.log('failed to set definition for "fáilte"');
  } else {
    loadItem();
  }
}

function loadItem () {
  words.get({
    key: 'fáilte'
  }, function (err, definitionStr) {
    if (err) {
      console.error('hmm, we failed to load definition for "fáilte"');
    } else {
      console.log('here is definition for the word "fáilte"', definitionStr);
    }
  });
}
```

### Object Mode
Optionally you can enable _objectMode_ when using expeditious to have it
seamlessly convert items to and from JSON format as demonstrated below.

```js
var expeditious = require('expeditious');

var words = expeditious({
  namespace: 'words',
  engine: require('expeditious-engine-memory')(),
  defaultTtl: (60 * 1000),

  // Tells expeditious that items being "set" should be JSON.strigify-d and
  // "get" should be JSON.parse-d for this particular instance
  objectMode: true
});

// Add some data with the key "fáilte"
words.set({
  key: 'fáilte',
  value: {
    definition: 'An Irish Gaelic word meaning "hello"'
  }
}, onItemSet);

function onItemSet (err) {
  if (err) {
    console.log('failed to set data for "fáilte"');
  } else {
    // Load the item back from the cache
    loadItem();
  }
}

function loadItem () {
  words.get({
    key: 'fáilte'
  }, function (err, definitionJson) {
    if (err) {
      console.error('hmm, we failed to load json for "fáilte"');
    } else {
      console.log('here is json for the word "fáilte"', definitionJson);
    }
  });
}
```


## Storage Engines
An engine is an implementation of the _ExpeditiousEngine_ constructor.
Typically an engine will use a database, Redis, or process memory to store
data, but you can create an engine to store any data format.

### Existing Engines
Here's a list of existing engines that you can use right now:

* expeditious-engine-memory

### Custom Engines
You can create a custom engine by inheriting from _ExpeditiousEngine_ and
implementing the required functions. If a function is not implemented in your
subclass it will use the default behaviour of returning an error stating that
the called function is not implemented.

Below is an example of an incomplete custom engine. For the full prototype
definition see the [Engine constructor](https://github.com/evanshortiss/expeditious/blob/master/lib/expeditious-engine.js)

```js
var ExpeditiousEngine = require('expeditious').ExpeditiousEngine;
var util = require('util');

function CustomEngine (opts) {
  ExpeditiousEngine.call(this);

  this.entries = {};
}
util.inherits(CustomEngine, ExpeditiousEngine);

module.exports = CustomEngine;

CustomEngine.prototype.get = function (namespacedKey, callback) {
  /* get the value for the given key from the data store */
  callback(null, this.entries[namespacedKey].value);
};

CustomEngine.prototype.set = function (namespacedKey, val, exp, callback) {
  var self = this;

  self.entries[namespacedKey] = {
    value: val
  };

  setTimeout(function () {
    delete self.entries[namespacedKey];
  }, exp);

  // Cached successfully!
  callback(null);
};
```

## Contributing
Contributions are always welcome, just open a PR and add/fix tests for new/changed functionality. If you are unsure about a PR you have in mind, then open an issue for discussion.

## Changelog

* 1.0.0 - Initial stable release. No API changes from 0.2.0.
