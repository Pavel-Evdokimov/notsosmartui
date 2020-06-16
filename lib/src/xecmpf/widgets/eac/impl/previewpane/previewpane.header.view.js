/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
    'csui/lib/underscore',
    'csui/lib/jquery',
    'csui/lib/backbone',
    'csui/lib/marionette',
    'csui/controls/mixins/view.events.propagation/view.events.propagation.mixin',
    'hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane.header.view',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/widgets/eac/impl/eac'
], function (_, $, Backbone, Marionette, ViewEventsPropagationMixin, template, lang) {

    var EACPopoverHeaderView = Marionette.ItemView.extend({

        className: 'xecmpf-eac-binf-popover-header-view',

        constructor: function EACPopoverHeaderView(options) {
            options || (options = {});
            this.options = options;
            Marionette.ItemView.prototype.constructor.call(this, options);

            this.model = new Backbone.Model({
                headerTypeName: this.options.headerTypeName,
                planName: this.options.planName,
                enableBackButton: this.options.enableBackButton,
                enableNextButton: this.options.enableNextButton,
                index: this.options.index
            });

        },

        template: template,

        templateHelpers: function () {
            return {
                headerTypeName: this.model.get('headerTypeName'),
                planName: this.model.get('planName'),
                enableBackButton: this.model.get('enableBackButton'),
                enableNextButton: this.model.get('enableNextButton'),
                index: this.model.get('index')
            };
        },

        onBeforeDestroy: function () {
            if (this._nodeIconView) {
                this._nodeIconView.destroy();
            }
        }

    });

    _.extend(EACPopoverHeaderView.prototype, ViewEventsPropagationMixin);
    return EACPopoverHeaderView;

});
