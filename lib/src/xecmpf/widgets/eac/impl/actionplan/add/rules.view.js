/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone', 'csui/lib/marionette',
    'csui/utils/contexts/factories/connector', 'csui/controls/form/form.view', 'csui/controls/progressblocker/blocker',
    'xecmpf/widgets/eac/impl/actionplan/add/rule.form.model',
    'xecmpf/widgets/eac/impl/emptyruleslist/emptyrules.list.item.view',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'hbs!xecmpf/widgets/eac/impl/actionplan/add/rule',
    'hbs!xecmpf/widgets/eac/impl/actionplan/add/rules',
    'csui/controls/globalmessage/globalmessage',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'csui/utils/deepClone/deepClone'
], function (_, $, Backbone, Marionette,
        ConnectorFactory, FormView, BlockingView,
        EACRuleFormModel, EACEmptyRulesItemView, PerfectScrollingBehavior,
        ruleTemplate, rulesTemplate, GlobalMessage, lang) {

    var EACRuleView = Marionette.LayoutView.extend({

        className: 'xecmpf-eac-rule',
        template: ruleTemplate,
        templateHelpers: function () {
            return {
                summary: this.options.summary,
                ruleName: this.model.attributes.formModel.attributes.data.from,
                operator: this.model.attributes.formModel.attributes.data.operator,
                value: this.model.attributes.formModel.attributes.data.to,
                noRules: this.options.noRules,
                noRulesDef: lang.noRulesDefined,
                conditionLabel: lang.conditionLabel
            };
        },

        initialize: function (options) {
            if (!options.summary) {
                this.formView = new FormView({
                    context: this.options.context,
                    layoutMode: 'singleCol',
                    mode: 'create',
                    model: this.model.get('formModel')
                });
                BlockingView.imbue(this.formView);
            }
        },
        regions: {
            ruleForm: '.xecmpf-eac-rule-form'
        },
        events: {
            'click .xecmpf-eac-rule-delete': '_deleteRule',
            'click .xecmpf-eac-rule-copy': '_copyRule'
        },
        _deleteRule: function () {
            if (this._parent.collection.length > 1) {
                var parentObj = this._parent;
                this.model.destroy();
                var i;
                parentObj.collection.forEach(function (model, index) {
                    i = ++index;
                    model.set('sequence', i);
                    model.get('formModel').options.sq = i;
                });
                parentObj.collection.models[i - 1].attributes.formModel.attributes.data.conjunction = "";
                parentObj.render();
            } else {
                GlobalMessage.showMessage('warning', lang.warningMsgondeletionOfLast1Rule);
            }
        },
        onRender: function () {
            if (this.formView) {
                this.showChildView('ruleForm', this.formView);
                this.formView.blockActions();
                var that = this;
                this.listenTo(this.formView, 'render', function () {
                    that.formView.unblockActions();
                });
            }

        },
        getSubmitData: function () {
            if (this.formView.getValues().from !== ''
                    && this.formView.getValues().operator !== '' && this.formView.getValues().to !== '') {
                return this.formView.getValues();
            }
        }
    });
    var EACRulesView = Marionette.CompositeView.extend({

        className: 'xecmpf-eac-rules',
        template: rulesTemplate,
        templateHelpers: function () {
            return {
                summary: this.options.summary,
                rulesLabel: lang.rulesLabel
            };
        },
        region: {
            rulesRegion: '.xecmpf-eac-rules-container'
        },

        behaviors: {
            PerfectScrolling: {
                behaviorClass: PerfectScrollingBehavior,
                contentParent: '.xecmpf-eac-rules-form',
                suppressScrollX: true,
                scrollXMarginOffset: 15
            }
        },
        
        initialize: function (options) {
            var model;
            var that = this;
            if (!options.collection) {
                this.collection = new Backbone.Collection();
                if (options.eventModel.fromEdit) {
                    var rules = this.options.eventModel.get('rules'), i;
                    if (rules.length === 0) {
                        model = new Backbone.Model({
                            sequence: 1,
                            formModel: new EACRuleFormModel(undefined, {
                                context: this.options.context,
                                eventModel: this.options.eventModel,
                                sq: 1,
                                selectCallback: function (e, modelObj) {
                                    that.actionPlanSelected(e, modelObj);
                                }
                            })
                        });
                        this.collection.add(model);
                    } else {
                        for (i = 0; i < rules.length; i++) {
                            model = new Backbone.Model({
                                sequence: i + 1,
                                formModel: new EACRuleFormModel(undefined, {
                                    context: this.options.context,
                                    eventModel: this.options.eventModel,
                                    sq: i + 1,
                                    rules: rules[i],
                                    selectCallback: function (e, modelObj) {
                                        that.actionPlanSelected(e, modelObj);
                                    }
                                })
                            });
                            this.collection.add(model);
                        }
                    }

                } else {
                    model = new Backbone.Model({
                        sequence: 1,
                        formModel: new EACRuleFormModel(undefined, {
                            context: this.options.context,
                            eventModel: this.options.eventModel,
                            sq: 1,
                            selectCallback: function (e, modelObj) {
                                that.actionPlanSelected(e, modelObj);
                            }
                        })
                    });
                    this.collection.add(model);
                }
            }

            this.listenTo(this, "changeCong", function (e, modelObj) {
                if (this.collection && this.collection.length === modelObj.options.sq) {
                    this.addNewRule();
                }
            })

        },
        actionPlanSelected: function (e, modelObj) {
            if (modelObj.attributes.data.conjunction !== '') {
                this.trigger("changeCong", e, modelObj);
            }
        },
        emptyView: EACEmptyRulesItemView,

        emptyViewOptions: function () {
            return this.options;
        },

        addNewRule: function () {
            var isValid = true;
            var that = this;
            _.map(this.children._views, function (childView) {
                if (childView.formView) {
                    if (!childView.formView.validate()) {
                        isValid = false;
                        var emptyModel = new Backbone.Model({
                            id: null,
                            name: "<None>"
                        });
                        childView.formView.form.childrenByPropertyId['conjunction'].fieldView.setValue(emptyModel);
                    }
                }
            });
            if (isValid) {
                var model = new Backbone.Model({
                    sequence: this.collection.length + 1,
                    formModel: new EACRuleFormModel(undefined, {
                        context: this.options.context,
                        eventModel: this.options.eventModel,
                        sq: this.collection.length + 1,
                        selectCallback: function (e, modelObj) {
                            that.actionPlanSelected(e, modelObj);
                        }
                    })
                });
                this.collection.add(model);
            }

        },

        childViewContainer: '.xecmpf-eac-rules-container',
        childView: EACRuleView,
        childViewOptions: function () {
            return {
                context: this.options.context,
                eventModel: this.options.eventModel,
                summary: this.options.summary,
                noRules: this.options.noRules
            };
        },
        getSummaryData: function () {
            return this.collection;
        },
        getSubmitData: function () {
            return _.map(this.children._views, function (childView) {
                return childView.getSubmitData();
            });
        }
    });
    return EACRulesView;
});