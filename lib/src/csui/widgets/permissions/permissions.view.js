/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['module', 'csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette',
  'csui/utils/base', 'csui/models/node/node.model',
  'csui/widgets/permissions/impl/permissions.content.view',
  'csui/utils/contexts/factories/node', 'csui/utils/contexts/factories/user',
  'csui/utils/contexts/factories/permission.list.factory',
  'csui/controls/mixins/view.events.propagation/view.events.propagation.mixin',
  'csui/utils/nodesprites', 'csui/utils/command.error',
  'csui/controls/progressblocker/blocker',
  'csui/models/nodechildren', 'csui/dialogs/modal.alert/modal.alert',
  'csui/utils/commands', 'csui/utils/contexts/factories/usernodepermission',
  'csui/behaviors/keyboard.navigation/tabable.region.behavior', 'csui/utils/taskqueue',
  'csui/utils/permissions/permissions.precheck',
  'hbs!csui/widgets/permissions/impl/no.permissions',
  'i18n!csui/widgets/permissions/impl/nls/lang',
  'css!csui/widgets/permissions/impl/permissions'
], function (module, _, $, Marionette, base, NodeModel, PermissionsContentView,
    NodeModelFactory, UserModelFactory, PermissionCollectionFactory, ViewEventsPropagationMixin,
    NodeSpriteCollection, CommandError, BlockingView, NodeChildrenCollection,
    ModalAlert, commands, AuthenticatedUserNodePermissionFactory, TabableRegionBehavior,
    TaskQueue, PermissionPreCheck, NoPermssionsTemplate, lang) {

  var config = module.config();
  _.defaults(config, {
    parallelism: 3
  });

  var PermissionsView = Marionette.ItemView.extend({

    className: 'cs-permissions',

    behaviors: {
      TabablesBehavior: {
        behaviorClass: TabableRegionBehavior,
        recursiveNavigation: true,
        containTabFocus: true
      }
    },

    isTabable: function () {
      return this.$('*[tabindex]').length > 0;
    },

    currentlyFocusedElement: function (event) {
      var tabElements = this.$('*[tabindex]');
      if (!!event && event.shiftKey) {
        return $(tabElements[tabElements.length - 1]);
      } else {
        return $(tabElements[0]);
      }
    },

    template: false,

    events: {
      'focusin .csui-permissions-user-picker': 'onFocusInUserPicker'
    },

    constructor: function PermissionsView(options) {
      var self = this;
      options || (options = {});
      options.data || (options.data = {});
      if (!options.model) {
        options.model = options.context.getModel(NodeModelFactory, {
          attributes: options.data.id && {id: options.data.id},
          temporary: true
        });
      }
      this.options = options;
      this.context = options.context;
      this.user = this.options.context.getModel(UserModelFactory);

      Marionette.ItemView.prototype.constructor.call(this, options);
      BlockingView.imbue(this);

      this.hasPermissionAction = options.model && options.model.actions &&
                                 !!options.model.actions.get({signature: "permissions"});

      if (this.hasPermissionAction) {
        if (this.options.model && this.options.model.models &&
            this.options.model.models.length > 0) {
          this.options.model = this.options.model.models[0];
        }

        this.collection = this.options.collection = this.options.context.getCollection(
            PermissionCollectionFactory, this.options);

        this.collection.options.node = this.options.model;
        var userNodePermissionsModel = this.context.getModel(
            AuthenticatedUserNodePermissionFactory);
        userNodePermissionsModel.node = this.options.model;
        userNodePermissionsModel.node.set("isNotFound", false);
        userNodePermissionsModel.fetch()
            .done(function () {
              self.collection.options.authenticatedUserPermissions = userNodePermissionsModel;
              self.collection.fetch({
                success: _.bind(self.onPermissionsRequestSuccess, self, self.options),
                error: _.bind(self.onPermissionsRequestFailed, self, self.options)
              });
            })
            .fail(function (cause) {
              var errMsg = new CommandError(cause);
            });

        this._blockActions();
        this.listenTo(this, "permission:inlineaction:clicked", this._hidePopovers);
      }
    },

    onRender: function () {
      if (!this.hasPermissionAction) {
        var typeName            = this.model.get("type_name") ? this.model.get("type_name") :
                                  this.model.get("shortcutNode") &&
                                  this.model.get("shortcutNode").get("type_name"),
            noPermissionContent = $('<div />', {
              'class': 'csui-no-permissions-container',
              'html': NoPermssionsTemplate({
                'messages': _.str.sformat(lang.noPermissionsAvailable, typeName)
              })
            });
        this.$el.html(noPermissionContent);
      }
    },

    _hidePopovers: function () {
      if (this.$el.parents('body') &&
          this.$el.parents('body').find('.csui-edit-permission-popover-container' +
                                        ' .binf-popover')) {
        var popoverTarget = this.$el.parents('body').find(
            '.csui-edit-permission-popover-container' +
            ' .binf-popover');
        if (popoverTarget.data('binf.popover')) {
          popoverTarget.binf_popover('destroy');
        }
      }
    },

    onFocusInUserPicker: function (event) {
      var popoverTarget = this.$el.find('.binf-popover.binf-in');
      if (popoverTarget.data('binf.popover')) {
        popoverTarget.binf_popover('destroy');
      }
    },

    onPermissionsRequestSuccess: function (options) {
      var self = this;
      if (this.permissionsContentView) {
        this.cancelEventsToViewsPropagation(this.permissionsContentView);
        this.permissionsContentView.destroy();
      }
      var userHasEditPermissions = _.filter(options.model && options.model.actions.models,
          function (action) { return action.id === "editpermissions"; }),
          isContainer            = options.model.get("container");
      if (userHasEditPermissions.length > 0 && this.model.get("permissions_model") !== "simple" &&
          isContainer) {
        options.applyTo = {};
        options.model = this.model;
        options.connector = this.model.connector;
        PermissionPreCheck.fetchPermissionsPreCheck(options);
      }
      this.permissionsContentView = new PermissionsContentView(_.defaults({
        originatingView: this,
        context: options.context,
        collection: options.collection,
        applyTo: options.applyTo,
        authUser: this.user,
        authenticatedUserPermissions: options.collection &&
                                      options.collection.options.authenticatedUserPermissions,
        hasPermissionAction: this.hasPermissionAction,
        hasEditPermissionAction: userHasEditPermissions.length > 0 ? true : false
      }, options));

      this.propagateEventsToViews(this.permissionsContentView);
      this.renderContent();
      this._unblockActions();
    },

    onPermissionsRequestFailed: function (model, request, message) {
      var error = new base.RequestErrorMessage(message);
      ModalAlert.showError(error.toString());
      this._unblockActions();
    },

    renderContent: function () {
      var fetching = this.options.model.fetching;
      if (fetching) {
        return fetching.done(_.bind(this.render, this));
      }
      if (this.permissionsContentView) {
        var permissionsContentView = this.permissionsContentView.render();
        Marionette.triggerMethodOn(permissionsContentView, 'before:show', permissionsContentView,
            this);
        this.$el.append(permissionsContentView.el);
        Marionette.triggerMethodOn(permissionsContentView, 'show', permissionsContentView, this);
      }
    },

    onBeforeDestroy: function () {
      if (this.permissionsContentView) {
        this.cancelEventsToViewsPropagation(this.permissionsContentView);
        this.permissionsContentView.destroy();
      }
    },

    _closePermissions: function () {
      var node = this.options.model;
      if (node.get('type') === 1 && node.original && node.original.get('type') === 0) {
        this.trigger("permissions:close");
      } else {
        this.trigger('permissions:close:without:animation');
      }
    },

    _blockActions: function () {
      var origView = this.options.originatingView &&
                     this.options.originatingView.$el.is('visible') ? this.options.originatingView :
                     this;
      origView && origView.blockActions && origView.blockActions();
    },

    _unblockActions: function () {
      var origView = this.options.originatingView &&
                     this.options.originatingView.$el.is('visible') ? this.options.originatingView :
                     this;
      origView && origView.unblockActions && origView.unblockActions();
    }
  });

  _.extend(PermissionsView.prototype, ViewEventsPropagationMixin);

  return PermissionsView;

});
