/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette',
    'csui/utils/contexts/factories/connector',
    'xecmpf/widgets/eac/impl/carousel.nav/carousel.nav.view',
    'xecmpf/widgets/eac/impl/actionplan/add/rules.view',
    'xecmpf/widgets/eac/impl/actionplan/add/actions.view',
    'xecmpf/widgets/eac/impl/actionplan/add/summary.view',
    'csui/controls/globalmessage/globalmessage',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'hbs!xecmpf/widgets/eac/impl/actionplan/add/actionplan.add',
    'csui/behaviors/keyboard.navigation/tabkey.behavior',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/widgets/eac/impl/actionplan/add/actionplan.add'
], function (_, $, Marionette,
        ConnectorFactery, CarouselNavView,
        RulesView, ActionsView, SummaryView,
        GlobalMessage, PerfectScrollingBehavior,
        template,
        TabKeyBehavior,
        lang) {

    var EACActionPlanAddView = Marionette.LayoutView.extend({

        className: 'xecmpf-eac-actionplan-add',

        template: template,

        steps: [{
                key: 'rules',
                viewClass: RulesView,
                label: lang.addRuleDialogTitle,
                updateLabel: lang.editRuleHeaderLabel,
                buttons: ['eac-actionplan-add-next-btn']
            }, {
                key: 'actions',
                viewClass: ActionsView,
                label: lang.addActionPlanLabel,
                updateLabel: lang.editActionPlanLabel,
                buttons: ['eac-actionplan-add-back-btn', 'eac-actionplan-add-next-btn']
            }, {
                key: 'summary',
                viewClass: SummaryView,
                label: lang.saveActionPlanLabel,
                updateLabel: lang.updateActionPlanLabel,
                viewOptions: function () {
                    var data = this.steps.reduce(function (memo, step) {
                        if (step.view && !step.view.isDestroyed) {
                            memo[step.key] = getOption.call(step.view, 'getSummaryData', step.view);
                        }
                        return memo;
                    }, {});
                    return {
                        data: data
                    }
                },
                buttons: ['eac-actionplan-add-back-btn', 'eac-actionplan-add-finish-btn']
            }],

        initialize: function (options) {
            this.active = 0;

            this.navView = new CarouselNavView({
                count: this.steps.length,
                active: this.active
            });

            this.step = this.steps[this.active];
            options.btnOptions.activeButtons = this.step.buttons;
            options.btnOptions.genInfo = this.generalInfo(options);
        },

        behaviors: {
            TabKeyRegion: {
                behaviorClass: TabKeyBehavior
            }
        },

        generalInfo: function (options) {
            var genInfo = {};
            var localModuleObject;
            if (options.eventModel.attributes) {
                localModuleObject = options.eventModel.attributes;
            } else if (options.currentModel.attributes) {
                localModuleObject = options.currentModel.attributes;
                options.eventModel.attributes = {
                    namespace: options.currentModel.attributes.namespace,
                    event_name: options.currentModel.attributes.event_name
                };
            }

            genInfo['event_id'] = localModuleObject.event_id;
            genInfo['namespace'] = localModuleObject.namespace;
            genInfo['event_name'] = localModuleObject.event_name;
            genInfo['rule_id'] = localModuleObject.rule_id;
            genInfo['plan_id'] = localModuleObject.plan_id;
            return genInfo;
        },

        regions: {
            nav: '.xecmpf-eac-actionplan-add-nav',
            content: '.xecmpf-eac-actionplan-add-content'
        },

        onBack: function (btnOptions, headerView) {
            if (this.active > 0) {
                this.step = this.steps[--this.active];
                btnOptions.activeButtons = this.step.buttons;
                this._showContentView(headerView);
                this.navView.triggerMethod('back');
            }
        },

        onNext: function (btnOptions, headerView) {
            var isValid = true;
            if (this.active < this.steps.length - 1) {

                if (this.step.key === 'actions') {
                    _.map(this.step.view.children._views, function (childView) {
                        if (!childView.formView.validate()) {
                            isValid = false;
                        }
                    });
                }
                if (this.step.key === 'rules') {
                    _.map(this.step.view.children._views, function (childView) {
                        if (childView.formView.model.get('data').to && childView.formView.model.get('data').from && childView.formView.model.get('data').operator) {
                            isValid = true;
                        }else if(!childView.formView.model.get('data').to && !childView.formView.model.get('data').from && !childView.formView.model.get('data').operator){
							isValid = true;
						}else{
							isValid = false;
							childView.formView.validate();
						}
                    });
                }
                if (isValid) {
                    this.step = this.steps[++this.active];
                    btnOptions.activeButtons = this.step.buttons;
                    this._showContentView(headerView);
                    this.navView.triggerMethod('next');
                }
            }
        },

        onFinish: function (btnOptions, headerView) {
            var isValid = true;
            if (this.step.key === 'summary') {
                if (!this.step.view.formView.validate()) {
                    isValid = false;
                }
            }
            if (isValid) {
                var requestData = this.steps.reduce(function (memo, step) {
                    if (step.view && !step.view.isDestroyed) {
                        memo[step.key] = getOption.call(step.view, 'getSubmitData', step.view);
                        if (step.key === 'rules') {
                            if (memo[step.key][0] === undefined) {
                                memo[step.key] = undefined;
                            }
                        }
                    }
                    return memo;
                }, {});

                requestData['gen_information'] = btnOptions.genInfo;

                var actionPlanRequest = new FormData();
                var requestDataString = JSON.stringify(requestData);
                actionPlanRequest.append('action_plan_items', requestDataString);

                var connector = this.options.context.getObject(ConnectorFactery);
                var postURL = connector.connection.url.replace('/v1', '/v2') + '/eventactioncenter/actionplan';
                var that = this;

                $.ajax(connector.extendAjaxOptions({
                    type: "PUT",
                    url: postURL,
                    data: actionPlanRequest,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        that.trigger("sync");
                        if (response.results.statusCode === 200 && response.results.ok) {
                            that.trigger("refreshEACListPage");
                            var errorPopup = GlobalMessage.showMessage("success", response.results.msg);
                            setTimeout(function () {
                                errorPopup.doClose();
                            }, 3000);
                        }
                    },
                    error: function (xhr, status, error) {
                        that.trigger("error");
                        that.trigger("refreshEACListPage");
                        var errorMessage = xhr.responseJSON ?
                                (xhr.responseJSON.errorDetail ? xhr.responseJSON.errorDetail :
                                        xhr.responseJSON.error) :
                                "Server Error: Unable to perform the action";
                        var errorPopup = GlobalMessage.showMessage("error", errorMessage);
                        setTimeout(function () {
                            errorPopup.doClose();
                        }, 3000);
                    }
                }));
            }
        },

        _showContentView: function (headerView) {
            if (!this.step.view || this.step.view.isDestroyed) {
                this.step.view = new this.step.viewClass(_.extend({
                    context: this.options.context,
                    eventModel: this.options.eventModel,
                    headerView: headerView
                }, getOption.call(this, 'viewOptions', this.step)));
            }
            this.showChildView('content', this.step.view, {preventDestroy: true});
            if (headerView && headerView.options && headerView.options.headers) {
                if (headerView.options.fromEdit) {
                    headerView.options.headers[0] = {label: this.step.updateLabel, class: "eac-dialog-header"};
                } else {
                    headerView.options.headers[0] = {label: this.step.label, class: "eac-dialog-header"};
                }
                headerView.render();
            }

        },

        onRender: function () {
            this.showChildView('nav', this.navView);
            this._showContentView();            
        },
        
        onAfterShow: function () {
            this.step.view.triggerMethod('dom:refresh');
        },

        onBeforeDestroy: function () {
            this.navView.destroy();
            this.steps.forEach(function (step) {
                step.view && step.view.destroy();
            });
        }
    });

    function getOption(property, source) {
        var value = source[property];
        return _.isFunction(value) ? value.call(this) : value;
    }

    return EACActionPlanAddView;
});