describe('misc', function() {

  it('should not overwrite existing jQuery versions', function() {
    // The AMD test page does not include jquery
    if (typeof $ !== 'undefined') {
      // The jasmine test page loads 1.11.1 while 1.10.2 is bundled with F2
      expect($.fn.jquery).toEqual('1.11.1');
    }
  });

});
