/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(["module", "csui/lib/jquery", "csui/lib/underscore", "csui/lib/backbone",
  "csui/lib/marionette", "csui/utils/log",
  'conws/utils/workspaces/impl/workspaceutil',
  'conws/utils/workspaces/workspacestable.view'
], function (module, $, _, Backbone,
    Marionette, log,
    workspaceUtil, WorkspacesTableView) {

  var RelatedWorkspacesTableView = WorkspacesTableView.extend({

    constructor: function RelatedWorkspacesTableView(options) {
      WorkspacesTableView.prototype.constructor.apply(this, arguments);
    },

    onRender: function () {
      var collection = this.collection;
      if (!_.isUndefined(this.collection.options.relatedWorkspaces.attributes.sortExpanded)) {
        collection.orderBy = this.collection.options.relatedWorkspaces.attributes.sortExpanded;
      } else {
        collection.orderBy = workspaceUtil.orderByAsString(this.options.data.orderBy);
      }

      this.doRender(collection);
    },

    _getCollectionUrlQuery: function () {

      var query = {where_relationtype: this.options.data.relationType};
      query.fields = encodeURIComponent("properties{" + this.getColumnsToFetch() + "}");
      query.action = "properties-properties";
      query.expand_users = "true";

      return query;
    }

  });

  return RelatedWorkspacesTableView;
});
