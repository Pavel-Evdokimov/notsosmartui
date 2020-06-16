/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/jquery', 'csui/lib/marionette',
  'hbs!xecmpf/widgets/eac/impl/carousel.nav/carousel.nav',
  'css!xecmpf/widgets/eac/impl/carousel.nav/carousel.nav'
], function ($, Marionette, template) {
  'use strict';

  var CarouselNavView = Marionette.ItemView.extend({

    className: 'carousel-nav',

    template: template,

    constructor: function CarouselView(options) {
      options || (options = {});
      Marionette.ItemView.prototype.constructor.apply(this, arguments);
      this.count = options.count;
      this.active = options.active;
    },

    ui: {
      navDots: '>.carousel-nav-dot'
    },

    templateHelpers: function () {
      return {
        items: new Array(this.count)
      };
    },

    onRender: function () {
      if (this.active !== undefined) {
        $(this.ui.navDots[this.active]).addClass('active');
      }
    },

    onBack: function () {
      if (this.active > 0) {
        this.ui.navDots.removeClass('active');
        $(this.ui.navDots[--this.active]).addClass('active');
      }
    },

    onNext: function () {
      if (!this.active) {
        this.active = 0;
      }
      if (this.active < this.count - 1) {
        this.ui.navDots.removeClass('active');
        $(this.ui.navDots[++this.active]).addClass('active');
      }
    }

  });

  return CarouselNavView;
});
