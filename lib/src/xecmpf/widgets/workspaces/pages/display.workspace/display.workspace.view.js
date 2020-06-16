/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['module', 'csui/lib/jquery', 'csui/lib/underscore',
  'csui/lib/backbone',
  'csui/lib/marionette', 'csui/utils/log', 'csui/utils/base',
  'csui/utils/contexts/page/page.context',
  'csui/utils/commands',
  'xecmpf/utils/commands/workspaces/workspace.delete',
  'csui/integration/folderbrowser/folderbrowser.widget',
  'csui/utils/contexts/factories/connector',
  'xecmpf/utils/commands/folderbrowse/open.full.page.workspace',
  'csui/dialogs/modal.alert/modal.alert',
  'i18n!xecmpf/widgets/workspaces/pages/display.workspace/impl/nls/lang',
  'hbs!xecmpf/widgets/workspaces/pages/display.workspace/impl/display.workspace',
  'css!xecmpf/widgets/workspaces/pages/display.workspace/impl/display.workspace'

], function (module, $, _, Backbone, Marionette, log, base, PageContext,
    CsuiCommands, WkspDeleteCmd,
    FolderBrowserWidget, ConnectorFactory, OpenFullPageWorkspaceView,
    ModalAlert, lang,
    template,
    css) {

  var DisplayWorkspaceView = Marionette.LayoutView.extend({
    template: template,
    tagName: "div",
    id: "xecmpf-display_wksp",
    className: "xecmpf-page",

    regions: {
      content: "#display_wksp_content"
    },
    constructor: function DisplayWorkspaceView(options) {
      options || (options = {});
      Marionette.LayoutView.prototype.constructor.apply(this, arguments); // sets this.options
    },
    authenticateXecm: function (cgiUrl, deferred) {
      var that = this;
      deferred = deferred || $.Deferred();
      if (!!this.connector.connection.session && !!this.connector.connection.session.ticket) {
        var xhr = new XMLHttpRequest();
        var openFullView = new OpenFullPageWorkspaceView();
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              deferred.resolve();
            }
            else {
              deferred.reject(lang.failedAuthentication + new Error(xhr.statusText));
            }
          }
        };
        openFullView.authenticate(xhr, cgiUrl, this.connector);

      } else {
        this.options.context.once("sync", function () {
          that.authenticateXecm(cgiUrl, deferred);
        });
      }
      return deferred.promise();
    },

    onShow: function () {
      var options = this.options || {},
          status  = options.status || {};

      this.connector = this.options.context.getObject(ConnectorFactory);
      var require                      = window.csui && window.csui.require || window.require,
          commands                     = options.data && options.data.folderBrowserWidget &&
                                         options.data.folderBrowserWidget.commands || {},
          goToNodeHistory              = commands['go.to.node.history'] || {},
          goToNodeHistoryEnabled       = !_.isUndefined(goToNodeHistory.enabled) ?
                                         goToNodeHistory.enabled : true,

          openFullPageWorkspace        = commands['open.full.page.workspace'] || {},
          openFullPageWorkspaceEnabled = !_.isUndefined(openFullPageWorkspace.enabled) ?
                                         openFullPageWorkspace.enabled : true,
          fullPageOverlayEnabled       = !_.isUndefined(openFullPageWorkspace.fullPageOverlay) ?
                                         openFullPageWorkspace.fullPageOverlay : true,
          viewMode                     = options.data.viewMode ? options.data.viewMode.mode :
                                         'folderBrowse',
          searchContainer              = commands['search.container'] || {},
          searchContainerEnabled       = !_.isUndefined(searchContainer.enabled) ?
                                         searchContainer.enabled : true;

      if (viewMode === 'fullPage') {

        this.cgiUrl = this.connector && this.connector.connection && this.connector.connection.url ?
                      this.connector.connection.url.replace('/api/v1', '') : '';
        var that = this;
        this.authenticateXecm(this.cgiUrl)
            .done(function () {

              require(['xecmpf/widgets/integration/folderbrowse/full.page.workspace.view',
                    'csui/utils/url'
                  ],
                  function (FullPageWorkspaceView, Url) {

                    var urlPrefix            = 'xecm',
                        queryParams          = "where_ext_system_id=" +
                                               options.data.extSystemId +
                                               "&where_bo_type=" +
                                               options.data.busObjectType +
                                               "&where_bo_id=" +
                                               options.data.busObjectId + "&view_mode=" +
                                               options.data.viewMode.mode,
                        fullPageWorkspaceUrl = Url.appendQuery(
                            Url.combine(that.cgiUrl, urlPrefix, 'nodes',
                                status.workspaceNode.attributes.id), queryParams),
                        fullPageWorkspaceView,
                        currentWindowRef     = window,
                        themePath            = $(currentWindowRef.document).find(
                            "head > link[data-csui-theme-overrides]").attr('href'),
                        setTheme             = function (e) {
                          if (e.origin &&
                              (new RegExp(e.origin, "i").test(new Url(that.cgiUrl).getOrigin()))) {
                            if (e.data) {
                              if (e.data.status === "ok") {
                                e.source.postMessage({"themePath": themePath}, that.cgiUrl);
                                currentWindowRef.removeEventListener("message", setTheme, false);
                              }
                            }
                          }
                        };
                    require.config({
                      config: {
                        'csui/integration/folderbrowser/commands/go.to.node.history': {
                          enabled: true
                        }
                      }
                    });
                    fullPageWorkspaceView = new FullPageWorkspaceView({
                      fullPageWorkspaceUrl: fullPageWorkspaceUrl,
                      connector: that.connector
                    });
                    that.content.show(fullPageWorkspaceView);
                    currentWindowRef.addEventListener("message", setTheme);

                  },
                  function (error) {
                    ModalAlert.showError(error.toString());
                    console.error(error);
                  }
              );
            })
            .fail(function (error) {
              ModalAlert.showError(error.toString());
              console.error(error);
            });
      }
      else {

        require.config({
          config: {
            'csui/integration/folderbrowser/commands/go.to.node.history': {
              enabled: goToNodeHistoryEnabled
            }
          }
        });
        require.config({
          config: {
            'xecmpf/utils/commands/folderbrowse/search.container': {
              enabled: searchContainerEnabled
            },
            'xecmpf/utils/commands/folderbrowse/open.full.page.workspace': {
              enabled: openFullPageWorkspaceEnabled,
              fullPageOverlay: fullPageOverlayEnabled
            }
          }
        });
        var del = CsuiCommands.get('Delete');
        if (del) {
          CsuiCommands.remove(del);
        }
        options.data.id = status.workspaceNode.attributes.id;
        options.data.viewMode = viewMode;
        options.data.openFullPageWorkspaceEnabled = openFullPageWorkspaceEnabled;
        options.data.fullPageOverlayEnabled = fullPageOverlayEnabled;
        options.data.goToNodeHistoryEnabled = goToNodeHistoryEnabled;
        var busWkspDeleteCmd = new WkspDeleteCmd(options.data);
        CsuiCommands.add(busWkspDeleteCmd);
        this.options.context.options.suppressReferencePanel = true;
        this.browser = new FolderBrowserWidget({
          breadcrumb: !goToNodeHistoryEnabled,
          connection: this.connector.connection,
          start: {id: status.workspaceNode.attributes.id},
          context: this.options.context
        });
        this.browser.show({
          placeholder: "#display_wksp_content"
        });
      }
    }
  });
  return DisplayWorkspaceView;
});
