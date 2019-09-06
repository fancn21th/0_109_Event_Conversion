const { parallel, series, src, dest, watch } = require("gulp");
const inject = require("gulp-inject");
const del = require("del");
const browserSync = require("browser-sync").create();
const { buildPath, filesToWatch, filesToInject } = require("./gulpfile.config");

// INJECT TASK
function index(cb) {
  const target = src("./src/index.html");
  const sources = src(filesToInject, {
    read: false
  });
  return target
    .pipe(inject(sources, { ignorePath: "src" }))
    .pipe(dest(buildPath));
}

// COPY TASK
function copyCss(cb) {
  return src("./src/**/*.css").pipe(dest(buildPath));
}

function copyVendorJs(cb) {
  return src("./src/**/js/vendor/*.js").pipe(dest(buildPath));
}

function copyAppJs(cb) {
  return src("./src/**/app/**/*.js").pipe(dest(buildPath));
}

// CLEAN TASK
function clean(cb) {
  return del([buildPath], { force: true });
}

// BUILD TASK
const build = series(clean, parallel(copyVendorJs, copyAppJs, copyCss), index);

// RELOAD
function sync(cb) {
  browserSync.reload();
  cb();
}

// SERVE
function serve(cb) {
  // Serve files from the root of this project
  browserSync.init({
    server: {
      baseDir: buildPath
    }
  });

  watch(filesToWatch, { delay: 500 }, series(build, sync));
}

exports.build = build;
exports.default = series(build, index, serve);
