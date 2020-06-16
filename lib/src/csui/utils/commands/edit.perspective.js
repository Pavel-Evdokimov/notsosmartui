/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
  'module', 'require', 'csui/lib/underscore', 'csui/lib/jquery',
  'csui/models/command', 'csui/utils/url',
  'csui/models/perspective/perspective.template.model',
  'i18n!csui/utils/commands/nls/localized.strings'
], function (module, require, _, $, CommandModel,
    Url, PerspectiveTemplateModel, lang) {
  'use strict';
  var config = window.csui.requirejs.s.contexts._.config
                   .config['csui/utils/contexts/perspective'] || {};
  config = _.extend({
    enableInlinePerspectiveEditing: true
  }, config, module.config());

  var ConnectorFactory;

  var EditPerspectiveCommand = CommandModel.extend({

    defaults: {
      signature: 'EditPerspective',
      name: lang.EditPerspective
    },

    enabled: function (status, options) {
      var context    = status.context || options && options.context,
          attributes = context.perspective.attributes;
      if (attributes.id) {
        return attributes.canEditPerspective;
      }
      return false;
    },

    execute: function (status, options) {
      var context         = status.context || options && options.context,
          isInlineEditing = (options && options.inlinePerspectiveEditing) ||
                            config.enableInlinePerspectiveEditing;
      if (isInlineEditing) {
        return this._editInline(status, options, context);
      } else {
        return this._editInClassicPMan(status, options, context);
      }
    },

    _editInline: function (status, options, context) {
      var deferred = $.Deferred(),
          self     = this;
      require(['csui/perspective.manage/pman.view', 'csui/utils/contexts/factories/connector'],
          function (PManView, ConnectorFactory) {
            var perspectiveId       = context.perspective.get('id'),
                perspectiveTemplate = new PerspectiveTemplateModel(
                    {id: perspectiveId},
                    {connector: context.getObject(ConnectorFactory)}),
                pmanView, currentPerspective, allPerspectives;
            perspectiveTemplate.fetch().then(function () {
              allPerspectives = perspectiveTemplate.get('perspectives');
              if (allPerspectives && allPerspectives.length != 1) {
                require(['csui/dialogs/modal.alert/modal.alert'], function (alertDialog) {
                  alertDialog.showError(lang.editPerspectiveErrorMessage)
                      .done(function () {
                        deferred.resolve();
                      })
                      .fail(function (arg) {
                        deferred.reject(arg);
                      });
                });
              } else {
                currentPerspective = allPerspectives.at(0);
                currentPerspective.set('id',perspectiveId);
                pmanView = new PManView({
                  context: context,
                  perspective: currentPerspective
                });
                pmanView.show();
                deferred.resolve();
              }
            });
          }, deferred.reject);
      return deferred.promise();
    },

    _editInClassicPMan: function (status, options, context) {
      var deferred = $.Deferred(),
          self     = this;
      require(['csui/utils/contexts/factories/connector'
      ], function () {
        ConnectorFactory = arguments[0];
        var f = self._getForm(context, status);
        f.submit();
        f.remove();
        deferred.resolve();
      }, deferred.reject);
      return deferred.promise();
    },

    _getForm: function (context, status) {
      var f = $("<form target='_blank' method='POST' style='display:none;'></form>").attr({
        action: this._getUrl(context, status)
      }).appendTo(document.body);

      var params = this._getUrlQueryParameters(context);

      for (var i in params) {
        if (params.hasOwnProperty(i)) {
          $('<input type="hidden" />').attr({
            name: i,
            value: params[i]
          }).appendTo(f);
        }
      }

      return f;
    },

    _getUrl: function (context, status) {
      var connector      = context.getObject(ConnectorFactory),
          cgiUrl         = new Url(connector.connection.url).getCgiScript(),
          perspectiveUrl = cgiUrl.toString() + "/perspectivemgr";
      return perspectiveUrl;
    },

    _getUrlQueryParameters: function (context) {
      var perspective_id = context.perspective.attributes.id,
          parameters;
      if (perspective_id !== undefined && perspective_id > 0) {
        parameters = {
          perspective_id: perspective_id
        };
      } else {
        parameters = {};
      }
      return parameters;
    }

  });

  return EditPerspectiveCommand;
});
