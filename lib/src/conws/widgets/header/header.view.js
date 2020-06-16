/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */


define(['module',
  'require',
  'csui/lib/underscore',
  'csui/lib/jquery',
  'csui/lib/marionette',
  'csui/lib/handlebars',
  'csui/utils/base',
  'csui/utils/log',
  'csui/utils/url',
  'csui/utils/nodesprites',
  'csui/behaviors/keyboard.navigation/tabkey.behavior',
  'csui/dialogs/modal.alert/modal.alert',
  'csui/controls/tabletoolbar/tabletoolbar.view',
  'esoc/widgets/activityfeedwidget/activityfeedfactory',
  'esoc/widgets/activityfeedwidget/activityfeedcontent',
  'conws/models/workspacecontext/workspacecontext.factory',
  'conws/widgets/header/impl/editicon.view',
  'conws/widgets/header/impl/header.model.factory',
  'conws/widgets/header/impl/header.icon.model',
  'conws/widgets/header/impl/headertoolbaritems',
  'conws/widgets/header/impl/headertoolbaritems.masks',
  'conws/models/favorite.model',
  'conws/controls/description/description.view',
  'i18n!conws/widgets/header/impl/nls/header.lang',
  'hbs!conws/widgets/header/impl/header',
  'css!conws/widgets/header/impl/header'
], function (module, require, _, $, Marionette, Handlebars, base, log, Url, NodeSpriteCollection,
    TabKeyBehavior, ModalAlert, TableToolbarView, ActivityFeedFactory, ActivityFeedContent,
    WorkspaceContextFactory, EditIconView, HeaderModelFactory,
    HeaderIconModel, HeaderToolbarItems, HeaderToolbarItemsMask, FavoriteModel, DescriptionView,
    lang, template) {
  'use strict';
  var constants = {'activityfeedwidget': 'esoc/widgets/activityfeedwidget'};

  var moduleConfig = module.config();
  var HeaderView = Marionette.LayoutView.extend({
    className: 'conws-header',
    template: template,
    templateHelpers: function () {
      var obj = {
        canChange: this.model.hasAction('upload-icon') ||
                   this.model.hasAction('update-icon') ||
                   this.model.hasAction('delete-icon'),
        iconData: this.getImageInfo().iconContent,
        iconClass: this.getImageInfo().iconClass,
        iconFileTypes: this.options.data.iconFileTypes,
        chooseInpFileTitle: this.options.data.chooseInpFileTitle,
        iconMsg: lang.iconMessage,
        title: this.resolveProperty('title'),
        type: this.resolveProperty('type'),
        description: this.resolveProperty('description'),
        hasChildView: this.hasChildView(),
        hasToolbarView: !this.options.hideToolbar,
        hasDescription: !this.options.hideDescription,
        hasWorkspaceType: !this.options.hideWorkspaceType,
        hasMetadataExtension: this.options.hasMetadataExtension,
        hasMetadata: !this.options.hideDescription || !this.options.hideWorkspaceType ||
                     this.options.hasMetadataExtension
      };
      return obj;
    },
    regions: {
      childViewRegion: '#conws-header-childview',
      toolBarRegion: '.conws-header-toolbar',
      descriptionRegion: '.conws-header-desc'
    },
    triggers: {
      'change .conws-header-icon-file': 'set:icon',
      'mouseleave .conws-header-wrapper': 'mouse:leave'
    },

    events: {
      'keydown': 'onKeyDown'
    },

    behaviors: {
      TabableRegion: {
        behaviorClass: TabKeyBehavior
      }
    },

    isTabable: function () {
      return $('.cs-tabbed-perspective.cs-collapse').length === 0;
    },

    currentlyFocusedElement: function () {
      return this.$el.find('.conws-header-edit');
    },

    onKeyDown: function (e) {
      if (e.keyCode === 13 || e.keyCode === 32) {
        if ($(e.target).hasClass('conws-header-edit')) {
          e.preventDefault();
          e.stopPropagation();
          if ($('.cs-collapse').length === 0) {
            $(e.target).binf_popover('show');
          }
        }
      }
    },

    onMouseLeave: function () {
      $('.conws-header-edit').binf_popover('hide');
    },
    blankImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=',
    defaultIconFileTypes: 'image/gif, image/x-png, image/jpeg, image/pjpeg, image/png, image/svg+xml',
    defaultIconFileSize: 1048576,
    constructor: function HeaderView(options) {
      options || (options = {});
      if (!options.context) {
        throw new Error('Context is missing in the constructor options');
      }
      if (!options.data.iconFileTypes) {
        options.data.iconFileTypes = this.defaultIconFileTypes;
      }
      if (!options.data.iconFileSize) {
        options.data.iconFileSize = this.defaultIconFileSize;
      }
      if (!options.data.chooseInpFileTitle) {
        options.data.chooseInpFileTitle = lang.chooseInpFileTitle;
      }
      options.hideToolbar = options.hideToolbar ? !!options.hideToolbar :
                            !!moduleConfig.hideToolbar;
      options.hideToolbarExtension = options.hideToolbarExtension ? !!options.hideToolbarExtension :
                                     !!moduleConfig.hideToolbarExtension;
      options.hideActivityFeed = options.hideActivityFeed ? !!options.hideActivityFeed :
                                 !!moduleConfig.hideActivityFeed;
      options.hideDescription = options.hideDescription ? !!options.hideDescription :
                                !!moduleConfig.hideDescription;
      options.hideWorkspaceType = options.hideWorkspaceType ? !!options.hideWorkspaceType :
                                  !!moduleConfig.hideWorkspaceType;
      options.hasMetadataExtension = options.hasMetadataExtension ? !!options.hasMetadataExtension :
                                     !!moduleConfig.hasMetadataExtension;
      options.toolbarBlacklist = options.toolbarBlacklist ? options.toolbarBlacklist :
                                 moduleConfig.toolbarBlacklist;
      options.extensionToolbarBlacklist = options.extensionToolbarBlacklist ?
                                          options.extensionToolbarBlacklist :
                                          moduleConfig.extensionToolbarBlacklist;
      if (!options.workspaceContext) {
        options.workspaceContext = options.context.getObject(WorkspaceContextFactory);
        options.workspaceContext.setWorkspaceSpecific(HeaderModelFactory);
        options.workspaceContext.setWorkspaceSpecific(ActivityFeedFactory);
      }
      options.model = options.workspaceContext.getModel(HeaderModelFactory);
      if (options.data.widget && options.data.widget.type &&
          options.data.widget.type === 'activityfeed') {
        options.data.widget.type = constants.activityfeedwidget;
        options.data.widget.options || (options.data.widget.options = {});
      }
      Marionette.LayoutView.prototype.constructor.call(this, options);
      if (Array.isArray(options.toolbarBlacklist) && options.toolbarBlacklist.length > 0) {
        this.options.headerToolbarItemsMask = new HeaderToolbarItemsMask({"rightToolbar": {blacklist: options.toolbarBlacklist}});
      }
      if (Array.isArray(options.extensionToolbarBlacklist) &&
          options.extensionToolbarBlacklist.length > 0) {
        this.options.headerExtensionToolbarItemsMask = new HeaderToolbarItemsMask({"rightToolbar": {blacklist: options.extensionToolbarBlacklist}});
      }
      $(window).bind('resize', _.bind(this.onWindowResize, this));
      this.listenTo(this.model, 'change', this.render);
      this.iconModel = new HeaderIconModel({},
          {connector: this.model.connector, node: this.model});
      this.listenTo(this.iconModel, 'icon:change', this.onIconChanged);

      if (this.hasChildView()) {
        var widget = this.options.data.widget;
        if (widget.type === constants.activityfeedwidget) {
          this._makeActivityWidget();
          this.listenTo(this.model.node, 'change:id', this._makeActivityWidget);
        }
      }
      if (!this.options.hideToolbarExtension) {
        this.tabBarRightExtensionView = TableToolbarView;
        this.tabBarRightExtensionViewOptions = {
          context: this.options.context,
          toolbarItems: this.options.headerExtensionToolbaritems || HeaderToolbarItems,
          toolbarItemsMasks: this.options.headerExtensionToolbarItemsMask,
          container: this.options.model.node,
          originatingView: this,
          customClass: "conws-header-toolbar-extension conws-header-toolbar"
        }
        this.disableExtensionOnOtherTabs = true;
      }
      this.listenTo(this, 'dom:refresh', this.onDomRefresh);
    },

    onDomRefresh: function () {
      this._clampTexts();
      if (this.hasChildView()) {
        this.childViewRegion.currentView &&
        this.childViewRegion.currentView.triggerMethod('dom:refresh');
      }
      if (!this.options.hideToolbar) {
        this.tableToolbarView.triggerMethod('dom:refresh');
      }

      if ( !!this.descriptionView && this.descriptionView.ui.readMore.is(":hidden") && this.descriptionView.ui.showLess.is(":visible") ) {
        this.descriptionView.ui.showLess.click();
        this.currentlyFocusedElement().focus();
      }

      this.isTabable() ? this.currentlyFocusedElement().attr("tabindex", "0") : this.currentlyFocusedElement().attr("tabindex", "-1");

    },

    onWindowResize: function () {
      this._clampTexts();
    },

    onDestroy: function () {
      $(window).unbind('resize', this.onWindowResize);
      if (this._observer) {
        this._observer.disconnect();
      }
    },
    onIconChanged: function () {
      this.model.fetch();
    },
    onSetIcon: function (e) {
      var files = $('.conws-header-icon-file')[0].files
      if (this.getImageInfo().iconLocation === 'node') {
        this.iconModel.update(files).fail(function (resp) {
          var message = new base.RequestErrorMessage(resp).message ||
                        lang.changeIconDialogDefaultError;
          ModalAlert.showError(message);
        });
      } else {
        this.iconModel.add(files).fail(function (resp) {
          var message = new base.RequestErrorMessage(resp).message ||
                        lang.changeIconDialogDefaultError;
          ModalAlert.showError(message);
        });
      }
    },
    renderPopover: function () {
      var imageInfo = this.getImageInfo();
      var self = this;
      var view = new EditIconView({
        message: lang.changeIconDialogMessage.replace('%1',
            base.getReadableFileSizeString(self.options.data.iconFileSize)),
        resetButton: function () {
          return imageInfo.iconLocation === 'node' && self.model.hasAction('delete-icon')
        },
        uploadButton: function () {
          return imageInfo.iconLocation !== 'type' && self.model.hasAction('upload-icon')
                 || imageInfo.iconLocation !== 'node' && self.model.hasAction('update-icon');

        },
        callback: _.bind(this.onClickPopover, this)
      });
      return view.render().el;
    },
    onClickPopover: function (e) {
      $('.conws-header-edit').binf_popover('hide');
      if (e === 'reset') {
        this.iconModel.remove().fail(function (resp) {
          var message = new base.RequestErrorMessage(resp).message ||
                        lang.changeIconDialogDefaultError;
          ModalAlert.showError(message);
        });
      } else if (e === 'upload') {
        this.$('.conws-header-icon-file').trigger('click');
        if (base.isTouchBrowser()) {
          this.$('.conws-header-icon-file').trigger('click');
        }
      }
      this.currentlyFocusedElement().focus();
    },

    onShow: function () {
      var self = this;
      var perspective = $('.cs-perspective-panel');
      if (perspective.length === 1) {
        this._observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            var target = $(mutation.target);
            if (target.hasClass('cs-tabbed-perspective')) {
              self.titleClampLines = target.hasClass('cs-collapse') ? 1 : 2;
              self._clampTexts();
            }
          });
        });
        this._observer.observe(perspective[0],
            {attributes: true, attributeFilter: ['class'], subtree: true});
      }
    },
    onRender: function () {
      var self = this;
      var edit = this.$('.conws-header-edit');
      edit.binf_popover({
        container: '.conws-header-wrapper',
        animation: true,
        html: true,
        content: _.bind(this.renderPopover, this)
      });

      if (this.hasChildView()) {
        if (!self.activityFeedContent) {
          this._makeActivityWidget();
        }
        if (self.activityFeedContent) {
          var listView = self.activityFeedContent.contentView.unblockActions();
          self.childViewRegion.show(listView);
          self.activityFeedContent = undefined;
        }
      }
      if (!this.options.hideToolbar) {
        this.tableToolbarView = new TableToolbarView({
          context: this.options.context,
          toolbarItems: this.options.headertoolbaritems || HeaderToolbarItems,
          toolbarItemsMasks: this.options.headerToolbarItemsMask,
          container: this.options.model.node,
          originatingView: this
        });
        this.toolBarRegion.show(this.tableToolbarView);
      }
      if (!this.options.hideDescription) {
        var data = {
          view: this,
          complete_desc: this.resolveProperty('description'),
          collapsedHeightIsOneLine: true
        };
        this.descriptionView = new DescriptionView(data);
        this.descriptionRegion.show(this.descriptionView);
      }
    },

    _clampTexts: function () {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }
      this.resizeTimer = setTimeout(_.bind(function () {
        var title = $('.conws-header-title > p');
        if (title.length !== 0) {
          title.text(title.attr('title'));
          this.clamp(title[0], title.parent().outerHeight());
        }
      }, this), 200);
    },
    _makeActivityWidget: function () {
      this.activityFeedContent = undefined;
      if (this.model.node.get('id')) {
        var widget = (this.options.data && this.options.data.widget);
        if (widget && widget.type === constants.activityfeedwidget) {
          var widgetOptions = $.extend({}, widget.options, {
            feedsize: 10,
            feedtype: "all",
            feedSettings: {
              enableComments: true,
              enableFilters: false
            },
            feedsource: {
              source: 'pulsefrom',
              id: this.model.node.get('id')
            },
            hideExpandIcon: true,
            context: this.options.workspaceContext,
            headerView: true
          });
          this.activityFeedContent = new ActivityFeedContent(widgetOptions);
        }
      }
    },
    configProperty: function (name) {
      var props = (this.options.data && this.options.data.workspace &&
                   this.options.data.workspace.properties) || {};
      return props[name];
    },
    resolveProperty: function (name) {
      var ret = '';
      if (this.model.isWorkspaceType()) {
        var prop = this.configProperty(name);
        if (prop === '{business_properties.description}') {
          prop = '{description}'
        }
        if (prop && (prop.length > 0)) {
          var tags = prop.match(/{(.*?)}/g);
          if (tags) {
            var self = this;
            _.each(tags, function (tag) {
              prop = prop.replace(tag, self.format(self.resolveModelValue(tag)).formatted || '');
            });
          }
          ret = prop;
        }
      }
      return ret;
    },
    resolveModelValue: function (name) {
      var ret = {
        name: name,
        value: name,
        metadata: undefined
      };
      if (name.indexOf('{') === 0) {
        var value = this.model.attributes || {};
        var metadata = this.model.metadata && this.model.metadata.properties || {};
        var names = name.substring(1, name.length - 1).split('.');
        var metadataNames = names;
        var section = (names.length > 1) ? names[0] : undefined;
        if (section === 'categories') {
          value = this.model.categories || {};
          metadata = this.model.metadata && this.model.metadata.categories || {};
          var parts = names[1].split('_');
          names = [parts[0], names[1]];
          if (parts.length > 2) {
            parts[2] = 'x';
          }
          metadataNames = [parts[0], parts.join('_')];
        }
        else if (section === 'business_properties') {
          value = this.model.business_properties || {};
          metadata = {};
          names.splice(0, 1);
        }
        _.find(names, function (name) {
          value = value[name];
          if (value === undefined) {
            return true;
          }
        });
        _.find(metadataNames, function (name) {
          metadata = metadata[name];
          if (metadata === undefined) {
            return true;
          }
        });
        if (section === 'categories') {
          if (metadata && metadata.type_name === 'Integer') {
            if (metadata.persona === 'user' || metadata.persona === 'group' ||
                metadata.persona === 'member') {
              this.model.expandMemberValue({name: names[1], value: value, metadata: metadata});
            }
          }
        }
        ret.name = name;
        ret.value = value;
        ret.metadata = metadata;
      }
      return ret;
    },
    format: function (value) {
      var type = value.metadata && value.metadata.type_name;
      switch (type) {
      case 'Date':
        value.formatted = this.formatDate(value.value);
        break;
      case 'Integer':
        var persona = value.metadata.persona;
        switch (persona) {
        case 'user':
        case 'group':
        case 'member':
          var expprop = '{' + value.name.substring(1, value.name.length - 1) + '_expand}';
          var expval = this.resolveModelValue(expprop);
          value.formatted = this.formatMember(expval.value);
          break;
        default:
          value.formatted = this.formatValue(value.value);
          break;
        }
        break;
      default:
        value.formatted = this.formatValue(value.value);
        break;
      }
      return value;
    },

    formatDate: function (value) {
      value = _.isArray(value) ? value : [value];
      return _.map(value, function (element) {
        return base.formatDate(element);
      }).join('; ');
    },

    formatMember: function (value) {
      value = _.isArray(value) ? value : [value];
      var map = _.map(value, function (element) {
        if (!element) {
          return '';
        } else if (element.display_name !== undefined) {
          return element.display_name;
        } else if (element.name_formatted !== undefined) {
          return element.name_formatted;
        } else {
          return base.formatMemberName(element);
        }
      });
      var mapstr = map.join('; ');
      return mapstr;
    },

    formatValue: function (value) {
      value = _.isArray(value) ? value : [value];
      return value.join('; ');
    },
    hasChildView: function () {
      return !this.options.hideActivityFeed && (this.options.data && this.options.data.widget &&
             this.options.data.widget.type && this.options.data.widget.type !== "none");
    },
    getImageInfo: function () {
      var ret;
      var icon = this.model.icon;
      if (icon && icon.location !== 'none') {
        ret = {
          iconContent: icon.content,
          iconLocation: icon.location,
          iconClass: undefined
        };
      }
      else {
        ret = {
          iconContent: this.blankImage,
          iconLocation: 'none',
          iconClass: NodeSpriteCollection.findByNode(this.model).get('className')
        }
      }

      return ret;
    },

    clamp: function (elem, height) {

      var truncChars = '...';
      var splitChars = ['.', ',', ' '];
      var splitChar = null;

      var chunk = null;
      var chunks = null;

      function truncate(textElem) {
        var value = textElem.nodeValue.replace(truncChars, '');
        if (!chunks) {
          splitChar = splitChars.length ? splitChars.shift() : '';
          chunks = value.split(splitChar);
        }
        if (chunks.length > 1) {
          chunk = chunks.pop();
          textElem.nodeValue = chunks.join(splitChar) + truncChars;
        }
        else {
          chunks = null;
        }

        if (chunks) {
          if (elem.clientHeight <= height) {
            if (splitChars.length) {
              textElem.nodeValue = chunks.join(splitChar) + splitChar + chunk;
              chunks = null;
            } else {
              return;
            }
          }
        } else {
          if (!truncChars.length) {
            textElem.nodeValue = truncChars;
            return;
          }
        }
        truncate(textElem);
      }
      if (elem.clientHeight <= height) {
        return;
      }
      truncate(elem.lastChild);
    }
  });
  return HeaderView;
});
