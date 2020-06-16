/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
  'csui-ext!csui/utils/dragndrop.supported.subtypes'
], function (_, ExtraDragNDropSupportedSubTypes) {
  'use strict';
  var DragNDropSupportedSubTypes = [
    0, 202, 751, 30205, 144
  ];

  if (ExtraDragNDropSupportedSubTypes) {
    DragNDropSupportedSubTypes.concat(ExtraDragNDropSupportedSubTypes);
  }

  return DragNDropSupportedSubTypes;

});
