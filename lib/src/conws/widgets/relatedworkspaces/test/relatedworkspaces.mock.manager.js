/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/jquery.mockjax',
  'csui/utils/log'
], function (_, $, mockjax, log) {

  var doLog = false;
  var logConsole = function (logobj) {
    doLog && log.info(logobj) && console.log(log.last);
  };

  var logResponse = function (response) {
    if (doLog) {
      log.info("adding response to mockjax:") && console.log(log.last);
      var items = response.results;
      for (var ii = 0; ii < items.length; ii++) {
        log.info(items[ii].data.properties.name) && console.log(log.last);
      }
    }
  };

  var serverUrl = '//server/otcs/cs/api/v2';
  var baseUrl = serverUrl + '/businessworkspaces/120/relateditems';

  var alberi = {
    id: 120,
    name: "Alberi",
    type: 848
  };

  var filterForPageSize = function (index, pageSize) {
    var filter = ( ((index) % (Math.floor((pageSize * 3) / 4)) === 0) ? "" : " filter" );
    return filter;
  };

  mockjax({
    url: '//server/otcs/cs/api/v2/nodes/120',
    responseText: alberi
  });

  mockjax({
    url: serverUrl + '/nodes/120',
    responseText: alberi
  });


  mockjax({
    url: '//server/otcs/cs/api/v2/nodes/120?actions',
    responseText: {}
  });

  mockjax({
    url: '//server/otcs/cs/api/v2/nodes?actions',
    responseText: {}
  });

  mockjax({
    url: '//server/otcs/cs/api/v1/nodes/120/businessworkspace',
    responseText: {}
  });

  var dataCustomColumns = {
    "custom_123_1": "Europa ",
    "custom_123_2": ".4",
    "custom_124_1": "High Tech "
  };

  var dataCustomFormats = {
    "custom_123_1": "{0}{1}",
    "custom_123_2": "{1}{0}",
    "custom_124_1": "{0}{1}"
  };

  var metadataCustomColumns = {
        "custom_124_1": {
          "align": "center",
          "name": "Rating",
          "sort": true,
          "type": -1,
          "width_weight": 1
        },
        "custom_123_2": {
          "align": "left",
          "name": "Price",
          "sort": true,
          "type": -1,
          "width_weight": 1
        },
        "custom_123_1": {
          "align": "left",
          "name": "Area",
          "sort": true,
          "type": -1,
          "width_weight": 1
        }
      },
      metadataNode          = {
        "size": {
          "align": "right",
          "name": "Size",
          "persona": "",
          "sort": false,
          "type": 2,
          "width_weight": 0
        },
        "favorite": {
          "align": "center",
          "name": "Favorite",
          "persona": "",
          "type": 5,
          "width_weight": 0
        },
        "id": {
          "align": "right",
          "name": "ID",
          "persona": "node",
          "sort": false,
          "type": 2,
          "width_weight": 0
        },
        "modify_date": {
          "align": "left",
          "name": "Modified",
          "persona": "",
          "sort": false,
          "type": -7,
          "width_weight": 0
        },
        wnd_modifiedby: {
          align: "center",
          name: "Modified By",
          persona: "user",
          sort: false,
          type: 2,
          width_weight: 0
        },
        "name": {
          "align": "left",
          "name": "Name",
          "persona": "",
          "sort": true,
          "type": -1,
          "width_weight": 100
        },
        "type": {
          "align": "center",
          "name": "Type",
          "persona": "",
          "sort": false,
          "type": 2,
          "width_weight": 0
        }
      },
      DataManager           = function DataManager() {
      };

  var fixedDate = "2015-04-17T15:37:43";

  DataManager.fixedDate = fixedDate;

  DataManager.test = function (totalCount, title, workspaceTypeId, addCustomColumns) {
    DataManager._prepare(totalCount, title, workspaceTypeId, addCustomColumns);
  };
  DataManager._prepare = function (totalCount, title, workspaceTypeId, addCustomColumns) {
    var sorting  = ["asc_name", "desc_name"],
        pageSize = 30,
        pages    = Math.floor(totalCount / pageSize);
    if (totalCount % pageSize > 0) {
      pages++;
    }
    var filter = 'filter';

    DataManager._provideMockjax(totalCount, title, workspaceTypeId, addCustomColumns, sorting,
        pageSize, pages, filter);

  };

  DataManager._provideMockjax = function (totalCount, title, workspaceTypeId, addCustomColumns,
      sorting, pageSize, pages, filter) {

    var relation = ["child", "parent"];

    var elements = DataManager._createElements(workspaceTypeId, title, totalCount, pageSize,
        undefined, true, filter);
    var urlsRel;
    if (workspaceTypeId) {
      urlsRel = [
        baseUrl + '?where_workspace_type_id=' + workspaceTypeId +
        '&where_relationtype=child&metadata',
        baseUrl + '?where_workspace_type_id=' + workspaceTypeId +
        '&where_relationtype=parent&metadata'
      ];
    } else {
      urlsRel = [
        baseUrl + '?limit=' + pageSize + '&page=1&sort=asc_name&metadata'
      ];
    }
    var responseTextRel = DataManager._getPage(elements, 0, totalCount);
    logResponse(responseTextRel);
    urlsRel.forEach(function (url) {
      logConsole("adding url to mockjax: " + url);
      mockjax({
        url: url,
        responseTime: 0,
        responseText: responseTextRel
      });
    });

    sorting.forEach(function (sort) {
      elements = DataManager._createElements(workspaceTypeId, title, totalCount, pageSize, sort,
          addCustomColumns, filter);
      for (var i = 0; i <= pages; i++) {
        var limit      = pageSize,
            page       = i + 1,
            idFrom     = pageSize * i,
            idTo       = pageSize * i + pageSize,
            filterPart = '';
        idTo = idTo > totalCount ? totalCount : idTo;

        if (filter) {
          filterPart = '&where_name=contains_' + filter;
        }

        var fieldsParams = [
          '?fields=' +
          encodeURIComponent('properties{id,container,name,type,custom_123_1,custom_123_2,wnd_modifiedby,modify_date}') +
          '&action=properties-properties',
          '?fields=' +
          encodeURIComponent('properties{id,container,name,type,custom_123_1,custom_123_2,custom_124_1}') +
          '&action=properties-properties',
          '?fields=' +
          encodeURIComponent('properties{id,container,name,type}') +
          '&action=properties-properties',
          '?fields=' +
          encodeURIComponent('properties{custom_124_1,custom_123_2,custom_123_1,type,name,size,modify_date,favorite,id,container}') +
          '&action=properties-properties',
          '?fields=' +
          encodeURIComponent('properties{type,name,size,modify_date,favorite,id,container}') +
          '&action=properties-properties'];

        relation.forEach(function (relType) {
          var urls = [];
          fieldsParams.forEach(function (fieldParams) {
            urls.push(baseUrl + fieldParams + '&where_workspace_type_id=' + workspaceTypeId +
                      '&where_relationtype=' + relType + '&limit=' + limit + '&page=' + page +
                      '&sort=' + sort + '&expand_users=true&metadata');
            urls.push(baseUrl + fieldParams + '&where_workspace_type_id=' + workspaceTypeId +
                      '&where_relationtype=' + relType + '&sort=' + sort +
                      '&expand_users=true&limit=' + limit +
                      '&page=' + page + '&metadata');
            urls.push(baseUrl + fieldParams + '&where_workspace_type_id=' + workspaceTypeId +
                      '&where_relationtype=' + relType + '&expand_users=true&limit=' + limit +
                      '&page=' + page + '&sort=' + sort + '&metadata');
            urls.push(baseUrl + fieldParams + '&where_workspace_type_id=' + workspaceTypeId +
                      '&limit=' + limit + '&page=' + page + '&expand_users=true&metadata' +
                      '&where_relationtype=' + relType);
            urls.push(baseUrl + fieldParams + '&where_workspace_type_id=' + workspaceTypeId +
                      '&limit=' + limit + '&page=' + page + '&sort=' + sort +
                      '&expand_users=true&metadata' +
                      '&where_relationtype=' + relType);
            urls.push(baseUrl + fieldParams + '&where_workspace_type_id=' + workspaceTypeId +
                      '&sort=' + sort + '&expand_users=true&limit=' + limit + '&page=' + page +
                      '&metadata' +
                      '&where_relationtype=' + relType);
          });
          var responseText = DataManager._getPage(elements, idFrom, idTo);
          logResponse(responseText);
          urls.forEach(function (url) {
            logConsole("adding url to mockjax: " + url);
            mockjax({
              url: url,
              responseTime: 0,
              responseText: responseText
            });
          });

          urls = [];
          fieldsParams.forEach(function (fieldParams) {
            urls.push(baseUrl + fieldParams + '&where_workspace_type_id=' + workspaceTypeId +
                      '&where_relationtype=' + relType + '&limit=' + limit + '&page=' + page +
                      '&sort=' + sort + '&expand_users=true' + filterPart + '&metadata');
            urls.push(baseUrl + fieldParams + '&where_workspace_type_id=' + workspaceTypeId +
                      '&where_relationtype=' + relType + '&sort=' + sort +
                      '&expand_users=true&limit=' + limit +
                      '&page=' + page + filterPart + '&metadata');
            urls.push(baseUrl + fieldParams + '&where_workspace_type_id=' + workspaceTypeId +
                      '&where_relationtype=' + relType + '&expand_users=true&limit=' + limit +
                      '&page=' + page + '&sort=' + sort + filterPart + '&metadata');
            urls.push(baseUrl + fieldParams + '&where_workspace_type_id=' + workspaceTypeId +
                      '&limit=' + limit + '&page=' + page + '&sort=' + sort +
                      '&expand_users=true&metadata' +
                      '&where_relationtype=' + relType + filterPart);
          });
          responseText = DataManager._getPage(elements, idFrom, idTo, true);
          logResponse(responseText);
          urls.forEach(function (url) {
            logConsole("adding url to mockjax: " + url);
            mockjax({
              url: url,
              responseTime: 0,
              responseText: responseText
            });
          });
        });
      }
    });
    mockjax({
      url: new RegExp('^//server/otcs/cs/api/v2/members/favorites(\\?.*)?'),
      responseTime: 0,
      responseText: {
        results: []
      }
    });
  };

  DataManager._createElements = function (workspaceTypeId, name, totalCount, pageSize, sorting,
      addCustomColumns) {

    var splitByNumbers       = function (text) {
      var nextmatch,
          rest   = text,
          parts  = [],
          intreg = /[+-]?[0-9]+/;
      while (rest.length > 0) {
        nextmatch = rest.match(intreg);
        if (!nextmatch || (nextmatch.index === 0 && nextmatch[0].length === 0)) {
          parts.push(rest);
          rest = "";
        } else {
          if (nextmatch.index > 0) {
            parts.push(rest.substring(0, nextmatch.index));
            rest = rest.substring(nextmatch.index)
          }
          if (nextmatch[0].length > 0) {
            parts.push(nextmatch[0]);
            rest = rest.substring(nextmatch[0].length)
          }
        }
      }
      return parts;
    }, compareArrays         = function (a, b) {
      var aval, bval;
      for (var i = 0; i < a.length && i < b.length; i++) {
        aval = parseInt(a[i], 10);
        bval = parseInt(b[i], 10);
        if (isNaN(aval) || isNaN(bval)) {
          aval = a[i];
          bval = b[i];
        }
        if (aval < bval) {
          return -1;
        }
        if (aval > bval) {
          return 1;
        }
      }
      if (a.length < b.length) {
        return -1;
      }
      if (a.length > b.length) {
        return 1;
      }
      return 0;
    }, compareWorkspacesDesc = function (a, b) {
      return compareArrays(splitByNumbers(b.data.properties.name),
          splitByNumbers(a.data.properties.name));
    }, compareWorkspacesAsc  = function (a, b) {
      return compareArrays(splitByNumbers(a.data.properties.name),
          splitByNumbers(b.data.properties.name));
    };

    var properties = [];
    var i;

    for (i = 0; i < totalCount; i++) {
      var data = {data: {}};
      data.data.properties = {
        size: i % 12,
        favorite: (i % 7 === 0 ),
        id: i + 1,
        modify_date: fixedDate,
        name: name + (i + 1) + filterForPageSize(i + 1, pageSize),
        type: 848,
        wnd_modifiedby: 1000,
        wnd_modifiedby_expand: {
          name: "Admin",
          type_name: "User"
        }
      };

      properties.push(data);

      if (addCustomColumns) {
        _.extend(properties[properties.length - 1].data.properties, {
          "custom_123_1": dataCustomColumns["custom_123_1"] + (i + 1),
          "custom_123_2": (i + 1) + dataCustomColumns["custom_123_2"],
          "custom_124_1": dataCustomColumns["custom_124_1"] + (i + 1)
        });
      }
    }
    if (sorting && sorting.indexOf("desc") > -1) {
      properties.sort(compareWorkspacesDesc);
    } else if (sorting && sorting.indexOf("asc") > -1) {
      properties.sort(compareWorkspacesAsc);
    }

    var response = {
      results: properties,
      paging: {
        total_count: totalCount,
        actions: {next: {}}
      },
      wksp_info: {},
      meta_data: {
        properties: metadataNode
      }
    };

    if (addCustomColumns) {
      _.extend(response.meta_data.properties, metadataCustomColumns);
    }

    var icon = null;
    if (workspaceTypeId < 3) {
      icon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjU1MS4wNjJweCIgaGVpZ2h0PSI1NTEuMDYycHgiIHZpZXdCb3g9IjAgMCA1NTEuMDYyIDU1MS4wNjIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDU1MS4wNjIgNTUxLjA2MjsiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPHBhdGggZD0iTTQ2NS4xOSw0NTMuNDU5YzE0Ljc0OSw2Ny42ODgtNTguNzUyLDgyLjM3NS05MS4xMjcsNzMuNTYycy05OC40MS0xMC4yODEtOTguNDEtMTAuMjgxcy02Ni4yMTgsMS40NjktOTguNTkzLDEwLjI4MQ0KCQljLTMyLjM3NSw4Ljg3NC0xMDUuOTM3LTUuODc1LTkxLjI0OS03My41NjJzNzkuNDM4LTY0Ljc1LDk3LjE4Ni0xNTUuOTk5YzE3LjY4Ny05MS4yNDksOTIuNzE4LTg1LjM3NCw5Mi43MTgtODUuMzc0DQoJCXM3NC44NDctNS44NzUsOTIuNTM1LDg1LjM3NEMzODUuODc1LDM4OC43MDksNDUwLjUwMiwzODUuNzcxLDQ2NS4xOSw0NTMuNDU5eiBNMzQzLjU4NiwyMDYuMTUNCgkJYzM5Ljg0MSwxMS41MDUsODMuODQ0LTE5Ljk1MSw5OC4zNDktNzAuMjU4YzE0LjUwNC01MC4yNDUtNS45OTgtMTAwLjMwNy00NS44MzktMTExLjgxMg0KCQljLTM5Ljg0Mi0xMS41MDYtODMuODQ0LDE5Ljk1MS05OC4zNDksNzAuMjU4QzI4My4yNDMsMTQ0LjU4MywzMDMuNzQ1LDE5NC42NDUsMzQzLjU4NiwyMDYuMTV6IE01MDguNzAzLDE4Ny44NTINCgkJYy0zOC4zNzItMTUuNjY4LTg1LjQ5NiwxMC44OTQtMTA1LjI2NCw1OS4zNjNjLTE5Ljc2OCw0OC40NzEtNC43MTIsMTAwLjQzLDMzLjY2LDExNi4wMzUNCgkJYzM4LjM3MiwxNS42MDYsODUuNDk2LTEwLjg5NCwxMDUuMjY0LTU5LjM2NEM1NjIuMTMxLDI1NS40MTYsNTQ3LjA3NiwyMDMuNTE5LDUwOC43MDMsMTg3Ljg1MnogTTIwNy40MTYsMjA2LjE1DQoJCWMzOS44NDEtMTEuNTA2LDYwLjM0My02MS41NjcsNDUuODM5LTExMS44MTJzLTU4LjU2OC04MS43MDItOTguMzQ5LTcwLjE5NmMtMzkuNzgsMTEuNTA1LTYwLjM0Myw2MS41NjYtNDUuODM5LDExMS44MTINCgkJQzEyMy41NzIsMTg2LjE5OSwxNjcuNTc1LDIxNy42NTUsMjA3LjQxNiwyMDYuMTV6IE0xMTMuOTYzLDM2My4yNWMzOC4zNzMtMTUuNjY3LDUzLjQyOC02Ny42MjYsMzMuNjYtMTE2LjAzNQ0KCQlzLTY2Ljg5Mi03NS4wMzEtMTA1LjI2NC01OS4zNjNDMy45ODcsMjAzLjUxOS0xMS4wNjgsMjU1LjQ3OCw4LjcsMzAzLjg4NkMyOC40NjcsMzUyLjM1Niw3NS41OTEsMzc4LjkxNywxMTMuOTYzLDM2My4yNXoiLz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K';
    }
    response.wksp_info.wksp_type_icon = icon;
    return response;
  };

  DataManager._getPage = function (elements, idFrom, idTo, filtered) {

    var properties = elements.results;
    if (filtered) {
      var filtered_items = [];
      for (var ii = 0; ii < properties.length; ii++) {
        if (properties[ii].data.properties.name.indexOf("filter") >= 0) {
          filtered_items.push(properties[ii]);
        }
      }
      properties = filtered_items;
    }

    var response = {
      results: properties.slice(idFrom, idTo),
      paging: {
        total_count: elements.paging.total_count,
        actions: {next: {}}
      },
      wksp_info: {},
      meta_data: {
        properties: metadataNode
      }
    };

    if (elements.wksp_info.wksp_type_icon !== undefined) {
      response.wksp_info.wksp_type_icon = elements.wksp_info.wksp_type_icon;
    }

    return response;
  };

  DataManager.dataCustomColumns = dataCustomColumns;
  DataManager.dataCustomFormats = dataCustomFormats;

  return DataManager;
})
;
