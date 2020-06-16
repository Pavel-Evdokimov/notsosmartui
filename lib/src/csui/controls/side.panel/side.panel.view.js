/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['module', 'csui/lib/underscore', 'csui/lib/jquery',
  'csui/lib/backbone', 'csui/lib/marionette',
  'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',
  'csui/behaviors/keyboard.navigation/tabables.behavior',
  'csui/controls/side.panel/impl/footer.view',
  'csui/controls/side.panel/impl/header.view',
  'hbs!csui/controls/side.panel/impl/side.panel',
  'csui/utils/non-emptying.region/non-emptying.region',
  'csui/utils/log',
  'i18n',
  'css!csui/controls/side.panel/impl/side.panel',
  'csui/lib/binf/js/binf'
], function(module, _, $, Backbone, Marionette, LayoutViewEventsPropagationMixin,
  TabablesBehavior, FooterView, HeaderView, template,
  NonEmptyingRegion, log, i18n) {

  var SidePanelView = Marionette.LayoutView.extend({

    className: function() {
      var classNames = ['csui-sidepanel'];
      if (!!this.options.sidePanelClassName) {
        classNames.push(this.options.sidePanelClassName);
      }
      if (SidePanelView.SUPPORTED_SLIDE_ANIMATIONS.indexOf(this.options.openFrom) !== -1) {
        classNames.push('csui-sidepanel--from-' + this.options.openFrom);
      }
      return _.unique(classNames).join(' ');
    },

    template: template,

    ui: {
      body: '.csui-sidepanel-body',
      backdrop: '.csui-sidepanel-backdrop'
    },

    events: {
      'click @ui.backdrop': 'onBackdropClick'
    },

    regions: function() {
      return {
        header: '.csui-sidepanel-header',
        body: '.csui-sidepanel-body',
        footer: '.csui-sidepanel-footer'
      };
    },

    constructor: function SidePanelView(options) {
      _.defaults(options, {
        openFrom: 'right'
      });
      if (!options.slides || !_.isArray(options.slides) || options.slides.length === 0) {
        throw new Error("Slides not available");
      }
      this.slides = options.slides;

      Marionette.LayoutView.prototype.constructor.apply(this, arguments);
      this.propagateEventsToRegions();
    },

    onBackdropClick: function() {
      this.hide();
    },

    updateButton: function(id, options) {
      if (!this.footerView.updateButton) {
        throw new Error('Dialog footer does not support button updating.');
      }
      this.footerView.updateButton(id, options);
    },

    updateButtons: function() {
      this.footerView.updateButtons();
    },

    _checkAndCreatePanel: function() {

    },

    show: function() {
      this.trigger("before:show");
      if (!Marionette.isNodeAttached(this.el)) {
        var container = $.fn.binf_modal.getDefaultContainer(),
          region = new NonEmptyingRegion({
            el: container
          });
        region.show(this);
        setTimeout(_.bind(this._doShow, this));
      } else {
        this._doShow();
      }
      this.trigger("after:show");
      return this;
    },

    _doShow: function() {
      this.$el.addClass("csui-sidepanel-visible");
    },

    hide: function() {
      this.trigger("before:hide");
      this._doHide();
      this.trigger("after:hide");
    },

    _doHide: function() {
      this.$el.removeClass("csui-sidepanel-visible");
    },

    onDestroy: function() {
    },

    _doCleanup: function() {
      this.currentSlide = undefined;
      this.currentSlideIndex = -1;
    },

    onRender: function() {
      this.headerView = new HeaderView(this.options);
      this.header.show(this.headerView);

      this.contentHolders = [];

      this.footerView = new FooterView(this.options);
      this.footer.show(this.footerView);

      this._registerEventHandlers();
      this._showSlide(0);
    },

    _registerEventHandlers: function() {
      this.listenTo(this.footerView, "button:click:back", this._onBackClick);
      this.listenTo(this.footerView, "button:click:next", this._onNextClick);
      this.listenTo(this.footerView, "button:click:cancel", this._onCancelClick);

      this.listenTo(this.footerView, "button:click", function(event) {
        Marionette.triggerMethodOn(this.currentSlide.content, "button:click", event);
      });

      this.listenTo(this, "refresh:buttons", this.refreshButtons);
      this.listenTo(this, "update:button", function(btn) {
      });
      this.listenTo(this.headerView, "close:click", this.hide);
    },

    _onBackClick: function() {
      this._showSlide(this.currentSlideIndex - 1);
    },

    _onNextClick: function() {
      this._showSlide(this.currentSlideIndex + 1);
    },

    _onCancelClick: function() {
      this.destroy();
    },
    _showSlide: function(slideIndex) {
      var slide = this.slides[slideIndex];
      this.trigger("show:slide", slide, slideIndex);

      this._updateHeader(slide);
      this._updateBody(slide, slideIndex);
      this.footerView.update({
        slide: slide,
        slideIndex: slideIndex,
        totalSlides: this.slides.length
      });

      this.currentSlide = slide;
      this.currentSlideIndex = slideIndex;
      this.trigger("shown:slide", slide, slideIndex);
      this.listenTo(slide.content, "update:button", this.updateButton);
    },

    _updateHeader: function(slide) {
      if (!!slide.headerView) {
        this.header.show(slide.headerView);
      } else {
        this.headerView.update(slide);
      }
    },

    _updateBody: function(slide, index) {
      if (!_.isUndefined(this.currentSlideIndex)) {
        var currentContent = this.contentHolders[this.currentSlideIndex];
        currentContent.$el.removeClass('csui-slide-visible');
        currentContent.$el.addClass('csui-slide-hidden');
      }

      if (index >= this.contentHolders.length) {
        this.contentHolders.push(slide.content);
        var bodyRegion = new NonEmptyingRegion({
          el: this.ui.body
        });
        bodyRegion.show(slide.content);
      }
      var content = this.contentHolders[index];
      content.$el.removeClass('csui-slide-hidden');
      content.$el.addClass('csui-slide-visible');
    },

    onShow: function() {
    }

  }, {
    SUPPORTED_SLIDE_ANIMATIONS: ["left", "right"]
  });

  _.extend(SidePanelView.prototype, LayoutViewEventsPropagationMixin);

  return SidePanelView;
});
