/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
  'i18n!xecmpf/utils/commands/nls/localized.strings',
], function (CommandsLang) {
  var headerToolbarItems = {
    rightToolbar: [
      {
        signature: "CollapsePageOverlay",
        name: CommandsLang.CollapsePageOverlay,
        icon: "icon xecmpf-collapse-icon",
		className: "xecmpf-collapse",
        index: 7,
        group: 'main'
      }
    ]
  };

  return headerToolbarItems;
});
