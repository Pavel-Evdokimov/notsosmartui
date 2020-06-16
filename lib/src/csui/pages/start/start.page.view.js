/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */


define(['module', 'csui/lib/underscore', 'csui/lib/jquery',
  'csui/lib/marionette', 'csui/utils/routing', 'csui/utils/namedlocalstorage',
  'csui/utils/contexts/perspective/perspective.context',
  'csui/utils/contexts/factories/connector', 'csui/utils/contexts/factories/user',
  'csui/utils/contexts/factories/application.scope.factory',
  'csui/pages/start/perspective.routing', 'csui/utils/base',
  'csui/pages/start/impl/navigationheader/navigationheader.view',
  'csui/controls/breadcrumbspanel/breadcrumbspanel.view',
  'csui/controls/perspective.panel/perspective.panel.view',
  'csui/controls/mixins/view.events.propagation/view.events.propagation.mixin',
  'csui/behaviors/keyboard.navigation/tabables.behavior',
  'csui/behaviors/keyboard.navigation/tabable.region.behavior',
  'csui/utils/non-emptying.region/non-emptying.region',
  'csui/utils/non-attaching.region/non-attaching.region',
  'csui/utils/page.leaving.blocker', 'csui/controls/iconpreload/icon.preload.view',
  'csui/lib/radio', 'css!csui/pages/start/impl/start.page'
], function (module, _, $, Marionette, routing, NamedLocalStorage,
    PerspectiveContext, ConnectorFactory, UserModelFactory, ApplicationScopeModelFactory,
    PerspectiveRouting, base, NavigationHeaderView, BreadcrumbsPanelView, PerspectivePanelView,
    ViewEventsPropagationMixin, TabablesBehavior, TabableRegionBehavior, NonEmptyingRegion,
    NonAttachingRegion, PageLeavingBlocker, IconPreloadView, Radio) {

  var config = _.extend({
    signInPageUrl: 'signin.html',
    redirectToSignInPage: !routing.routesWithSlashes()
  }, module.config());

  var StartPageView = Marionette.ItemView.extend({

    template: false,

    behaviors: {
      TabablesBehavior: {
        behaviorClass: TabablesBehavior
      }
    },

    constructor: function StartPageView(options) {
      options || (options = {});
      options.el = document.body;

      Marionette.View.prototype.constructor.call(this, options);
      var context   = new PerspectiveContext(),
          connector = context.getObject(ConnectorFactory);
      if (!connector.connection.credentials &&
          !connector.authenticator.isAuthenticated() &&
          !connector.authenticator.syncStorage().isAuthenticated()) {
        this._navigateToSignIn();
        return;
      }

      this.applicationScope = context.getModel(ApplicationScopeModelFactory);
      connector.authenticator.on('loggedOut', function (args) {
        if (args.reason !== 'logged-out') {
          this._navigateToSignIn();
        }
      }, this);
      this.navigationHeader = new NavigationHeaderView({
        context: context,
        signInPageUrl: this.options.signInPageUrl
      });

      this.context = context;

      this.listenTo(this.applicationScope, 'change:breadcrumbsVisible',
          this._showOrHideBreadcrumbs);

      this.breadcrumbsPanel = new BreadcrumbsPanelView({
        context: context
      });

      this.user = context.getModel(UserModelFactory);
      this.listenTo(this.user, 'change', this.updateUserPreferences);

      this.perspectivePanel = new PerspectivePanelView({
        context: context
      });

      this.propagateEventsToViews(this.navigationHeader, this.breadcrumbsPanel,
          this.perspectivePanel);

      var routing = PerspectiveRouting.getInstance({
        context: context
      });
      routing.start();
      this.$el.addClass('binf-widgets');
      if (base.isAppleMobile()) {
        this.$el.addClass('csui-on-ipad');
      }
      $(window).unload(function () {});
    },

    onRender: function () {
      if (this._redirecting) {
        return this;
      }

      IconPreloadView.ensureOnThePage();

      this._appendView(this.navigationHeader);
      $(this.$el.children()[0]).attr('role', 'banner');
      this._appendView(this.breadcrumbsPanel);
      this._appendView(this.perspectivePanel);
      $(this.$el.children()[2]).attr('role', 'main');
      setTimeout(_.bind(function () {
        var bodyRegion = new NonAttachingRegion({el: this.el});
        bodyRegion.show(this, {render: false});
      }, this));
      this.$el.bind('globalmessage.shown', function (event, view) {
        var messageTabable = new TabableRegionBehavior(view.options, view);
      });
    },

    onBeforeDestroy: function () {
      this.navigationHeader && this.navigationHeader.destroy();
      this.breadcrumbsPanel && this.breadcrumbsPanel.destroy();
      this.perspectivePanel && this.perspectivePanel.destroy();
    },

    updateUserPreferences: function () {
      var userName = this.user.get('name');
      this.userPreferences = userName ? new NamedLocalStorage(
          'userPreferences:' + userName) : undefined;
      if (this._isRendered) {
        var prefVisible = this.userPreferences.get('breadcrumbs-visible');
        if (prefVisible === undefined) {
          prefVisible = true;
        }
        this._setBreadcrumbsVisibility(prefVisible);
      }
    },

    _showOrHideBreadcrumbs: function (args1, args2) {
      var breadcrumbsVisible = this.applicationScope.get('breadcrumbsVisible');
      this._setBreadcrumbsVisibility(breadcrumbsVisible);
    },

    _setBreadcrumbsVisibility: function (visible) {
      if (visible) {
        this.$el.addClass('csui-breadcrumbs-visible');
      } else {
        this.$el.removeClass('csui-breadcrumbs-visible');
      }
      this.userPreferences.set('breadcrumbs-visible', visible);
      this.applicationScope.set('breadcrumbsVisible', visible);
    },

    _appendView: function (view) {
      var region = new NonEmptyingRegion({el: this.el});
      region.show(view);
    },

    _navigateToSignIn: function () {
      if (!config.redirectToSignInPage) {
        PageLeavingBlocker.forceDisable();
        location.reload();
      } else {
        var signInPageUrl = this.options.signInPageUrl || config.signInPageUrl,
            query         = location.search;
        query += query ? '&' : '?';
        query += 'nextUrl=' + encodeURIComponent(location.pathname);
        location.href = signInPageUrl + query + location.hash;
      }
      this._redirecting = true;
    }

  });

  _.extend(StartPageView.prototype, ViewEventsPropagationMixin);

  return StartPageView;

});
