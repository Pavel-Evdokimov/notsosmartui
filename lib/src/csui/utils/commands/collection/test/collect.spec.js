/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/backbone', 'csui/lib/marionette', 'csui/lib/jquery',
  'csui/utils/contexts/page/page.context',
  'csui/utils/contexts/factories/connector',
  'csui/models/widget/search.results/search.results.model', 'csui/utils/commands/collection/collect',
  'csui/utils/contexts/factories/search.query.factory', '../../../../utils/testutils/async.test.utils.js',
  './mock.collect.js',
  'csui/lib/binf/js/binf'
], function (Backbone, Marionette, $, PageContext, ConnectorFactory,
  SearchResultsCollection, CollectCommand, SearchQueryModelFactory, AsyncUtils, mock) {
  'use strict';

  describe('Collect Command', function () {
    var context, connector, searchQueryModel, searchResultsCollection;
    beforeAll(function () {
      $(document.body).empty();
      mock.enable();
      context = new PageContext({
        factories: {
          connector: {
            connection: {
              url: '//server/otcs/cs/api/v1',
              supportPath: '/support',
              session: {
                ticket: 'dummy'
              }
            }
          }
        }
      });
      connector = context.getObject(ConnectorFactory);

    });
    it('Execute collect command for one node and open node picker', function (done) {
      searchQueryModel = context.getObject(SearchQueryModelFactory);
      searchQueryModel.set({
        where: "*"
      });
      searchResultsCollection = new SearchResultsCollection({
        context: context
      }, {
        connector: connector,
        query: searchQueryModel
      });
      var status = {
        connector: connector,
        container: searchResultsCollection.models[0],
        context: context,
        nodes: searchResultsCollection,
        originatingView: {},
        collection: searchResultsCollection
      };

      searchResultsCollection.fetch().then(function () {
        status.nodes = new Backbone.Collection([status.nodes.models[0]]);
        new CollectCommand().execute(status);
      });
      AsyncUtils.asyncElement(document.body, '.csui-node-picker').done(
        function (el) {
          expect(el.length).toEqual(1);
          done();
        });


    });
    it('Select Collection type as destination folder', function (done) {
      var dialog = $('.binf-modal-content'),
        target = $('.binf-modal-content .list-content ul li:last-child'),
      collectButton = '.cs-add-button';
      expect($(collectButton).is(':disabled')).toBeTruthy();
      target.click();
      AsyncUtils.asyncElement(dialog, collectButton + ':disabled', true).done(function (el) {
        expect(el.length).toEqual(0);
        done();
      });
    });
    
    afterAll(function() {
      $(document.body).empty();
      mock.disable();
    });
  });

});