/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
  'csui/lib/marionette', 'csui/lib/underscore', 'csui/lib/jquery',
  'csui/widgets/nodestable/nodestable.view',
  'csui/utils/contexts/page/page.context', './draganddrop.mock.js',
  '../../../utils/testutils/async.test.utils.js', 'csui/controls/globalmessage/globalmessage'
], function (Marionette, _, $, NodesTableView, PageContext, dragAndDropMock, AsyncUtils,
    GlobalMessage) {
  'use strict';

  xdescribe('DragAndDropView', function () {
    var context, contextWithDescriptionNodes, files, dataTransfer, dragEventData,
        factories = {
          connector: {
            connection: {
              url: '//server/otcs/cs/api/v1',
              supportPath: '/support',
              session: {
                ticket: 'dummy'
              }
            }
          },
          node: {
            attributes: {id: 2000}
          }
        };

    beforeAll(function () {
      dragAndDropMock.enable();
      if (!context) {
        context = new PageContext({
          factories: factories
        });
      }
      if (!contextWithDescriptionNodes) {
        var factoriesWithDescriptions = _.deepClone(factories);
        factoriesWithDescriptions.node.attributes.id = 5000;  //5000 have description nodes
        contextWithDescriptionNodes = new PageContext({
          factories: factoriesWithDescriptions
        });
      }
    });

    afterAll(function () {
      dragAndDropMock.disable();
    });

    describe('folder with description', function () {
      var nodesTableView, regionEl, dataTransfer, dragEventData;
      beforeEach(function (done) {
        if (!nodesTableView) {
          nodesTableView = new NodesTableView({
            context: contextWithDescriptionNodes
          });

          var file1        = new File(['Hello', 'World'], 'file1.txt', {type: 'text/plain'}),
              dataTransfer = new window.DataTransfer();
          dataTransfer.setData('Files', file1);
          dragEventData = new window.DragEvent('dragover', {dataTransfer: dataTransfer});
          contextWithDescriptionNodes.fetch().then(function () {
            regionEl = $('<div></div>').appendTo(document.body);
            new Marionette.Region({
              el: regionEl
            }).show(nodesTableView);
            done();
          });
        } else {
          done();
        }
      });

      afterAll(function () {
        regionEl && regionEl.remove();
      });

      it('Nodestable View gets rendered with its table rows',
          function () {
            expect(nodesTableView.$el.find('tr.csui-saved-item')).toBeTruthy();
          });
      it('Nodestable View gets registred with dragNDrop View',
          function () {
            expect(nodesTableView.$el.find('.csui-dropMessage')).toBeTruthy();
          });

      it('test dragover/dragleaves on sub folder adds/removes border to' +
         ' table row', function (done) {
        var e = $.Event({type: 'dragover'});
        e.originalEvent = dragEventData;
        var row = nodesTableView.$el.find('tr.csui-saved-item:first');
        $(row).trigger(e);
        expect($(row).attr('class')).toContain('drag-over');
        $(row).trigger('drop');
        $(row).trigger('dragleave');
        expect($(row).attr('class')).not.toContain(
            'drag-over');
        done();

      });

      it('test dragover/dragleave on non supported subtype adds/removes border to' +
         ' table view', function (done) {
        var e = $.Event({type: 'dragover'});
        e.originalEvent = dragEventData;
        var row = nodesTableView.$el.find('tr.csui-saved-item:last');
        $(row).trigger(e);
        expect($(row).attr('class')).not.toContain('drag-over');
        expect(nodesTableView.$el.find('csui-table-tableview').attr('class')).not.toContain(
            'drag-over');

        $($(row)).trigger('drop');
        $($(row)).trigger('dragleave');

        expect(nodesTableView.$el.find('csui-table-tableview').attr('class')).not.toContain(
            'drag-over');
        done();

      });

      it('test dragover/dragleave tableview adds/removes border to' +
         ' csui-child-container', function (done) {

        var e = $.Event({type: 'dragover'});
        e.originalEvent = dragEventData;
        var row = nodesTableView.$el.find('tr.csui-saved-item:first');
        $(row).trigger(e);
        expect($(row).attr('class')).toContain('drag-over');
        $(row).trigger('drop');
        $(row).trigger('dragleave');
        expect(nodesTableView.$el.find('csui-table-tableview').attr('class')).not.toContain(
            'drag-over');
        done();

      });

      it('test drop table gets registered', function () {
        var e = $.Event({type: 'dragover'});
        e.originalEvent = dragEventData;
        $('.csui-table-tableview').trigger(e);
        nodesTableView.$el.find('.csui-table-tableview').trigger('drop', files);
        expect(nodesTableView.$el.find('.csui-table-tableview').attr('class')).not.toContain(
            'drag-over');
      });

      it('On drop a file over document, confirmation alert should appear',
          function (done) {
            var file1        = new File(['Hello',
                  'World'], 'file1.txt', {type: 'text/plain'}),
                dataTransfer = new window.DataTransfer(),
                row          = nodesTableView.$el.find(
                    'tr.csui-saved-item:nth-child(3)');
            dataTransfer.items.add(file1);
            var dragEventData1 = new window.DragEvent('drag', {dataTransfer: dataTransfer}),
                eve            = $.Event({type: 'drop'});
            eve.originalEvent = dragEventData1;
            $(row).trigger(eve);
            AsyncUtils.asyncElement(document.body, '.binf-modal-content').done(
                function (el) {
                  expect(el.length).toEqual(1);
                  var cancel = el.find('button[title="No"]');
                  var addVersion = el.find('button[title="Yes"]');
                  expect(cancel.length).toEqual(1);
                  expect(addVersion.length).toEqual(1);
                  cancel.click();
                  done();
                });
          });

      xit('droping file as version to the document, choose option from dialog', function (done) {
        var file1        = new File(['Hello',
              'World'], 'file1.txt', {type: 'text/plain'}),
            dataTransfer = new window.DataTransfer(),
            row          = nodesTableView.$el.find(
                'tr.csui-saved-item:nth-child(3)');
        dataTransfer.items.add(file1);
        var dragEventData1 = new window.DragEvent('drop', {dataTransfer: dataTransfer}),
            eve            = $.Event({type: 'drop'});
        eve.originalEvent = dragEventData1;
        $(row).trigger(eve);
        AsyncUtils.asyncElement(document.body, '.binf-modal-content').done(
            function (el) {
              expect(el.length).toEqual(1);
              var addVersion = el.find('button[title="Yes"]');
              addVersion.click();
              done();
            });

      });
    });

    describe('folder with description for thumbnail view', function () {
      var nodesTableView, regionEl, dataTransfer, dragEventData;
      beforeEach(function (done) {
        if (!nodesTableView) {
          nodesTableView = new NodesTableView({
            context: contextWithDescriptionNodes
          });
          var file1        = new File(['Hello', 'World'], 'file1.txt', {type: 'text/plain'}),
              dataTransfer = new window.DataTransfer();
          dataTransfer.setData('Files', file1);
          dragEventData = new window.DragEvent('dragover', {dataTransfer: dataTransfer});
          contextWithDescriptionNodes.fetch().then(function () {
            regionEl = $('<div></div>').appendTo(document.body);
            new Marionette.Region({
              el: regionEl
            }).show(nodesTableView);
            done();
          });
        } else {
          done();
        }

      });

      afterAll(function () {
        regionEl && regionEl.remove();

      });

      it('Open thumbnail view', function (done) {
        AsyncUtils.asyncElement(nodesTableView.$el, "li[data-csui-command='thumbnail']").done(
            function () {
              expect($("li[data-csui-command='thumbnail']").length).toEqual(1);
              var configurationMenu = nodesTableView.$el.find(
                  '.csui-configuration-view .binf-dropdown');
              configurationMenu.find('.binf-dropdown-toggle').trigger('click');
              var clickMenuItem = $("li[data-csui-command='thumbnail'] > a");
              clickMenuItem.trigger('click');
              AsyncUtils.asyncElement(nodesTableView.$el, ".csui-thumbnail-container").done(
                  function () {
                    expect(nodesTableView.$el.find('.csui-thumbnail-container').length).toEqual(1);
                    done();
                  });
            });
      });

      it('test dragover/dragleaves on sub folder adds/removes border to' +
         'thumbnail view', function (done) {
        AsyncUtils.asyncElement(nodesTableView.$el, "li[data-csui-command='thumbnail']").done(
            function () {
              AsyncUtils.asyncElement(nodesTableView.$el, ".csui-thumbnail-item-container").done(
                  function () {
                    var e = $.Event({type: 'dragover'});
                    e.originalEvent = dragEventData;
                    var row = nodesTableView.$el.find('div.csui-thumbnail-item:nth-child(2)');
                    $(row).trigger(e);
                    expect($(row).attr('class')).toContain('drag-over');
                    $(row).trigger('drop');
                    $(row).trigger('dragleave');
                    expect($(row).attr('class')).not.toContain(
                        'drag-over');
                    done();
                  });
            });
      });

      it('test dragover/dragleave thumbnailview adds/removes border to' +
         ' csui-child-container', function (done) {
        AsyncUtils.asyncElement(nodesTableView.$el, "li[data-csui-command='thumbnail']").done(
            function () {

              AsyncUtils.asyncElement(nodesTableView.$el, ".csui-thumbnail-item-container").done(
                  function () {
                    var e = $.Event({type: 'dragover'});
                    e.originalEvent = dragEventData;
                    var row = nodesTableView.$el.find('div.csui-thumbnail-item:nth-child(2)');
                    $(row).trigger(e);
                    expect($(row).attr('class')).toContain('drag-over');
                    $(row).trigger('drop');
                    $(row).trigger('dragleave');
                    expect(nodesTableView.$el.find('csui-thumbnail-wrapper').attr(
                        'class')).not.toContain(
                        'drag-over');
                    done();
                  });
            });
      });

      it('Nodestable View gets rendered with its thumbnail items',
          function () {
            expect(nodesTableView.$el.find('div.csui-thumbnail-item')).toBeTruthy();
          });

      it('Nodestable View gets registred with dragNDrop View',
          function () {
            expect(nodesTableView.$el.find('.csui-dropMessage')).toBeTruthy();
          });

      it('test dragover/dragleave on non supported subtype adds/removes border to' +
         ' thumbnail view', function (done) {
        AsyncUtils.asyncElement(nodesTableView.$el, "li[data-csui-command='thumbnail']").done(
            function () {

              AsyncUtils.asyncElement(nodesTableView.$el, ".csui-thumbnail-item-container").done(
                  function () {
                    var e = $.Event({type: 'dragover'});
                    e.originalEvent = dragEventData;
                    var row = nodesTableView.$el.find('div.csui-thumbnail-item:last');
                    $(row).trigger(e);
                    expect($(row).attr('class')).not.toContain('drag-over');
                    expect(nodesTableView.$el.find('csui-thumbnail-wrapper').attr(
                        'class')).not.toContain(
                        'drag-over');
                    $(row).trigger('drop');
                    $(row).trigger('dragleave');
                    expect(nodesTableView.$el.find('csui-thumbnail-wrapper').attr(
                        'class')).not.toContain(
                        'drag-over');
                    done();
                  });
            });
      });

      it('test drop thumbnail container gets registered', function () {
        var e = $.Event({type: 'dragover'});
        e.originalEvent = dragEventData;
        $('.csui-thumbnail-wrapper').trigger(e);
        nodesTableView.$el.find('.csui-thumbnail-wrapper').trigger('drop', files);
        expect(nodesTableView.$el.find('.csui-thumbnail-wrapper').attr('class')).not.toContain(
            'drag-over');
      });

      it('test dragover/dragleaves on document type to thumbnail view', function (done) {
        AsyncUtils.asyncElement(nodesTableView.$el, "li[data-csui-command='thumbnail']").done(
            function () {
              AsyncUtils.asyncElement(nodesTableView.$el, ".csui-thumbnail-item-container").done(
                  function () {
                    var e = $.Event({type: 'dragover'});
                    e.originalEvent = dragEventData;
                    var row = nodesTableView.$el.find('div.csui-thumbnail-item:nth-child(3)');
                    $(row).trigger(e);
                    expect($(row).attr('class')).toContain('drag-over');
                    $(row).trigger('dragleave');
                    AsyncUtils.asyncElement(nodesTableView.$el, '.drag-over', true).done(
                        function () {
                          expect($(row).attr('class')).not.toContain('drag-over');
                          done();
                        });

                  });
            });
      });

      it('test on dragover, on document type shows drag dialog to ' +
         'thumbnail view', function (done) {
        AsyncUtils.asyncElement(nodesTableView.$el, "li[data-csui-command='thumbnail']").done(
            function () {
              AsyncUtils.asyncElement(nodesTableView.$el, ".csui-thumbnail-item-container").done(
                  function () {
                    var e = $.Event({type: 'dragover'});
                    e.originalEvent = dragEventData;
                    var row     = nodesTableView.$el.find('div.csui-thumbnail-item:nth-child(3)'),
                        message = "Drop file to upload it to: " + $(row).text().trim();
                    $(row).trigger(e);
                    expect($(row).attr('class')).toContain('drag-over');
                    AsyncUtils.asyncElement(nodesTableView.$el, ".csui-dropMessage").done(
                        function (el) {
                          expect(el.length).toEqual(1);
                          expect(el.text()).toEqual(message);
                          done();
                        });
                  });
            });
      });
    });

  });
});
