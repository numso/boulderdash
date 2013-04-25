var stylus = require('stylus')
  , fs     = require('fs');

function log() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift("\033[0;32m" + "stylus:", "\033[m");
  console.log.apply(console, args);
}

var orig = process.cwd();
process.chdir('./public/styl/');

function compileFile(file, cb) {
  var str = fs.readFileSync(file, 'utf8');
  log('compiling', file);
  stylus(str)
    .render(function (err, css) {
      if (err) return cb(err);
      cb(null, css);
  });
}

function write(style) {
  process.chdir(orig)
  var outfile = './public/css/main.css';
  log('writing', outfile);
  fs.writeFileSync(outfile, style);
}

function create(cb) {
  log('starting stylus');

  cb = cb || function () {};
  compileFile('main.styl', function (err, css) {
    if (err) {
      log('ERROR');
      console.log('\n' + err);
      log('stylus failed');
      process.exit();
    }
    write(css);
    cb();
  });
}

exports.create = create;
