/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/marionette',
    'csui/controls/mixins/layoutview.events.propagation/layoutview.events.propagation.mixin',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'csui/behaviors/keyboard.navigation/tabkey.behavior',
    'xecmpf/widgets/eac/impl/previewpane/previewpane.layout.view',
    'hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane',
    'css!xecmpf/widgets/eac/impl/eac'
], function (_, $, Marionette, LayoutviewEventsPropogationMixin, PerfectScrollingBehavior, TabKeyBehavior, EACPopoverLayoutView,
    template) {

        var EACPreviewPane = Marionette.LayoutView.extend({

            class: 'xecmpf-eac-preview binf-panel binf-panel-default',
            constructor: function EACPreviewPane(options) {
                Marionette.LayoutView.prototype.constructor.apply(this, arguments);
                options || (options = {});
                this.config = options.config;
                this.currElemClassName = options.currElemClassName;
                this.previewPane = this.options.parent.$el.find('.' + this.currElemClassName);
                if (this.config) {
                    this.parent = options.parent;
                    this.config.readonly = true;
                    this.previewCollection = options.model;
                    this.headerTitle = options.headerTitle;
                    this.footerInfoText = options.info;

                    this.previewPane.binf_popover({
                        content: this.$el,
                        placement: "auto left",
                        trigger: 'manual',
                        container: 'body',
                        html: true
                    });
                    var $tip = this.previewPane.data('binf.popover');
                    var $pop = $tip.tip();
                    $pop.addClass('xecmpf-eac-previewpane-popover');
                    this.previewPane.unbind('click').bind('click', $.proxy(function () {
                        this.show();
                    }, this));
                    this.previewPane.unbind('keydown').bind('keydown', $.proxy(function () {
                        if(event.keyCode === 27 && this.isRendered){this.destroy();}
                    }, this));
                    $pop.unbind('click').bind('click', $.proxy(function () {
                        this.show();
                    }, this));
                    $pop.unbind('keydown').bind('keydown', $.proxy(function (event) {
						if(event.keyCode === 27){this.destroy();}
                    }, this));
                    $pop.unbind('mouseenter').bind('mouseenter', $.proxy(function () {
                        this.show();
                    }, this));
                    $pop.unbind('mouseleave').bind('mouseleave', $.proxy(function () {
                        if(!this.isDestroyed){this.destroy();}
                    }, this));
                    this.propagateEventsToRegions();
                    this.listenTo(this, 'dom:refresh', function () {
                        this.previewPane.binf_popover('show');
                    });
                }
            },
            template: template,

            regions: {
                contentRegion: '.xecmpf-eac-preview-body',
                footRegion: '.xecmpf-eac-preview-footer'
            },

            behaviors: {
                TabKeyRegion: {
                  behaviorClass: TabKeyBehavior
                }
              },

            onBeforeDestroy: function () {
                this.previewPane.binf_popover('destroy');
            },
            show: function () {
                if (this.hideTimeout) {
                    clearTimeout(this.hideTimeout);
                    this.hideTimeout = null;
                }
                if (this.$el.is(":visible")) {
                    return;
                }

                this.showCancelled = false;
                this.$el.hide();
                this.render();
                if (this.eacPopoverLayoutView) {
                    this.eacPopoverLayoutView.destroy();
                }

                this.eacPopoverLayoutView = new EACPopoverLayoutView({
                    parent: this,
                    model: this.previewCollection
                });
                this.listenTo(this.eacPopoverLayoutView, 'PopoverLayoutEidtAll', function (event) {
                    this.trigger("PopoverLayoutEidtAll", event);
                });
                if (!this.showCancelled) {
                    this.contentRegion.show(this.eacPopoverLayoutView, { render: true });
                    this.$el.show();
                    this.triggerMethod('before:show', this);
                    this.toggle = 1;
                    this.previewPane.binf_popover('show');
                    this.triggerMethod('show', this);
                }
            },
            hide: function () {
                this.toggle = 0;
                this.previewPane.binf_popover('hide');
                this.hideTimeout = null;
                this.showCancelled = true;
                this.hideTimeout = null;
            },
            _delayedHide: function () {
                this.hideTimeout = window.setTimeout($.proxy(this.hide, this), 200);
            }

        });

        _.extend(EACPreviewPane.prototype, LayoutviewEventsPropogationMixin);

        return EACPreviewPane;

    });