/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette',
  'csui/behaviors/keyboard.navigation/tabable.region.behavior',
  'hbs!csui/controls/side.panel/impl/header',
  'i18n!csui/controls/side.panel/impl/nls/lang',
  'css!csui/controls/side.panel/impl/side.panel'
], function(_, $, Marionette, TabableRegion, template, lang) {

  var SidePanelHeaderView = Marionette.ItemView.extend({

    template: template,

    behaviors: {
      TabableRegion: {
        behaviorClass: TabableRegion
      }
    },

    className: 'cs-header-control',

    ui: {
      title: '.csui-sidepanel-title .csui-heading',
      closeBtn: '.csui-sidepanel-close'
    },

    triggers: {
        "click @ui.closeBtn": "close:click"
    },

    templateHelpers: function() {
      return {};
    },

    constructor: function SidePanelHeaderView(options) {
      Marionette.ItemView.prototype.constructor.apply(this, arguments);
    },

    onRender: function() {
      var headers = this.options.headers || [];
      if (headers.length) {
        _.each(headers, function(header) {
          var $header = this._renderHeader(header);
          this.$el.append($header);
        }, this);
      }
      var headerControl = this.options.headerControl;
      if (headerControl) {
        this.ui.headerControl.append(headerControl.$el);
        headerControl.render();
        headerControl.trigger('dom:refresh');
      }

      if (!!this.options.actionIconLeft) {
        this._adjustTitleCSS();
      }
    },

    onDomRefresh: function() {
      var headerControl = this.options.headerControl;
      if (headerControl) {
        headerControl.triggerMethod('dom:refresh');
        headerControl.triggerMethod('after:show');
      }
    },

    update: function(slide) {
      this.ui.title.text(slide.title);
    }

  });

  return SidePanelHeaderView;
});