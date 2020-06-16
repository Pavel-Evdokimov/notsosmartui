/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
  'require', 'csui/lib/underscore', 'csui/utils/log',
  'csui/utils/authenticators/ticket.authenticator'
], function (require, _, log, TicketAuthenticator) {
  'use strict';
  var RedirectingFormAuthenticator = TicketAuthenticator.extend({
    constructor: function RedirectingFormAuthenticator(options) {
      TicketAuthenticator.prototype.constructor.call(this, options);
    },

    authenticate: function (options, succeeded, failed) {
      if (typeof options === 'function') {
        failed = succeeded;
        succeeded = options;
        options = undefined;
      }

      TicketAuthenticator.prototype.authenticate.call(this, options,
          succeeded, _.bind(this.initiateLoginSequence, this, succeeded));
    },

    initiateLoginSequence: function (succeeded) {
      var self = this;
      var timer, dialog, urlOrigin;

      function createIFrame() {
        require(['csui/lib/marionette', 'csui/controls/dialog/dialog.view', 'csui/utils/url'],
            function (Marionette, DialogView, Url) {
              var reauthPage = new Url(self.connection.url).getCgiScript() + '?func=csui.ticket';
              urlOrigin = new Url(self.connection.url).getOrigin();

              var iFrame = '<iframe width="100%" height="100%" src="' + reauthPage + '"></iframe>';
              var view = new Marionette.View({
                el: iFrame
              });

              dialog = new DialogView({
                standardHeader: false,
                view: view,
                fullSize: true
              });
              dialog.show();
              dialog.$el.addClass('binf-hidden');
              setDialogStyling();
            });
      }

      function removeIFrame() {
        self.reauthenticating = false;
        resumeBlockingView();
        dialog && dialog.destroy();
        dialog = undefined;
      }

      function suppressBlockingView() {
        require(['csui/controls/progressblocker/blocker'],
            function (BlockingView) {
              BlockingView.suppressAll();
            });
      }

      function resumeBlockingView() {
        require(['csui/controls/progressblocker/blocker'],
            function (BlockingView) {
              BlockingView.resumeAll();
            });
      }

      function setDialogStyling() {
        dialog.$el.css({'z-index': '1061'});  // higher than popover
        dialog.$el.find('.binf-modal-content').css({'width': '100%', 'height': '100%'});
        dialog.$el.find('.binf-modal-body').css({'width': '100%', 'height': '100%'});
        dialog.$el.find('.binf-modal-header').addClass('binf-hidden');
      }

      function receiveMessage(event) {
        if (event.origin !== urlOrigin) {
          return;
        }
        if (event.data.ticket) {
          log.debug('Redirecting Form Authenticator received new ticket.') && console.log(log.last);
          window.removeEventListener('message', receiveMessage, false);
          timer && clearTimeout(timer);
          timer = undefined;
          removeIFrame();
          var session = self.connection.session || (self.connection.session = {});
          session.ticket = event.data.ticket;
          succeeded && succeeded(self.connection);
        }
      }

      if (!this.reauthenticating) {
        this.reauthenticating = true;
        window.addEventListener('message', receiveMessage, false);
        createIFrame();
        timer = setTimeout(function () {
          if (dialog) {
            dialog.$el.removeClass('binf-hidden');
            setDialogStyling();
            suppressBlockingView();
          }
        }, 3000);
      }
    }
  });

  return RedirectingFormAuthenticator;
});
