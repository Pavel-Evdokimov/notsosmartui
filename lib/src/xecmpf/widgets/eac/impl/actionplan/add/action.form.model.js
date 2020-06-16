/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

'use strict'

define(['csui/lib/jquery', 'csui/lib/backbone', 'csui/models/form',
    'xecmpf/models/eac/eac.defaultplans.factory', 'xecmpf/models/eac/eac.planproperties.factory',
    'i18n!xecmpf/widgets/eac/impl/nls/lang',
], function ($, Backbone, FormModel, EACDefaultPlansFactory, EACPlanPropertiesFactory, lang) {

    var EACActionFormModel = FormModel.extend({

        constructor: function EACActionFormModel(attributes, options) {
            this.options = options || (options = {});
            attributes || (attributes = {
                data: {},
                schema: {properties: {}},
                options: {fields: {}}
            });
            this.action_key = '';
            if (this.options.actions) {
                this.action_name = this.options.actions.action_name;
                this.action_key = this.options.actions.action_key;
            } else if (attributes && attributes.data && attributes.data.action) {
                this.action_key = attributes.data.action;
            }
            FormModel.prototype.constructor.call(this, attributes, options);
        },

        initialize: function (attributes, options) {
            var promises = [];
            var eacDefaultPlans = options.context.getCollection(EACDefaultPlansFactory);
            var namespace;
            var event_name;
            if (options.eventModel.get) {
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

            if (!eacDefaultPlans.fetched) {
                promises.push(eacDefaultPlans.fetch());
            }

            if (!eacPlanProperties.planProperties) {
                promises.push(eacPlanProperties.fetch());
            }

            $.when.apply($, promises).done(function () {
                eacPlanProperties.planProperties = eacPlanProperties.map(function (model) {
                    return model.get('name');
                });

                if (attributes && attributes.data && attributes.data.action) {
                    this.set(attributes);
                } else {
                    this._setAttributes(eacDefaultPlans, eacPlanProperties.planProperties);
                }
            }.bind(this));
        },

        _setAttributes: function (eacDefaultPlans, planProperties) {
            var that = this;
            var attributes = {
                data: {
                    action: that.action_key
                },
                schema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            required: true
                        }
                    }
                },
                options: {
                    fields: {
                        action: {
                            type: 'select',
                            events: {
                                change: function () {
                                    that.setValue(this.path, this.getValue());
                                }
                            }
                        }
                    }
                }
            };

            var actionFieldEnum = [], actionFieldLabels = [];
            var actions = '', attributeMappings = '';
            if (this.options.actions) {
                actions = this.options.actions;
                attributeMappings = this.options.actions.attribute_mappings;
            }
            for (var k = 0; k < eacDefaultPlans.models.length; k++) {
                var key = eacDefaultPlans.models[k].get('action_key');
                actionFieldEnum.push(key);
                actionFieldLabels.push(eacDefaultPlans.models[k].get('action_name'));

                if (eacDefaultPlans.models[k].get('actions_attributes').length > 0) {
                    var schema = attributes.schema;
                    schema.properties[key + '_fields'] = {properties: {}, dependencies: "action"};
                    var properties = schema.properties[key + '_fields'].properties;

                    var options = attributes.options;
                    options.fields[key + '_fields'] = {fields: {}, dependencies: {action: key}};
                    var fields = options.fields[key + '_fields'].fields;

                    var data = attributes.data[key + '_fields'] = {};

                    for (var i = 0; i < eacDefaultPlans.models[k].get('actions_attributes').length; i++) {
                        var fieldKey = eacDefaultPlans.models[k].attributes.actions_attributes[i].key;//key + '_fields_' + i;
                        var source = '', propVal = '',
                                resultsfromprev = 'Result from previous action';
                        if (this.options.actions) {
                            if (i <= this.options.actions.attribute_mappings.length - 1) {
                                source = this.options.actions.attribute_mappings[i].mapping_method;
                                propVal = this.options.actions.attribute_mappings[i].mapping_data;
                            }
                        }
                        if (source === 'Content Server Object') {
                            source = "csObj";
                        } else if (source === 'Event Property') {
                            source = "evtProp";
                        } else if (source === 'Result from previous Action') {
                            source = "prevAct";
                        }

                        properties[fieldKey] = {
                            properties: {
                                source: {
                                    type: "string",
                                    enum: ["csObj", "evtProp", "prevAct"]
                                },
                                properties_label: {
                                    dependencies: "source",
                                    type: "string",
                                    readonly: true
                                },
                                csObj_field: {
                                    dependencies: "source",
                                    type: "string",
                                    required: true
                                },
                                evtProp_field: {
                                    dependencies: "source",
                                    type: "string",
                                    required: true,
                                    enum: planProperties
                                },
                                prevAct_field: {
                                    dependencies: "source",
                                    type: "string",
                                    required: true,
                                    readonly: true
                                }
                            }
                        };

                        fields[fieldKey] = {
                            fields: {
                                source: {
                                    type: "select",
                                    label: lang.sourceLabel,
                                    optionLabels: [lang.csObjLabel, lang.evtPropLabel, lang.prevActLabel]
                                },
                                properties_label: {
                                    label: eacDefaultPlans.models[k].get('actions_attributes')[i].name,
                                    type: "text",
                                    dependencies: {
                                        source: ""
                                    }
                                },
                                csObj_field: {
                                    type: "otcs_node_picker",
                                    label: eacDefaultPlans.models[k].get('actions_attributes')[i].name,
                                    type_control: {
                                        parameters: {
                                            startLocations: [
                                                "csui/dialogs/node.picker/start.locations/current.location",
                                                "csui/dialogs/node.picker/start.locations/enterprise.volume",
                                                "csui/dialogs/node.picker/start.locations/personal.volume",
                                                "csui/dialogs/node.picker/start.locations/favorites",
                                                "csui/dialogs/node.picker/start.locations/recent.containers",
                                                "csui/dialogs/node.picker/start.locations/category.volume",
                                                "csui/dialogs/node.picker/start.locations/perspective.assets.volume",
                                                "recman/dialogs/node.picker/start.locations/classifications.volume"
                                            ]
                                        }
                                    },

                                    dependencies: {
                                        source: "csObj"
                                    }
                                },
                                evtProp_field: {
                                    type: "select",
                                    label: eacDefaultPlans.models[k].get('actions_attributes')[i].name,
                                    dependencies: {
                                        source: "evtProp"
                                    }
                                },
                                prevAct_field: {
                                    label: eacDefaultPlans.models[k].get('actions_attributes')[i].name,
                                    type: "text",
                                    dependencies: {
                                        source: "prevAct"
                                    }
                                }
                            }
                        };

                        data[fieldKey] = {
                            source: source,
                            properties_label: " ",
                            csObj_field: propVal,
                            evtProp_field: propVal,
                            prevAct_field: resultsfromprev
                        };
                    }
                }
            }
            attributes.schema.properties['action'].enum = actionFieldEnum;
            attributes.options.fields['action'].optionLabels = actionFieldLabels;

            this.set(attributes);
        }

    });

    return EACActionFormModel;
});