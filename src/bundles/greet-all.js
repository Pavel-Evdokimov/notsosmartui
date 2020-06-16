// Placeholder for the build target file; the name must be the same,
// include public modules from this component

define([
  'greet/widgets/hello/hello.view',
  'json!greet/widgets/hello/hello.manifest.json'
], {});

require([
  'require',
  'css'
], function (require, css) {

  // Load the bundle-specific stylesheet
  css.styleLoad(require, 'greet/bundles/greet-all');
});