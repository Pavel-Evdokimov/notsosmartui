/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/underscore', 'csui/lib/backbone',
    'csui/lib/jquery', 'csui/lib/marionette', 'csui/utils/url',
    'csui/utils/contexts/factories/connector',
    'csui/utils/contexts/factories/node',
    'csui/controls/globalmessage/globalmessage',
    'csui/dialogs/modal.alert/modal.alert',
    'xecmpf/models/eac/eventactionplans.model',
    'hbs!xecmpf/widgets/eac/impl/editall/impl/edit.actionplans.view',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/widgets/eac/impl/eac'
], function (_, Backbone, $, Marionette, Url, ConnectorFactory, NodeFactory, GlobalMessage, ModalAlert, EACEventActionPlans, template, lang) {

    var EACEditActionPlanView = Marionette.ItemView.extend({
        className: 'eac-edit-actions',
        template: template,
        templateHelpers: function () {
            return{
                actplanLabel: lang.action,
                index: this._index + 1
            };
        },

        events: {
            'click .eac-delete-icon': 'deleteActionPlan',
            'click .eac-edit-icon': 'editActionPlan'
        },

        constructor: function EACEditActionPlanView(options) {
            options || (options = {});
            this.options = options;
            Marionette.ItemView.prototype.constructor.call(this, options);
            if (this.options.collection) {
                this.actionplancount = this.options.collection.models.length;
                this.models = this.options.collection.models;
            }
        },

        deleteActionPlan: function (event) {
            var that = this;
            ModalAlert
                    .confirmInformation(lang.confirmDeleteMsg)
                    .done(function () {
                        event.stopPropagation();
                        event.preventDefault();
                        event.selectedModel = that.model;
                        var connector = that.options.context.getObject(ConnectorFactory, that.options);
                        var deleteActplanURL = connector.connection.url.replace('/v1', '/v2');
                        deleteActplanURL = Url.combine(deleteActplanURL, 'eventactioncenter', 'actionplan');
                        deleteActplanURL = deleteActplanURL +'?rule_id='+event.selectedModel.attributes.rule_id+'&plan_id='+event.selectedModel.attributes.plan_id;

                        that.trigger('request');
                        $.ajax(connector.extendAjaxOptions({
                            type: "DELETE",
                            url: deleteActplanURL,
                            processData: false,
                            contentType: false,
                            success: function (response) {
                                GlobalMessage.showMessage("success", response.results.msg);
                                var parentObj = that._parent;
                                var node;
                                that.model.destroy();
                                if (parentObj.collection.length === 0) {
                                    parentObj._parentLayoutView().destroy();
                                } else {
                                    parentObj.render();
                                }
                                if (that.options.parentView) {
                                    node = that.options.parentView.options.context.getModel(NodeFactory, that.options.parentView.options);
                                    that.options.parentView.options.collection = new EACEventActionPlans([], _.extend({
                                        connector: node.connector,
                                        node: node
                                    }));
                                    that.options.parentView.options.collection.fetch();
                                    that.listenTo(that.options.parentView.options.collection, 'sync', function () {
                                        that.options.tableView.collection = that.options.parentView.options.collection;
                                        that.options.tableView.triggerMethod('dom:refresh');
                                        that.options.parentView._removeAll();
                                    });
                                }
                            },
                            error: function (xhr) {
                                that.trigger("error");
                                var errorMessage = xhr.responseJSON ?
                                        (xhr.responseJSON.errorDetail ? xhr.responseJSON.errorDetail :
                                                xhr.responseJSON.error) :
                                        "Server Error: Unable to perform the action";
                                GlobalMessage.showMessage("error", errorMessage);
                            }
                        }));
                    });
        },

        editActionPlan: function (event) {
            event.stopPropagation();
            event.preventDefault();
            event.selectedModel = this.model;
            event.selectedModel.attributes.namespace = this.options.namespace;
            event.selectedModel.attributes.event_name = this.options.eventname;
            event.selectedModel.attributes.system_name = this.model.get('systemname');
            event.selectedModel.fromEdit = true;
            this._parent.trigger("openEditDialog", event);
        }
    });
    return EACEditActionPlanView;
});