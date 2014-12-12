describe('misc', function () {

    it('should not overwrite existing jQuery versions', function () {
        // the AMD test page does not include jquery
        if (typeof $ !== 'undefined') {
            // the jasmine test page loads 1.11.1 while 1.10.2 is bundled with F2
            expect($.fn.jquery).toEqual('1.11.1');
        }
    });

});