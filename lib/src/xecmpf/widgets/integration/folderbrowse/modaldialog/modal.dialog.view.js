/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/controls/dialog/dialog.view',
  'hbs!xecmpf/widgets/integration/folderbrowse/modaldialog/impl/modal.dialog',
  'i18n!xecmpf/widgets/integration/folderbrowse/impl/nls/localized.strings',
  'css!xecmpf/widgets/integration/folderbrowse/modaldialog/impl/modal.dialog'
], function (DialogView, Template, Lang) {
  var ModalDialogView = DialogView.extend({
    template: Template,
    templateHelpers: function () {
      return {
        closeToolTip: Lang.CloseToolTip
      };
    }
  });
  return ModalDialogView;
});