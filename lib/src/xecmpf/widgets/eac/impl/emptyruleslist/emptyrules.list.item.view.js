/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
    'csui/lib/marionette',
    'hbs!xecmpf/widgets/eac/impl/emptyruleslist/impl/emptyrules.list.item',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/widgets/eac/impl/eac'
], function (Marionette, template, lang) {
    var EACEmptyRulesItemView = Marionette.ItemView.extend({
        template: template,

        templateHelpers: function () {
            return{
                emptyRules: this.options.noRules ? lang.noRulesDefined : ''
            };
        },

        constructor: function EACEmptyRulesItemView(options) {
            this.options = options;
            Marionette.ItemView.prototype.constructor.call(this, options);
        }
    });

    return EACEmptyRulesItemView;
});


