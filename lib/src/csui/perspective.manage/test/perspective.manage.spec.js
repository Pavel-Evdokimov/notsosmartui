/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([ "require", "csui/lib/jquery", "csui/lib/underscore", "csui/lib/marionette",
  "csui/lib/backbone", "./perspective.manage.mock.js",
  'csui/controls/perspective.panel/perspective.panel.view',
  "csui/utils/contexts/page/page.context",
  'csui/perspective.manage/pman.view',
  'csui/utils/contexts/factories/connector',
  "../../utils/testutils/async.test.utils.js", 'csui/lib/bililiteRange',
  'csui/lib/jquery.simulate',
  'csui/lib/jquery.simulate.ext',
  'csui/lib/jquery.simulate.key-sequence'
  ], function (require, $, _, Marionette, Backbone, Mock, PerspectivePanelView, PageContext, PManView, ConnectorFactory, asyncTestUtils) {
  'use strict';
 describe("Perspective Manager", function () {

    var context, perspectivePanel, pmanView, perspective;

    beforeAll(function (done) {
      Mock.enable();
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
      context.perspective = new Backbone.Model({
        "id": 398548,
        "type": "flow",
        "options": {
          "widgets": [
            {
              "type": "csui/widgets/welcome.placeholder"
            },
            {
              "type": "csui/widgets/myassignments"
            },
            {
              "type": "csui/widgets/favorites"
            },
            {
              "type": "csui/widgets/recentlyaccessed"
            },
            {
              "type": "csui/widgets/search.custom",
              "options": {
                "savedSearchQueryId": 391383
              }
            }
          ]
        }
      });
      require(['csui/models/perspective/perspective.model'], function (PerspectiveModel) {
        perspective = new PerspectiveModel(
          {id: context.perspective.get('id'), perspective: _.pick(context.perspective.attributes, 'type', 'options')},
          {connector: context.getObject(ConnectorFactory)}
        );
        perspectivePanel = new PerspectivePanelView({
          context: context
        });      
        $('body').append('<div id="perspective-panel-view"></div>');
        var region = new Marionette.Region({
          el: "#perspective-panel-view"
        });
        region.show(perspectivePanel);
        perspectivePanel.listenTo(perspectivePanel, 'show:perspective', function () {
          pmanView = new PManView({
            context: context,
            perspective: perspective
          });
          $('body').append('<div id="pman-view"></div>');
          var region = new Marionette.Region({
            el: "#pman-view"
          });
          region.show(pmanView);
        });
        done();
      });
      
      });

    it("should render Perspective Manager header", function (done) {
      asyncTestUtils.asyncElement('body',
          '.pman-container .pman-header .pman-tools-container').done(
            function (el) {
              expect(el.find('.pman-left-tools> ul > li .icon-toolbarAdd').length).toEqual(1);
              expect(el.find('.pman-right-tools> ul > li .icon-save').length).toEqual(1);
              expect(el.find(' .pman-right-tools> ul > li .cancel-edit').length).toEqual(1);
              done();
            });
    });

    describe("Add perspective", function () {
      var Addtoolbar = $('.pman-tools-container .pman-left-tools> ul > li .icon-toolbarAdd');
      it("should open pman panel on selecting add item", function (done) {
        $('.pman-tools-container .pman-left-tools> ul > li .icon-toolbarAdd').click();
        asyncTestUtils.asyncElement('body', '.csui-pman-panel .load-container.binf-hidden').done(
          function (el) {
            expect($('.csui-tab-pannel').find('.csui-layout-tab').length).toEqual(1);
            expect($('.csui-tab-pannel').find('.csui-widget-tab').length).toEqual(1);
            done();
          });

      });
      describe("PMan Panel", function () {
        it("should show list of layouts", function () {
          $('.csui-layout-tab').click();
          expect($('.csui-list-pannel .csui-layout-item').length > 1).toBeTruthy();
          $(".csui-pman-list .arrow_back").click();
        });
        it("should show accordion list of modules", function (done) {
          $('.csui-accordion-header').click();
          asyncTestUtils.asyncElement('body', '.csui-accordion-content .cs-list-group').done(
            function (el) {
              expect(el.length).toEqual(1);
              done();
            });
        });
        
      });

      describe("PMan Body", function () {
        describe("Flow Perspective in edit mode", function () {
          it("should show empty placeholder in flow perspective", function (done) {
            asyncTestUtils.asyncElement('body',
                '.cs-perspective .csui-pman-editable-widget').done(
                function () {
                  var emptyPlaceHolder = $('.cs-perspective .csui-pman-editable-widget.csui-pman-placeholder-container');
                  expect(emptyPlaceHolder[0]).toBeDefined();
                  done();
                });
          });
          it("should show existing widgets in edit mode", function () {
            var widgets     = $(
                    '.cs-perspective .csui-pman-editable-widget:not(.csui-pman-placeholder-container)'),
                widgetClose = widgets.find(".csui-pman-widget-close");
            expect(widgets.length).toEqual(widgetClose.length);
          });
          it("should show alert dialog on clicking close", function (done) {

            var widgets = $(
                    '.cs-perspective .csui-pman-editable-widget:not(.csui-pman-placeholder-container)'),
                widget  = widgets.last();
            expect(widgets.length).toEqual(5);
            widget.find(".csui-pman-widget-close").click();
            asyncTestUtils.asyncElement('body', '.binf-widgets .binf-modal-dialog .binf-modal-content').done(
                function (el) {
                  expect(el.length).toEqual(1);
                  done();
                });
          });
          it("should allow widget delete", function (done) {
            $('.binf-widgets .binf-modal-dialog .binf-modal-footer .csui-yes').click();
            asyncTestUtils.asyncElement('body', '.binf-widgets .binf-modal-dialog', true).done(
                function () {
                  var widgets = $(
                    '.cs-perspective .csui-pman-editable-widget:not(.csui-pman-placeholder-container)');
                  expect(widgets.length).toEqual(4);
                  done();
                });
          });
          it("should not render form in create mode inside popover for widgets without configuration", function (done) {
            var noConfigurationWidget = $('.csui-configure-perspective-widget .csui-pman-widget-masking')[1];
            noConfigurationWidget.click();
            asyncTestUtils.asyncElement('.cs-perspective', '.csui-pman-editable-widget .binf-popover.binf-in').done(
              function (el) {
                var form    = el.find('.cs-form.cs-form-create');
                expect(form.length).toEqual(0);
                done();
              });
          });
          it("should open popover for widgets with configuration", function (done) {
            var configurationWidget = $('.csui-configure-perspective-widget .csui-pman-widget-masking')[0];
            configurationWidget.click();
            asyncTestUtils.asyncElement('.cs-perspective', '.csui-pman-editable-widget .binf-popover.binf-in').done(
                function (el) {
                  expect(el.length).toEqual(1);
                  done();
                });
          });
          it("should render form in create mode inside popover", function () {
            var popover = $('.cs-perspective .csui-pman-editable-widget .binf-popover'),
                form    = popover && popover.find('.cs-form.cs-form-create');
            expect(form.length).toEqual(1);
          });
          it("should close popover on click outside widget and popover", function (done) {
            var popover = $('.cs-perspective .csui-pman-editable-widget .binf-popover.binf-in');
            $('.pman-backdrop').click();
            if (popover.length) {
              asyncTestUtils.asyncElement('body', '.binf-popover.binf-in', true).done(
                  function () {
                    expect($('.binf-popover.binf-in').length).toEqual(0);
                    done();
                  });
            } else {
              done();
            }
          });
        });

      });

      describe("Change layout", function () {
        it("Check for change page layout section", function (done) {
          Addtoolbar.click();
          asyncTestUtils.asyncElement('.perspective-editing', '.csui-pman-panel .load-container.binf-hidden').done(
            function (el) {
              expect($('.csui-tab-pannel').find('.csui-layout-tab').length).toEqual(1);
              done();
            });  
        });        
        it("Check that current layout is highlighted", function (done) {
          $('.csui-layout-tab').click();
          asyncTestUtils.asyncElement('.perspective-editing', '.csui-list-pannel .csui-layout-item').done(
            function (el) {
              expect($('.csui-layout-item.binf-active .csui-layout-flow').length).toEqual(1);
              done();
            });
        });
        it("Try to change the layout and check for confirmation dialog", function (done) {
          $('.csui-layout-item .csui-layout-lcr').click();
          asyncTestUtils.asyncElement('body', '.csui-alert').done(
            function (el) {
              expect($('.csui-alert').find('.binf-modal-dialog').length).toEqual(1);
              done();
            });
        });
        it("Change the layout and verify that all widgets removed from the page", function (done) {
          $('.csui-alert .binf-modal-dialog .csui-yes').click();
          asyncTestUtils.asyncElement('.perspective-editing', '.cs-left-center-right-perspective').done(
            function (el) {
              expect($('.cs-perspective .csui-pman-editable-widget.csui-pman-placeholder-container').length).toEqual(3);
              done();
            });

        });

      });
    });

    xdescribe("Save perspective", function() {
      it("click on widgets for popover", function(done) {
        asyncTestUtils.asyncElement('body', '.cs-perspective .csui-pman-editable-widget .csui-configure-perspective-widget').done(function(el) {
          $('.csui-configure-perspective-widget .csui-pman-widget-masking')[0].click();
          done();
        });
      });

      it("should open popover", function(done) {
        asyncTestUtils.asyncElement('.binf-popover', '.alpaca-container-item').done(function(el) {
          done();
        })
      });

      it("Should show confirmation dialog on clicking save", function(done) {
        $('.pman-right-tools .icon-save').click();
        asyncTestUtils.asyncElement('body','.binf-widgets .binf-modal-dialog').done(
          function(el) {
            expect(el.length).toEqual(1);
            done();
        });
      });

      it("Should show global message on clicking yes", function(done) {
        $('.binf-widgets .binf-modal-dialog .binf-modal-footer .csui-yes').click();
        asyncTestUtils.asyncElement('body','.csui-success').done(
          function(el) {
            expect(el.length).toEqual(1);
            done();
        });
      });
    });

    afterAll(function () {
      Mock.disable();
      $('body').empty();
    });
  })
});


