/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['module', 'require', 'csui/lib/underscore', 'csui/lib/jquery',
  'csui/utils/commandhelper', 'conws/utils/commands/delete',
  'csui/integration/folderbrowser/commands/go.to.node.history', 'csui/utils/commands/confirmable',
  'csui/controls/globalmessage/globalmessage'
], function (module, require, _, $,
  CommandHelper, DeleteCommand, GoToNodeHistoryCommand, ConfirmableCommand,
  GlobalMessage) {
  'use strict';

  var config = module.config();

  _.defaults(config, {
    extSystemViewModes: ['folderBrowse', 'fullPage'],
    extSystemEl: '#widgetWMainWindow'
  });


  var goToNodeHistoryCommand = new GoToNodeHistoryCommand();
  var origExecute = DeleteCommand.prototype._executeDelete,
    WkspDeleteCommand = DeleteCommand.extend({

      _executeDelete: function (status, options) {

        options || (options = {});

        var viewMode = this.get('viewMode') || config.viewMode,
          openFullPageWorkspaceEnabled = this.get('openFullPageWorkspaceEnabled'),
          goToNodeHistoryEnabled = this.get('goToNodeHistoryEnabled'),
          fullPageOverlayEnabled = this.get('fullPageOverlayEnabled');

        _.extend(status, {
          viewMode: viewMode && (viewMode.mode ? viewMode.mode : viewMode),
          wkspId: this.get('id') || config.id
        });

        var node = CommandHelper.getJustOneNode(status);

        options.originatingView = status.originatingView;
        if (config.extSystemViewModes.indexOf(status.viewMode) === -1 ||
          !node ||
          node.get('id') !== status.wkspId) {
          return origExecute.apply(this, arguments);
        }
        _.extend(status, {
          busObjectId: this.get('busObjectId') || config['busObjectId'],
          busObjectType: this.get('busObjectType') || config['busObjectType'],
          extSystemId: this.get('extSystemId') || config['extSystemId']
        });

        var deferred = $.Deferred(),
          commandData = status.data || {},
          context = status.context || options.context,
          showProgressDialog = commandData.showProgressDialog != null ?
          commandData.showProgressDialog : true;

        ConfirmableCommand.execute.call(this, status, options)
          .done(function (results) {
            showProgressDialog && GlobalMessage.hideFileUploadProgress();
            require(['xecmpf/widgets/workspaces/workspaces.widget'], function (WorkspacesWidget) {
              goToNodeHistoryCommand.clearHistory(context);

              var data = {
                  deletecallback: true,
                  workspaceNodeId: 0, // no CS Workspace is available for the BO
                  busObjectId: status.busObjectId,
                  busObjectType: status.busObjectType,
                  extSystemId: status.extSystemId,
                  folderBrowserWidget: {
                    commands: {
                      'open.full.page.workspace': {
                        enabled: openFullPageWorkspaceEnabled,
                        fullPageOverlay: fullPageOverlayEnabled
                      },
                      'go.to.node.history': {
                        enabled: goToNodeHistoryEnabled
                      }
                    }
                  },
                  viewMode: {
                    mode: status.viewMode
                  }
                },
                workspacesWidget = new WorkspacesWidget({
                  context: context,
                  data: data
                });

              if (status.viewMode === 'fullPage') {
                window.top.postMessage(JSON.stringify(data), '*');
              } else {
                workspacesWidget.show({
                  placeholder: config.extSystemEl
                });
              }
            });
            deferred.resolve(results);
          })
          .fail(function (args) {
            deferred.reject(args);
          });
        return deferred.promise();
      }
    });

  DeleteCommand.prototype = WkspDeleteCommand.prototype;

  return WkspDeleteCommand;
});