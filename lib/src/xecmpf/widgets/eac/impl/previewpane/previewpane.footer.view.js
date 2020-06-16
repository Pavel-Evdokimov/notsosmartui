/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
    'csui/lib/underscore',
    'csui/lib/jquery',
    'csui/lib/backbone',
    'csui/lib/marionette',
    'csui/controls/mixins/view.events.propagation/view.events.propagation.mixin',
    'hbs!xecmpf/widgets/eac/impl/previewpane/impl/previewpane.footer.view',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
    'css!xecmpf/widgets/eac/impl/eac'
], function (_, $, Backbone, Marionette, ViewEventsPropagationMixin, template, lang) {

    var EACPopoverFooterView = Marionette.ItemView.extend({

        className: 'xecmpf-eac-binf-popover-footer-view',

        events: {
            'click #xecmpf-eac-popover-footer': 'openEditDialogue'
        },

        constructor: function EACPopoverHeaderView(options) {
            options || (options = {});
            this.options = options;
            Marionette.ItemView.prototype.constructor.call(this, options);

        },

        template: template,

        templateHelpers: function () {
            return {
                edit: this.options.editButtonName ||lang.editButtonLabel
            };
        },

        onBeforeDestroy: function () {
            if (this._nodeIconView) {
                this._nodeIconView.destroy();
            }
        }

    });

    _.extend(EACPopoverFooterView.prototype, ViewEventsPropagationMixin);
    return EACPopoverFooterView;

});
