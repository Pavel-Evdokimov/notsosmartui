/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */



define([
  'conws/utils/icons/icons',
  'conws/controls/inlineforms/workspace/workspace.view',
  'conws/controls/inlineforms/conwstemplate/conwstemplate.view',
  'conws/controls/form/fields/alpaca/referencefield',
  'conws/controls/description/description.view',
  'conws/utils/commands/tabletoolbar.extension',
  'conws/widgets/header/impl/headertoolbaritems.masks',
  'conws/utils/commands/addconws',
  'conws/utils/commands/addconwstemplate',
  'conws/utils/commands/delete',
  'conws/utils/commands/defaultactionitems',
  'conws/widgets/relatedworkspaces/relatedworkspaces.view',
  'conws/widgets/header/header.view',
  'conws/widgets/team/team.view',
  'conws/widgets/myworkspaces/myworkspaces.view',
  'conws/widgets/metadata/metadata.view',
  'conws/widgets/outlook/conwsoutlook.view',
  'conws/widgets/configurationvolume/configurationvolume.view',
  'json!conws/widgets/relatedworkspaces/relatedworkspaces.manifest.json',
  'json!conws/widgets/header/header.manifest.json',
  'json!conws/widgets/team/team.manifest.json',
  'json!conws/widgets/myworkspaces/myworkspaces.manifest.json',
  'json!conws/widgets/metadata/metadata.manifest.json',
  'json!conws/widgets/configurationvolume/configurationvolume.manifest.json',
  'conws/widgets/outlook/impl/utils/emailservice',
  'conws/widgets/outlook/impl/utils/utility',
  'i18n!conws/widgets/team/impl/nls/team.lang',
  'i18n!conws/utils/previewpane/impl/nls/previewpane.lang',
  'i18n!conws/widgets/outlook/impl/nls/lang',
  'i18n!conws/widgets/configurationvolume/impl/nls/lang',
  'i18n!conws/widgets/configurationvolume/impl/nls/configurationvolume.manifest',
  'i18n!conws/widgets/team/impl/nls/team.manifest',
  'i18n!conws/widgets/metadata/impl/nls/metadata.manifest',
  'i18n!conws/widgets/relatedworkspaces/impl/nls/relatedworkspaces.manifest',
  'i18n!conws/widgets/header/impl/nls/header.manifest',
  'i18n!conws/widgets/myworkspaces/impl/nls/myworkspaces.manifest'

], {});

require(['require', 'css'], function (require, css) {

    css.styleLoad(require, 'conws/bundles/conws-app', true);

});
