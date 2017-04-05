'use strict';

var ExpeditiousEngine = module.exports = function ExpeditiousEngine () {};

ExpeditiousEngine.prototype.getNamespaceFromKey = function (key) {
  return key.match(/^[a-z0-9]*/)[0];
};

ExpeditiousEngine.prototype.getKeyWithoutNamespace = function (key) {
  return key.match(/\:(.*)/)[1];
};

ExpeditiousEngine.prototype.get = function (key, callback) {
  callback(
    new Error('engine has not implemented the "get" function'),
    null
  );
};

ExpeditiousEngine.prototype.set = function (key, val, expire, callback) {
  callback(
    new Error('engine has not implemented the "set" function'),
    null
  );
};

ExpeditiousEngine.prototype.del = function (key, callback) {
  callback(
    new Error('engine has not implemented the "del" function'),
    null
  );
};

ExpeditiousEngine.prototype.flush = function (namespace, callback) {
  callback(
    new Error('engine has not implemented the "flush" function'),
    null
  );
};

ExpeditiousEngine.prototype.keys = function (namespace, callback) {
  callback(
    new Error('engine has not implemented the "keys" function'),
    null
  );
};

ExpeditiousEngine.prototype.ttl = function (key, callback) {
  callback(
    new Error('engine has not implemented the "ttl" function'),
    null
  );
};
