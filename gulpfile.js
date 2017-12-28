// ===================================================
// Settin'
// ===================================================

var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    $               = gulpLoadPlugins({
                        rename: {
                          'gulp-sourcemaps'  : 'sourcemaps',
                          'gulp-minify-css'  : 'mincss',
                          'gulp-minify-html' : 'minhtml',
                          'gulp-gh-pages'    : 'ghPages',
                          'gulp-foreach'     : 'foreach',
                          'gulp-mocha'       : 'mocha',
                          'gulp-if'          : 'if'
                        }
                      }),
    yaml            = require('js-yaml'),
    helpers         = require('handlebars-helpers'),
    expand          = require('expand')(),
    permalinks      = require('assemble-permalinks'),
    assemble        = require('assemble'),
    app             = assemble(),
    del             = require('del'),
    resolve         = require('path').resolve,
    merge           = require('merge-stream'),
    basename        = require('path').basename,
    extname         = require('path').extname;

$.exec   = require('child_process').exec;
$.fs     = require('fs');


// ===================================================
// Configin'
// ===================================================

var env_flag = true;

var asset_dir = {
  site: 'site',
  templates : 'templates',
  data: 'data',
  dist: 'dist',
  js: 'js',
  css: 'css',
  sass: 'src'
};

var path = {
  site: asset_dir.site,
  data: asset_dir.data,
  templates: asset_dir.site + '/' + asset_dir.templates,
  dist: asset_dir.dist,
  js: asset_dir.site + '/' + asset_dir.js,
  css: asset_dir.site + '/' + asset_dir.css,
  sass: asset_dir.site + '/' + asset_dir.css + '/' + asset_dir.sass
};

var glob = {
  html: path.site + '/*.html',
  css: path.css + '/*.css',
  sass: path.sass + '/**/*.scss',
  js: path.js + '/src/**/*.js',
  jslibs : path.js + '/lib/**/*.js',
  layouts: path.templates + '/layouts/*.{md,hbs}',
  pages: path.templates + '/pages/**/*.{md,hbs}',
  includes: path.templates + '/includes/**/*.{md,hbs}',
  data: path.data + '/**/*.{json,yaml}',
  rootData: ['site.yaml', 'package.json']
};


// ===================================================
// Developin'
// ===================================================

gulp.task('serve', ['assemble'], function() {
  $.connect.server({
    root: [path.site],
    port: 5000,
    livereload: true,
    middleware: function(connect) {
      return [
        connect().use(connect.query())
      ];
    }
  });

  $.exec('open http://localhost:5000');
});


// ===================================================
// Previewin'
// ===================================================

gulp.task('preview', function() {
  $.connect.server({
    root: [path.dist],
    port: 5001
  });

  $.exec('open http://localhost:5001');
});


// ===================================================
// Testin'
// ===================================================

gulp.task('mocha', function () {
  return gulp.src('test/*.js', {read: false})
    .pipe($.mocha({ reporter: 'nyan' }));
});


// ===================================================
// Stylin'
// ===================================================

// $.if(process.env.NODE_ENV === 'production', '')
gulp.task('sass', function() {
  var stream = gulp.src(glob.sass)
    .pipe($.if(env_flag === false, $.sourcemaps.init()))
    .pipe($.sass({
      outputStyle: $.if(env_flag === false, 'expanded', 'compressed')
    }))
    .pipe($.if(env_flag === false,
      $.sourcemaps.write({
        debug: true,
        includeContent: false,
        sourceRoot: path.css
      })
    ))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(path.css))
    .pipe($.connect.reload());

  return stream;
});


// ===================================================
// Templatin'
// ===================================================


// Loaders
// ================

// @info
// Load yaml files using a custom dataLoader.
app.dataLoader('yaml', function(str, fp) {
	return yaml.safeLoad(str);
});

function loadData() {
	app.data([glob.data, 'site.yaml', 'package.json'], { namespace: true });
	app.data(expand(app.cache.data));
}


// Permalinks
// ================

// @info
// Create a pages collection
app.create('pages').use(permalinks(':category:name.html', {
	category: function() {
		if (!this.categories) return '';
		var category = Array.isArray(this.categories) ? this.categories[0] : this.categories;
		return category ? category + '/' : '';
	}
}));


// Custom Helpers
// ================

// @info
// Custom helper for environment control w/compiling
app.helper('isEnv', function(env) {
	return process.env.NODE_ENV === env;
});

// @info
// Handlebars helper that iterates over an
// object of pages for a specific category
//
// @example
// {{#category "clients"}}
//   {{data.summary}}
// {{/category}}
app.helper('category', function(category, options) {
	var pages = this.app.get('categories.' + category);
	if (!pages) {
		return '';
	}

	return Object.keys(pages).map(function(page) {
		// this renders the block between
		// `{{#category}}` and `{{/category}}`
		// passing the entire page object as the context.
		return options.fn(pages[page]);
	}).join('\n');
});

app.helper('date', function() {
	var time_stamp = new Date();
	return time_stamp;
});


// Assemble Tasks
// ================

// @info
// Placing assemble setups inside the task allows
// live reloading/monitoring of files changed.
gulp.task('assemble', function() {
	app.option('layout', 'default');
	app.helpers(helpers());
	app.layouts(glob.layouts);
	app.partials(glob.includes);
	loadData();

	// @info
	// https://github.com/assemble/assemble-permalinks/issues/8#issuecomment-231181277
	// Load pages onto the pages collection to ensure the page templates are put on the
	// correct collection and the middleware is triggered.
	app.pages(glob.pages);

	var stream = app.toStream('pages')
		.pipe($.newer(glob.pages))
		.on('error', console.log)
		.pipe(app.renderFile())
		.on('error', console.log)
		.pipe($.extname())
		.on('error', console.log)
		// @info
		// update the file.path before writing
		// the file to the file system.
		.pipe(app.dest(function(file) {
			// @info
			// Creates a permalink and puts it on file.data.permalink.
			// This can be used in other templates for linking.
			file.path = resolve(file.base, file.data.permalink);
			return path.site;
		}))
		.on('error', console.log)
		.pipe($.livereload());

	return stream;
});


// ===================================================
// Optimizin'
// ===================================================

gulp.task('svgstore', function() {
  return gulp
    .src(path.site + '/img/icons/linear/*.svg')
    .pipe($.svgmin({
      plugins: [{
        removeDoctype: true
      }]
    }))
    .pipe($.svgstore())
    .pipe($.cheerio(function($) {
      $('svg').attr('style', 'display:none');
    }))
    .pipe(gulp.dest(path.templates + '/includes/atoms/svg-sprite.svg'));
});


// ===================================================
// Buildin'
// ===================================================

/*
 * foreach is because usemin 0.3.11 won't manipulate
 * multiple files as an array.
 */

gulp.task('usemin', ['assemble', 'sass'], function() {
  return gulp.src(glob.html)
    .pipe($.foreach(function(stream, file) {
      return stream
        .pipe($.usemin({
          assetsDir: path.site,
          css: [ $.rev() ],
          html: [$.htmlmin({
            empty: true,
            quotes: true,
            comment: true
          })],
          js: [ $.uglify(), $.rev() ]
        }))
        .pipe(gulp.dest(path.dist));
    }));
});


// ===================================================
// Duplicatin'
// ===================================================

gulp.task('copy', ['usemin'], function() {
  return merge(
    gulp.src([path.site + '/{articles,img,bower_components,js/lib}/**/*'])
        .pipe(gulp.dest(path.dist)),

    gulp.src([
        path.site + '/*.{ico,png,txt}',
        path.site + '/CNAME'
      ]).pipe(gulp.dest(path.dist))
  );
});


// ===================================================
// Releasin'
// ===================================================

gulp.task('deploy', function() {
  return gulp.src([path.dist + '/**/*'])
             .pipe($.ghPages(
                $.if(env_flag === false,
                { branch: 'staging' },
                { branch: 'gh-pages'})
             ));
});


// ===================================================
// Cleanin'
// ===================================================

gulp.task('clean', function(cb) {
  del([
    'dist',
    glob.css,
    glob.html
  ], cb);
});


// ===================================================
// Monitorin'
// ===================================================

gulp.task('watch', function() {
  gulp.watch([
    glob.sass
  ], ['sass']);

  gulp.watch([
    glob.includes,
    glob.pages,
    glob.layouts
  ], ['assemble']);
});


// ===================================================
// Taskin'
// ===================================================

gulp.task('build', [ 'copy','usemin' ]);
gulp.task('default', [ 'sass','assemble','serve','watch' ]);
