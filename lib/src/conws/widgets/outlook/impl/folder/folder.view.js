/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
    'csui/lib/underscore',
    "csui/lib/jquery",
    'csui/lib/backbone',
    'csui/lib/marionette',
    'csui/utils/contexts/page/page.context',
    'csui/dialogs/modal.alert/modal.alert',

    'conws/widgets/outlook/impl/utils/emailservice',
    'hbs!conws/widgets/outlook/impl/folder/impl/folder',
    'conws/widgets/outlook/impl/utils/utility',
    'conws/widgets/outlook/impl/dialog/saveSection.view',
    'i18n!conws/widgets/outlook/impl/nls/lang', 
    'css!conws/widgets/outlook/impl/conwsoutlook' 

], function (_, $, Backbone, Marionette, PageContext, ModalAlert, EmailService, template, WkspUtil, SaveView, lang) {
    var FolderView = Marionette.LayoutView.extend({
        className: 'FolderItem',

        template: template,

        templateHelpers: function () {
            return {
                serverOrigin: window.ServerOrigin,
                supportFolder: window.ContentServerSupportPath,
                isEmailFolder: this.type === 751 ? true : false,
                isCompoundDocument: this.type === 136 ? true : false,
                isRegularFolder: this.type !== 751 && this.type !== 136 ? true : false,                
                id: this.id,
                name: this.name,
                typeName: this.typeName,
                toggleStatus: this.hasChild ? WkspUtil.ToggleStatusExpand : WkspUtil.ToggleStatusEmpty,
                saveTitle: lang.title_save_email
            }
        },

        regions: {
            subFolders: '#subFolders'
        },

        ui: {
            $actionBar: '.wkspFolder-actiondiv',
            $toggleIcon: '#toggleIcon'
        },

        events: {
            'click .listItemFolder': 'clickFolder',
            'mouseenter #wkspFolderItem': 'showActionBar',
            'mouseleave #wkspFolderItem': 'hideActionBar',
            'click #saveEmailButton': 'saveEmail'
        },

        initialize: function (options) {
            this.listenTo(this.model, 'change', this.renderToggleIcon);
        },

        constructor: function FolderView(options) {
            this.model = options.model;
            this.name = options.model.get('data').properties.name;
            this.id = options.model.get('data').properties.id;
            this.type = options.model.get('data').properties.type;
            this.typeName = options.model.get('data').properties.type_name;
            this.hasChild = options.model.get('data').properties.container_size > 0;
            this.connector = WkspUtil.getConnector();

            this.folderRetrieved = false;
            this.folderExpended = false;

            Marionette.LayoutView.prototype.constructor.call(this, options);
        },

        clickFolder: function (e) {
            var self = this;

            if (!self.hasChild) {
                return;
            }

            var targetId = $(e.target).data("id");

            if (targetId !== self.id || targetId === "noToggle") {
                return;
            }
            var FoldersView = (window.csui) ? window.csui.require('conws/widgets/outlook/impl/folder/folders.view') :
                window.require('conws/widgets/outlook/impl/folder/folders.view');

            if (!self.folderRetrieved) {
                var foldersView = new FoldersView({
                    connector: self.connector,
                    id: self.id,
                    parentNode: self,
                    pageSize: WkspUtil.pageSize,
                    pageNo: 1
                });
                self.getRegion('subFolders').show(foldersView);
            } else if (self.folderExpended) {
                self.getRegion('subFolders').$el.hide();
                self.folderExpended = false;
                self.toggleStatus = WkspUtil.ToggleStatusExpand;
            } else {
                self.getRegion('subFolders').$el.show();
                self.folderExpended = true;
                self.toggleStatus = WkspUtil.ToggleStatusCollapse;
            }

            var toggleIcon = this.ui.$toggleIcon;
            toggleIcon.attr('class', self.toggleStatus);
        },

        renderToggleIcon: function () {
            this.hasChild = this.model.get('hasChild');
            var toggleIcon = this.ui.$toggleIcon;
            if (!this.hasChild) {
                this.toggleStatus = WkspUtil.ToggleStatusEmpty;
            }
            toggleIcon.attr('class', this.toggleStatus);
        },

        showActionBar: function (e) {
            var self = this;
            var targetId = $(e.currentTarget).data("id");
            if (targetId !== self.id) {
                return;
            }

            if (self.type === 0 && WkspUtil.emailSavingConfig.onlySaveToEmailFolder) {
                return;
            }

            var bar = this.ui.$actionBar;
            bar.css("display", "block");
            setTimeout(function () {
                bar.addClass("binf-in");
            }, 300);
        },

        hideActionBar: function (e) {
            var self = this;
            var targetId = $(e.currentTarget).data("id");
            if (targetId !== self.id) {
                return;
            }

            if (self.type === 0 && WkspUtil.emailSavingConfig.onlySaveToEmailFolder) {
                return;
            }

            var bar = this.ui.$actionBar;
            bar.css("display", "none");
            bar.removeClass("binf-in");
        },

        saveEmail: function(e) {
            var self = this;
            var targetId = $(e.currentTarget).data("id");
            if (targetId !== self.id) {
                return;
            }

            if (window.CurrentEmailItem == null) {
                ModalAlert.showWarning(lang.warning_no_outlook_context);
                return;
            }

            var folderId = self.id,
                folderName = self.name,
                connector = self.connector,
                emailItem = window.CurrentEmailItem;
            
            var saveRegion = new Marionette.Region({
                el: '#savePanel'
            });
            var saveEmailView = new SaveView({
                connector: connector, 
                folderId: folderId,
                folderName: folderName,
                proposedEmailName: emailItem.subject,
                attachments: emailItem.attachments
            });
            saveRegion.show(saveEmailView);
        }
    });

    return FolderView;

});