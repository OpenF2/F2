var builder,
  docOptions = {
    quiet: true,
    norecurse: true,
    paths: '../../sdk/src',
    outdir: '../dist/sdk/',
    themedir: '../src/sdk-template',
    helpers: ['../src/sdk-template/helpers/helpers.js']
  },
  json,
  pkg = require('../../package.json'),
  Y = require('yuidocjs');

docOptions = Y.Project.init(docOptions);

json = (new Y.YUIDoc(docOptions)).run();
// massage in some meta information from F2.json
json.project = {
  docsAssets: '../',
  version: pkg.version,
  releaseDateFormatted: pkg._releaseDateFormatted
};
docOptions = Y.Project.mix(json, docOptions);

// ensures that the class has members and isn't just an empty namespace
// used in sidebar.handlebars
Y.Handlebars.registerHelper('hasClassMembers', function() {
  for (var i = 0, len = json.classitems.length; i < len; i++) {
    //console.log(json.classitems[i].class, this.name);
    if (json.classitems[i].class === this.name) {
      return '';
    }
  }
  return 'hidden';
});

builder = new Y.DocBuilder(docOptions, json);
builder.compile(function() {
  console.log('done');
});