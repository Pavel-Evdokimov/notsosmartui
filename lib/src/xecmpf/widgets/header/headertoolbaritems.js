/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['module',
  'csui/lib/underscore',
  'csui/controls/toolbar/toolitems.factory',
  'csui/controls/toolbar/toolitem.model',
  'conws/widgets/header/impl/favorite.icon.view',
  'conws/widgets/header/impl/commenting.icon.view',
  'xecmpf/widgets/header/impl/completenesscheck/completenesscheck.view',
  'i18n!csui/controls/tabletoolbar/impl/nls/localized.strings',
  'i18n!xecmpf/utils/commands/nls/localized.strings',
  'csui-ext!xecmpf/widgets/header/headertoolbaritems'
], function (module, _, ToolItemsFactory, ToolItemModel, FavoriteIconView, CommentingIconView,
    CompletenessCheckView, Lang, CommandsLang, extraToolItems) {

  var headerToolbarItems = {

    rightToolbar: new ToolItemsFactory({
      main: [
        {
          signature: "SearchFromHere",
          name: CommandsLang.SearchWorkspace,
          icon: "icon xecmpf-icon-search",
          className: "csui-search-button",
          index: 1
        },
        {
          signature: "Comment",
          name: Lang.ToolbarItemComment,
          icon: "icon icon-socialComment",
          enabled: true,
          className: "esoc-socialactions-comment",
          customView: true,
          viewClass: CommentingIconView,
          commandData: {useContainer: true},
          index: 5
        },
        {
          signature: "Favorite2",
          enabled: true,
          viewClass: FavoriteIconView,
          customView: true,
          commandData: {useContainer: true},
          index: 6
        }
      ],
      completeness: [
        {
          signature: "CompletenessCheck",
          enabled: true,
          viewClass: CompletenessCheckView,
          customView: true,
          commandData: {useContainer: true},
          index: 2
        }
      ]
    })
  };

  if (!!extraToolItems) {
    _.each(extraToolItems, function (moduleToolItems) {
      _.each(moduleToolItems, function (toolItems, key) {
        var targetToolbar = headerToolbarItems[key];
        if (!!targetToolbar) {
          _.each(toolItems, function (toolItem) {
            toolItem = new ToolItemModel(toolItem);
            targetToolbar.addItem(toolItem);
          });
        }
      });
    });
  }

  headerToolbarItems['rightToolbar'].collection.comparator = function (model) {
    return model.get('index');
  }
  headerToolbarItems['rightToolbar'].collection.sort();
  return headerToolbarItems;

});

