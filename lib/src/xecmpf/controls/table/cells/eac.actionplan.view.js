/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/underscore', 'csui/lib/backbone', 'csui/controls/table/cells/templated/templated.view',
    'csui/controls/table/cells/cell.registry', 'csui/utils/contexts/factories/node',
    'csui/controls/dialog/dialog.view',
    'xecmpf/widgets/eac/impl/actionplan/add/actionplan.add.view',
    'csui/controls/dialog/impl/header.view',
    'xecmpf/widgets/eac/impl/previewpane/previewpane.view',
    'xecmpf/widgets/eac/impl/editall/edit.actionplan.list.view',
    'xecmpf/models/eac/eventactionplans.model',
    'hbs!xecmpf/controls/table/cells/impl/actionplan',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/controls/table/cells/impl/actionplan'

], function (_, Backbone, TemplatedCellView,
        cellViewRegistry, NodeFactory,
        DialogView,
        EACActionPlanAddView,
        DialogHeaderView,
        EACPreviewPane,
        EACEditActionPlanList,
        EACEventActionPlans,
        template,
        lang) {

    var ActionPlanCellView = TemplatedCellView.extend({

        template: template,
        className: 'csui-nowrap',

        triggers: {
            'click .action-plan-add': 'click:ActionPlanAdd'
        },

        events: {
            'click .action-plan-edit': 'editActionPlan'
        },

        getValueData: function () {
            var node = this.model,
                    count = node.get('action_plans').length;
            return {
                count: count,
                actionPlan: lang.actionPlan,
                addActionPlan: lang.addActionPlan
            };
        },

        onClickActionPlanAdd: function () {
            this.showActionPlanAddDialog(this.model);
        },

        showActionPlanAddDialog: function (eventModel) {
            var btnOptions = {
                ok: true,
                activeButtons: []
            }, title;

            if (eventModel.fromEdit) {
                title = lang.editRuleHeaderLabel;
            } else {
                title = lang.addRuleDialogTitle;
            }

            var view = new EACActionPlanAddView({
                context: this.options.context,
                eventModel: eventModel,
                btnOptions: btnOptions,
                currentModel: this.options.model
            });


            var headers = [
                {
                    label: title,
                    class: 'eac-dialog-header'
                },
                {
                    class: 'eac-header-divider'
                },
                {
                    label: this.options.model.get("event_name"),
                    class: 'eac-dialog-sub-heading'
                }];

            var options = {
                headers: headers,
                iconRight: 'cs-icon-cross',
                dialogCloseAria: 'Close dialog',
                dialogCloseButtonTooltip: 'Close',
                expandedHeader: true,
                fromEdit: eventModel.fromEdit ? eventModel.fromEdit : false
            };
            var headerView = new DialogHeaderView(options);

            var dialog = new DialogView({
                id: 'xecmpf-eac-actionplan-add-dialog',
                className: 'xecmpf-eac-actionplan-add-dialog',
                headerView: headerView,
                largeSize: false,
                view: view,
                buttons: [{
                        id: 'eac-actionplan-add-back-btn',
                        label: lang.backButtonLabel,
                        toolTip: lang.backButtonLabel,
                        click: function () {
                            view.triggerMethod('back', btnOptions, headerView);
                            _updateDialogButtons(dialog, btnOptions);
                        }
                    }, {
                        id: 'eac-actionplan-add-next-btn',
                        label: lang.nextButtonLabel,
                        toolTip: lang.nextButtonLabel,
                        click: function () {
                            view.triggerMethod('next', btnOptions, headerView);
                            _updateDialogButtons(dialog, btnOptions);
                        }
                    }, {
                        id: 'eac-actionplan-add-finish-btn',
                        label: lang.finishButtonLabel,
                        toolTip: lang.finishButtonLabel,
                        click: function () {
                            view.triggerMethod('finish', btnOptions, headerView);
                            _updateDialogButtons(dialog, btnOptions);
                        }
                    }]
            });

            this.listenTo(dialog, 'before:hide', function () {
                view.destroy();
            });
            var that = this;
            this.listenTo(view, 'refreshEACListPage', function () {
                dialog.destroy();
                that.triggerMethod('refreshEACListPage');
                if (that.options && that.options.tableView) {
                    var parentView = that.options.tableView.options.parentView;
                    var node = parentView.options.context.getModel(NodeFactory, parentView.options);
                    parentView.options.collection = new EACEventActionPlans([], _.extend({
                        connector: node.connector,
                        node: node
                    }));
                    parentView.options.collection.fetch();
                    this.listenTo(parentView.options.collection, 'sync', function () {
                        that.options.tableView.collection = parentView.options.collection;
                        that.options.tableView.triggerMethod('dom:refresh');
                        parentView._removeAll();
                    });
                }
            });

            dialog.show();

            _updateDialogButtons(dialog, btnOptions);

            function _updateDialogButtons(dialog, btnOptions) {
                if (btnOptions.ok) {
                    dialog.options.buttons.forEach(function (btn) {
                        var flag = (btnOptions.activeButtons.indexOf(btn.id) !== -1);
                        dialog.updateButton(btn.id, {
                            hidden: !flag,
                            disabled: !flag
                        });
                    });
                }
            }

            if (this.editDialog) {
                this.editDialog.destroy();
            }

        },
        editActionPlan: function (event) {

            event.preventDefault();
            event.stopPropagation();
            var that = this;
            if (that.previewpane) {
                that.previewpane.destroy();
            }

            that.previewpane = new EACPreviewPane({
                parent: that,
                currElemClassName: event.currentTarget.className,
                model: that.options.model,
                config: true
            });

            this.listenTo(that.previewpane, 'PopoverLayoutEidtAll', function (event) {
                that.PopoverLayoutEidtAll();
                that.previewpane.hide();
            });

            that.previewpane.show();

        },
        PopoverLayoutEidtAll: function () {

            var parentView, tableView;
            if (this.options && this.options.tableView) {
                parentView = this.options.tableView.options.parentView;
                tableView = this.options.tableView;
            }
            var editActionplanView = new EACEditActionPlanList({
                context: this.options.context,
                collection: new Backbone.Collection(this.options.model.attributes.action_plans),
                eventname: this.options.model.get("event_name"),
                namespace: this.options.model.get('namespace'),
                parentView: parentView,
                tableView: tableView
            });

            this.listenTo(editActionplanView, 'openEditDialog2', function (event) {
                this.openEditDialog(event);
                this.editDialog.destroy();
            });

            this.editDialog = new DialogView({
                className: 'eac-edit-actionplan-view',
                midSize: true,
                medSize: true,
                headers: [
                    {
                        label: lang.editActionPlan,
                        class: 'eac-edit-actionplan-label'
                    },
                    {
                        class: 'eac-edit-header-divider'
                    },
                    {
                        label: this.options.model.get("event_name"),
                        class: 'eac-eventname'
                    }],
                view: editActionplanView,
                buttons: [
                    {
                        id: 'add-new',
                        label: lang.addNew,
                        default: true,
                        disabled: false,
                        click: _.bind(this.showActionPlanAddDialog, this)
                    }
                ]
            });

            this.editDialog.show();
        },

        openEditDialog: function (event) {
            this.showActionPlanAddDialog(event.selectedModel);
        }
    },
            {
                hasFixedWidth: true,
                columnClassName: 'xecmpf-table-cell-action-plan'
            });

    cellViewRegistry.registerByColumnKey('action_plan', ActionPlanCellView);

    return ActionPlanCellView;
});