/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone', 'csui/lib/marionette', 'csui/utils/contexts/factories/connector', 'csui/controls/form/form.view',
    'xecmpf/widgets/eac/impl/actionplan/add/action.form.model', 'csui/controls/progressblocker/blocker',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'csui/controls/globalmessage/globalmessage',
    'hbs!xecmpf/widgets/eac/impl/actionplan/add/action',
    'hbs!xecmpf/widgets/eac/impl/actionplan/add/actions',
    'i18n!xecmpf/widgets/eac/impl/nls/lang'
],
        function (_, $, Backbone, Marionette, ConnectorFactory, FormView,
                EACActionFormModel, BlockingView, PerfectScrollingBehavior, GlobalMessage,
                actionTemplate, actionsTemplate, lang) {

            var EACActionView = Marionette.LayoutView.extend({

                className: 'xecm-eac-action',

                template: actionTemplate,

                templateHelpers: function () {
                    var lastIndex, actionName, action_name;
                    if (this.model.attributes.formModel.attributes.data.action) {
                        lastIndex = this.model.attributes.formModel.attributes.data.action.lastIndexOf(".");
                        actionName = this.model.attributes.formModel.attributes.data.action.slice(lastIndex + 1);
                        action_name = actionName;
                    }

                    return {
                        summary: this.options.summary,
                        actionName: action_name,
                        actionLabel: lang.actionLabel
                    };
                },

                initialize: function () {
                    if (!this.options.summary) {
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
                    actionForm: '.xecmpf-eac-action-form'
                },

                events: {
                    'click .xecmpf-eac-action-delete': '_deleteAction',
                    'click .xecmpf-eac-action-copy': '_copyAction',
                },

                _deleteAction: function () {
                    if (this._parent.collection.length > 1) {
                        var parentObj = this._parent;
                        this.model.destroy();
                        parentObj.collection.forEach(function (model, index) {
                            model.set('sequence', ++index);
                        });
                        parentObj.render();
                    } else {
                        GlobalMessage.showMessage('warning', lang.warningMsgondeletionOfLast1Action);
                    }
                },

                _copyAction: function () {
                    var formModelAttrs = _.deepClone(this.model.get('formModel').attributes);
                    var model = new Backbone.Model({
                        sequence: this.model.collection.length + 1,
                        formModel: new EACActionFormModel(formModelAttrs, {
                            context: this.options.context,
                            eventModel: this.options.eventModel
                        })
                    });
                    this.model.collection.add(model);
                },

                onRender: function () {
                    if (this.formView) {
                        this.showChildView('actionForm', this.formView);
                        this.formView.blockActions();
                        var that = this;
                        this.listenTo(this.formView, 'render', function () {
                            that.formView.unblockActions();
                        });
                    }
                },

                getSubmitData: function () {
                    return this.formView.getValues();
                }
            });

            var EACActionsView = Marionette.CompositeView.extend({

                className: 'xecmpf-eac-actions',

                template: actionsTemplate,

                templateHelpers: function () {
                    return {
                        summary: this.options.summary,
                        actionslabel: lang.addActionSummaryPageActionPlanLabel
                    };
                },

                regions: {
                    actionsRegion: ".xecmpf-eac-actions-container"
                },

                behaviors: {
                    PerfectScrolling: {
                        behaviorClass: PerfectScrollingBehavior,
                        contentParent: '.xecmpf-eac-actions-form',
                        suppressScrollX: true,
                        scrollXMarginOffset: 15
                    }
                },

                initialize: function (options) {
                    if (!options.collection) {
                        this.collection = new Backbone.Collection();
                        var model;
                        if (options.eventModel.fromEdit) {
                            var actions = this.options.eventModel.get('actions'), i;
                            for (i = 0; i < actions.length; i++) {
                                model = new Backbone.Model({
                                    sequence: i + 1,
                                    formModel: new EACActionFormModel(undefined, {
                                        context: this.options.context,
                                        eventModel: this.options.eventModel,
                                        actions: actions[i]
                                    })
                                });
                                this.collection.add(model);
                            }
                        } else {
                            model = new Backbone.Model({
                                sequence: 1,
                                formModel: new EACActionFormModel(undefined, {
                                    context: this.options.context,
                                    eventModel: this.options.eventModel
                                })
                            });
                            this.collection.add(model);
                        }

                    }
                },

                events: {
                    'click .xecmpf-eac-actions-new-add': 'addNewAction'
                },

                addNewAction: function () {
                    var isValid = true;
                    _.map(this.children._views, function (childView) {
                        if (!childView.formView.validate()) {
                            isValid = false;
                        }
                    });
                    if (isValid) {
                        var model = new Backbone.Model({
                            sequence: this.collection.length + 1,
                            formModel: new EACActionFormModel(undefined, {
                                context: this.options.context,
                                eventModel: this.options.eventModel
                            })
                        });
                        this.collection.add(model);
                    }
                },

                childViewContainer: '.xecmpf-eac-actions-container',

                childView: EACActionView,

                childViewOptions: function () {
                    return {
                        context: this.options.context,
                        eventModel: this.options.eventModel,
                        summary: this.options.summary
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

            return EACActionsView;
        });