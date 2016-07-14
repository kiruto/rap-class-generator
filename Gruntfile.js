module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.file %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: ['src/config.js', 'src/class_gen_res.js', 'uiutils.js'],
        dest: 'dist/class_gen.min.js'
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'src', src: ['manifest.json'], dest: 'dist/', filter: 'isFile'},
        ],
      },
    },
    compress: {
      main: {
        options: {
          mode: 'zip',
          archive: 'chrome_extension/extension.crx'
        },
        files: [
          {expand: true, cwd: 'dist', src: ['**'], dest: 'chrome_extension/'},
        ]
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['uglify', 'copy', 'compress']);
}