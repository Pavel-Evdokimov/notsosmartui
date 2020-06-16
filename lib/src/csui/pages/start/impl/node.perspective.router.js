/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
  'csui/lib/underscore', 'csui/pages/start/perspective.router',
  'csui/utils/contexts/factories/next.node', 'csui/models/node/node.model',
  'i18n!csui/pages/start/nls/lang', 'i18n!csui/pages/start/impl/nls/lang'
], function (_, PerspectiveRouter, NextNodeModelFactory, NodeModel,
    publicLang, lang) {
  'use strict';

  var NodePerspectiveRouter = PerspectiveRouter.extend({
    routes: {
      'nodes/:id': 'openNodePerspective'
    },

    constructor: function NodePerspectiveRouter(options) {
      PerspectiveRouter.prototype.constructor.apply(this, arguments);

      this.nextNode = this.context.getModel(NextNodeModelFactory);
      this.listenTo(this.nextNode, 'change:id', this._updateNodeUrl);
      this.listenTo(this.nextNode, 'change:name', this._updatePageTitle);
    },

    openNodePerspective: function (id) {
      this._updatePageTitle();
      if (NodeModel.usesIntegerId) {
        id = parseInt(id);
      }
      this.nextNode.set('id', id);
    },

    onOtherRoute: function () {
      this.nextNode.clear({silent: true});
    },

    _updateNodeUrl: function () {
      this._updatePageTitle();
      this.navigate('nodes/' + this.nextNode.get('id'));
    },

    _updatePageTitle: function () {
      document.title = !this.nextNode.has('name') ?
          _.str.sformat(lang.NodeLoadingTitle, this.nextNode.get('id')) :
          _.str.sformat(publicLang.NodeTitle, this.nextNode.get('name'));
    }
  });

  return NodePerspectiveRouter;
});
