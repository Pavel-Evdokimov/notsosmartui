/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
    'csui/lib/backbone',
    'csui/lib/marionette',
    'xecmpf/widgets/eac/impl/emptyruleslist/emptyrules.list.item.view',
    'xecmpf/widgets/eac/impl/previewpane/previewpane.list.item.view'
], function (Backbone, Marionette, EACEmptyRulesItemView, EACListItemView) {
    var EACListView = Marionette.CollectionView.extend({

        emptyView: EACEmptyRulesItemView,

        emptyViewOptions: function () {
            return this.options;
        },

        childView: EACListItemView,

        childViewOptions: function () {
            return this.options;
        },

        constructor: function EACListView(options) {
            options || (options = {});
            this.options = options;
            if (this.options.rulesView) {
                if (this.options.collection.length === 0) {
                    this.options.noRules = true;
                }
            }
            if (!this.options.collection) {
                this.options.collection = new Backbone.Collection({
                    runAsHeader: this.options.runAsHeader,
                    runAsUser: this.options.runAsUser,
                    processHeader: this.options.processHeader,
                    processMode: this.options.processMode,
                    isactPlanRunView: this.options.actPlanRunView
                });
            }

            Marionette.CollectionView.prototype.constructor.call(this, options);
        }

    });

    return EACListView;
});