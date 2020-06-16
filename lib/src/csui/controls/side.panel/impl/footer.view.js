/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/backbone', 'csui/lib/marionette',
  'csui/behaviors/keyboard.navigation/tabable.region.behavior',
  'hbs!csui/controls/side.panel/impl/footer',
  'i18n!csui/controls/side.panel/impl/nls/lang',
  'css!csui/controls/side.panel/impl/side.panel'
], function(_, $, Backbone, Marionette, TabableRegion, template, lang) {

  var ButtonView = Marionette.ItemView.extend({
    tagName: 'button',
    className: 'cs-footer-btn',
    template: false,
    triggers: {
      'click': 'click'
    },
    constructor: function ButtonView(options) {
      Marionette.ItemView.apply(this, arguments);
      this.listenTo(this.model, "change", this.render);
    },

    onRender: function() {
      var button = this.$el,
        attributes = this.model.attributes,
        className = attributes.className;
      button.text(attributes.label);
      button.addClass(className || 'binf-btn binf-btn-default');
      if (attributes.toolTip) {
        button.attr('title', attributes.toolTip);
      }
      if (attributes.separate) {
        button.addClass('cs-separate');
      }
      this.updateButton(attributes);
    },

    updateButton: function(attributes) {
      var $button = this.$el;
      attributes || (attributes = {});
      if (attributes.hidden !== undefined) {
        if (attributes.hidden) {
          $button.addClass('binf-hidden');
        } else {
          $button.removeClass('binf-hidden');
        }
      }
      if (attributes.disabled !== undefined) {
        $button.prop('disabled', attributes.disabled);
      }
    }
  }, {
    BTN_TYPE_BACK: 'back',
    BTN_TYPE_NEXT: 'next',
    BTN_TYPE_CANCEL: 'cancel',
    BTN_TYPE_ACTION: 'action',
  });

  var ButtonsGroup = Marionette.CollectionView.extend({
    childView: ButtonView,
    constructor: function ButtonsGroup(options) {
      Marionette.CollectionView.apply(this, arguments);
    }
  });

  var SidePanelFooterView = Marionette.LayoutView.extend({

    template: template,

    className: 'cs-footer-control',

    behaviors: {
      TabableRegion: {
        behaviorClass: TabableRegion
      }
    },

    regions: {
      leftContainer: '.cs-footer-left',
      rightContainer: '.cs-footer-right'
    },

    templateHelpers: function() {
      return {};
    },

    constructor: function SidePanelFooterView(options) {
      Marionette.LayoutView.apply(this, arguments);
      this.leftCollection = new Backbone.Collection();
      this.rightCollection = new Backbone.Collection();

    },

    onRender: function() {
      var leftGroup = new ButtonsGroup({
        collection: this.leftCollection
      });
      var rightGroup = new ButtonsGroup({
        collection: this.rightCollection
      });

      this.leftContainer.show(leftGroup);
      this.rightContainer.show(rightGroup);

      this.listenTo(leftGroup, "childview:click", this._onButtonClick);
      this.listenTo(rightGroup, "childview:click", this._onButtonClick);
    },

    _onButtonClick: function(btnView) {
      var btn = btnView.model;
      this.trigger("button:click button:click:" + btn.get("type"), btn);
    },

    update: function(options) {

      var slide = options.slide,
        leftButtons = [],
        rightButtons = [];

      if (!!slide.buttons) {
        if (_.isArray(slide.buttons)) {
          rightButtons = slide.buttons;
        } else {
          leftButtons = slide.buttons.left;
          rightButtons = slide.buttons.right;
        }
      }

      if (options.slideIndex > 0) {
        this._addButtonIfNotFound(leftButtons, 0, {
          type: ButtonView.BTN_TYPE_BACK,
          toolTip: lang.btnBack,
          className: "cs-go-back arrow_back"
        });
      }
      if (options.slideIndex + 1 < options.totalSlides) {
        this._addButtonIfNotFound(rightButtons, rightButtons.length, {
          type: ButtonView.BTN_TYPE_NEXT,
          label: lang.btnNext
        });
      }
      this._addButtonIfNotFound(rightButtons, rightButtons.length, {
        type: ButtonView.BTN_TYPE_CANCEL,
        label: lang.btnCancel
      });

      this.leftCollection.reset(leftButtons);
      this.rightCollection.reset(rightButtons);
    },

    _addButtonIfNotFound: function(buttons, index, options) {
      var found = _.find(buttons, function(btn) {
        return btn.type === options.type;
      });
      if (!found) {
        buttons.splice(index, 0, options);
      }
    },

    updateButton: function(id, attributes) {
      var button = this.leftCollection.get(id) || this.rightCollection.get(id);
      if (button) {
        button.set(attributes);
      }
    }


  });

  return SidePanelFooterView;
});