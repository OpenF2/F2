describe("Console", function() {  
  it ("should fail", function() {
    expect(false).toBeFalsy();
  });
  
  it ("should succeed", function() {
    expect(true).toBeTruthy();
  });
  
  it ("$.ajax exists", function() {
    expect(!!$.ajax).toBeTruthy();
  });
  
  it ("jQuery.ajax exists", function() {
    expect(!!jQuery.ajax).toBeTruthy();
  });
  
});