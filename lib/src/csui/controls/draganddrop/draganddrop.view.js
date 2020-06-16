/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(["module", "csui/lib/jquery", "csui/lib/underscore", "csui/lib/marionette",
  "csui/lib/backbone", "csui/utils/log", "i18n!csui/controls/draganddrop/impl/nls/lang",
  'csui/controls/globalmessage/globalmessage', 'csui/controls/fileupload/fileupload',
  'csui/dialogs/modal.alert/modal.alert',
  'csui/utils/dragndrop.supported.subtypes',
  'csui/utils/base',
  "hbs!csui/controls/draganddrop/impl/draganddrop",
  "css!csui/controls/draganddrop/impl/draganddrop", 'csui/lib/jquery.when.all'
], function (module, $, _, Marionette, Backbone, log, lang, GlobalMessage,
    fileUploadHelper, ModalAlert, DragndropSupportedSubtypes, base, template) {

  var config = _.defaults({}, module.config(), {
    detectLeaveDelay: 10
  });

  var DragAndDropView = Marionette.ItemView.extend({

    template: template,
    className: "csui-dropMessage",

    ui: {
      message: '.csui-messageBox'
    },

    templateHelpers: function () {
      return {
        message: this._getDropPossibleMessage()
      };
    },

    constructor: function DragAndDropView(options) {
      Marionette.ItemView.prototype.constructor.call(this, options);

      this.collection = options.collection;
      this.container = options.container;
      this.addableTypes = options.addableTypes;
      this.wantDragAndDrop = true;
      this.context = options.context;
      this.visible = false;
      this.highlightedTarget = options.highlightedTarget;
      this.originatingView = options.originatingView;
      this.listenTo(this.options.container, "change:name", this._resetMessage);
    },

    setDragParentView: function (parentView, selector) {
      this._parentEl = _.isString(selector) && parentView.$(selector) ||
                       selector.length !== undefined && selector ||
                       selector && $(selector) ||
                       parentView.$el;
      this.render();
      if (!parentView.csuiDropMessage) {
        parentView.csuiDropMessage = this.$el;
        this._parentEl.append(parentView.csuiDropMessage);
      }
      this.parentView = parentView;
      if (this.shouldDragAndDrop()) {
        this.disable();
        this._setDragEvents();
      }
      return true;
    },

    onDestroy: function () {
      if (this.shouldDragAndDrop()) {
        if (this._parentEl) {
          this._parentEl
              .off("dragover", this.dragOver)
              .off("dragleave", this.dragLeave)
              .off("drop", this.dragDrop);
        }
      }
    },

    stopListeningDragEvent: function (element, parentView) {
      $(element) && parentView &&
      $(element).off("dragover", parentView.dragOver)
          .off("dragleave", parentView.dragLeave)
          .off("drop", parentView.dragDrop);
    },

    _setDragEvents: function () {
      this.dragOver = _.bind(this.onOverView, this);
      this.dragLeave = _.bind(this.onLeaveView, this);
      this.dragDrop = _.bind(this.onDropView, this);
      this._parentEl
          .on("dragover", this.dragOver)
          .on("dragleave", this.dragLeave)
          .on("drop", this.dragDrop);
    },

    getSupportedSubType: function () {
      var supportedType = {
        type: 144,
        type_name: "Document"
      };
      return supportedType;
    },

    enable: function (triggerEvent) {
      if (!this.visible) {
        if (triggerEvent !== false) {
          this.trigger('drag:over');
        }
        this.parentView.csuiDropMessage.show();
        this.visible = true;
      }
      if (this.canAdd()) {
        var node = this.getSupportedSubType();
        this.options.addableType = node.type;
        this.options.addableTypeName = node.type_name;
      }
    },

    disable: function (currentEvent) {
      this.trigger('drag:leave', this, {highlightedTarget: this.highlightedTarget});
      if (currentEvent && currentEvent.type === 'dragleave') {
        if (!!currentEvent.relatedTarget) {
          if (!this.parentView.$el.find('.drag-over').length) {
            if ($('div.csui-dropMessage').length && $('div.csui-dropMessage')[0].className !==
                currentEvent.relatedTarget.className) {
              this.parentView.csuiDropMessage.hide();
              this.visible = false;
            }
          }
        } else {
          if (!this.parentView.$el.find('.drag-over').length) {
            this.parentView.csuiDropMessage.hide();
            this.visible = false;
          }
        }
      }
      else {
        this.parentView.csuiDropMessage.hide();
        this.visible = false;
      }
    },

    shouldDragAndDrop: function () {
      var browserSupported = false,
          sampleDiv        = document.createElement('div');
      if ((window.File && window.FileReader && window.FileList && window.Blob) &&
          (('draggable' in sampleDiv) ||
           ('ondragstart' in sampleDiv && 'ondrop' in sampleDiv))) {
        browserSupported = true;
      }

      return browserSupported && this.wantDragAndDrop;
    },

    canAdd: function () {
      if (this.addableTypes && this.addableTypes.length && this.addableTypes.get(144)) {
        return true;
      } else if (!this.addableTypes) {
        return true;
      } else {
        return false;
      }
    },

    isDndSupportedContainer: function (container) {
      return $.inArray(container.get('type'), DragndropSupportedSubtypes) !== -1;
    },

    onOverView: function (currentEvent) {

      currentEvent.preventDefault();
      currentEvent.stopPropagation();
      if ($(currentEvent.target).closest(
          '.csui-thumbnail-overview-container .binf-popover').length) {
        return false;
      }

      if (this.leaveViewTimeout) {
        clearTimeout(this.leaveViewTimeout);
        this.leaveViewTimeout = undefined;
      }
      else {
        this.enable(false);
      }
      var dataTransfer   = currentEvent.originalEvent &&
                           currentEvent.originalEvent.dataTransfer,
          items          = dataTransfer.items,
          validItems     = items && items.length && _.all(items, function (item) {
            return item.kind === 'file';
          }),
          types          = dataTransfer && dataTransfer.types,
          validTypes     = types && types.length && _.any(types, function (type) {
            return type.toLowerCase() === 'files';
          }),
          invalidMessage = lang.dropInvalid;
      this.valid = items && validItems || validTypes;

      if (!this.canAdd()) {
        var validContainer = this.isDndSupportedContainer(this.originatingView.container);
        this.valid = validContainer && this.options.isSupportedRowView;
        invalidMessage = lang.dropNotPermitted;
      }
      if (items && items.length > 1 && this.container.get('type') === 144) {
        if (!this.currentRowHighlightedTarget) {
          this.currentRowHighlightedTarget = this.highlightedTarget;
          this.highlightedTarget = undefined;
        }
        if (this.originatingView.addableTypes && !this.originatingView.addableTypes.get(144)) {
          this.valid = false;
        }

      } else {
        if (this.currentRowHighlightedTarget) {
          this.highlightedTarget = this.currentRowHighlightedTarget;
          this.currentRowHighlightedTarget = undefined;
        }
      }
      if (this.valid) {
        this._resetMessage({items: items});
      }
      if (!this.overViewTimeout) {
        this.overViewTimeout = setTimeout(_.bind(function () {
          this.overViewTimeout = undefined;
          if (this.valid) {
            this.parentView.csuiDropMessage.hasClass('csui-disabled') &&
            this.parentView.csuiDropMessage.removeClass('csui-disabled');
            this.trigger('drag:over', this,
                {disabled: false, highlightedTarget: this.highlightedTarget});
            this.parentView.csuiDropMessage.show();
            this.visible = true;
          } else {
            !this.parentView.csuiDropMessage.hasClass('csui-disabled') &&
            this.parentView.csuiDropMessage.addClass('csui-disabled');
            this.parentView.csuiDropMessage.html(invalidMessage);
            this.parentView.csuiDropMessage.show();
            this.visible = true;
            this.trigger('drag:over', this, {disabled: true});
          }
        }, this), config.detectLeaveDelay);
      }
    },

    onLeaveView: function (currentEvent) {
      currentEvent.preventDefault();
      currentEvent.stopPropagation();
      if (!this.leaveViewTimeout) {
        this.leaveViewTimeout = setTimeout(_.bind(function () {
          this.leaveViewTimeout = undefined;
          this.disable(currentEvent);
        }, this), config.detectLeaveDelay);
      }
      if (this.overViewTimeout) {
        clearTimeout(this.overViewTimeout);
        this.overViewTimeout = undefined;
      }
    },

    onDropView: function (currentEvent) {
      currentEvent.preventDefault();
      currentEvent.stopPropagation();
      if (this.overViewTimeout) {
        clearTimeout(this.overViewTimeout);
        this.overViewTimeout = undefined;
      }
      var self         = this,
          dataTransfer = currentEvent.originalEvent &&
                         currentEvent.originalEvent.dataTransfer ||
              {
                files: currentEvent.originalEvent &&
                       currentEvent.originalEvent.target &&
                       currentEvent.originalEvent.target.files || []
              };
      this._selectFiles(dataTransfer)
          .always(function (files) {
            files = _.reject(files, function (file) {
              return file instanceof Error;
            });
            if (files.length) {
              if (self.canAdd() ||
                  (self.isDndSupportedContainer(self.options.originatingView.container) &&
                   self.options.isSupportedRowView)) {
                var status = {};
                status = {
                  container: self.container.get('type') === 144 ?
                             self.options.originatingView.container :
                             self.container,
                  context: self.context,
                  originatingView: self.options.originatingView
                };
                if (!self.options.isSupportedRowView || self.container.get('type') === 144) {
                  status.collection = self.collection;
                }
                if (files.length === 1 && self.container.get('type') === 144) {
                  var dropTargetName = self.container.get("name");
                  self.container.fetch().done(function () {
                    var action = self.container.actions.findWhere({signature: 'addversion'});
                    if (action) {
                      ModalAlert.confirmQuestion(
                          _.str.sformat(lang.dialogTemplate, dropTargetName), lang.dialogTitle, {})
                          .done(function (result) {
                            self._addVersionToFile(status, files);
                          });
                    } else {
                      if (self.container.get('reserved')) {
                        GlobalMessage.showMessage('warning',
                            _.str.sformat(lang.addVersionDeniedForReservedItem));
                      } else {
                        GlobalMessage.showMessage('warning',
                            _.str.sformat(lang.addVersionDenied, dropTargetName));
                      }
                    }
                  })
                      .fail(function (request) {
                        if (request) {
                          var error = new base.Error(request);
                          GlobalMessage.showMessage('error', error.message);
                        }
                      });
                } else {
                  var fileUploadModel = fileUploadHelper.newUpload(status, self.options);
                  fileUploadModel.addFilesToUpload(files);
                }
              } else {
                var nodeName = self.container.get('name');
                GlobalMessage.showMessage('error', _.str.sformat(lang.addTypeDenied, nodeName));
              }
            } else {
              GlobalMessage.showMessage('error', lang.noFiles);
            }
          });
      this.disable();
    },

    _addVersionToFile: function (status, files) {
      var fileUploadModel = fileUploadHelper.newUpload(status);
      fileUploadModel.status = 'version';
      fileUploadModel.itemId = this.container.get('id');
      fileUploadModel.addFilesToUpload(files,
          {skipResolveNamingConflicts: true});
    },

    _selectFiles: function (dataTransfer) {
      var filesFromItems = false,
          wrongEntries   = false,
          items          = dataTransfer.items,
          files          = items && items.length && _.chain(items)
              .map(function (item) {
                var entry  = item.webkitGetAsEntry && item.webkitGetAsEntry(),
                    isFile = entry && entry.isFile;
                if (isFile) {
                  filesFromItems = true;
                  return item.getAsFile();
                } else {
                  wrongEntries = true;
                }
              })
              .compact()
              .value() || dataTransfer.files;
      if (filesFromItems) {
        var resolveMethod = wrongEntries ? 'reject' : 'resolve';
        return $
            .Deferred()
            [resolveMethod](files)
            .promise();
      }
      files = dataTransfer.files;
      if (files) {
        return $.whenAll
            .apply($, _.map(files, checkFile))
            .then(function (results) {
              return results;
            }, function (files) {
              return $
                  .Deferred()
                  .reject(files)
                  .promise();
            });
      }
      return $
          .Deferred()
          .reject([])
          .promise();

      function checkFile(file) {
        var reader   = new FileReader(),
            deferred = $.Deferred(),
            aborted;
        reader.addEventListener('load', function () {
          deferred.resolve(file);
          aborted = true;
          reader.abort();
        });
        reader.addEventListener('error', function () {
          if (!aborted) {
            var error = new Error('No file');
            error.file = file;
            deferred.reject(error);
          }
        });
        try {
          reader.readAsArrayBuffer(file);
        } catch (err) {
          var error = new Error(err.message);
          error.file = file;
          deferred.reject(error);
        }
        return deferred.promise();
      }
    },

    _resetMessage: function (options) {
      if (this._isRendered) {
        var msgEle = this.parentView.csuiDropMessage;
        msgEle && msgEle.length && msgEle.html(this._getDropPossibleMessage(options));
      }
    },

    _getDropPossibleMessage: function (options) {
      var items       = options && options.items,
          itemsCount  = items && items.length,
          fileName    = itemsCount && itemsCount > 1 && this.container.get('type') === 144 ?
                        this.originatingView.container.get('name') :
                        this.container.get('name'),
          message     = '',

          dropMessage = function () {
            if (itemsCount && itemsCount > 1) {
              return lang.MultipleFilesDropMessage;
            } else if (itemsCount) {
              return lang.singleFileDropMessage;
            } else {
              return lang.defaultDropMessage;
            }

          };

      if (fileName) {
        message = _.str.sformat(dropMessage(), fileName);
      }
      return message;
    }

  });

  return DragAndDropView;
});
