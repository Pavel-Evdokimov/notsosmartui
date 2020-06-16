/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['module',
  'csui/lib/underscore',
  'csui/lib/jquery',
  'csui/models/command',
  'i18n!xecmpf/utils/commands/nls/localized.strings',
], function (module, _, $, CommandModel, lang) {
  var CollapseDialog = CommandModel.extend({

    defaults: {
      signature: 'CollapsePageOverlay',
      name: lang.CollapsePageOverlay
    },
    enabled: function (status, options) {
      var config = _.extend({
        enabled: false,
      }, module.config());

      return config.enabled;
    },

    execute: function (status, options) {
      var parent = window.opener ? window.opener : window !== window.parent ? window.parent : undefined
      if (parent) {
        parent.postMessage({ "status": "closeDialog" }, "*");
      }
      var deferred = $.Deferred();
      return deferred.promise();
    }
  });

  return CollapseDialog;
});