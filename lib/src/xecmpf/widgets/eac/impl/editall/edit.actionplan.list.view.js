/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
    'csui/lib/underscore',
    'csui/lib/backbone',
    'csui/lib/marionette',
    'csui/controls/tile/behaviors/perfect.scrolling.behavior',
    'xecmpf/widgets/eac/impl/editall/edit.actionplans.view'
], function (_, Backbone, Marionette, PerfectScrollingBehavior, EACEditActionPlanView) {
    var EACEditActionPlanList = Marionette.CollectionView.extend({
        className: 'csui-perfect-scrolling eac-edit-actionplans-view',

        behaviors: {
            PerfectScrolling: {
                behaviorClass: PerfectScrollingBehavior,
                contentParent: this.$el,
                suppressScrollX: true,
                scrollXMarginOffset: 15
            }
        },

        childView: EACEditActionPlanView,

        childViewOptions: function () {
            return this.options;
        },

        constructor: function EACEditActionPlanList(options) {
            options || (options = {});
            this.options = options;
            
            this.listenTo(this, "deleteActionPlanInEditDialog", function () {
                this.trigger("deleteActionPlanInEditDialog2");
            });

            this.listenTo(this, "openEditDialog", function (event) {
                this.trigger("openEditDialog2", event);
            });

            Marionette.CollectionView.prototype.constructor.call(this, options);
        }
    });
    return EACEditActionPlanList;
});


