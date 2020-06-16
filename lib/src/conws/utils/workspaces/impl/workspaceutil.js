/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */


define([
  'csui/lib/jquery',
  'csui/lib/underscore'
], function ($, _, Backbone, NodeModel) {

  function WorkspaceUtil () {}

  _.extend(WorkspaceUtil.prototype,{

    orderByAsString: function (orderBy,defCol,defOrd) {
      var sc;

      var ret, order = {sc:defCol, so:defOrd};
      if (orderBy) {
        order = _.defaults({sc:orderBy.sortColumn,so:orderBy.sortOrder},order);
      }
      if (order.sc) {
        var parameterPlaceholder = /{([^:}]+)(:([^}]+))?}/g;
        var match = parameterPlaceholder.exec(order.sc);
        if (match) {
          order.sc = match[1];
        } else {
          order.sc = undefined;
        }
      }
      if (order.sc || order.so) {
        ret = _.str.sformat("{0} {1}", order.sc?order.sc:"name", order.so?order.so:"asc");
      }
      return ret;
    }

  });

  return new WorkspaceUtil();
});
