/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['require',
    'csui/lib/jquery',
    'csui/lib/underscore',
    'csui/lib/marionette',
    'csui/lib/backbone',
    'xecmpf/widgets/workspaces/pages/select.workspace/select.workspace.view',
    'xecmpf/widgets/workspaces/pages/create.workspace/create.workspace.view',
    'xecmpf/widgets/workspaces/pages/display.workspace/display.workspace.view',
    'xecmpf/widgets/workspaces/pages/update.workspace/update.workspace.view',
    'xecmpf/widgets/workspaces/factories/workspace.factory',
    'xecmpf/widgets/workspaces/factories/workspace.types.factory',

    'conws/models/workspacecreateforms',

    'csui/utils/contexts/factories/connector',
    "csui/models/node/node.model",
    'csui/dialogs/modal.alert/modal.alert',

    'i18n!xecmpf/widgets/workspaces/controllers/impl/nls/lang'
], function (require, $, _,
    Marionette, Backbone,
    SelectWorkspaceView,
    CreateWorkspaceView,
    DisplayWorkspaceView,
    UpdateWorkspaceView,
    WorkspacesCollectionFactory,
    WorkspaceTypeCollectionFactory,
    WorkspaceCreateFormCollection,

    ConnectorFactory,
    NodeModel,
    ModalAlert,
    lang) {


    var DialogController = Marionette.Object.extend({

        constructor: function DialogController(options) {
            options = options || {};
            this.options = options;
            this.context = this.options.context || {};
            this.region = this.options.region;
        },
        updateWorkspace: function (options) {
            options || (options = this.options);
            this._showUpdateWorkspaceView(options);
        },
        displayWorkspace: function (options) {
            options || (options = this.options);
            this._showDisplayWorkspaceView(options);
        },
        createWorkspace: function (options) {
            options || (options = this.options);
            this._showCreateWorkspaceView(options);
        },
        selectWorkspace: function (options) {
            options || (options = this.options);
            options.status || (options.status = {});

            var context = options.context,
                data = options.data,
                that = this,
                promises = [];

            this._getBOWorkspace(context, data)
                .done(function (boWorkspace) {
                    if (boWorkspace) {
                        _.defaults(options.status, {
                            workspaceNode: boWorkspace,
                            viewMode: {
                                mode: data.viewMode ? data.viewMode.mode : 'folderBrowse'
                            }
                        });
                        that.displayWorkspace(options);
                    } else {
                        promises.push(that._getBOEarlyWorkspaces(context, data));
                        promises.push(that._getBOWorkspaceType(context, data));
                        $.when.apply($, promises)
                            .done(function (boEarlyWorkspaces, boWorkspaceType) {
                                if (boEarlyWorkspaces && !!boEarlyWorkspaces.length) {
                                    that._showSelectWorkspaceView(options);
                                } else {
                                    _.defaults(options.status, {
                                        workspaceType: new Backbone.Model({
                                            wksp_type_name: boWorkspaceType.get('wksp_type_name'),
                                            wksp_type_id: boWorkspaceType.get('wksp_type_id'),
                                            rm_enabled: boWorkspaceType.get('rm_enabled'),
                                            template: boWorkspaceType.get('templates')[0],
                                            type: 848
                                        }),
                                        mode: 'directCreate'
                                    });
                                    that._showCreateWorkspaceView(options);
                                }
                            })
                            .fail(function (jqXHR, statusText, error) {
                                if (jqXHR) {
                                    if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
                                        ModalAlert.showError(lang.errorGettingBusinessWorkspaceType + ' ' + jqXHR.responseJSON.error);
                                    } else {
                                        ModalAlert.showError(lang.errorGettingBusinessWorkspaceType);
                                    }
                                }
                            });
                    }
                })
                .fail(function (jqXHR, statusText, error) {
                    if (jqXHR) {
                        if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
                            ModalAlert.showError(lang.errorGettingBusinessWorkspaceType + ' ' + jqXHR.responseJSON.error);
                        } else {
                            ModalAlert.showError(lang.errorGettingBusinessWorkspaceType);
                        }
                    }
                });
        },

        _showCreateWorkspaceView: function (options) {
            this.region.show(new CreateWorkspaceView(options));
        },
        _showDisplayWorkspaceView: function (options) {
            this.region.show(new DisplayWorkspaceView(options));
        },
        _showUpdateWorkspaceView: function (options) {
            var updateView = new UpdateWorkspaceView(options),
                self = this;
            updateView.fetchForm().done(function () {
                self.region.show(updateView);
            });
        },
        _showSelectWorkspaceView: function (options) {
            this.region.show(new SelectWorkspaceView(options));
        },

        _getBOWorkspace: function (context, data) {
            var deferred = $.Deferred();
            var boWorkspace = false;
            if (data.hasOwnProperty('workspaceNodeId')) {
                if (!!data['workspaceNodeId']) {
                    boWorkspace = new NodeModel({
                        id: data.workspaceNodeId,
                        container: true
                    })
                }
                deferred.resolve(boWorkspace);
            }
            else {
                var collection = context.getCollection(WorkspacesCollectionFactory, {
                    attributes: data.busObjectId,
                    busObjectId: data.busObjectId,
                    busObjectType: data.busObjectType,
                    extSystemId: data.extSystemId,
                    detached: true // fetching manually
                });
                collection.ensureFetched()
                    .done(function () {
                        if (collection.length === 1) {
                            boWorkspace = new NodeModel({
                                id: collection.at(0).get('id'),
                                container: true
                            });
                        }
                        deferred.resolve(boWorkspace);
                    })
                    .fail(function () {
                        deferred.reject.apply(deferred, arguments);
                    });
            }
            return deferred;
        },
        _getBOEarlyWorkspaces: function (context, data) {
            var deferred = $.Deferred();
            var collection = context.getCollection(WorkspacesCollectionFactory, {
                attributes: 'early',
                early: true,
                busObjectType: data.busObjectType,
                extSystemId: data.extSystemId,
                detached: true // fetching manually
            });

            var promise;
            if (data.deletecallback) {
                promise = collection.fetch();
            } else {
                promise = collection.ensureFetched();
            }

            promise
                .done(function () {
                    deferred.resolve(collection);
                })
                .fail(function () {
                    deferred.reject.apply(deferred, arguments);
                });
            return deferred;
        },
        _getBOWorkspaceType: function (context, data) {
            var deferred = $.Deferred();
            var boWorkspaceType = false;
            var collection = context.getCollection(WorkspaceTypeCollectionFactory, {
                busObjectType: data.busObjectType,
                extSystemId: data.extSystemId,
                detached: true // fetching manually
            });
            collection.ensureFetched()
                .done(function () {
                    if (collection.at(0).get('templates').length === 1) {
                        boWorkspaceType = collection.at(0);
                    }
                    deferred.resolve(boWorkspaceType);
                })
                .fail(function () {
                    deferred.reject.apply(deferred, arguments);
                });

            return deferred;
        }
    });

    return DialogController;
});