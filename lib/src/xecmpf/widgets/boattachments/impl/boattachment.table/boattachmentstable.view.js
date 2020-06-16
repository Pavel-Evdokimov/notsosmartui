/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['module', 'csui/lib/jquery', 'csui/lib/underscore',
    'csui/lib/backbone', 'csui/lib/marionette', 'csui/utils/base',
    'csui/behaviors/default.action/default.action.behavior',
    'csui/behaviors/table.rowselection.toolbar/table.rowselection.toolbar.behavior',
    'csui/utils/contexts/factories/connector',
    'csui/controls/table/table.view', 'csui/controls/pagination/nodespagination.view',
    'csui/dialogs/modal.alert/modal.alert',
    'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',
    'csui/utils/commands', 'csui/controls/table/rows/description/description.view',
    'xecmpf/widgets/boattachments/impl/boattachment.table/toolbaritems',
    'xecmpf/widgets/boattachments/impl/boattachment.table/boattachments.columns',
    'i18n!xecmpf/widgets/boattachments/impl/nls/lang',
    'hbs!xecmpf/widgets/boattachments/impl/boattachment.table/boattachmentstable',
    'css!xecmpf/widgets/boattachments/impl/boattachment.table/boattachmentstable'
], function (module, $, _, Backbone, Marionette, base,
    DefaultActionBehavior, TableRowSelectionToolbarBehavior,
    ConnectorFactory,
    TableView, PaginationView,
    ModalAlert,
    LayoutViewEventsPropagationMixin,
    commands, DetailsRowView,
    toolbarItems,
    AttachmentsColumns,
    lang, template) {

    var config = module.config();

    _.defaults(config, {
        defaultPageSize: 30,
        orderBy: {
            sortColumn: '{name}',
            sortOrder: 'asc'
        }
    });

    var BOAttachmentTableView = Marionette.LayoutView.extend({

        className: 'xecmpf-boattachments-table',

        template: template,

        regions: {
            toolbarRegion: '.csui-rowselection-toolbar',
            tableRegion: '#botableview',
            paginationRegion: '#bopaginationview'
        },

        behaviors: {
            DefaultAction: {
                behaviorClass: DefaultActionBehavior
            },
            TableRowSelectionToolbar: {
                behaviorClass: TableRowSelectionToolbarBehavior
            }
        },

        constructor: function BOAttachmentTableView(options) {
            options || (options = {});

            _.defaults(options, {
                data: {},
                pageSize: config.defaultPageSize,
                toolbarItems: toolbarItems,
                toolbarItemsMasks: {
                    toolbars: {}
                }
            });

            _.defaults(options.data, {
                pageSize: config.defaultPageSize,
                orderBy: config.orderBy
            });

            this.context = options.context;
            this.collection = options.collection;

            Marionette.LayoutView.prototype.constructor.apply(this, arguments);
            this.propagateEventsToRegions();
        },

        initialize: function (options) {
            this.setTableView();
            this.setPagination();

            if (options.collection) {
                this.collection.fetched = false;
            }
        },

        setTableView: function () {
            this.columns = this.collection.columns;
            this.connector = (this.collection.node && this.collection.node.connector) ||
                this.context.getObject(ConnectorFactory);
            var columnsWithSearch = [''];
            _.each(this.columns.models, function (model) {
                if (model.get('sort') === true && model.get('type') === -1) {
                    columnsWithSearch.push(model.get('column_key'));
                }
            });
            var tableColumns = AttachmentsColumns.clone();

            this.tableView = new TableView({
                context: this.options.context,
                haveDetailsRowExpandCollapseColumn: true,
                descriptionRowView: DetailsRowView,
                descriptionRowViewOptions: {
                    firstColumnIndex: 2,
                    lastColumnIndex: 2,
                    showDescriptions: true,
                    collapsedHeightIsOneLine: true
                },
                connector: this.connector,
                collection: this.collection,
                columns: this.columns,
                tableColumns: tableColumns,
                columnsWithSearch: columnsWithSearch,
                selectColumn: true,
                pageSize: this.options.data.pageSize,
                orderBy: this.collection.options.boAttachments.attributes.sortExpanded || this.collection.orderBy,
                nameEdit: false,
                tableTexts: {
                    zeroRecords: lang.noAttachmentsFound
                },
                maxColumnsDisplayed: 10
            });

            this.listenTo(this.tableView, 'execute:defaultAction', function (node) {
                var args = {
                    node: node
                };
                this.trigger('before:defaultAction', args);
                if (!args.cancel) {
                    this.defaultActionController.executeAction(node, {
                        context: this.options.context,
                        originatingView: this
                    }).done(function () {
                        this.trigger('executed:defaultAction', args);
                    }.bind(this));
                }
            });
        },

        setPagination: function () {
            this.paginationView = new PaginationView({
                collection: this.collection,
                pageSize: this.options.data.pageSize
            });
        },

        onRender: function () {
            this.collection.fetch({
                reload: true
            });
            this.tableRegion.show(this.tableView);
            this.paginationRegion.show(this.paginationView);
        },

        onBeforeShow: function () {
            var parent = this._parent;
            while (!parent.headerView) {
                parent = parent._parent;
            }
            this._renderTitleIconWaterMark(parent);
        },

        _renderTitleIconWaterMark: function (dialogView) {
            var titleImgEl = dialogView.headerView &&
                dialogView.headerView.$el.find('.tile-type-image img')[0];
            if (titleImgEl) {
                $(titleImgEl).after('<span class="csui-icon xecmpf-icon-boattachment-overlay" ' +
                    'title="' + lang.businessAttachments + '"></span>');
            }
        }
    });

    _.extend(BOAttachmentTableView.prototype, LayoutViewEventsPropagationMixin);

    return BOAttachmentTableView;
});