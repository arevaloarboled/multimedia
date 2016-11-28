module.exports = function (grunt) {

  grunt.initConfig({
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static('app')
            ];
          }
        }
      }
    },
    watch: {
      project: {
        files: ['app/**/*.js',
                'app/**/*.html',
                'app/**/*.json',
                'app/**/*.css'],
        options: {
          livereload: true
        }
      },
      express: {
        files:  [ 'server/app.js' ],
        tasks:  [ 'express' ],
        options: {
          spawn: false
        }
      }
    },
    express: {
      options: {
        port: 5000,
        debug: true
      },
      server: {
        options: {
          script: 'server/app.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('default', ['connect', 'express', 'watch']);

};
