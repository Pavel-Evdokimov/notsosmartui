/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
  'csui/models/node/node.model', 'csui/utils/defaultactionitems'
], function (NodeModel, defaultActionItems) {
  'use strict';

  describe('defaultActionItems', function () {
    it('Prefers the command "Browse" for containers', function () {
      var node = new NodeModel({ type: 0, container: true });
      var action = defaultActionItems.find(function (actionItem) {
        if (actionItem.enabled(node)) {
          return true;
        }
      });
      expect(action).toBeDefined();
      expect(action.get('signature')).toEqual('Browse');
    });

    it('Chooses the command "OpenSpecificClassicPage" for unsupported nodes', function () {
      var node = new NodeModel({ type: 384 });
      var action = defaultActionItems.find(function (actionItem) {
        if (actionItem.enabled(node)) {
          return true;
        }
      });
      expect(action).toBeDefined();
      expect(action.get('signature')).toEqual('OpenSpecificClassicPage');
    });
  });
});
