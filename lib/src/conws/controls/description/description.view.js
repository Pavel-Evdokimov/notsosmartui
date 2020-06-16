/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette', 'csui/utils/base',
  'csui/behaviors/keyboard.navigation/tabable.region.behavior',
  'csui/controls/tile/behaviors/perfect.scrolling.behavior',
  'hbs!conws/controls/description/impl/description',
  'i18n!conws/controls/description/impl/nls/lang',
  'css!conws/controls/description/impl/description'
], function (_, $, Marionette, base, TabableRegionBehavior, PerfectScrollingBehavior, template,
    lang) {

  var DescriptionView = Marionette.ItemView.extend({

    className: function () {
      if (this.options.collapsedHeightIsOneLine) {
        return "conws-description conws-description-short-lines-1";
      } else {
        return "conws-description";
      }
    },

    template: template,

    initialize: function () {
      this.shortDescMode = true;
      this.has_more_desc = false;
      this.hideShowLess = false;
      this.collapsedHeightIsOneLine = false;
    },

    templateHelpers: function () {
      return {
        complete_description: this.options.complete_desc,
        current_description: this.options.complete_desc,
        more_description: this.has_more_desc && !this.hideShowLess,
        showmore_tooltip: lang.showmore,
        showmore_aria: lang.showmoreAria,
        showless_tooltip: lang.showless,
        showless_aria: lang.showlessAria
      };
    },

    ui: {
      description: '.description',
      readMore: '.description-readmore',
      showLess: '.description-showless',
      caretDiv: '.description-caret-div'
    },

    events: {
      'keydown @ui.readMore': 'readMoreClicked',
      'keydown @ui.showLess': 'showLessClicked',
      'click @ui.readMore': 'readMoreClicked',
      'click @ui.showLess': 'showLessClicked'
    },

    behaviors: {
      TabableRegion: {
        behaviorClass: TabableRegionBehavior
      },
      PerfectScrolling: {
        behaviorClass: PerfectScrollingBehavior,
        contentParent: '.description',
        suppressScrollX: true,
        scrollYMarginOffset: 15
      }
    },

    constructor: function DescriptionView(options) {
      this.options = options || {};
      Marionette.ItemView.prototype.constructor.apply(this, arguments);
      $(window).bind('resize', _.bind(this._onWindowResize, this));
      this.hideShowLess = false;

      this.listenTo(this, 'dom:refresh', this._truncateIfNecessary);

      this.listenTo(this.options.view, 'dom:refresh', function () {
        this.triggerMethod('dom:refresh');
      });
    },

    currentlyFocusedElement: function () {
      if (this.has_more_desc) {
        if (this.shortDescMode) {
          return this.ui.readMore;
        } else {
          return this.ui.showLess;
        }
      } else {
        return $();
      }
    },

    onDestroy: function () {
      if (this.renderTimer) {
        clearTimeout(this.renderTimer);
      }
      $(window).unbind('resize', this._onWindowResize);
    },

    _setTimer: function () {
      if (this.renderTimer) {
        clearTimeout(this.renderTimer);
      }
      this.renderTimer = setTimeout(_.bind(function () {
        this._truncateIfNecessary();
      }, this), 200);
    },

    onRender: function () {
      this._setTimer();
    },
    _onWindowResize: function () {
      this._setTimer();
    },

    _updateDescriptionAndCaret: function () {
      this._enableCaretState();
      if (this.shortDescMode && this.has_more_desc) {
        this.$el.addClass('conws-description-collapsed');
      } else {
        this.$el.removeClass('conws-description-collapsed');
      }
    },

    _truncateIfNecessary: function () {
      if (!!this.ui.description && typeof(this.ui.description) === "object") {
        var actualHeight = this.ui.description.height();
        if (actualHeight) {
          var maxHeight = parseFloat(this.ui.description.css("line-height"));
          if (!this.options.collapsedHeightIsOneLine) {
            maxHeight = maxHeight * 2;  // if not one line, use 2 lines
          }
          if (actualHeight > maxHeight) {
            this.has_more_desc = true;
          }
          this._updateDescriptionAndCaret();
        }
      }
    },

    readMoreClicked: function (event) {
      if (!!event && (event.keyCode === 13 || event.keyCode === 32 || event.type === 'click')) {
        event.preventDefault();
        event.stopPropagation();

        this.shortDescMode = false;
        this._truncateIfNecessary();
        this.ui.description.removeClass("description-height-oneline").addClass("description-height-auto description-maxheight-threeline");
        var actualHeight = this.ui.description.innerHeight();
        var maxHeight = parseFloat(this.ui.description.css("line-height"));

        actualHeight > maxHeight * 2 ? this.ui.caretDiv.addClass("description-height-threeline") : this.ui.caretDiv.addClass("description-height-twoline");
        this.$el.removeClass("description-height-oneline").addClass("description-height-threeline");
        this.ui.showLess.focus();
        this.trigger("show:more:description");
      }
    },

    showLessClicked: function (event) {
      if (!!event && (event.keyCode === 13 || event.keyCode === 32 || event.type === 'click')) {
        event.preventDefault();
        event.stopPropagation();

        this.shortDescMode = true;
        this._truncateIfNecessary();
        this.$el.removeClass("description-height-threeline");
        this.ui.caretDiv.removeClass("description-height-threeline description-height-twoline").addClass("description-height-oneline");
        this.ui.description.addClass("description-height-oneline");
		    this.$el.addClass("description-height-oneline");
        this.ui.readMore.focus();
        this.trigger("show:less:description");
      }
    },

    _enableCaretState: function () {
      if (this.has_more_desc) {
        this.ui.readMore.toggleClass('caret-hide', this.shortDescMode ? false : true);
        this.ui.showLess.toggleClass('caret-hide', this.shortDescMode ? true : false);
      } else {
        this.ui.readMore.addClass('caret-hide');
        this.ui.showLess.addClass('caret-hide');
      }
    }

  });

  return DescriptionView;

});
