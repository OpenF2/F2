process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function(config) {
  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    browsers: ['Chrome'],
    client: {
      jasmine: {
        failFast: true
      }
    },
    // enable / disable colors in the output (reporters and logs)
    colors: true,
    concurrency: Infinity,
    customContextFile: 'tests/context.html',
    customDebugFile: 'tests/debug.html',
    exclude: [
      // TODO: need to figure out the best way to test AMD - perhaps separately
      // from the rest of the tests
      'tests/spec/amd-spec.js'
    ],
    files: [
      'tests/spec/spec-helpers.js',
      'tests/spec/**/*-spec.js'
    ],
    frameworks: ['jasmine'],
    jasmineHtmlReporter: {
      suppressAll: true
    },
    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    middleware: ['serve-static-map'],
    // web server port
    port: 3000,
    proxies: {
      '/F2/apps/test/http-post': 'http://localhost:8080/F2/apps/test/http-post'
    },
    reporters: ['kjhtml'],
    serveStaticMap: [
      { fsPath: './dist', baseURL: '/dist' },
      { fsPath: './tests', baseURL: '/tests' }
    ],
    singleRun: false
  })
}
