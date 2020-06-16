/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
  'csui/lib/backbone'
], function (Backbone) {
  'use strict';

  var PerspectiveRouter = Backbone.Router.extend({
    constructor: function PerspectiveRouter(options) {
      Backbone.Router.prototype.constructor.apply(this, arguments);
      this.context = options.context;
      this._routeWithSlashes = options.routeWithSlashes;
      this.listenTo(this, 'other:route', this.onOtherRoute);
    },

    execute: function (callback, args) {
      this.trigger('before:route', this);
      return Backbone.Router.prototype.execute.apply(this, arguments);
    },

    navigate: function (fragment, options) {
      if (this._routeWithSlashes) {
        fragment += location.search + location.hash;
      }

      this.trigger('before:route', this);
      return Backbone.Router.prototype.navigate.call(this, fragment, options);
    }
  });

  return PerspectiveRouter;
});
