describe('AMD', function() {

  it('should define F2', function() {
    var isLoaded = false;

    require(["../dist/f2.min.js"], function(nonGlobalF2) {
      isLoaded = typeof nonGlobalF2 !== "undefined";
    });

    waitsFor(function() {
      return isLoaded;
    }, 'F2-AMD never loaded', 1000);

    runs(function() {
      expect(isLoaded).toBe(true);
    });
  });

  it('should still globally define F2', function() {
    expect(F2).toBeDefined();
  });

});
