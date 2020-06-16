/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['module',
    'csui/lib/jquery',
    'conws/widgets/outlook/impl/utils/utility',
    'i18n!conws/widgets/outlook/impl/nls/lang'
], function EmailSerivce(module, $, WkspUtil, lang) {

        return {

            constants : {
                cs_config_missing: lang.config_CS_missing,
                retrieve_email_error: lang.error_retrieve_email
            },

            getCurrentMailboxItem: getCurrentMailboxItem
    };

        function getCurrentMailboxItem() {
            var deferred = $.Deferred();

            try {
                var currentEmail = window.Office.cast.item.toItemRead(window.Office.context.mailbox.item);
                var currentUser = window.Office.context.mailbox.userProfile.emailAddress;
                deferred.resolve({
                    currentEmail: currentEmail,
                    currentUser: currentUser
                });
            } catch (error) {
                deferred.reject(error);
            }

            return deferred.promise();
        }

    }
);
