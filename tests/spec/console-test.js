describe("Console", function() {  
  it ("should fail", function() {
    expect(false).toBeFalsy();
  });
  
  it ("should succeed", function() {
    expect(true).toBeTruthy();
  });
  
  it ("jQuery exists", function() {
    expect(!!jQuery).toBeTruthy();
  });
  
});