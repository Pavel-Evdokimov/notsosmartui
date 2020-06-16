/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */


define([
    'csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette',
    'hbs!xecmpf/widgets/eac/impl/carousel/impl/carousel',
    'css!xecmpf/widgets/eac/impl/eac'
], function (_, $, Marionette, template) {
    'use strict';

    var CarouselView = Marionette.ItemView.extend({

        className: 'carousel-view',

        template: template,

        constructor: function CarouselView(options) {
            options || (options = {});
            this.options = options.data ? _.extend(options, options.data) : options;
            Marionette.ItemView.prototype.constructor.apply(this, arguments);
            this.carouselCount = options.carouselCount || [];
            this.options.total = options.total;
            this.options.current = options.current;
            this.options.dashes = options.dashes;
        },

        ui: {
            item: '.carousel_view li',
            activeitem: '.carousel_view li.active',
            firstChild: '.carousel_view li:first-child'
        },

        events: {
        },

        templateHelpers: function () {
            var that = this;
            return {
                dashes: true,
                items: function () {
                    var i
                    var total = that.options.total;
                    var items = [];
                    for (i = 1; i <= total; i++) {
                        if (i === that.options.current) {
                            items.push("indicators dot" + i + " active");
                        } else {
                            items.push("indicators dot" + i);
                        }

                    }
                    return items;
                }
            };
        },
        onRender: function () {
        }

    });

    return CarouselView;
});
