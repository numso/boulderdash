var browserify   = require('browserify')
  // , browserijade = require('browserijade')
  , fs           = require('fs');

function log() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift("\033[0;36m" + "browserify:", "\033[m");
  console.log.apply(console, args);
}

function create(cb, timeout) {
  log('browserify starting');

  timeout = timeout || 300;
  cb = cb || function () {};
  var t = setTimeout(finished, timeout);

  browserify()
    .on('error', function (err) {
      clearTimeout(t);
      log('ERROR');
      console.log(err.annotated + '\n');
      log('browserify failed!!');
      process.exit();
    })
    .require(require.resolve('../client/main.js'), { entry: true })
    // .external(browserijade('../test'))
    // .require('browserijade')
    .bundle({ debug: true })
    .pipe(fs.createWriteStream(__dirname + '/../public/js/app.js'));

  function finished() {
    log('browserify success!!');
    cb();
  }
}

exports.create = create;
