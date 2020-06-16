/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/underscore', 'csui/controls/table/cells/templated/templated.view',
  'csui/controls/table/cells/cell.registry',
  'hbs!xecmpf/controls/table/cells/impl/actionplan',
  'i18n!xecmpf/widgets/eac/impl/nls/lang',
  'css!xecmpf/controls/table/cells/impl/actionplan',

], function (_, TemplatedCellView,
  cellViewRegistry, template,
  lang) {

    var ActionPlanCellView = TemplatedCellView.extend({

      template: template,
      className: 'csui-nowrap',

      triggers: {
        'click .add-action-plan': 'click:AddActionPlan',
        'click .edit-action-plan': 'click:EditActionPlan',
        'mouseenter .edit-action-plan': 'mouseenter:EditActionPlan',
      },

      getValueData: function () {
        var node = this.model,
          count = node.get('action_plans').length;
        return {
          count: count,
          actionPlan: lang.actionPlan,
          addActionPlan: lang.addActionPlan
        }
      },

      onClickAddActionPlan: function () {
        this.options.tableView.triggerMethod('click:AddActionPlan');
      },

      onClickEditActionPlan: function () {
        this.options.tableView.triggerMethod('click:EditActionPlan');
      },

      onMouseenterEditActionPlan: function () {
        this.options.tableView.triggerMethod('mouseenter:EditActionPlan');
      },

    }, {
        hasFixedWidth: true,
        columnClassName: 'xecmpf-table-cell-action-plan'
      });

    cellViewRegistry.registerByColumnKey('action_plan', ActionPlanCellView);

    return ActionPlanCellView;
  });