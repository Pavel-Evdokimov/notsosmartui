/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */


define([
  "csui/lib/underscore",
  "csui/lib/jquery",
  "csui/lib/backbone",
  "csui/lib/marionette",
  "csui/widgets/shortcuts/shortcuts.view",
  "csui/controls/tile/behaviors/perfect.scrolling.behavior",
  "csui/behaviors/keyboard.navigation/tabable.region.behavior",
  "conws/models/configurationvolume/configurationvolume.factory",
  "hbs!conws/widgets/configurationvolume/impl/configurationvolume",
  "i18n!conws/widgets/configurationvolume/impl/nls/lang",
  "css!conws/widgets/configurationvolume/impl/configurationvolume"
], function (_,
    $,
    Backbone,
    Marionette,
    ShortcutsView,
    PerfectScrollingBehavior,
    TabableRegionBehavior,
    ConfigurationVolumeFactory,
    Template,
    lang) {

  var THEME_SUFFIX = ["shade1", "shade2", "shade3", "shade4"];

  var ConfigurationVolumeView = ShortcutsView.extend({
    className: 'conws-volumeshortcut-container csui-shortcut-container tile',
    template: Template,

    attributes: {
      role: 'menu'
    },

    constructor: function ConfigurationVolumeView(options) {
      options || (options = {});
      options.data || (options.data = {});
      options.model = options.context.getModel(ConfigurationVolumeFactory, {});
      Marionette.LayoutView.prototype.constructor.call(this, options);
    },

    templateHelpers: function () {
      return {
        items: this._items,
        noConfiguredVolumes: !(this.model.fetched ? this.model.get("shortcutItems").length : 0 ),
        emptyResultsText: this.model.fetched ? lang.emptyResultsText : ""
      };
    },

    modelEvents: {
      change: 'modelChange'
    },

    currentlyFocusedElement: function () {
      return (this._items && this._items.length) ?
             this._items[this._currentShortcutIndex].shortcutView.$el : "";
    },

    modelChange: function () {
      this._setupItems();
      this._currentShortcutIndex = 0;
      this.render();
    },

    _setupItems: function () {
      var self = this;
      if (this.model.fetched) {
        self._items = _.map(self.model.attributes.shortcutItems, function (item, index, arr) {
          var theme         = self._getShortcutTheme(index, arr.length),
              shortcutItems = self.model.get('shortcutItems'),
              layout;
          switch (shortcutItems.length) {
          case 1 :
            layout = 'large';
            break;
          case 2 :
            layout = 'medium';
            break;
          case 3 :
          case 4 :
            self.fitItemsInWidget = true;
            layout = 'small';
            break;
          default :
            layout = 'small';
          }
          self.addRegion("shortcut" + index, ".shortcut-region-" + index);
          var options = {
            id: (item.id || item.launchButtonID),
            type: item.type,
            layout: layout,
            theme: theme
          };
          var shortCutView = self._getShortcutView(options, self.options.context);
          shortCutView.model.fetch();
          return {
            id: (item.id || item.launchButtonID),
            type: item.type,
            layout: layout,
            shortcutView: shortCutView
          };
        });
      }
    },

    onRender: function () {
      var self          = this;
      if (self.model.fetched && self.fitItemsInWidget) {
        self.$el.find('.conws-configurevolume-tile-content').addClass('csui-shortcut-container');
      }

      _.each(this._items, function (item, index) {
        self.getRegion("shortcut" + index).show(item.shortcutView);
      });

    },

    _getShortcutTheme: function (itemIndex, numberOfItems) {
      var theme = this.options.data.shortcutTheme ? this.options.data.shortcutTheme :
                  "csui-shortcut-theme-grey";
      if (numberOfItems > 1) {
        var numOfShades = THEME_SUFFIX.length;
        theme += "-" + THEME_SUFFIX[(numOfShades - 1) - (itemIndex % numOfShades)];
      }

      return theme;
    },

    behaviors: {
      PerfectScrolling: {
        behaviorClass: PerfectScrollingBehavior,
        contentParent: '.conws-configurevolume-tile-content',
        suppressScrollX: true,
        scrollYMarginOffset: 15
      },
      TabableRegion: {
        behaviorClass: TabableRegionBehavior,
        initialActivationWeight: 100
      }
    }
  })

  return ConfigurationVolumeView;

});
