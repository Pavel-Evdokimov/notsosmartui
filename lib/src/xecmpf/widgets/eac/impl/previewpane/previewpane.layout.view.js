/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/underscore',
    'csui/lib/jquery',
    'csui/lib/backbone',
    'csui/lib/marionette',
    'csui/utils/url',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'csui/utils/contexts/factories/connector',
    'xecmpf/widgets/eac/impl/previewpane/previewpane.header.view',
    'xecmpf/widgets/eac/impl/previewpane/previewpane.footer.view',
    'xecmpf/widgets/eac/impl/carousel.nav/carousel.nav.view',
    'xecmpf/widgets/eac/impl/previewpane/previewpane.list.view',
    'hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane.layout.view',
    'csui/behaviors/keyboard.navigation/tabkey.behavior',
    'i18n!xecmpf/widgets/eac/impl/nls/lang'
], function (_, $, Backbone, Marionette, Url, PerfectScrollingBehavior, ConnectorFactory, EACPopoverHeaderView, EACPopoverFooterView, CarouselView, EACListView, template, TabKeyBehavior, lang) {

    var EACPopoverLayoutView = Marionette.LayoutView.extend({
        className: 'xecmpf-eac-binf-popover-layout-view',
        template: template,

        events: {
            'click #xecmpf-eac-popover-back': 'navigateToPreviousView',
            'click #xecmpf-eac-popover-next': 'navigateToNextView',
            'click .xecmpf-eac-popover-footer': 'openEditAllActionPlan'
        },

        regions: {
            headerRegion: ".xecmpf-eac-popover-header",
            rulesRegion: ".xecmpf-eac-rules-region",
            actionRegion: ".xecmpf-eac-action-region",
            runasRegion: ".xecmpf-eac-popover-runas",
            footerRegion: ".xecmpf-eac-popover-footer",
            navigationRegion: ".xecmpf-eac-navigation-controller"
        },

        constructor: function EACPopoverLayoutView(options) {
            options || (options = {});
            Marionette.LayoutView.prototype.constructor.apply(this, arguments);
            this.currIndex = 0;
            this.actionplan = this.options.model.get('action_plans');
            this.actionplan.eventname = this.options.model.get('event_name');
            this.actionplan.namespace = this.options.model.get('namespace');
            this.actionplan.eventid = this.options.model.get('event_id');
            this.actionplan.systemname = this.options.model.get('business_application');

            this.updateLayoutView(this.currIndex, false);
        },

        templateHelpers: function () {
            return {
                rule: lang.rulesLabel,
                actionPlanLabel: lang.columnActionPlan
            };
        },

        behaviors: {
            PerfectScrolling: {
                behaviorClass: PerfectScrollingBehavior,
                contentParent: '.xecmpf-eac-popover-content-all',
                suppressScrollX: true,
                scrollYMarginOffset: 15
            },
            TabKeyRegion: {
                behaviorClass: TabKeyBehavior
              }
        },

        updateLayoutView: function (currIndex, isShowRegion) {
            this.headerView(currIndex, isShowRegion);
            this.contentView(currIndex, isShowRegion);
            this.navCouroselView(currIndex, isShowRegion);
            this.footerView(isShowRegion);
        },

        navigateToNextView: function () {
            this.updateLayoutView(this.currIndex + 1, true);
            this.currIndex = this.currIndex + 1;
        },

        navigateToPreviousView: function () {
            this.updateLayoutView(this.currIndex - 1, true);
            this.currIndex = this.currIndex - 1;
        },

        openEditAllActionPlan: function (event) {
            event.currIndex = this.currIndex;
            this.trigger("PopoverLayoutEidtAll", event);
        },

        headerView: function (currIndex, isShowRegion) {
            if (this.headerRegionViewObject && isShowRegion) {
                this.headerRegionViewObject.destroy();
            }
            currIndex = currIndex + 1;
            var enableBackButton = false;
            var enableNextButton = false;
            var actionPlanCount = this.model.attributes.action_plans.length;
            if (currIndex === actionPlanCount) {
                if (actionPlanCount === 1) {
                    enableBackButton = false;
                } else {
                    enableBackButton = true;
                }
                enableNextButton = false;
            } else if (currIndex === 1) {
                enableBackButton = false;
                enableNextButton = true;
            } else {
                enableBackButton = true;
                enableNextButton = true;
            }
            this.headerRegionViewObject = new EACPopoverHeaderView({
                headerTypeName: lang.actionPlan,
                planName: this.actionplan.eventname,
                index: currIndex,
                enableBackButton: enableBackButton,
                enableNextButton: enableNextButton
            });

            if (isShowRegion) {
                this.headerRegion.show(this.headerRegionViewObject);
            }

        },

        contentView: function (currIndex, isShowRegion) {
            if (this.rulesView && this.actionsView && this.actPlanRunasView && isShowRegion) {
                this.rulesView.destroy();
                this.actionsView.destroy();
                this.actPlanRunasView.destroy();
            }
            var actionPlans = this.actionplan;
            var rules = actionPlans[currIndex]["rules"];
            var actionPlan = actionPlans[currIndex]["actions"];

            this.rulesView = new EACListView({
                collection: new Backbone.Collection(rules),
                rulesView: true
            });

            this.actionsView = new EACListView({
                collection: new Backbone.Collection(actionPlan),
                actionsView: true
            });

            this.actPlanRunasView = new EACListView({
                runAsHeader: lang.runAs,
                runAsUser: actionPlans[currIndex]['run_as_value'],
                processHeader: lang.processMode,
                processMode: actionPlans[currIndex]['process_mode'],
                isactPlanRunView: true
            });

            if (isShowRegion) {
                this.rulesRegion.show(this.rulesView);
                this.actionRegion.show(this.actionsView);
                this.runasRegion.show(this.actPlanRunasView);
            }
        },

        footerView: function (isShowRegion) {
            if (this.footerRegionViewObject && isShowRegion) {
                this.footerRegionViewObject.destroy();
            }
            this.footerRegionViewObject = new EACPopoverFooterView({
                enableButton: true,
                editButtonName: lang.editAllButtonLabel
            });

            if (isShowRegion) {
                this.footerRegion.show(this.footerRegionViewObject);
            }

        },

        navCouroselView: function (currIndex, isShowRegion) {
            if (this.navigationViewObject && isShowRegion) {
                this.navigationViewObject.destroy();
            }
            var total = this.model.attributes.action_plans.length;
            var current = currIndex;

            if (total > 1) {
                this.navigationViewObject = new CarouselView({
                    count: total,
                    active: current
                });
            }

            if (isShowRegion) {
                this.navigationRegion.show(this.navigationViewObject);
            }
        },

        _onDomRefresh: function () {
            if (this.$el.is(':visible')) {
                if (this.runasRegion || this.rulesRegion || this.actionRegion) {
                    this.rulesRegion.triggerMethod('dom:refresh', this.rulesRegion);
                    this.actionRegion.triggerMethod('dom:refresh', this.actionRegion);
                    this.runasRegion.triggerMethod('dom:refresh', this.runasRegion);
                }
            }
        },

        onRender: function () {
            this.headerRegion.show(this.headerRegionViewObject);
            this.footerRegion.show(this.footerRegionViewObject);
            if (this.navigationViewObject) {
                this.navigationRegion.show(this.navigationViewObject);
            }
            this.runasRegion.show(this.actPlanRunasView);
            this.rulesRegion.show(this.rulesView);
            this.actionRegion.show(this.actionsView);
        }
    });

    return EACPopoverLayoutView;
});        