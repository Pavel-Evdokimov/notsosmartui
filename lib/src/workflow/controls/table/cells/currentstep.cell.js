/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/jquery', 'csui/lib/underscore', 'csui/lib/backbone', 'csui/lib/marionette',
  'csui/controls/table/cells/cell.registry',
  'csui/controls/table/cells/templated/templated.view',
  'workflow/utils/workitem.util',
  'hbs!workflow/controls/table/cells/impl/currentstep',
  'css!workflow/controls/table/cells/impl/currentstep'
], function ($, _, Backbone, Marionette, cellViewRegistry, TemplatedCellView, WorkItemUtil, Template) {
  'use strict';

  var CurrentStepCellView = TemplatedCellView.extend({

    template: Template,

    renderValue: function () {
      var data = this.getValueData(),
          html = data ? this.template(data) : '';
      this.$el.html(html);
    },

    getValueData: function () {
      var model           = this.model,
          column          = this.options.column,
          columnName      = column.name,
          currentStepName = model.get(columnName), remainingStepCount, status = model.get("status_key");
      if (currentStepName == null) {
        currentStepName = '';
      }
      if (status && status !== WorkItemUtil.constants.WFSTATUS_COMPLETED) {
        remainingStepCount = model.get("steps_count") - 1;
      }
      currentStepName = currentStepName.toString();
      return {
        currentStepName: currentStepName,
        remainingStepCount: remainingStepCount
      };
    }
  });
  cellViewRegistry.registerByColumnKey('step_name', CurrentStepCellView);

  return CurrentStepCellView;
});