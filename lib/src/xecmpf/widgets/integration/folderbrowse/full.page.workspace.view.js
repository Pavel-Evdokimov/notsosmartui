/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['module', 'csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette',
  'hbs!xecmpf/widgets/integration/folderbrowse/impl/full.page.workspace',
  'css!xecmpf/widgets/integration/folderbrowse/impl/folderbrowse'
], function (module, _, $, Marionette, FullPageWorkspaceTemplate) {
  "use strict";
  var FullPageWorkpsaceView = Marionette.ItemView.extend({
    className: 'xecm-full-page-workspace',
    constructor: function FullPageWorkpsaceView(options) {
      options = options || {};
      Marionette.ItemView.prototype.constructor.apply(this, arguments);
    },
    template: FullPageWorkspaceTemplate,
    templateHelpers: function () {
      return {
        fullPageWorkspaceUrl: this.options.fullPageWorkspaceUrl
      };
    }
  });
  return FullPageWorkpsaceView;
});
