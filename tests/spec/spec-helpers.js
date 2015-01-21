var TEST_MANIFEST_URL = 'http://localhost:8080/F2/apps/test/hello-world';
var TEST_APP_ID = 'com_openf2_examples_javascript_helloworld';
var TEST_MANIFEST_URL2 = 'http://localhost:8080/F2/apps/test/market-news';
var TEST_APP_ID2 = 'com_openf2_examples_csharp_marketnews';
var TEST_MANIFEST_URL_HTTP_POST = 'http://localhost:8080/F2/apps/test/http-post';
var TEST_MANIFEST_URL3 = 'http://localhost:8080/F2/apps/test/hello-world-node';
var TEST_APP_ID3 = 'com_openf2_examples_nodejs_helloworld';

// Addition to Jasmine Async that reloads F2
AsyncSpec.prototype.beforeEachReloadF2 = function(callback) {
  this.beforeEach(function(done) {
    window.F2 = {
      Apps: {}
    };

    $.ajax({
      url: '../dist/f2.debug.js',
      dataType: 'script',
      complete: function() {
        callback && callback();
        done();
      }
    });
  });
};

function itConditionally(condition, desc, func) {
  if (condition) {
    return jasmine.getEnv().it(desc, func);
  }

  var el = document.getElementById('tests-skipped');
  var count = Number(el.getAttribute('data-count')) + 1;
  el.innerHTML = 'Skipping ' + count + ' spec' + ((count > 1) ? 's' : '');
  el.setAttribute('data-count', count);
  el.style.display = 'block';
  return jasmine.getEnv().xit(desc, func);
}

// Clean out the test fixture before each spec
beforeEach(function() {
  $('#test-fixture').empty();
});
