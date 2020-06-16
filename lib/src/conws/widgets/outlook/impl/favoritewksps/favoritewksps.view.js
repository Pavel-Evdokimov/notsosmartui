/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */


define([
    'csui/lib/jquery',
    'csui/lib/underscore',
    'csui/lib/marionette',
    'csui/lib/backbone',

    'conws/widgets/outlook/impl/favoritewksps/impl/favoritewksps.model.factory',
    'conws/widgets/outlook/impl/wksp/wksp.view',
    'conws/widgets/outlook/impl/wksp/impl/wksp.model',
    'conws/widgets/outlook/impl/utils/utility',

    'i18n!conws/widgets/outlook/impl/nls/lang',       
    'hbs!conws/widgets/outlook/impl/favoritewksps/impl/favoritewksps',
   'css!conws/widgets/outlook/impl/conwsoutlook'         
], function ($, _, Marionette, Backbone, favoritewkspsModelFactory, WkspView, WkspModel, WkspUtil, lang, template) {
  var favoritewkspsView = Marionette.CompositeView.extend({

    className: 'favoriteWksps-conwsoutlook panel panel-default',

    template: template,

    childView: WkspView,

    childViewContainer: '#favorite-list',

    templateHelpers: function () {
        return {
            sectionTitle: lang.sectionTitle_favorite
        }
    },

    events: {
        'click #favoriteToggleIcon': 'toggleIconClicked'
    },

    initialize: function(options) {

    },

    constructor: function favoritewkspsView(options) {
        options.model = options.context.getModel(favoritewkspsModelFactory);
        Marionette.CompositeView.prototype.constructor.call(this, options);

        this.listenTo(this.model, 'change', this.renderWksps);
        this.listenTo(this.model, 'error', this.renderError);
    },

    renderWksps: function (model, response, options) {
        var self = this;
        var values = model.get('results');
        self.collection = new Backbone.Collection(values);
        if (values.length === 0) {
            self.renderMessage(lang.noWksp_favorite);
            $("#favoriteToggleIcon").click();
        } else {
            self.render();
        }

        $("#favoriteCount").html("(" + self.collection.length + ")");
    },

    renderError: function (model, response, options) {
        var self = this;
        var msg = model.get('error');
        if (!msg) {
            msg = typeof (response) !== 'object' ? JSON.parse(response).error : response.responseJSON ? response.responseJSON.error : response.error;
        }

        self.renderMessage(_.str.sformat(lang.error_retrieve_favorite, msg));
    },

    renderMessage: function (msg) {
        var self = this;
        var msgArea = self.$('#recentWkspMsgArea');

        if (msg) {
            msgArea.css("display", "block");
            msgArea.html(msg);
        } else {
            msgArea.css("display", "none");
        }
    },

    toggleIconClicked: function(args){
        WkspUtil.collapsibleClicked("favorite");
    }

  });

  return favoritewkspsView;

});
