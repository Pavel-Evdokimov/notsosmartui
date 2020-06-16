/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/backbone', 'csui/lib/marionette',
    'csui/controls/form/form.view',
    'xecmpf/widgets/eac/impl/actionplan/add/summary.form.model',
    'xecmpf/widgets/eac/impl/actionplan/add/rules.view',
    'xecmpf/widgets/eac/impl/actionplan/add/actions.view',
    'xecmpf/widgets/eac/impl/emptyruleslist/emptyrules.list.item.view',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'hbs!xecmpf/widgets/eac/impl/actionplan/add/summary',
    'i18n!xecmpf/widgets/eac/impl/nls/lang'
], function (Backbone, Marionette,
        FormView, SummaryFormModel, RulesView, ActionsView, EACEmptyRulesItemView, PerfectScrollingBehavior, template, lang) {

    var EACSummaryView = Marionette.LayoutView.extend({

        className: 'xecmpf-eac-summary',

        template: template,

        templateHelpers: function () {
            return {
                bussapp: lang.bussapplicatoin,
                namespace: this.options.eventModel.get ? this.options.eventModel.get('namespace') : this.options.eventModel.attributes.namespace
            };
        },

        regions: {
            rules: '.xecmpf-eac-summary-rules',
            actions: '.xecmpf-eac-summary-actions',
            form: '.xecmpf-eac-summary-form'
        },

        behaviors: {
            PerfectScrolling: {
                behaviorClass: PerfectScrollingBehavior,
                contentParent: '.xecmpf-eac-summary-view',
                suppressScrollX: true,
                scrollXMarginOffset: 15
            }
        },

        initialize: function (options) {
        },

        onRender: function () {

            var noRules = false;
            if (this.options.data.rules.length === 1) {
                if (this.options.data.rules.models[0].attributes.formModel.get('data').from === '' ||
                        this.options.data.rules.models[0].attributes.formModel.get('data').operator === '' ||
                        this.options.data.rules.models[0].attributes.formModel.get('data').to === '') {
                    noRules = true;
                }
            } else if (this.options.data.rules.length === 0) {
                noRules = true;
            }


            this.rulesSummaryView = new RulesView({
                summary: true,
                noRules: noRules,
                collection: this.options.data.rules
            });

            this.actionsSummaryView = new ActionsView({
                summary: true,
                collection: this.options.data.actions
            });

            var model = new SummaryFormModel(undefined, {
                context: this.options.context,
                eventModel: this.options.eventModel
            });

            this.formView = new FormView({
                context: this.options.context,
                mode: 'create',
                model: model
            });

            this.showChildView('rules', this.rulesSummaryView);
            this.showChildView('actions', this.actionsSummaryView);
            this.showChildView('form', this.formView);
        },

        getSubmitData: function () {
            return this.formView.getValues();
        }

    });
    return EACSummaryView;
});