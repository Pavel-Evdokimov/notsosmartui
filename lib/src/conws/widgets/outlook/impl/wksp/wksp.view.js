/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
    'csui/lib/underscore',
    "csui/lib/jquery",
    'csui/lib/backbone',
    'csui/lib/marionette',
    'csui/utils/url',
    'csui/dialogs/modal.alert/modal.alert',
    'csui/utils/nodesprites',
    'hbs!conws/widgets/outlook/impl/wksp/impl/wksp',
    'conws/widgets/outlook/impl/folder/folders.view',
    'conws/widgets/outlook/impl/utils/utility',
    'conws/widgets/outlook/impl/utils/csservice',
    'conws/widgets/outlook/impl/dialog/saveSection.view',
    'conws/widgets/outlook/impl/wksp/impl/wksp.model',
    'i18n!conws/widgets/outlook/impl/nls/lang'
], function (_, $, Backbone, Marionette, Url, ModalAlert, NodeSprites, template, FoldersView, WkspUtil, CSService, SaveView, WkspModel, lang) {

    var WkspView = Marionette.LayoutView.extend({

        className: 'ListItem', 

        template: template,

        templateHelpers: function() {
            return {
                id: this.id,
                name: this.name,
                iconClass: this.getIconClass(),
                typeName: this.typeName,
                toggleStatus: this.hasChild && this.expendable ? WkspUtil.ToggleStatusExpand : WkspUtil.ToggleStatusEmpty,
                openLinkTitle: lang.wksp_open_link
            }
        },

        regions: {
            subFolders: '#subFolders'
        },

        ui: {
            $actionBar: '.wkspFolder-actiondiv',
            $toggleIcon: '#toggleIcon',
            $saveMenuItem: '#wkspSaveMenuItem',
            $saveButton: '#saveEmailButton'
        },

        events: {
            'click .listItemWksp': 'clickWksp',
            'keyup #ListItem': 'keyEnterWksp',    // this event not being triggered. try to figure it out later
            'mouseenter #wkspItem': 'showActionBar',
            'mouseleave #wkspItem': 'hideActionBar',
            'mouseenter #wkspOpenButton': 'assignAccessUrl',
            'click #saveEmailButton': 'saveEmail'
        },

        initialize: function (options) {
            this.listenTo(this.model, 'change', this.renderToggleIcon);
        },

        constructor: function WkspView(options) {
            this.model = options.model;
            var props = options.model.get('data').properties;
            this.name = props.name;
            this.id = props.id;

            this.typeName = props.type_name;
            this.type = props.type;
            this.hasChild = props.container && props.size > 0 && props.type === 848;
            this.connector = WkspUtil.getConnector(); 

            var enableEmailSaving = this.model.get('enableEmailSaving');
            this.expendable = (enableEmailSaving !== undefined ? enableEmailSaving : true) && WkspUtil.emailSavingConfig.allowExpandWorkspace;            
            
            this.folderRetrieved = false;
            this.folderExpended = false;

            var self = this;
            if (enableEmailSaving === undefined || enableEmailSaving){
                this.updateModelForPreConfigFolder(self);
            }

            Marionette.LayoutView.prototype.constructor.call(this, options);
        },

        clickWksp: function(event) {
            var self = this;
            if (!self.expendable){
                return;
            }

            if (!self.expendable || !self.hasChild) {
                return;
            }

            var toToggle = $(event.target).data("id");
            if (toToggle && toToggle === "noToggle") {
                return;
            }

            if (!self.folderRetrieved) {
                var foldersView = new FoldersView({
                    connector: this.connector,
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

        saveEmail: function(event) {
            var self = this;
            var targetId = $(event.currentTarget).data("id");
            if (targetId !== self.id) {
                return;
            }

            if (window.CurrentEmailItem == null) {
                ModalAlert.showWarning(lang.warning_no_outlook_context);
                return;
            }

            var folderId = self.saveFolderId,
                folderName = self.saveFolderName,
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

        },

        keyEnterWksp: function(event) {
            if (event.keyCode === 13 || event.keyCode === 27) {
                this.$(".listItemWkspName").click();
            }
        },

        assignAccessUrl: function(event) {
            var link = this.$('#wkspOpenButton');
            if (link.attr('href') !== 'javascript:;') {
                return;
            }

            var urlObj = new Url(this.connector.connection.url);
            
            link.attr('href', Url.combine(urlObj.getCgiScript(), 'app/nodes', this.id));
        },

        showActionBar: function () {
            var bar = this.ui.$actionBar;
            bar.css("display", "block");
            setTimeout(function () {
                bar.addClass("binf-in");
            }, 300);
        },

        hideActionBar: function () {
            var bar = this.ui.$actionBar;
            bar.css("display", "none");
            bar.removeClass("binf-in");
        },

        renderToggleIcon: function () {
            this.hasChild = this.model.get('hasChild');
            var toggleIcon = this.ui.$toggleIcon;
            if (!this.hasChild || !this.expendable) {
                this.toggleStatus = WkspUtil.ToggleStatusEmpty;
            }

            toggleIcon.attr('class', this.toggleStatus);
        },

        updateModelForPreConfigFolder: function (self) {
            if (!WkspUtil.emailSavingConfig.preConfigFolderToSave.enabled) {
                return;
            }

            var wkspModel = new WkspModel({ id: self.id }, {connector: self.connector});

            var fetchPromise = wkspModel.getPreConfigFolder();
            fetchPromise.done(function (result) {
                var saveMenuItem = self.ui.$saveMenuItem,
                    saveButton = self.ui.$saveButton;
                    
                if (result.hasPreConfigFolder) {
                    self.saveFolderId = result.folderId;
                    self.saveFolderName = result.folderName;
                    saveMenuItem.css("display", "inline-block");
                    saveButton.attr("title", lang.title_save_email_to + result.folderName);
                } else {
                    saveMenuItem.css("display", "none");
                }
            });
        },

        getIconClass: function() {
            var self = this,
                atts = self.model.attributes,
                node = {type: self.type};
            if (atts != null && atts.data != null && atts.data.properties != null) {
                node = atts.data.properties;
            }
            return "icon " + NodeSprites.findClassByNode(node);
        }
    });

    return WkspView;

});