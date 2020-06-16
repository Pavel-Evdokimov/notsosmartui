/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

'use strict'

define(['csui/lib/underscore', 'csui/models/form',
    'xecmpf/models/eac/eac.planproperties.factory',
    'i18n!xecmpf/widgets/eac/impl/nls/lang'
], function (_, FormModel, EACPlanPropertiesFactory, lang) {

    var EACRuleFormModel = FormModel.extend({

        constructor: function EACRuleFormModel(attributes, options) {
            this.options = options || (options = {});
            attributes || (attributes = {
                data: {},
                schema: {properties: {}},
                options: {fields: {}}
            });
            this.conjunction = '';
            this.operand = '';
            this.operator = '';
            this.position = '';
            this.value = '';
            if (this.options.rules) {
                this.conjunction = this.options.rules.conjunction;
                this.operand = this.options.rules.operand;
                this.operator = this.options.rules.operator;
                this.position = this.options.rules.position;
                this.value = this.options.rules.value;
            }

            FormModel.prototype.constructor.call(this, attributes, options);
        },

        initialize: function (attributes, options) {
            if (_.isEmpty(attributes.data)) {
                var namespace;
              var event_name;
              if(options.eventModel.get){
                namespace = options.eventModel.get('namespace');
                event_name = options.eventModel.get('event_name');
              } else {
                namespace = options.eventModel.attributes.namespace;
                event_name = options.eventModel.attributes.event_name;
              }

                var eacPlanProperties = options.context.getCollection(EACPlanPropertiesFactory, {
                    eventModel: options.eventModel,
                    attributes: {
                        namespace: namespace,
                        event_name: event_name
                    }
                });

                if (!eacPlanProperties.planProperties) {
                    this.listenToOnce(eacPlanProperties, 'sync', function () {
                        eacPlanProperties.planProperties = eacPlanProperties.map(function (model) {
                            return model.get('name');
                        });
                        this._setAttributes(eacPlanProperties.planProperties);
                    });
                    eacPlanProperties.fetch();
                } else {
                    this._setAttributes(eacPlanProperties.planProperties);
                }
            }
        },

        _setAttributes: function (planProperties) {
            var that = this;

            this.set({
                data: {
                    from: this.operand,
                    operator: this.operator,
                    to: this.value,
                    conjunction: this.conjunction
                },
                schema: {
                    properties: {
                        from: {
                            enum: planProperties,
                            required: true,
                            type: "string"
                        },
                        operator: {
                            enum: ['Equal to', 'Not equal to'],
                            required: true,
                            type: "string"
                        },
                        to: {
                            minLength: 1,
                            maxLength: 248,
                            required: true,
                            type: "string"

                        },
                        conjunction: {
                            enum: ['And', 'Or'],
                            required: false,
                            type: "string"
                        }
                    }
                },
                options: {
                    fields: {
                        from: {
                            label: "",
                            type: "select",
                            events: {
                                change: function () {
                                    that.setValue(this.path, this.getValue());
                                }
                            }
                        },
                        operator: {
                            label: "",
                            type: "select",
                            optionLabels: [lang.operatorEqualtoLabel, lang.operatorNotequaltoLabel],
                            events: {
                                change: function () {
                                    that.setValue(this.path, this.getValue());
                                }
                            }
                        },
                        to: {
                            label: "",
                            type: "text",
                            events: {
                                change: function () {
                                    setTimeout(function () {
                                        that.setValue(this.path, this.getValue());
                                    }.bind(this), 0);
                                }
                            }
                        },
                        conjunction: {
                            label: "",
                            type: "select",
                            optionLabels:  [lang.conjunctionAndLabel, lang.conjunctionOrLabel],
                            events: {
                                change: function (e) {
                                    that.setValue(this.path, this.getValue());
                                    if (that.options.selectCallback && typeof that.options.selectCallback === 'function') {
                                        that.options.selectCallback(e, that);
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    });

    return EACRuleFormModel;
});