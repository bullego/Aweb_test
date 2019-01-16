var gulp 		 = require('gulp'),
	sass         = require('gulp-sass'),
	plumber		 = require('gulp-plumber'),
	concat       = require('gulp-concat'),
	uglify       = require('gulp-uglify'),
	autoprefixer = require('gulp-autoprefixer'),	
	cssnano      = require('gulp-cssnano'),
	rename       = require('gulp-rename'),
	sourcemaps   = require('gulp-sourcemaps'),
	del          = require('del'),
	imagemin     = require('gulp-imagemin'),
	pngquant     = require('imagemin-pngquant'),
	cache        = require('gulp-cache'),
	gcmq 		 = require('gulp-group-css-media-queries'),
	delComments  = require('gulp-strip-css-comments'),
	rigger       = require("gulp-rigger"),
	browserSync  = require('browser-sync').create();

var	devPath = {
	src: 'develop',	
	html: {
		src: '/index.html'		
	},
	css: {
		src: '/scss/style.scss',
		dest: '/css'
	},
	cssLibs: {
		src: '/scss-libs/libs.scss',
		dest: '/css'
	},
	js: {
		src: '/js/index.js',
		dest: '/js'
	},	
	jsLibs: {
		src: '/js-libs'
	},
	img: {
		src: '/img/**/*'
	},
	fonts: '/fonts/**/*'
};	

var	prodPath = {
	src: 'production',
	css: '/css',
	js: '/js',
	img: '/img',
	fonts: '/fonts'
};

//____________________watch
gulp.task('default', ['watch']);

gulp.task('watch', ['scripts', 'sass'], function() {
	browserSync.init({
	    server: devPath.src,
	    notify: false,
	    open: true,
	    cors: true,
	    ui: false
	});

	gulp.watch(devPath.src + devPath.css.src, ['sass']);
	gulp.watch(devPath.src + devPath.html.src, browserSync.reload);
	gulp.watch(devPath.src + devPath.js.src, browserSync.reload);
});

gulp.task('sass', function() {
	gulp.src([
		devPath.src + devPath.css.src,		
		devPath.src + '/scss-libs/custom-bootstrap.scss'])
	.pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(sass())
	.pipe(autoprefixer(['last 15 versions', '> 1%'], { cascade: false }))
	.pipe(sourcemaps.write())
	.pipe(delComments())
	.pipe(gcmq())
	.pipe(gulp.dest(devPath.src + devPath.css.dest))
	.pipe(browserSync.reload({stream: true}))
	.pipe(cssnano())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest(devPath.src + devPath.css.dest))
	.pipe(browserSync.reload({stream: true}));	
});

gulp.task('scripts', ['js-libs'], function() {
	return gulp.src(devPath.src + devPath.js.src)
	//.pipe(delComments())
	.pipe(uglify())
	.pipe(rename({suffix: '.min'})) 
	.pipe(gulp.dest(devPath.src + devPath.js.dest));	
});

gulp.task('js-libs', ['js-libs-node-modules'], function() {
	return gulp.src([
		devPath.src + devPath.jsLibs.src + '/jquery/dist/jquery.min.js'])
	.pipe(gulp.dest(devPath.src + devPath.js.dest)); 
});
gulp.task('js-libs-node-modules', function() {
	return gulp.src([devPath.src + devPath.jsLibs.src + '/custom-bootstrap.js'])
		.pipe(rigger())
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(devPath.src + devPath.js.dest));
});

//____________________build
gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function() {
	
	var buildHtml = gulp.src(devPath.src + devPath.html.src)
	.pipe(gulp.dest(prodPath.src));	

	var buildCss = gulp.src(devPath.src + devPath.css.dest + '/**/*.css')
	.pipe(gulp.dest(prodPath.src + prodPath.css));
	
	var buildJs = gulp.src(devPath.src + devPath.js.dest + '/**/*.js')
	.pipe(gulp.dest(prodPath.src + prodPath.js));

	var buildFonts = gulp.src(devPath.src + devPath.fonts)
	.pipe(gulp.dest(prodPath.src + prodPath.fonts));

});

gulp.task('clean', function() {
	return del('production');
});

gulp.task('img', function() {
	return gulp.src(devPath.src + devPath.img.src) 
		.pipe(imagemin({ 
			optimizationLevel: 3,
			interlaced: true,
			progressive: true,			
			use: [pngquant()]
		}))
		.pipe(gulp.dest('production/img')); 		 
});

gulp.task('clear', function (callback) {
	return cache.clearAll();
});
