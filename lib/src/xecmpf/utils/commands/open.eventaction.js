/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['require', 'csui/lib/jquery',
  'csui/models/command', 'csui/utils/commandhelper'
], function (require, $, CommandModel, CommandHelper) {
  'use strict';

  var OpenEventActionCommand = CommandModel.extend({

    defaults: {
      signature: 'OpenEventActionPage',
      command_key: ['default', 'open'],
      scope: 'single'
    },

    execute: function (status, options) {
      var deferred = $.Deferred();
      require(
        ['csui/lib/underscore', 'csui/lib/backbone', 'csui/utils/contexts/factories/next.node',
          'csui/utils/contexts/factories/node'
        ], function (_, Backbone, NextNodeModelFactory, NodeModelFactory) {
          var context = status.context || options && options.context,
            nextNode = context.getModel(NextNodeModelFactory),
            currentNode = context.getModel(NodeModelFactory),
            node = CommandHelper.getJustOneNode(status);
          if (!!status.nodes.models[0].attributes &&
            status.nodes.models[0].attributes.type === 898) {
            
            nextNode.set('id', node.get('id'));
            
          }

          deferred.resolve();

          return deferred.promise();

        });
    }
  });

  return OpenEventActionCommand;

});
