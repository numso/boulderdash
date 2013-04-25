var browserify = require('./browserify')
  , sleep      = require('sleep');

browserify.create(function () {
  sleep.sleep(10000000);
});
