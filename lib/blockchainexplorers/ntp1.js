'use strict';

var _ = require('lodash');
var $ = require('preconditions').singleton();
var log = require('npmlog');
log.debug = log.verbose;
var io = require('socket.io-client');
var requestList = require('./request-list');

function NPT1(opts) {
  $.checkArgument(opts);
  $.checkArgument(_.contains(['livenet', 'testnet'], opts.network));
  $.checkArgument(opts.url);

  this.apiPrefix = opts.apiPrefix || '/v3';
  this.network = opts.network || 'livenet';
  this.hosts = 'http://ntp1node.nebl.io:8080';
  this.userAgent = opts.userAgent || 'bws';
};


var _parseErr = function(err, res) {
  if (err) {
    log.warn('NTP1 error: ', err);
    return "NTP1 Error";
  }
  log.warn("NTP1 " + res.request.href + " Returned Status: " + res.statusCode);
  return "Error querying the NTP1";
};

NTP1.prototype._doRequest = function(args, cb) {
  var opts = {
    hosts: this.hosts,
    headers: {
      'User-Agent': this.userAgent,
    }
  };
  requestList(_.defaults(args, opts), cb);
};

NTP1.prototype.getAddressInfo = function(address, cb) {
  var args = {
    method: 'GET',
    path: this.apiPrefix + '/addressinfo/' + address,
    json: true,
  };

  this._doRequest(args, function(err, res, info) {
    if (err || res.statusCode !== 200) return cb(_parseErr(err, res));
    return cb(null, info);
  });
};

NTP1.prototype.initSocket = function() {

  // sockets always use the first server on the pull
  var socket = io.connect(_.first([].concat(this.hosts)), {
    'reconnection': true,
  });
  return socket;
};

module.exports = Insight;
