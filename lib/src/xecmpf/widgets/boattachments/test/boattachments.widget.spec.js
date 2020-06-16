/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

'use strict';

define(['csui/lib/jquery', 'csui/lib/underscore', 'csui/lib/marionette',
  'csui/utils/base', 'csui/utils/contexts/page/page.context',
  'xecmpf/widgets/boattachments/boattachments.view', 'xecmpf/widgets/boattachments/test/boattachments.mock'
], function ($, _, Marionette,
  base, PageContext,
  BusinessAttachmentWidget, Mock) {
  describe('Business Attachments Widget', function () {
    var context, widget, contentRegion;

    beforeAll(function () {
      Mock.enable();

      var $head = $('head');
      $head.append('<link rel="stylesheet" href="/base/csui/themes/carbonfiber/theme.css">');

      var $body = $('body');
      $body.addClass('binf-widgets');
      $body.css({
        'margin': 0,
        'height': '100%',
        'overflow-y': 'hidden',
        'overflow-x': 'hidden',
        'padding-right': '0px !important'
      });
      $body.append('<div id="widgetWMainWindow" style="height:100vh"></div>');

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
    });

    describe('Collapsed View', function () {
      it('can be instantiated and rendered', function (done) {
        widget = new BusinessAttachmentWidget({
          context: context,
          data: {
            "businessattachment": {
              "properties": {
                "busObjectId": "0000001000",
                "busObjectType": "KNA1",
                "extSystemId": "D7K"
              }
            },
            "collapsedView": {
              "bottomLeft": {
                "label": {
                  "en": "Type"
                },
                "value": "{type_name}"
              },
              "bottomRight": {
                "label": {
                  "en": "Modified"
                },
                "value": "{modify_date}"
              },
              "description": {
                "value": "{description}"
              },
              "noResultsPlaceholder": {
                "en": "No attachments to display."
              },
              "orderBy": {
                "sortColumn": "{name}",
                "sortOrder": "asc"
              },
              "title": {
                "value": "{name}"
              },
              "topRight": {
                "label": {
                  "en": "Created"
                },
                "value": "{create_date}"
              }
            },
            "snapshot": {
              "folderNamePrefix": "D7K_KNA1",
              "parentFolderName": "D7K_Customer_Snapshots"
            },
            "title": {
              "en": "Customer 0000001000 attachments"
            }
          }
        });

        contentRegion = new Marionette.Region({
          el: '#widgetWMainWindow'
        });

        contentRegion.show(widget);

        expect(widget).toBeDefined();
        expect(widget.$el.length).toBe(1);
        done();
      });

      it('fetches the business attachments with context fetch', function (done) {
        context
          .fetch()
          .done(function () {
            expect(widget.collection.length).toBe(5); // mock data returns 5 attachments
            done();
          });
      });

      it('renders item view for each attachment model', function (done) {
        var itemsLength = widget.$el.find('.binf-list-group').children().length;
        expect(itemsLength).toBe(5); // mock data returns 5 attachments

        for (var i = 0; i < itemsLength; i++) {
          var props = getPropsForAttachmentItem(i);
          var model = widget.collection.at(i);
          expect(props.icon.attr('title')).toBe(getIconTitle(model));
          expect(props.title.text()).toBe(model.get('name'));
          expect(props.topRight.text()).toBe(base.formatDate(model.get('create_date')));
          expect(props.description.text()).toBe(model.get('description'));
          expect(props.bottomLeft.text()).toBe(model.get('type_name'));
          expect(props.bottomRight.text()).toBe(base.formatDate(model.get('modify_date')));
        }

        function getIconTitle(model) {
          var mime = model.get('mime_type');
          if (!mime) {
            return model.get('type_name');
          }
          var mimeTitleMap = {
            'application\/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Microsoft Word',
            'application\/vnd.openxmlformats-officedocument.presentationml.presentation': 'Microsoft Powerpoint',
            'application\/pdf': 'Portable Document Format'
          };

          return mimeTitleMap[mime];
        }

        done();
      });

      it('opens expand view on click expand icon', function (done) {
        widget.$el.find('.cs-more').click();
        setTimeout(function () {
          expect($('.xecmpf-businessattachments.cs-dialog .binf-modal-dialog').length).toBe(1);
          done();
        }, 2000); // delay in rendering the modal dialog and table view
      });
    });

    describe('Expanded View', function () {
      it('renders row in expanded table view for each attachment model', function (done) {
        var rows = $('.xecmpf-businessattachments.cs-dialog .binf-modal-dialog #botableview tbody tr[role="row"]');
        expect(rows.length).toBe(5);
        done();
      });
    });

    afterAll(function () {
      widget.destroy();
      $('#widgetWMainWindow').remove();
      $('link[href="/base/csui/themes/carbonfiber/theme.css"]').remove();
      Mock.disable();
    });

    function getPropsForAttachmentItem(itemnr) {
      var attachmentItem = $(widget.$el.find('.xecmpf-attachmentitem-object')[itemnr]),
        attachmentItemTop = attachmentItem.find('.xecmpf-attachmentitem-top'),
        attachmentItemCenter = attachmentItem.find('.xecmpf-attachmentitem-center'),
        attachmentItemBottom = attachmentItem.find('.xecmpf-attachmentitem-bottom');

      return {
        icon: attachmentItemTop.find('.csui-icon-group'),
        title: attachmentItemTop.find('.xecmpf-title').find('.xecmpf-value'),
        topRight: attachmentItemTop.find('.xecmpf-right').find('.xecmpf-value'),
        description: attachmentItemCenter.find('.xecmpf-body'),
        bottomLeft: attachmentItemBottom.find('.xecmpf-left').find('.xecmpf-value'),
        bottomRight: attachmentItemBottom.find('.xecmpf-right').find('.xecmpf-value')
      }
    }

  })
});