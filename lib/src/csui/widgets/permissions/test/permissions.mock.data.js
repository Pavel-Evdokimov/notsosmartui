/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define(['require', 'csui/lib/underscore', 'csui/lib/jquery','json!./permissions.data.json' ,'csui/lib/jquery.mockjax'
], function (require, _, $, mockdata, mockjax) {

  _.extend($.mockjaxSettings, {
    responseTime: 0,
    headers: {}
  });

  var enterpriseVolume = {
    "id": 2000,
    "name": "Enterprise",
    "type": 141
  };
  var personalVolume = {
    "id": 2004,
    "name": "Personal",
    "type": 142
  };
  var categoriesVolume = {
    "id": 2006,
    "name": "Categories",
    "type": 133
  };

  return {

    enable: function () {

      mockjax({
        url: '//server/otcs/cs/api/v1/members/1000/photo',
        responseTime: 5,
        type: 'GET',
        response: function (settings) {
          this.status = 404;
        }
      });

      mockjax({
        url: '//server/otcs/cs/api/v1/contentauth?id=109661',
        responseTime: 5,
        type: 'GET',
        response: function (settings) {
          this.status = 200;
          this.responseText =
          {"token": "1000\/182623\/158049\/15589\/7f6f59393680830f4a04677d617abae15a9ae3c3"};
        }
      });

      mockjax({
        url: new RegExp('/api/v1/contentauth?id=(\d{5})'),
        responseTime: 5,
        type: 'GET',
        response: function (settings) {
          this.status = 200;
          this.responseText = mockdata.id;
        }
      });

      mockjax({
        url: new RegExp('^//server/otcs/cs/api/v2/nodes/(.*)\/permissions\/effective\/1000'),
        responseTime: 5,
        type: 'GET',
        response: function (settings) {
          this.status = 200;
          this.responseText =
          {
            "results": {
              "data": {
                "permissions": {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 1000,
                  "type": null
                }
              }
            }
          };

        }
      });

      mockjax({
        url: '//server/otcs/cs/api/v2/nodes/11111/permissions/effective/1500',
        responseTime: 5,
        type: 'GET',
        response: function (settings) {
          this.status = 200;
          this.responseText =
          {
            "results": {
              "data": {
                "permissions": {
                  "permissions": mockdata.permissions.readOnly,
                  "right_id": 1000,
                  "type": null
                }
              }
            }
          };
        }
      });

      mockjax({
        url: new RegExp('^//server/otcs/cs/api/v2/nodes/(\d{5})/permissions/owner'),
        responseTime: 0,
        type: 'PUT',
        responseText: mockdata.owner
      });

      mockjax({
        url: '//server/otcs/cs/api/v2/nodes/44444*',
        responseTime: 0,
        type: 'DELETE',
        responseText: {}
      });

      mockjax({
        url: new RegExp('/api/v2/nodes/44444?fields=properties{name}(\\?.*)?'),
        responseText: {
          "results": {
            "data": {
              "permissions": [{
                "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 1000,
                  "right_id_expand": mockdata.properties.Admin,
                "type": "owner"
              }, {
                "permissions": mockdata.permissions.fullPermissions,
                "right_id": 1001,
                "right_id_expand": mockdata.properties.DefaultGroup,
                "type": "group"
              }, {
                "permissions": mockdata.permissions.readOnly,
                "right_id": null,
                "type": "public"
              }, {
                "permissions": mockdata.permissions.fullPermissions,
                "right_id": 24085,
                "right_id_expand": mockdata.properties.TestPermissionGroup1,
                "type": "custom"
              }, {
                "permissions": mockdata.permissions.fullPermissions,
                "right_id": 19915,
                "right_id_expand": mockdata.properties.TestUser1,
                "type": "custom"
              }],
              "properties": {
                "name": "AllPermissions.JPG"
              }
            }
          }
        }
      });
      mockjax({
        url: new RegExp('//server/otcs/cs/api/v1/members/(.+)$'),
        responseTime: 0,
        responseText: ''
      });
      mockjax({
        url: new RegExp('//server/otcs/cs/api/v2/nodes/11111\\?expand=(.*)$'),
        responseTime: 0,
        responseText: {
          "results": {
            "actions": mockdata.actions,
            "data": {
              "properties": mockdata.properties.Document
            }
          }
        }
      });

      mockjax({
        url: '//server/otcs/cs/api/v2/members?limit=5&where_type=0&' +
             encodeURIComponent('expand=properties{group_id,leader_id}') + '&query=u',
        responseTime: 0,
        type: 'GET',
        responseText: {
          "results": [
            {
              "data": {
                "properties": mockdata.properties.user
              }
            }
          ]
        }
      });

      mockjax({

        url: '//server/otcs/cs/api/v2/members?limit=5&where_type=1&' +
             encodeURIComponent('expand=properties{group_id,leader_id}') + '&query=b',
        responseTime: 0,
        type: 'GET',
        responseText: {
          "results": [
            {
              "data": {
                "properties": mockdata.properties.BusinessAttributes
              }
            }
          ]
        }
      });

      mockjax({
        url: '//server/otcs/cs/api/v2/members?limit=20&where_type=0&where_type=1&' +
             encodeURIComponent('expand=properties{group_id,leader_id}') + '&query=a',
        responseTime: 0,
        type: 'GET',
        responseText: {
          "results": [
            {
              "data": {
                "properties": mockdata.properties.Admin
              }
            },
            {
              "data": {
                "properties": mockdata.properties.testUser
              }
            },
            {
              "data": {
                "properties": mockdata.properties.BusinessAdministrators
              }
            },
            {
              "data": {
                "properties": mockdata.properties.user
              }
            },
            {
              "data": {
                "properties": mockdata.properties.DefaultGroup
              }
            }
          ]
        }
      });

      mockjax({
        url: '//server/otcs/cs/api/v2/members?limit=5&where_type=0&where_type=1&' +
             encodeURIComponent('expand=properties{group_id,leader_id}') + '&query=a',
        responseTime: 0,
        type: 'GET',
        responseText: {
          "results": [
            {
              "data": {
                "properties": mockdata.properties.Admin
              }
            },
            {
              "data": {
                "properties": mockdata.properties.DefaultGroup
              }
            },
            {
              "data": {
                "properties": mockdata.properties.testUser
              }
            },
            {
              "data": {
                "properties": mockdata.properties.Admin
              }
            },
            {
              "data": {
                "properties": mockdata.properties.DefaultGroup
              }
            },
            {
              "data": {
                "properties": mockdata.properties.BusinessAdministrators
              }
            }
          ]
        }
      });
      mockjax({
        url: "//server/otcs/cs/api/v2/nodes/11111?fields=properties%7Bcontainer%2C+name%2C+type%2C+versions_control_advanced%2C+permissions_model%7D&fields=permissions%7Bright_id%2C+permissions%2C+type%7D&fields=versions%7Bversion_id%7D&expand=permissions%7Bright_id%7D",
        responseTime: 0,
        responseText: {
          "results": {
            "data": {
              "permissions": [
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 1100,
                  "right_id_expand": mockdata.properties.Admin,
                  "type": "owner"
                },
                {
                  "permissions": mockdata.permissions.readOnly,
                  "right_id": 1001,
                  "right_id_expand": mockdata.properties.DefaultGroup,
                  "type": "group"
                },
                {
                  "permissions": mockdata.permissions.readOnly,
                  "right_id": null,
                  "type": "public"
                },
                {
                  "permissions": mockdata.permissions.readOnly,
                  "right_id": 2116,
                  "right_id_expand": mockdata.properties.Filter,
                  "type": "custom"
                },
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 2244,
                  "right_id_expand": mockdata.properties.recommender,
                  "type": "custom"
                },
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 64039,
                  "right_id_expand": mockdata.properties.Kristen,
                  "type": "custom"
                },
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 1000,
                  "right_id_expand": mockdata.properties.spencer5,
                  "type": "custom"
                }
              ],
              "properties": {
                "container": true,
                "name": "000000_KR",
                "type": 0,
                "versions_control_advanced": true
              }
            }
          }
        }

      });

      mockjax({
        url: "//server/otcs/cs/api/v2/members/2244/members?limit=30&page=1&sort=asc_name",
        responseTime: 0,
        responseText: {
          "results": [{
            "data": {
              "properties": mockdata.properties.testUser
            }
          }]
        }
      });
      
      mockjax({
        url: '//server/otcs/cs/api/v2/nodes/44444?fields=properties&fields=versions%7Bowner_id%7D.element(0)&expand=properties%7Boriginal_id%7D&expand=permissions%7B44444%7D&state=&actions=addcategory&actions=addversion&actions=default&actions=open&actions=browse&actions=copy&actions=delete&actions=download&actions=ZipAndDownload&actions=edit&actions=editactivex&actions=editofficeonline&actions=editwebdav&actions=favorite&actions=nonfavorite&actions=rename&actions=move&actions=permissions&actions=favorite_rename&actions=reserve&actions=unreserve&actions=description&actions=thumbnail&actions=savefilter&actions=editpermissions&actions=collectionCanCollect&actions=removefromcollection',
        responseTime: 0,
        responseText: {
          "results": {
            "data": {
              "permissions": [
                {
                  "permissions": [],
                  "right_id": 9458780,
                  "right_id_expand": mockdata.properties.EmptyGroup,
                  "type": "custom"
                }
              ],
              "properties": mockdata.properties.NTestFolder
            }
          }
        }
      });

      mockjax({
        url: '//server/otcs/cs/api/v2/nodes/44444?fields=properties&fields=versions%7Bowner_id%7D.element(0)&expand=properties%7Boriginal_id%7D&expand=permissions%7B44444%7D&state=&actions=addcategory&actions=addversion&actions=default&actions=open&actions=browse&actions=copy&actions=delete&actions=download&actions=ZipAndDownload&actions=edit&actions=editactivex&actions=editofficeonline&actions=editwebdav&actions=favorite&actions=nonfavorite&actions=rename&actions=move&actions=permissions&actions=properties&actions=favorite_rename&actions=reserve&actions=unreserve&actions=description&actions=savefilter&actions=editpermissions&actions=collectionCanCollect&actions=removefromcollection',
        responseTime: 0,
        responseText: {
          "results": {
            "data": {
              "permissions": [
                {
                  "permissions": [],
                  "right_id": 9458780,
                  "right_id_expand": mockdata.properties.EmptyGroup,
                  "type": "custom"
                }
              ],
              "properties": mockdata.properties.NTestFolder
            }
          }
        }
      });

      mockjax({
        url: '//server/otcs/cs/api/v2/nodes/44444/permissions/effective/1000',
        responseTime: 0,
        responseText: {}
      });

      mockjax({
        url: '//server/otcs/cs/api/v2/nodes/44444?fields=properties&fields=versions%7Bowner_id%7D.element(0)&expand=properties%7Boriginal_id%7D&expand=permissions%7B44444%7D&state=&actions=addcategory&actions=addversion&actions=default&actions=open&actions=browse&actions=copy&actions=delete&actions=download&actions=ZipAndDownload&actions=edit&actions=editactivex&actions=editofficeonline&actions=editwebdav&actions=favorite&actions=nonfavorite&actions=rename&actions=move&actions=permissions&actions=properties&actions=favorite_rename&actions=reserve&actions=unreserve&actions=description&actions=savefilter&actions=editpermissions&actions=collect&actions=remove',
        responseText: '',
        responseTime: 0
      });
      mockjax({
        url: '//server/otcs/cs/api/v2/nodes/44444?fields=properties%7Bcontainer%2C+name%2C+type%2C+versions_control_advanced%2C+permissions_model%7D&fields=permissions%7Bright_id%2C+permissions%2C+type%7D&fields=versions%7Bversion_id%7D&expand=permissions%7Bright_id%7D',
        responseTime: 0,
        responseText: {
          "results": {
            "data": {
              "permissions": [
                {
                  "permissions": [],
                  "right_id": 9458780,
                  "right_id_expand": mockdata.properties.EmptyGroup,
                  "type": "custom"
                }
              ],
              "properties": mockdata.properties.NTestFolder
            }
          }
        }
      });
      mockjax({
        url: '//server/otcs/cs/api/v2/nodes/44444?fields=properties&expand=properties%7Boriginal_id%7D&expand=permissions%7B44444%7D&state=&actions=addcategory&actions=addversion&actions=default&actions=open&actions=browse&actions=copy&actions=delete&actions=download&actions=ZipAndDownload&actions=edit&actions=editactivex&actions=editofficeonline&actions=editwebdav&actions=favorite&actions=nonfavorite&actions=rename&actions=move&actions=permissions&actions=properties&actions=favorite_rename&actions=reserve&actions=unreserve&actions=description&actions=thumbnail&actions=savefilter&actions=editpermissions&actions=collectionCanCollect&actions=removefromcollection',
        responseText: '',
        responseTime: 0
      });

      mockjax({
        url: '//server/otcs/cs/api/v2/nodes/44444?fields=properties&expand=properties%7Boriginal_id%7D&expand=permissions%7B44444%7D&state=&actions=addcategory&actions=addversion&actions=default&actions=open&actions=browse&actions=copy&actions=delete&actions=download&actions=edit&actions=editactivex&actions=editofficeonline&actions=editwebdav&actions=favorite&actions=nonfavorite&actions=rename&actions=move&actions=permissions&actions=properties&actions=favorite_rename&actions=reserve&actions=unreserve&actions=description&actions=thumbnail&actions=savefilter&actions=editpermissions&actions=collectionCanCollect&actions=removefromcollection',
        responseText: '',
        responseTime: 0
      });

      mockjax({
        url: '//server/otcs/cs/api/v2/members/9458780/members?limit=30&page=1&sort=asc_name',
        responseText: {
          "results": {}
        }

      });

      mockjax({
        url: '//server/otcs/cs/api/v2/members/9458780/members',
        responseTime: 0,
        responseText: {
          "results": {}
        }
      });
      mockjax({
        url: "//server/otcs/cs/api/v2/nodes/22222?fields=properties%7Bcontainer%2C+name%2C+type%2C+versions_control_advanced%2C+permissions_model%7D&fields=permissions%7Bright_id%2C+permissions%2C+type%7D&fields=versions%7Bversion_id%7D&expand=permissions%7Bright_id%7D",
        responseTime: 0,
        responseText: {
          "results": {
            "data": {
              "permissions": [
                {
                  "permissions": null,
                  "right_id": null,
                  "type": "owner"
                },
                {
                  "permissions": mockdata.permissions.readOnly,
                  "right_id": 1001,
                  "right_id_expand": mockdata.properties.DefaultGroup,
                  "type": "group"
                },
                {
                  "permissions": mockdata.permissions.readOnly,
                  "right_id": null,
                  "type": "public"
                },
                {
                  "permissions": mockdata.permissions.readOnly,
                  "right_id": 2116,
                  "right_id_expand": mockdata.properties.Filter,
                  "type": "custom"
                },
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 2244,
                  "right_id_expand": mockdata.properties.recommender,
                  "type": "custom"
                },
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 64039,
                  "right_id_expand": mockdata.properties.Kristen,
                  "type": "custom"
                },
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 1000,
                  "right_id_expand": mockdata.properties.spencer5,
                  "type": "custom"
                }
              ],
              "properties": mockdata.properties.Document,
              "versions": [
                {
                  "version_id": 9901863
                }
              ]
            }
          }
        }
      });

      mockjax({
        url: "//server/otcs/cs/api/v2/nodes/33333?fields=properties%7Bcontainer%2C+name%2C+type%2C+versions_control_advanced%2C+permissions_model%7D&fields=permissions%7Bright_id%2C+permissions%2C+type%7D&fields=versions%7Bversion_id%7D&expand=permissions%7Bright_id%7D",
        responseTime: 0,
        responseText: {
          "results": {
            "data": {
              "permissions": [
                {
                  "permissions": null,
                  "right_id": null,
                  "type": "owner"
                },
                {
                  "permissions": null,
                  "right_id": null,
                  "type": "group"
                },
                {
                  "permissions": mockdata.permissions.readOnly,
                  "right_id": null,
                  "type": "public"
                },
                {
                  "permissions": mockdata.permissions.readOnly,
                  "right_id": 2116,
                  "right_id_expand": mockdata.properties.Filter,
                  "type": "custom"
                },
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 2244,
                  "right_id_expand": mockdata.properties.recommender,
                  "type": "custom"
                },
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 64039,
                  "right_id_expand": mockdata.properties.Kristen,
                  "type": "custom"
                },
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 1000,
                  "right_id_expand": mockdata.properties.spencer5,
                  "type": "custom"
                }
              ],
              "properties": mockdata.properties.Document,
              "versions": [
                {
                  "version_id": 9901865
                }
              ]
            }
          }
        }
      });

      mockjax({
        url: "//server/otcs/cs/api/v2/nodes/55555?fields=properties%7Bcontainer%2C+name%2C+type%2C+versions_control_advanced%2C+permissions_model%7D&fields=permissions%7Bright_id%2C+permissions%2C+type%7D&fields=versions%7Bversion_id%7D&expand=permissions%7Bright_id%7D",
        responseTime: 0,
        responseText: {
          "results": {
            "data": {
              "permissions": [
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 1100,
                  "right_id_expand": mockdata.properties.Admin,
                  "type": "owner"
                },
                {
                  "permissions": null,
                  "right_id": null,
                  "type": "group"
                },
                {
                  "permissions": mockdata.permissions.readOnly,
                  "right_id": null,
                  "type": "public"
                },
                {
                  "permissions": mockdata.permissions.readOnly,
                  "right_id": 2116,
                  "right_id_expand": mockdata.properties.Filter,
                  "type": "custom"
                },
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 2244,
                  "right_id_expand": mockdata.properties.recommender,
                  "type": "custom"
                },
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 64039,
                  "right_id_expand": mockdata.properties.Kristen,
                  "type": "custom"
                },
                {
                  "permissions": mockdata.permissions.fullPermissions,
                  "right_id": 1000,
                  "right_id_expand": mockdata.properties.spencer5,
                  "type": "custom"
                }
              ],
              "properties": mockdata.properties.Document,
              "versions": [
                {
                  "version_id": 9901865
                }
              ]
            }
          }
        }
      });
      mockjax({
        url: "//server/otcs/cs/api/v2/members?limit=20&page=1&sort=asc_name",
        responseTime: 0,
        responseText: {
          "results": [
            {
              "data": {
                "properties": mockdata.properties.Admin
              }
            },
            {
              "data": {
                "properties": mockdata.properties.spencer5
              }
            },
            {
              "data": {
                "properties": mockdata.properties.usera
              }
            },
            {
              "data": {
                "properties": mockdata.properties.spencer5
              }
            },
            {
              "data": {
                "properties": mockdata.properties.userc
              }
            },
            {
              "data": {
                "properties": mockdata.properties.userabc
              }
            },
            {
              "data": {
                "properties": mockdata.properties.recommender
              }
            }
          ]
        }
      });
      mockjax({
        url: "//server/otcs/cs/api/v2/members?where_type=1&limit=20&page=1&sort=asc_name",
        responseTime: 0,
        responseText: {
          "results": [{
            "data": {
              "properties": mockdata.properties.DefaultGroup
            }
          }, {
            "data": {
              "properties": mockdata.properties.BusinessAdministrators
            }
          }, {
            "data": {
              "properties": mockdata.properties.BusinessAdministrators
            }
          }, {
            "data": {
              "properties": mockdata.properties.recommender
            }
          }, {
            "data": {
              "properties": mockdata.properties.dummyGroup
            }
          }, {
            "data": {
              "properties": mockdata.properties.MyGroup
            }
          }]
        }
      });

      mockjax({
        url: "//server/otcs/cs/api/v2/members/10866/members?limit=20&page=1&sort=asc_name",
        responseTime: 0,
        responseText: {
          "results": [
            {
              "data": {
                "properties": mockdata.properties.usera
              }
            },
            {
              "data": {
                "properties": mockdata.properties.userb
              }
            },
            {
              "data": {
                "properties": mockdata.properties.userc
              }
            }
          ]
        }
      });

      mockjax({
        url: "//server/otcs/cs/api/v2/members/2244/members?limit=20&page=1&sort=asc_name",
        responseTime: 0,
        responseText: {
          "results": [
            {
              "data": {
                "properties": mockdata.properties.recommender1
              }
            },
            {
              "data": {
                "properties": mockdata.properties.recommender99
              }
            }
          ]
        }
      });

      mockjax({
        url: "//server/otcs/cs/api/v2/members/2244/members?where_type=1&limit=20&page=1&sort=asc_name",
        responseTime: 0,
        responseText: {
          "results": [
            {
              "data": {
                "properties": mockdata.properties.recommender1
              }
            },
            {
              "data": {
                "properties": mockdata.properties.recommender99
              }
            }
          ]
        }
      });
      mockjax({
        url: "//server/otcs/cs/api/v2/members/2244/members",
        responseTime: 0,
        responseText: {
          "results": [
            {
              "data": {
                "properties": mockdata.properties.recommender1
              }
            },
            {
              "data": {
                "properties": mockdata.properties.recommender99
              }
            }
          ]
        }
      });

      mockjax({
        url: new RegExp('//server/otcs/cs/api/v2/nodes/11111'),
        responseTime: 0,
        responseText: {
          "results": {
            "data": {
              "properties": mockdata.properties.Folder
            }
          }
        }
      });
    },

    disable: function () {
      mockjax.clear();
    }
  };
});
