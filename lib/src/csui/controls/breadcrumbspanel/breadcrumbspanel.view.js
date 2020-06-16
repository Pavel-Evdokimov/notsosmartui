/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/marionette', 'csui/utils/contexts/factories/ancestors',
  'csui/utils/contexts/factories/application.scope.factory',
  'csui/controls/breadcrumbs/breadcrumbs.view',
  'hbs!csui/controls/breadcrumbspanel/impl/breadcrumbspanel',
  'i18n!csui/controls/breadcrumbs/impl/breadcrumb/impl/nls/lang',
  'css!csui/controls/breadcrumbspanel/impl/breadcrumbspanel'
], function (Marionette, AncestorCollectionFactory, ApplicationScopeModelFactory, BreadcrumbsView,
    BreadcrumbsPanelTemplate, lang) {
  'use strict';

  var BreadcrumbsPanelView = Marionette.LayoutView.extend({

    attributes: {id: 'breadcrumb-wrap'},

    className: 'binf-container-fluid',

    template: BreadcrumbsPanelTemplate,

    ui: {
      tileBreadcrumb: '.tile-breadcrumb',
      breadcrumbsWrap: '#breadcrumb-wrap'
    },

    regions: {
      breadcrumbsInner: '.breadcrumb-inner'
    },

    templateHelpers: function () {
      return {
        breadcrumbAria: lang.breadcrumbAria
      };
    },

    constructor: function BreadcrumbsPanelView(options) {

      Marionette.LayoutView.apply(this, arguments);

      this.applicationScope = options.context.getModel(ApplicationScopeModelFactory);
      this.listenTo(this.applicationScope, 'change:breadcrumbsVisible', this._showOrHideBreadcrumbs);

      this.listenTo(this.options.context, 'request', this._contextFetching);
      this.listenTo(this.options.context, 'sync error', this._contextFetched);
      this.listenTo(this.options.context, 'current:folder:changed', this._currentFolderChanged);
    },

    _getAncestors: function () {
      var ancestors = this.options.context.getCollection(AncestorCollectionFactory);
      if (this.ancestors !== ancestors) {
        if (this.ancestors) {
          this.stopListening(this.ancestors, 'sync', this._ancestorsFetched);
        }
        this.listenTo(ancestors, 'sync', this._ancestorsFetched);
        this.ancestors = ancestors;
      }
      return ancestors;
    },

    _contextFetching: function () {
      this._contextHasFetched = false;
      this._breadcrumbsHaveChanged = false;
      var ancestors = this._getAncestors();
      if (this.breadcrumbs && ancestors !== this.breadcrumbs.completeCollection) {
        this.breadcrumbs.updateCompleteCollection(ancestors);
      }
    },

    _contextFetched: function () {
      this._contextHasFetched = true;
      this._breadcrumbsAvailable = this.ancestors.isFetchable();
      this._showOrHideBreadcrumbs(); // show or remove breadcrumb depending on state
      this.applicationScope.set('breadcrumbsAvailable', this._breadcrumbsAvailable);
    },

    _currentFolderChanged: function (node) {
      if (this.ancestors) {
        if (this.ancestors.isFetchable()) {
          if (node) {
            var ancestor = this.ancestors.findWhere({id: node.get('id')});
            if (ancestor) {
              ancestor.set('name', node.get('name'));
            } else {
              this.ancestors.reset([]);
              if (this.breadcrumbs) {
                this.breadcrumbs.updateCompleteCollection(this.ancestors);
                this.triggerMethod('change:breadcrumbs', {isBreadcrumbsEmpty: true});
              }
            }
          } else {
            this.ancestors.fetch();
          }
        } else {
          this.ancestors.reset([]);
        }
      }
    },

    _breadCrumbsChanged: function () {
      this.triggerMethod('change:breadcrumbs', {
        isBreadcrumbsEmpty: this.ancestors.size() === 0
      });
    },

    _ancestorsFetched: function () {
      this._breadcrumbsHaveChanged = true;
      if (this._contextHasFetched) {
        this._breadCrumbsChanged();
      }
    },

    onRender: function () {
      this._showOrHideBreadcrumbs();
    },

    _showOrHideBreadcrumbs: function() {
      this._breadcrumbsVisible = this.applicationScope.get('breadcrumbsVisible');
      if (this._breadcrumbsVisible && this._breadcrumbsAvailable) {
        if (!this.breadcrumbs) {
          this.breadcrumbs = new BreadcrumbsView({
            context: this.options.context,
            collection: this._getAncestors(),
            fetchOnCollectionUpdate: false
          });
          this.breadcrumbsInner.show(this.breadcrumbs);
          this.breadcrumbs.synchronizeCollections();
          this.$el.addClass('breadcrumb-wrap-visible');
          this.triggerMethod("tabable", this);
          this.breadcrumbs.triggerMethod("refresh:tabindexes");
        }
      } else {
        if (this.breadcrumbs) {
          this.$el.removeClass('breadcrumb-wrap-visible');
          this.breadcrumbsInner.empty();
          delete this.breadcrumbs;
        }
      }
    },

    hideBreadcrumbs: function () {
      if (this.breadcrumbs) {
        this.breadcrumbs.hideSubCrumbs();
      }
      this.$el.removeClass('breadcrumb-wrap-visible');
      this.triggerMethod("tabable:not", this);
      this.$el.hide();
    },

    showBreadcrumbs: function () {
      this.$el.addClass('breadcrumb-wrap-visible');
      this.triggerMethod("tabable", this);
      this.$el.show();
      this.breadcrumbs && this.breadcrumbs.triggerMethod("refresh:tabindexes");
    },

    isTabable: function () {
      if (this.breadcrumbs) {
        return this.ancestors.size() > 1;
      } else {
        return false;
      }
    }

  });

  return BreadcrumbsPanelView;
});
