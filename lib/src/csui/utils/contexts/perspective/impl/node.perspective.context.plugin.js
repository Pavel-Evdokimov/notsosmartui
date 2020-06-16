/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
  'csui/lib/underscore', 'csui/lib/backbone',
  'csui/utils/contexts/factories/node',
  'csui/utils/contexts/factories/next.node',
  'csui/utils/contexts/factories/previous.node',
  'csui/utils/contexts/factories/application.scope.factory',
  'csui/utils/contexts/perspective/perspective.context.plugin',
  'csui/utils/contexts/perspective/node.perspectives',
  'csui/utils/classic.nodes/classic.nodes',
  'csui/utils/contexts/impl/delayed.actions.for.node'
], function (_, Backbone, NodeModelFactory, NextNodeModelFactory,
    PreviousNodeModelFactory, ApplicationScopeModelFactory,
    PerspectiveContextPlugin, nodePerspectives, classicNodes,
    delayedActions) {
  'use strict';

  var nodeOptions = {
    fields: {
      properties: [],
      columns: []
    },
    includeResources: ['metadata', 'perspective']
  };

  var NodePerspectiveContextPlugin = PerspectiveContextPlugin.extend({
    constructor: function NodePerspectiveContextPlugin(options) {
      PerspectiveContextPlugin.prototype.constructor.apply(this, arguments);

      this.applicationScope = this.context
          .getModel(ApplicationScopeModelFactory);

      this.nextNodeFactory = this.context.getFactory(NextNodeModelFactory, {
        options: nodeOptions,
        permanent: true,
        detached: true
      });
      this.nextNode = this.nextNodeFactory.property;
      delayedActions.delayCommands(this.nextNode);
      delayedActions.relayActionEvents(this);
      this.nextNode.on('change:id', this._fetchNodePerspective, this);

      this.previousNode = this.context
          .getModel(PreviousNodeModelFactory, {
            permanent: true,
            detached: true
          });
      createNodeModel.call(this);
    },

    onClear: function () {
      this._clearModels(true);
    },

    onRefresh: function () {
      this._clearModels(false);
    },

    isFetchable: function (factory) {
      return factory.property !== this.node;
    },

    _clearModels: function (recreateNode) {
      this.previousNode.clear({silent: true});
      this.previousNode.set(this.node.attributes);
      if (recreateNode) {
        createNodeModel.call(this);
      }
      this.node.clear({silent: true});
      this.node.set(this.nextNode.attributes);
      delayedActions.updateNodeActions(this);
      delayedActions.resumeRelayingActionEvents(this);
    },

    _fetchNodePerspective: function () {
      Backbone.trigger('closeToggleAction');
      var nextNodeId = this.nextNode.get('id');
      if (nextNodeId == null || nextNodeId <= 0) {
        return;
      }
      this.context.triggerMethod('request:perspective', this);
      this.applicationScope.set('id', 'node');
      delayedActions.suppressRelayingActionEvents(this);
      this.nextNodeFactory.fetch({
        success: _.bind(this._changePerspective, this, this.nextNode),
        error: _.bind(this.context.rejectPerspective, this.context)
      });
    },

    _changePerspective: function (sourceModel) {
      var classicUrl = classicNodes.getUrl(sourceModel);
      if (classicUrl) {
        window.location.replace(classicUrl);
        return;
      }

      var perspectiveModule,
          perspective = nodePerspectives.findByNode(sourceModel);
      if (_.isEmpty(sourceModel.get('perspective')) || !sourceModel.get('container') ||
          perspective.get('important')) {
        perspectiveModule = perspective.get('module');
      }
      if (perspectiveModule) {
        return this.context.overridePerspective(sourceModel, perspectiveModule);
      }

      this.context.applyPerspective(sourceModel);
    }
  });

  function createNodeModel () {
    this.node = this.context
        .getModel(NodeModelFactory, {
          options: nodeOptions
        });
    delayedActions.delayCommands(this.node);
  }

  return NodePerspectiveContextPlugin;
});
