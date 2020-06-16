/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */


define(['module',
  'csui/lib/underscore',
  'csui/lib/jquery',
  'csui/lib/marionette',
  'csui/lib/handlebars',
  'conws/widgets/header/header.view',
  'conws/models/selectedmetadataform/selectedmetadataform.factory',
  'xecmpf/widgets/header/impl/completenesscheck/completenesscheck.view',
  'xecmpf/widgets/header/impl/displayUrl/displayUrl.view',
  'esoc/widgets/activityfeedwidget/activityfeedfactory',
  'esoc/widgets/activityfeedwidget/activityfeedcontent',
  'xecmpf/widgets/header/impl/metadata.view',
  'csui/behaviors/keyboard.navigation/tabkey.behavior',
  'xecmpf/widgets/header/headertoolbaritems',
  'css!xecmpf/widgets/header/impl/header'
], function (module, _, $, Marionette, Handlebars,
    ConwsHeaderView, MetadataFactory,
    CompletenessCheckView, DisplayUrlView,
    ActivityFeedFactory, ActivityFeedContent,
    MetadataView, TabKeyBehavior, headertoolbaritems) {
  var constants = {'activityfeedwidget': 'esoc/widgets/activityfeedwidget'};
  var moduleConfig = module.config();
  var HeaderView = ConwsHeaderView.extend({

    id: 'xecmpf-header',

    constructor: function HeaderView(options) {
      options || (options = {});
      options.data || (options.data = {});
      options.data.widget || (options.data.widget = {});
      options.data.widget.type || (options.data.widget.type = 'metadata');
      options.hideToolbar = !!moduleConfig.hideToolbar;
      options.hideActivityFeed = !!moduleConfig.hideActivityFeed;
      options.hideMetadata = !!moduleConfig.hideMetadata || !(options.data.metadataSettings &&
                                                              options.data.metadataSettings.metadata &&
                                                              !options.data.metadataSettings.hideMetadata);
      options.toolbarBlacklist = [];
      options.extensionToolbarBlacklist = [];

      var toolbarBlacklist = moduleConfig.toolbarBlacklist;
      if (Array.isArray(toolbarBlacklist) && toolbarBlacklist.length > 0) {
        options.toolbarBlacklist = toolbarBlacklist;
      }
      var extensionToolbarBlacklist = moduleConfig.extensionToolbarBlacklist;
      if (Array.isArray(extensionToolbarBlacklist) && extensionToolbarBlacklist.length > 0) {
        options.extensionToolbarBlacklist = extensionToolbarBlacklist;
      }

      if (options.data && options.data.favoriteSettings &&
          options.data.favoriteSettings.hideFavorite) {
        if (!options.toolbarBlacklist['Favorite2']) {
          options.toolbarBlacklist.push('Favorite2');
        }
        if (!options.extensionToolbarBlacklist['Favorite2']) {
          options.extensionToolbarBlacklist.push('Favorite2');
        }
      }

      if (!options.extensionToolbarBlacklist['CompletenessCheck']) {
        options.extensionToolbarBlacklist.push('CompletenessCheck');
      }
      var cCConfig           = options.data.completenessCheckSettings,
          cCViewOptions      = {
            context: options.context,
            workspaceContext: options.workspaceContext,
            hideMissingDocsCheck: cCConfig && cCConfig.hideMissingDocsCheck,
            hideOutdatedDocsCheck: cCConfig && cCConfig.hideOutdatedDocsCheck,
            hideInProcessDocsCheck: cCConfig && cCConfig.hideInProcessDocsCheck
          },
          toolItemCollection = headertoolbaritems.rightToolbar.collection;
      if (toolItemCollection && toolItemCollection.length > 0) {
        var completenessToolModel = toolItemCollection.findWhere({signature: "CompletenessCheck"});
        completenessToolModel.set({commandData: {viewOptions: cCViewOptions}})
      }
      options.cCViewOptions = cCViewOptions;
      options.headertoolbaritems = headertoolbaritems;
      options.headerExtensionToolbaritems = headertoolbaritems;

      ConwsHeaderView.prototype.constructor.call(this, options);
      if (options.workspaceContext) {
        options.workspaceContext.setWorkspaceSpecific(MetadataFactory);
        options.workspaceContext.setWorkspaceSpecific(ActivityFeedFactory);
      }
    },
    behaviors: {
      TabKeyRegion: {
        behaviorClass: TabKeyBehavior
      }
    },

    initialize: function (options) {
      options || (options = {});
      if (options.data) {

        var headerwidgetConfigValue = options.data.headerwidget ? (options.data.headerwidget.type ?
                                                                   options.data.headerwidget.type :
                                                                   "metadata" ) : "metadata";
        this.headerwidgetConfigValue = headerwidgetConfigValue;

        if (headerwidgetConfigValue === 'metadata'
            && (options.data.widget.type === 'metadata') && !this.options.hideMetadata) {
          var mConfig = options.data.metadataSettings;
          var metadata = this._makeMetadataReadOnly(mConfig.metadata);
          var mViewOptions = {
            context: options.context,
            workspaceContext: options.workspaceContext,
            data: {
              hideEmptyFields: mConfig.hideEmptyFields,
              metadata: metadata,
              readonly: true,
              colOptions: options.data.metadataSettings.metadataInColumns
            }
          };
          this.metadataView = new MetadataView(mViewOptions);
        }
        if (this.headerwidgetConfigValue === 'activityfeed' && !this.options.hideActivityFeed) {
          options.data.widget.type = constants.activityfeedwidget;
          options.data.widget.options || (options.data.widget.options = {});
        }

        if (!moduleConfig.pageWidget) {
          var cCViewOptions = _.extend(options.cCViewOptions,
              {workspaceContext: options.workspaceContext});
          if (!cCViewOptions.hideMissingDocsCheck || !cCViewOptions.hideOutdatedDocsCheck ||
              !cCViewOptions.hideInProcessDocsCheck) {
            this.options.hasMetadataExtension = true;
            this.completenessCheckView = new CompletenessCheckView(cCViewOptions);
          }
        }

        var displayUrlViewOptions = {
          model: this.model,
          logging: {debug: false}
        };
        this.displayUrlView = new DisplayUrlView(displayUrlViewOptions);
      }
    },

    ui: {
      completenessCheckRegion: '.conws-header-metadata-extension',
      metadataRegion: '#conws-header-childview',
      displayUrlRegion: '.conws-header-child-displayUrl'
    },

    _makeMetadataReadOnly: function (arr) {
      var metadata = arr || [];
      metadata.forEach(function (obj) {
        obj['readOnly'] = true;
      });
      return metadata;
    },

    onRender: function (options) {
      ConwsHeaderView.prototype.onRender.apply(this, arguments);
      this.showChildViews();
    },

    showChildViews: function () {
      if (this.completenessCheckView) {
        this.completenessCheckRegion = new Marionette.Region({el: this.ui.completenessCheckRegion});
        this.completenessCheckRegion.show(this.completenessCheckView);

        if (this.descriptionView) {
          this.listenTo(this.descriptionView, "show:more:description", function () {
            this.toggleCompletenessCheckView(false);
          });
          this.listenTo(this.descriptionView, "show:less:description", function () {
            this.toggleCompletenessCheckView(true);
          });
        }
      }
      if (this.metadataView) {
        this.metadataRegion = new Marionette.Region({el: this.ui.metadataRegion});
        this.metadataRegion.show(this.metadataView);
      }
      if (this.displayUrlView) {
        this.displayUrlRegion = new Marionette.Region({el: this.ui.displayUrlRegion});
        this.displayUrlRegion.show(this.displayUrlView);
      }
    },

    toggleCompletenessCheckView: function (toggle) {
      if (toggle) {
        this.completenessCheckView.$el.removeClass("xecmpf-completenesscheck-hidden").addClass(
            "xecmpf-completenesscheck-shown");
      } else {
        this.completenessCheckView.$el.removeClass("xecmpf-completenesscheck-shown").addClass(
            "xecmpf-completenesscheck-hidden");
      }
    },

    hasChildView: function () {
      var isChildWidgetConfigured = (this.options.data && this.options.data.widget &&
                                     this.options.data.widget.type &&
                                     this.options.data.widget.type !== "none");
      if (this.headerwidgetConfigValue === 'activityfeed') {
        return !this.options.hideActivityFeed && isChildWidgetConfigured;
      } else if (this.headerwidgetConfigValue === 'metadata') {
        return !this.options.hideMetadata && isChildWidgetConfigured;
      }
    },

    onDomRefresh: function () {
      if (this.completenessCheckView) {
        this.toggleCompletenessCheckView(true);
      }

      if (!!this.descriptionView && this.descriptionView.ui.readMore.is(":hidden") &&
          this.descriptionView.ui.showLess.is(":visible")) {
        this.descriptionView.ui.showLess.click();
        this.currentlyFocusedElement().focus();
      }

      this.isTabable() ? this.currentlyFocusedElement().attr("tabindex", "0") :
      this.currentlyFocusedElement().attr("tabindex", "-1");
      this._clampTexts();
    },

    onBeforeDestroy: function () {
      if (this.metadataView) {
        this.metadataView.destroy();
      }
      if (this.displayUrlView) {
        this.displayUrlView.destroy();
      }
    }
  });

  return HeaderView;
});
