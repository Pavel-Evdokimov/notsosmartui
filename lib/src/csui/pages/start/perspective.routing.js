/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */


define([
  'module', 'csui/lib/underscore', 'csui/lib/backbone', 'csui/utils/url',
  'csui/utils/routing',
  'csui-ext!csui/pages/start/perspective.routing'
], function (module, _, Backbone, Url, routing, extraRouters) {
  'use strict';
  var instance;
  var config = _.extend({
    handlerUrlPathSuffix: '/app',
    rootUrlPath: null
  }, module.config());

  function PerspectiveRouting(options) {
    var DefaultRouters = [];
    var Routers = _
            .chain(extraRouters)
            .flatten(true)
            .filter(function (Router) {
              if (Router.isDefault) {
                DefaultRouters.push(Router);
              } else {
                return true;
              }
            })
            .concat(DefaultRouters)
            .unique()
            .reverse()
            .value(),
        routeWithSlashes = routing.routesWithSlashes();
    this._routers = _.map(Routers, function (Router) {
      var router = new Router(_.extend({
        routeWithSlashes: routeWithSlashes
      }, options));
      router.on('before:route', _.bind(this._informOthers, this));
      return router;
    }, this);

    this._context = options.context;
    this._originalHistoryLength = history.length;
  }

  _.extend(PerspectiveRouting.prototype, Backbone.Events, {
    start: function () {
      var historyOptions;
      if (routing.routesWithSlashes()) {
        historyOptions = {
          pushState: true,
          root: config.rootUrlPath != null && config.rootUrlPath ||
                Url.combine(
                    new Url(new Url(location.pathname).getCgiScript()).getPath(),
                    config.handlerUrlPathSuffix)
        };
      } else {
		    var rootPath = Backbone.history.decodeFragment(location.pathname);
        historyOptions = {
          root: rootPath
        };
      }
      Backbone.history.start(historyOptions);
    },

    hasRouted: function () {
      return history.length > this._originalHistoryLength;
    },

    _informOthers: function (akceptor) {
      _.each(this._routers, function (router) {
        if (router !== akceptor) {
          router.trigger('other:route', router, akceptor);
        }
      });
    }
  });

  PerspectiveRouting.routesWithSlashes = routing.routesWithSlashes;

  return {
    getInstance: function (options) {
      if (!instance) {
        instance = new PerspectiveRouting(options);
      }
      return instance;
    },
    routesWithSlashes: routing.routesWithSlashes
  };
});
