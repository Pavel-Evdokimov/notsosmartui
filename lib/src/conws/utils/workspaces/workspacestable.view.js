/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(["module", "csui/lib/jquery", "csui/lib/underscore",
  "csui/lib/backbone", "csui/lib/marionette", "csui/utils/log",
  "i18n!conws/utils/workspaces/impl/nls/lang",
  'hbs!conws/utils/workspaces/workspacestable',
  'csui/behaviors/default.action/default.action.behavior',
  'csui/utils/contexts/factories/connector',
  'csui/controls/table/table.view',
  'csui/controls/pagination/nodespagination.view',
  'conws/utils/workspaces/workspaces.columns',
  'csui/dialogs/modal.alert/modal.alert',
  'csui/utils/base',
  'csui/controls/progressblocker/blocker',
  'css!conws/utils/workspaces/workspacestable',
  'css!conws/utils/workspaces/workspaces'
], function (module, $, _, Backbone,
    Marionette, log, lang,
    template,
    DefaultActionBehavior,
    ConnectorFactory,
    TableView,
    PaginationView,
    WorkspacesColumns,
    ModalAlert,
    base,
    BlockingView) {

  var config = module.config();
  var orderByDefault = { sortColumn: "{name}", sortOrder: "asc" };

  var WorkspacesTableView = Marionette.LayoutView.extend({

    template: template,

    regions: {
      tableRegion: '#tableview',
      paginationRegion: '#paginationview'
    },

    behaviors: {
      DefaultAction: {
        behaviorClass: DefaultActionBehavior
      }
    },

    constructor: function WorkspacesTableView(options) {
      if (options === undefined || !options.context) {
        throw new Error('Context required to create WorkspacesTableView');
      }
      if (!options.collection) {
        throw new Error('Collection required to create WorkspacesTableView');
      }
      options.data || (options.data = {});
      this.context = options.context;
      this.collection = options.collection;
      Marionette.LayoutView.prototype.constructor.apply(this, arguments); // sets this.options
      _.defaults(this.options.data, {
        pageSize: config.defaultPageSize || 20,
        orderBy: {}
      });
      _.defaults(this.options.data.orderBy, orderByDefault );

      if (this.options &&
          this.options.data &&
          this.options.data.expandedView &&
          this.options.data.expandedView.orderBy) {
        if (_.isString(this.options.data.expandedView.orderBy)) {
          log.error(lang.errorOrderByMustNotBeString) && console.log(log.last);
          ModalAlert.showError(lang.errorOrderByMustNotBeString);
        } else if (this.options.data.expandedView.orderBy.sortColumn) {
          var parameterPlaceholder = /{([^:}]+)(:([^}]+))?}/g;
          var match = parameterPlaceholder.exec(this.options.data.expandedView.orderBy.sortColumn);
          if (!match) {
            log.error(lang.errorOrderByMissingBraces) && console.log(log.last);
            ModalAlert.showError(lang.errorOrderByMissingBraces);
          }
        }
      }

      this.onWinRefresh = _.bind(this.windowRefresh, this);
      $(window).bind("resize.app", this.onWinRefresh);

      if (this.options.blockingParentView) {
        BlockingView.delegate(this, this.options.blockingParentView);
      } else {
        BlockingView.imbue(this);
      }
      this.listenTo(this, 'after:show', this.windowRefresh);
      this.listenTo(this.collection, "error", function (model,response,options) {
        this.unblockActions.apply(this, arguments);
        if (response) {
          ModalAlert.showError((new base.Error(response)).message);
        }
      });
    },

    onDestroy: function () {
      $(window).unbind("resize.app", this.onWinRefresh);
    },

    doRender: function (collection) {
      _.extend(collection.options.query, this._getCollectionUrlQuery());
      collection.setLimit(0, this.options.data.pageSize, false);
      var self = this;
      collection
          .once('sync', function() {
            self.renderAfterFetch(self,collection);
          })
          .fetch();
    },

    renderAfterFetch: function (self, collection) {
      var columns   = self.collection.columns,
          connector = self.context.getObject(ConnectorFactory);
      var columnsWithSearch = [];
      _.each(columns.models, function (model) {
        if (model.get("sort") === true && model.get("type") === -1) {
          columnsWithSearch.push(model.get("column_key"));
        }
      });
      var tableColumns = WorkspacesColumns.clone();
      var error = {};
      tableColumns.add(this._getCustomColumns(true));

      this.tableView = new TableView({
        context: this.options.context,
        connector: connector,
        collection: collection,
        columns: columns,
        tableColumns: tableColumns,
        columnsWithSearch: columnsWithSearch,
        selectColumn: false,
        pageSize: this.options.data.pageSize,
        orderBy: this.collection.orderBy,
        nameEdit: false,
        tableTexts: {
          zeroRecords: lang.noWorkspacesFound
        }
      });
      this.tableView.enableEmptyViewText();
      this.listenTo(this.tableView, 'execute:defaultAction', function (node) {
        this.triggerMethod('execute:defaultAction', node);
      });
      this.listenTo(this.tableView, 'render', function () {
        this.tableView.triggerMethod('refresh:tabindexes');
      });
      self.paginationView = new PaginationView({
        collection: collection,
        pageSize: self.options.data.pageSize
      });
      if (!_.isUndefined(self.tableView.accFocusedState.body.column)) {
        self.tableView.accFocusedState.body.column = 1;
      }

      self.tableRegion.show(self.tableView);
      self.paginationRegion.show(self.paginationView);
    },
    _getCustomColumns: function (showError) {
      var customColumns = [], errors = [];
      if (this.options &&
          this.options.data &&
          this.options.data.expandedView &&
          this.options.data.expandedView.customColumns) {
        var unknownError = false;
        var seqnr = 500;
        this.options.data.expandedView.customColumns.forEach(function (cc) {
          var parameterPlaceholder = /{([^:}]+)(:([^}]+))?}/g;
          var match = parameterPlaceholder.exec(cc.key);
          if (match) {
            customColumns.push(_.defaults({key:match[1],sequence:seqnr++},cc));
          } else {
            if (showError) {
              if (cc.key && cc.key.indexOf("{")>=0) {
                unknownError = true;
                log.error(lang.errorCustomColumnConfigInvalid, cc.key) && console.log(log.last);
              } else {
                log.error(lang.errorCustomColumnMissingBraces, cc.key) && console.log(log.last);
              }
              errors.push(cc.key)
            }
          }
        });
        if (showError && errors.length>0) {
          var errfmt = unknownError ? lang.errorCustomColumnConfigInvalid : lang.errorCustomColumnMissingBraces;
          ModalAlert.showError(_.str.sformat(errfmt, errors.join(", ")));
        }
      }
      return customColumns;
    },
    _getCustomColumnKeys: function () {
      var columns = this._getCustomColumns();
      return columns.length > 0 ? $.map(columns, function (val, i) {
        return val.key
      }) : [];
    },
    _getCoreColumnKeys: function () {
      var columns = WorkspacesColumns.models;
      return columns.length > 0 ? $.map(columns, function (val, i) {
        return val.get("key");
      }) : [];
    },
    getColumnsToFetch: function () {
      var columns         = this._getCustomColumnKeys(),
          coreColumns     = this._getCoreColumnKeys(),
          requiredColumns = ["id", "type", "container"];
      _.each(coreColumns, function (coreColumn) {
        if ($.inArray(coreColumn, columns) < 0) {
          columns.push(coreColumn);
        }
      });
      _.each(requiredColumns, function (requiredColumn) {
        if ($.inArray(requiredColumn, columns) < 0) {
          columns.push(requiredColumn);
        }
      });

      return columns.toString()
    },
    windowRefresh: function () {
      if (this.paginationView) {
        this.paginationView.triggerMethod('dom:refresh');
      }
    },
    onDomRefresh: function () {
      _.each(this.regionManager._regions, function (region) {
        if (region.currentView) {
          region.currentView.trigger('dom:refresh');
        }
      });
    },
    onShow: function () {
      _.each(this.regionManager._regions, function (region) {
        if (region.currentView) {
          region.currentView.trigger('show');
        }
      });
    },
    onAfterShow: function () {
      _.each(this.regionManager._regions, function (region) {
        if (region.currentView) {
          region.currentView.triggerMethod('after:show');
        }
      });
    }
  });

  return WorkspacesTableView;
});
