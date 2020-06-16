/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
    'csui/lib/marionette',
    'hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane.list.item',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/widgets/eac/impl/eac'
], function (Marionette, template, lang) {
    var EACListItemView = Marionette.ItemView.extend({
        tagName: 'div',
        template: template,
        templateHelpers: function () {
            var that = this;
            return {
                isRulesView: that.options.rulesView,
                isActionPlanView: that.options.actionsView,
                runAsHeader: that.options.runAsHeader,
                runAsUser: that.options.runAsUser,
                processHeader: that.options.processHeader,
                processMode: that.options.processMode,
                isactPlanRunView: that.options.isactPlanRunView,
                noRules: that.options.noRules ? that.options.noRules : false,
                emptyRules: lang.noRulesDefined,
                action_name: this.options.model.get('action_name')
            };
        },
        constructor: function EACListItemView(options) {
            options || (options = {});
            this.options = options;
            if(this.options.actionsView){
                var lastIndex = this.options.model.get('action_key').lastIndexOf(".");
                var actionName = this.options.model.get('action_key').slice(lastIndex+1);
                this.options.model.attributes.action_name = actionName;
            }
            Marionette.ItemView.prototype.constructor.call(this, options);
        }


    });
    return EACListItemView;
});