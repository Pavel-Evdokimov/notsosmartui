/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
    'csui/lib/jquery',
    'csui/lib/underscore',
    'csui/lib/marionette',
    'csui/lib/backbone',
    'csui/utils/contexts/page/page.context',
    'csui/utils/contexts/factories/connector',
    'csui/utils/authenticators/request.authenticator',
    'csui/utils/url',
    'csui/utils/nodesprites',
    'conws/utils/icons/icons',
    'conws/widgets/outlook/impl/recentwksps/recentwksps.view',
    'conws/widgets/outlook/impl/favoritewksps/favoritewksps.view',
    'conws/widgets/outlook/impl/searchwksps/searchwksps.view',
    'conws/widgets/outlook/impl/suggestedwksps/suggestedwksps.view',
    'conws/widgets/outlook/impl/searchwksps/customSearchSection.view',
    'conws/widgets/outlook/impl/dialog/authenticator',
    'conws/widgets/outlook/impl/utils/utility',
    'conws/widgets/outlook/impl/utils/csservice',

    'i18n!conws/widgets/outlook/impl/nls/lang',
    'hbs!conws/widgets/outlook/impl/conwsoutlook',
    'css!conws/widgets/outlook/impl/conwsoutlook'
], function ($, _, Marionette, Backbone, PageContext, ConnectorFactory, RequestAuthenticator, Url, NodeSprites, ConwsIcons, RecentWkspsView, FavoriteWkspsView, SearchWkspsView, SuggestedWkspsView, CustomSearchSectionView, Authenticator, WkspUtil, CSService, lang, template) {

    var conwsoutlookView = Marionette.LayoutView.extend({

    className: 'conwsoutlook ',

    template: template,

    regions: {
        searchRegion: '#searchRegion',
        favoriteRegion: '#favoriteRegion',
        recentRegion: '#recentRegion',
        suggestedRegion: '#suggestedRegion',
        customSearchRegion: "#customSearchSection",
        customViewSearchResultRegion: "#customViewSearchResultRegion",
        dialogRegion: '#dialogRegion'
    },

    templateHelpers: function () {
        return {
            customSearchLabel: lang.search_custom_button_label
        }
    },

    events: {
        'click #customSearchButton': 'showCustomSearch'
    },

    initialize: function(options) {
        this.context = this.options.context;

        var paras = {
            authenticator: new RequestAuthenticator({})
        };
        this.connector = this.context.getObject(ConnectorFactory, paras);
        WkspUtil.setConnector(this.connector);

        var self = this,
            urlObj = new Url(this.connector.connection.url);

        this.connector.timeoutProcessed = false;

        this.connector.authenticator.on("loggedOut", function (args) {
            WkspUtil.stopGlobalSpinner();
            if (!self.connector.timeoutProcessed) {
                WkspUtil.writeTrace("Session logged out.");
                WkspUtil.disableSimpleSearch();
                self.connector.timeoutProcessed = true;
                var authenticator = new Authenticator({ context: self.context, centerVertically: true });
                authenticator.authenticate()
                    .done(function(result){
                        authenticator.beingAuthenticated = false;
                    });
            }
        });

        window.ServerOrigin = urlObj.getOrigin();
        window.ServerCgiScript = urlObj.getCgiScript();
        NodeSprites.add(ConwsIcons);
        var rawWhen = $.when;
        $.whenAll = function (promise) {
            if ($.isArray(promise)) {
                var dfd = new $.Deferred();
                rawWhen.apply($, promise).done(function () {
                    dfd.resolve(Array.prototype.slice.call(arguments));
                }).fail(function () {
                    dfd.reject(Array.prototype.slice.call(arguments));
                });
                return dfd.promise();
            } else {
                return rawWhen.apply($, arguments);
            }
        }
    },

    onBeforeShow: function (options) {
        var self = this;

        var authenticator = new Authenticator({ context: self.context, centerVertically: true });
        WkspUtil.startGlobalSpinner();
        authenticator.authenticate()
            .done(function (result) {
                WkspUtil.stopGlobalSpinner();
                authenticator.beingAuthenticated = false;
                if (result) {
                    self.context.connector = WkspUtil.getConnector();
                    var addinConfigPromise = CSService.getAddinConfig(self.context.connector);
                    addinConfigPromise.done(function (config) {
                        WkspUtil.setConfig(config, self.context.csUser);

                        self.getRegion('recentRegion').show(new RecentWkspsView({ context: self.context }));
                        self.getRegion('favoriteRegion').show(new FavoriteWkspsView({ context: self.context }));
                        self.getRegion('searchRegion').show(new SearchWkspsView({ context: self.context, enableEmailSaving: true, showSearchFormSelection: WkspUtil.ShowSearchFormSelection }));

                        var wkspConfigPromise = CSService.getSuggestedWkspConfig(self.context.connector);
                        wkspConfigPromise.done(function (wkspConfig) {
                            if (wkspConfig == null || wkspConfig.general == null) {
                                self.getRegion('suggestedRegion').show(new SuggestedWkspsView({ error: "NoConfiguration" }));
                            } else if (wkspConfig.general.showSection) {
                                self.getRegion('suggestedRegion').show(new SuggestedWkspsView({ context: self.context, config: wkspConfig }));
                            } else {
                                self.getRegion('suggestedRegion').$el.css("display", "none");
                            }
                        });
                        wkspConfigPromise.fail(function(error) {
                            self.getRegion('suggestedRegion').show(new SuggestedWkspsView({ error: error }));
                        });
                        if (config.searchForm.enabled){
                            var queriesPromise = CSService.getSimpleSearchQueries(self.context.connector);
                            queriesPromise.done(function (queries) {
                                if (queries != null && queries.length !== 0) {
                                    WkspUtil.uiShow('customSearchButton');
                                    var top = 'calc(100vh - ' + (WkspUtil.SearchButtonHeight + WkspUtil.TraceAreaHeight) + 'px)';
                                    $('#customSearchButton').css('top', top);
                                    self.getRegion('customSearchRegion').show(new CustomSearchSectionView({ context: self.context, queries: queries }));
                                    if (WkspUtil.TraceAreaHeight > 0){
                                        var frames = document.querySelectorAll('iframe[id^="log4javascript_"]');
                                        if (frames.length > 0){
                                            var hideFunc = frames[0].contentWindow.hide;

                                            if (typeof hideFunc === "function"){
                                                frames[0].contentWindow.hide = function(){
                                                    $('#customSearchButton').css('top', 'calc(100vh - ' + WkspUtil.SearchButtonHeight + 'px)');
                                                    $(".tile-content").css('height', 'calc(100vh - ' + WkspUtil.SearchFormBottomPadding +'px)');
                                                    $('#saveDisplayArea').css('height', 'calc(100vh - 32px');
                                                    WkspUtil.TraceAreaHeight = 0;
                                                    hideFunc();
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                            queriesPromise.fail(function (error) {
                                $('#topMessage').html(WkspUtil.getErrorMessage(error));
                            });
                        }

                        self.context.fetch();
                    });
                    addinConfigPromise.fail(function(errMsg) {
                        $('#topMessage').html(errMsg);
                    });
                }
            });
                   
    },

    constructor: function conwsoutlookView(options) {
      Marionette.LayoutView.prototype.constructor.call(this, options);
    },

    showCustomSearch: function(){
        WkspUtil.uiHide("standardSections");
        WkspUtil.uiHide("customSearchButton");
        WkspUtil.uiShow("customSearchSection");

        WkspUtil.PreSaveSection = "customSearchSection";
    }

  });

  return conwsoutlookView;

});
