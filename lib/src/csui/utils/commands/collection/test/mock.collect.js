/* Copyright (c) 2016-2017  OpenText Corp. All Rights Reserved. */

define([
    'require', 'csui/lib/underscore', 'csui/lib/jquery', 'csui/lib/jquery.mockjax'
], function (require, _, $, mockjax) {
    'use strict';
    var mocks = [];

    return {
        enable: function () {
            mocks.push(mockjax({
                url: "//server/otcs/cs/api/v2/search?expand=properties%7Boriginal_id%2Cowner_user_id%2Ccreate_user_id%2Cowner_id%2Creserved_user_id%7D&options=%7B'highlight_summaries'%2C'facets'%7D&where=*",
                responseText: {
                    "collection": {
                        "paging": {
                            "limit": 10,
                            "links": {
                                "next": {
                                    "body": "",
                                    "content_type": "",
                                    "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=2&where=*&cache_id=2002384794",
                                    "method": "GET",
                                    "name": "Next"
                                }
                            },
                            "page": 1,
                            "page_total": 1939,
                            "range_max": 10,
                            "range_min": 1,
                            "result_header_string": "Results 1 to 10 of 19380 sorted by Relevance",
                            "total_count": 19380
                        },
                        "searching": {
                            "cache_id": 2002384794,
                            "facets": {
                                "available": [{
                                    "count": 55,
                                    "count_exceeded": false,
                                    "display_name": "Creation Date",
                                    "facet_items": [{
                                        "count": 199,
                                        "display_name": "Last 3 days",
                                        "value": "lz3d"
                                    }, {
                                        "count": 376,
                                        "display_name": "Last 2 weeks",
                                        "value": "ly2w"
                                    }, {
                                        "count": 1849,
                                        "display_name": "Last 2 months",
                                        "value": "lx2m"
                                    }, {
                                        "count": 4984,
                                        "display_name": "Last 6 months",
                                        "value": "lw6m"
                                    }, {
                                        "count": 11899,
                                        "display_name": "Last 12 months",
                                        "value": "lv1y"
                                    }, {
                                        "count": 16792,
                                        "display_name": "Last 3 years",
                                        "value": "lu3y"
                                    }, {
                                        "count": 19092,
                                        "display_name": "Last 5 years",
                                        "value": "lt5y"
                                    }, {
                                        "count": 288,
                                        "display_name": "Older",
                                        "value": "ls5o"
                                    }],
                                    "name": "OTCreateDate",
                                    "type": "Date"
                                }, {
                                    "count": 110,
                                    "count_exceeded": false,
                                    "display_name": "Content Type",
                                    "facet_items": [{
                                        "count": 11339,
                                        "display_name": "Document",
                                        "value": "144"
                                    }, {
                                        "count": 2991,
                                        "display_name": "Folder",
                                        "value": "0"
                                    }, {
                                        "count": 1163,
                                        "display_name": "Wiki Page",
                                        "value": "5574"
                                    }, {
                                        "count": 743,
                                        "display_name": "MicroPost",
                                        "value": "1281"
                                    }, {
                                        "count": 470,
                                        "display_name": "Category",
                                        "value": "131"
                                    }, {
                                        "count": 323,
                                        "display_name": "ActiveView",
                                        "value": "30309"
                                    }, {
                                        "count": 300,
                                        "display_name": "Shortcut",
                                        "value": "1"
                                    }, {
                                        "count": 263,
                                        "display_name": "Wiki",
                                        "value": "5573"
                                    }, {
                                        "count": 205,
                                        "display_name": "URL",
                                        "value": "140"
                                    }, {
                                        "count": 164,
                                        "display_name": "Forum Topics & Replies",
                                        "value": "123470"
                                    }, {
                                        "count": 150,
                                        "display_name": "Asset Folder",
                                        "value": "955"
                                    }, {
                                        "count": 124,
                                        "display_name": "Collection",
                                        "value": "298"
                                    }, {
                                        "count": 109,
                                        "display_name": "Task List",
                                        "value": "204"
                                    }, {
                                        "count": 75,
                                        "display_name": "Business Workspace",
                                        "value": "848"
                                    }, {
                                        "count": 70,
                                        "display_name": "LiveReport",
                                        "value": "299"
                                    }, {
                                        "count": 55,
                                        "display_name": "RM Classification",
                                        "value": "551"
                                    }, {
                                        "count": 54,
                                        "display_name": "Email Folder",
                                        "value": "751"
                                    }, {
                                        "count": 51,
                                        "display_name": "Workflow Map",
                                        "value": "128"
                                    }, {
                                        "count": 44,
                                        "display_name": "Task",
                                        "value": "206"
                                    }, {
                                        "count": 41,
                                        "display_name": "Search Query",
                                        "value": "258"
                                    }],
                                    "name": "OTSubType",
                                    "type": "Text"
                                }, {
                                    "count": 56,
                                    "count_exceeded": false,
                                    "display_name": "File Type",
                                    "facet_items": [{
                                        "count": 3774,
                                        "display_name": "Text",
                                        "value": "Text"
                                    }, {
                                        "count": 3737,
                                        "display_name": "Picture",
                                        "value": "Picture"
                                    }, {
                                        "count": 3140,
                                        "display_name": "Folder",
                                        "value": "Folder"
                                    }, {
                                        "count": 2786,
                                        "display_name": "Photo",
                                        "value": "Photo"
                                    }, {
                                        "count": 1613,
                                        "display_name": "Microsoft Word",
                                        "value": "Microsoft Word"
                                    }, {
                                        "count": 1366,
                                        "display_name": "Adobe PDF",
                                        "value": "Adobe PDF"
                                    }, {
                                        "count": 1263,
                                        "display_name": "UNKNOWN",
                                        "value": "UNKNOWN"
                                    }, {
                                        "count": 1021,
                                        "display_name": "Microsoft Excel",
                                        "value": "Microsoft Excel"
                                    }, {
                                        "count": 743,
                                        "display_name": "Blog",
                                        "value": "Blog"
                                    }, {
                                        "count": 501,
                                        "display_name": "Classification",
                                        "value": "Classification"
                                    }, {
                                        "count": 318,
                                        "display_name": "ActiveView",
                                        "value": "ActiveView"
                                    }, {
                                        "count": 309,
                                        "display_name": "Graphics",
                                        "value": "Graphics"
                                    }, {
                                        "count": 296,
                                        "display_name": "Microsoft PowerPoint",
                                        "value": "Microsoft PowerPoint"
                                    }, {
                                        "count": 262,
                                        "display_name": "Web Page",
                                        "value": "Web Page"
                                    }, {
                                        "count": 161,
                                        "display_name": "Task",
                                        "value": "Task"
                                    }, {
                                        "count": 99,
                                        "display_name": "JPEG",
                                        "value": "JPEG"
                                    }, {
                                        "count": 94,
                                        "display_name": "Software Report",
                                        "value": "Software Report"
                                    }, {
                                        "count": 93,
                                        "display_name": "Compressed Archive",
                                        "value": "Compressed Archive"
                                    }, {
                                        "count": 66,
                                        "display_name": "Workflow",
                                        "value": "Workflow"
                                    }, {
                                        "count": 64,
                                        "display_name": "Video ",
                                        "value": "Video"
                                    }],
                                    "name": "OTFileType",
                                    "type": "Text"
                                }, {
                                    "count": 39,
                                    "count_exceeded": false,
                                    "display_name": "Classification",
                                    "facet_items": [{
                                        "count": 1534,
                                        "display_name": "MyClassification : Class1",
                                        "value": "1707840 2067849 2067850"
                                    }, {
                                        "count": 1407,
                                        "display_name": "MyClassification : Class 2",
                                        "value": "1707840 2067849 2120757"
                                    }, {
                                        "count": 963,
                                        "display_name": "Hyd-Classifications : Class1",
                                        "value": "1707840 9442390 15741379"
                                    }, {
                                        "count": 646,
                                        "display_name": "Classifications : Rm33",
                                        "value": "1707840 15741269"
                                    }, {
                                        "count": 577,
                                        "display_name": "Classifications : CWS classification tree",
                                        "value": "1707840 18121785"
                                    }, {
                                        "count": 349,
                                        "display_name": "CTree1 : C2",
                                        "value": "1707840 6271898 6272669"
                                    }, {
                                        "count": 206,
                                        "display_name": "RMClassification_testing_children : RM1",
                                        "value": "1707840 13815265 13815485"
                                    }, {
                                        "count": 188,
                                        "display_name": "CTree1 : C1",
                                        "value": "1707840 6271898 6272668"
                                    }, {
                                        "count": 76,
                                        "display_name": "CTree1 : C3",
                                        "value": "1707840 6271898 6272670"
                                    }, {
                                        "count": 68,
                                        "display_name": "ClassificationType : classificationSubType2",
                                        "value": "1707840 8750617 8750177"
                                    }, {
                                        "count": 46,
                                        "display_name": "Classifications : CTree1",
                                        "value": "1707840 6271898"
                                    }, {
                                        "count": 43,
                                        "display_name": "Classifications : Hyd-Classifications",
                                        "value": "1707840 9442390"
                                    }, {
                                        "count": 41,
                                        "display_name": "RMClassification_testing_children : RM3",
                                        "value": "1707840 13815265 13815925"
                                    }, {
                                        "count": 39,
                                        "display_name": "Classifications : test RM classification",
                                        "value": "1707840 12605817"
                                    }, {
                                        "count": 25,
                                        "display_name": "Hyd-Classifications : ~!@#$%^&*()_+|}{\u0022?><,.\/;\u0027[]\\==-` &lt; &gt; &nbsp; &amp; <SCRIPT> var pos=document.URL.indexOf(\u0022name=\u0022)+5; document.write(document.URL.substring(pos,document.URL.length)); <\/SCRIPT><script>alert(\u0022Hahaha\u0022);<\/script>",
                                        "value": "1707840 9442390 9442391"
                                    }, {
                                        "count": 24,
                                        "display_name": "RM Classifications : Finance",
                                        "value": "1707840 17863744 17863745"
                                    }, {
                                        "count": 12,
                                        "display_name": "test RM classification : 1",
                                        "value": "1707840 12605817 13289777"
                                    }],
                                    "name": "OTClassificationTree",
                                    "type": "Text"
                                }, {
                                    "count": 110,
                                    "count_exceeded": false,
                                    "display_name": "Container",
                                    "facet_items": [{
                                        "count": 895,
                                        "display_name": "Enterprise Workspace : 200 Documents",
                                        "value": "1275805"
                                    }, {
                                        "count": 401,
                                        "display_name": "Enterprise Workspace : Performance",
                                        "value": "191152"
                                    }, {
                                        "count": 289,
                                        "display_name": "Perspectives",
                                        "value": "388851"
                                    }, {
                                        "count": 245,
                                        "display_name": "000000Test HTML tile creation12 : Wiki container",
                                        "value": "11359205"
                                    }, {
                                        "count": 185,
                                        "display_name": "Comments for - 00000_55715 (3675682)",
                                        "value": "132097"
                                    }, {
                                        "count": 166,
                                        "display_name": "Enterprise Workspace : 007 Hyderabad",
                                        "value": "604999"
                                    }, {
                                        "count": 150,
                                        "display_name": "Perspective Assets",
                                        "value": "11019211"
                                    }, {
                                        "count": 150,
                                        "display_name": "assets_15185970638447420062166032542 : HTMLWidgetContentWiki",
                                        "value": "12231365"
                                    }, {
                                        "count": 147,
                                        "display_name": "Admin\u0027s Home : Large Folder",
                                        "value": "73279"
                                    }, {
                                        "count": 135,
                                        "display_name": "Enterprise Workspace",
                                        "value": "2000"
                                    }, {
                                        "count": 134,
                                        "display_name": "Comments for - 00000_55715 (3675682) : profile-photos",
                                        "value": "135406"
                                    }, {
                                        "count": 131,
                                        "display_name": "A Cost Analysis : 12345",
                                        "value": "293056"
                                    }, {
                                        "count": 127,
                                        "display_name": "Enterprise Workspace : A Cost Analysis",
                                        "value": "205659"
                                    }, {
                                        "count": 124,
                                        "display_name": "Kristen Home : 12345",
                                        "value": "567205"
                                    }, {
                                        "count": 120,
                                        "display_name": "Enterprise Workspace : Thoms",
                                        "value": "19835776"
                                    }, {
                                        "count": 110,
                                        "display_name": "assets_15186032722549366004128151315 : HTMLWidgetContentWiki",
                                        "value": "12234295"
                                    }, {
                                        "count": 106,
                                        "display_name": "Admin\u0027s Home",
                                        "value": "2003"
                                    }, {
                                        "count": 103,
                                        "display_name": "00 Navya Test folder : Test nodestable widget options",
                                        "value": "17879132"
                                    }, {
                                        "count": 101,
                                        "display_name": "00 Navya Test folder : 100 folders",
                                        "value": "8230344"
                                    }, {
                                        "count": 100,
                                        "display_name": "Subfolder02 : SFolder_02",
                                        "value": "12342928"
                                    }],
                                    "name": "OTParentID",
                                    "type": "Text"
                                }]
                            },
                            "result_title": "Search Results for: *"
                        },
                        "sorting": {
                            "links": {
                                "asc_OTObjectDate": {
                                    "body": "",
                                    "content_type": "",
                                    "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=1&where=*&cache_id=2002384794&sort=asc_OTObjectDate",
                                    "method": "GET",
                                    "name": "Date (Ascending)"
                                },
                                "asc_OTObjectSize": {
                                    "body": "",
                                    "content_type": "",
                                    "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=1&where=*&cache_id=2002384794&sort=asc_OTObjectSize",
                                    "method": "GET",
                                    "name": "Size (Ascending)"
                                },
                                "desc_OTObjectDate": {
                                    "body": "",
                                    "content_type": "",
                                    "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=1&where=*&cache_id=2002384794&sort=desc_OTObjectDate",
                                    "method": "GET",
                                    "name": "Date (Descending)"
                                },
                                "desc_OTObjectSize": {
                                    "body": "",
                                    "content_type": "",
                                    "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=1&where=*&cache_id=2002384794&sort=desc_OTObjectSize",
                                    "method": "GET",
                                    "name": "Size (Descending)"
                                },
                                "relevance": {
                                    "body": "",
                                    "content_type": "",
                                    "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=1&where=*&cache_id=2002384794",
                                    "method": "GET",
                                    "name": "Relevance"
                                }
                            }
                        }
                    },
                    "links": {
                        "data": {
                            "self": {
                                "body": "",
                                "content_type": "",
                                "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=1&where=*&cache_id=2002384794",
                                "method": "GET",
                                "name": ""
                            }
                        }
                    },
                    "results": [{
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/19785506\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 5,
                                "create_date": "2018-11-07T20:34:42",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "Attempting to set focus to a hidden element causes an error in Internet Explorer. Take care to only use .focus() on elements that are visible. To run an element\u0027s focus event handlers without setting focus to the element, use .triggerHandler( \u0022focus\u0022 ) instead of .focus().\nAttempting to set focus to a hidden element causes an error in Internet Explorer. Take care to only use .focus() on elements that are visible. To run an element\u0027s focus event handlers without setting focus to the element, use .triggerHandler( \u0022focus\u0022 ) instead of .focus().",
                                "description_multilingual": {
                                    "en": "Attempting to set focus to a hidden element causes an error in Internet Explorer. Take care to only use .focus() on elements that are visible. To run an element\u0027s focus event handlers without setting focus to the element, use .triggerHandler( \u0022focus\u0022 ) instead of .focus().\nAttempting to set focus to a hidden element causes an error in Internet Explorer. Take care to only use .focus() on elements that are visible. To run an element\u0027s focus event handlers without setting focus to the element, use .triggerHandler( \u0022focus\u0022 ) instead of .focus()."
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 19785506,
                                "mime_type": null,
                                "modify_date": "2018-12-10T17:40:33",
                                "modify_user_id": 1000,
                                "name": "bala test 0001",
                                "name_multilingual": {
                                    "en": "bala test 0001"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 11445223,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 5,
                                "size_formatted": "5 Items",
                                "summary": [""],
                                "type": 0,
                                "type_name": "Folder",
                                "versions_control_advanced": true,
                                "volume_id": -2000
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2000",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/11445223",
                                "name": "000 Bala"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2000\/nodes",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999\/nodes",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/11445223\/nodes",
                                "name": "000 Bala"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/11445223",
                                "name": "000 Bala"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/11445223\/nodes",
                                "name": "000 Bala"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=19785506&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/11123387\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 24,
                                "create_date": "2017-08-02T00:15:15",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "gnhkjgk\nkjhjj\ngjhghj\nhjkh",
                                "description_multilingual": {
                                    "de_DE": "",
                                    "en": "gnhkjgk\nkjhjj\ngjhghj\nhjkh"
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 11123387,
                                "mime_type": null,
                                "modify_date": "2018-12-09T22:52:36",
                                "modify_user_id": 1000,
                                "name": "234-12",
                                "name_multilingual": {
                                    "de_DE": "Empty",
                                    "en": "234-12"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 10879731,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 24,
                                "size_formatted": "24 Items",
                                "summary": [""],
                                "type": 0,
                                "type_name": "Folder",
                                "versions_control_advanced": true,
                                "volume_id": -2000
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2000",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/10879731",
                                "name": "000 yamini"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2000\/nodes",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999\/nodes",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/10879731\/nodes",
                                "name": "000 yamini"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/10879731",
                                "name": "000 yamini"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/10879731\/nodes",
                                "name": "000 yamini"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=11123387&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/6774268\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": false,
                                "container_size": 0,
                                "create_date": "2018-04-19T23:45:39",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "mfkhgk",
                                "description_multilingual": {
                                    "en": "mfkhgk"
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 14091915,
                                "mime_type": null,
                                "modify_date": "2018-12-05T20:28:00",
                                "modify_user_id": 1000,
                                "name": "shortcut to Ravi folder 111222",
                                "name_multilingual": {
                                    "en": "shortcut to Ravi folder 111222"
                                },
                                "original_id": 6774268,
                                "original_id_expand": {
                                    "container": true,
                                    "container_size": 33,
                                    "create_date": "2017-08-06T22:21:40",
                                    "create_user_id": 1000,
                                    "description": "dfdfdfdfdf",
                                    "description_multilingual": {
                                        "de_DE": "sds dsds dsd",
                                        "en": "dfdfdfdfdf",
                                        "ja": ""
                                    },
                                    "external_create_date": null,
                                    "external_identity": "",
                                    "external_identity_type": "",
                                    "external_modify_date": null,
                                    "external_source": "",
                                    "favorite": false,
                                    "id": 6774268,
                                    "mime_type": null,
                                    "modify_date": "2018-12-03T18:22:06",
                                    "modify_user_id": 1000,
                                    "name": "006 Bhaskar Bonthala",
                                    "name_multilingual": {
                                        "de_DE": "006 Bhaskar Bonthala",
                                        "en": "006 Bhaskar Bonthala",
                                        "ja": "006 Bhaskar Bonthala"
                                    },
                                    "owner": "istrator, Admin",
                                    "owner_group_id": 1001,
                                    "owner_user_id": 1000,
                                    "parent_id": 604999,
                                    "permissions_model": "advanced",
                                    "reserved": false,
                                    "reserved_date": null,
                                    "reserved_shared_collaboration": false,
                                    "reserved_user_id": 0,
                                    "size": 33,
                                    "size_formatted": "33 Items",
                                    "type": 0,
                                    "type_name": "Folder",
                                    "versions_control_advanced": true,
                                    "volume_id": -2000,
                                    "wnd_att_7bgpv_5": null,
                                    "wnd_comments": null
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 10879731,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": null,
                                "size_formatted": "",
                                "summary": [""],
                                "type": 1,
                                "type_name": "Shortcut",
                                "versions_control_advanced": true,
                                "volume_id": -2000
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2000",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/10879731",
                                "name": "000 yamini"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2000\/nodes",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999\/nodes",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/10879731\/nodes",
                                "name": "000 yamini"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/10879731",
                                "name": "000 yamini"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/10879731\/nodes",
                                "name": "000 yamini"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=14091915&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "download": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/13962996\/content?download",
                                    "method": "GET",
                                    "name": "Download"
                                },
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/13962996\/content",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open", "download"]
                        },
                        "data": {
                            "properties": {
                                "container": false,
                                "container_size": 0,
                                "create_date": "2018-04-17T10:03:45",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "a",
                                "description_multilingual": {
                                    "en": "a"
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 13962996,
                                "mime_type": "image\/gif",
                                "modify_date": "2018-12-05T20:28:01",
                                "modify_user_id": 1000,
                                "name": "2018-03-19_New Labels.gif_renme",
                                "name_multilingual": {
                                    "en": "2018-03-19_New Labels.gif_renme"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 12729103,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 13364,
                                "size_formatted": "14 KB",
                                "summary": [""],
                                "type": 144,
                                "type_name": "Document",
                                "versions_control_advanced": true,
                                "volume_id": -2000
                            },
                            "versions": {
                                "create_date": "2018-04-17T10:03:45",
                                "description": null,
                                "file_create_date": "2018-04-17T10:03:45",
                                "file_modify_date": "2018-04-17T10:03:45",
                                "file_name": "2018-03-19_New Labels.gif",
                                "file_size": 13364,
                                "file_type": "gif",
                                "id": 13962996,
                                "locked": false,
                                "locked_date": null,
                                "locked_user_id": null,
                                "mime_type": "image\/gif",
                                "modify_date": "2018-04-17T10:03:45",
                                "name": "2018-03-19_New Labels.gif",
                                "owner_id": 1000,
                                "provider_id": 13962996,
                                "version_id": 13962996,
                                "version_number": 1,
                                "version_number_major": 0,
                                "version_number_minor": 1,
                                "version_number_name": "1"
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2000",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/749454",
                                "name": "00_Aihua\u0027s Folder"
                            }, {
                                "href": "api\/v1\/nodes\/12729103",
                                "name": "000_subfolder"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2000\/nodes",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/749454\/nodes",
                                "name": "00_Aihua\u0027s Folder"
                            }, {
                                "href": "api\/v1\/nodes\/12729103\/nodes",
                                "name": "000_subfolder"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/12729103",
                                "name": "000_subfolder"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/12729103\/nodes",
                                "name": "000_subfolder"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": true,
                            "object_href": null,
                            "object_id": "DataId=13962996&Version=1",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {},
                            "map": {
                                "default_action": ""
                            },
                            "order": []
                        },
                        "data": {
                            "properties": {
                                "container": false,
                                "container_size": 0,
                                "create_date": "2018-03-12T01:34:43",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "DSD",
                                "description_multilingual": {
                                    "en": "DSD"
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 18890205,
                                "mime_type": null,
                                "modify_date": "2018-10-16T19:43:30",
                                "modify_user_id": 1000,
                                "name": "Req_TKL_MV",
                                "name_multilingual": {
                                    "en": "Req_TKL_MV"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 616849,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 673,
                                "size_formatted": "",
                                "summary": [""],
                                "type": 131,
                                "type_name": "Category",
                                "versions_control_advanced": true,
                                "volume_id": -2004
                            },
                            "versions": {
                                "create_date": "2018-03-12T01:35:46",
                                "description": null,
                                "file_create_date": null,
                                "file_modify_date": null,
                                "file_name": "Req_TKL_MV",
                                "file_size": 673,
                                "file_type": null,
                                "id": 18890205,
                                "locked": false,
                                "locked_date": null,
                                "locked_user_id": null,
                                "mime_type": null,
                                "modify_date": "2018-03-12T01:35:46",
                                "name": "Req_TKL_MV",
                                "owner_id": 1000,
                                "provider_id": 12863085,
                                "version_id": 18890206,
                                "version_number": 1,
                                "version_number_major": 0,
                                "version_number_minor": 1,
                                "version_number_name": "1"
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2004",
                                "name": "Categories Volume"
                            }, {
                                "href": "api\/v1\/nodes\/616849",
                                "name": "000 Hyderabad"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2004\/nodes",
                                "name": "Categories Volume"
                            }, {
                                "href": "api\/v1\/nodes\/616849\/nodes",
                                "name": "000 Hyderabad"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/616849",
                                "name": "000 Hyderabad"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/616849\/nodes",
                                "name": "000 Hyderabad"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": true,
                            "object_href": null,
                            "object_id": "DataId=18890205&Version=1",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {},
                            "map": {
                                "default_action": ""
                            },
                            "order": []
                        },
                        "data": {
                            "properties": {
                                "container": false,
                                "container_size": 0,
                                "create_date": "2018-03-12T01:34:43",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "DSD",
                                "description_multilingual": {
                                    "en": "DSD",
                                    "ja": ""
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 12863085,
                                "mime_type": null,
                                "modify_date": "2018-10-08T20:29:22",
                                "modify_user_id": 1000,
                                "name": "Req_TKL_MV",
                                "name_multilingual": {
                                    "en": "",
                                    "ja": "Req_TKL_MV"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 7247375,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 673,
                                "size_formatted": "",
                                "summary": [""],
                                "type": 131,
                                "type_name": "Category",
                                "versions_control_advanced": true,
                                "volume_id": -2004
                            },
                            "versions": {
                                "create_date": "2018-03-12T01:35:46",
                                "description": null,
                                "file_create_date": null,
                                "file_modify_date": null,
                                "file_name": "Req_TKL_MV",
                                "file_size": 673,
                                "file_type": null,
                                "id": 12863085,
                                "locked": false,
                                "locked_date": null,
                                "locked_user_id": null,
                                "mime_type": null,
                                "modify_date": "2018-03-12T01:35:46",
                                "name": "Req_TKL_MV",
                                "owner_id": 1000,
                                "provider_id": 12863085,
                                "version_id": 12863085,
                                "version_number": 1,
                                "version_number_major": 0,
                                "version_number_minor": 1,
                                "version_number_name": "1"
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2004",
                                "name": "Categories Volume"
                            }, {
                                "href": "api\/v1\/nodes\/616849",
                                "name": "000 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/7247375",
                                "name": "00 MultiValueAttributes"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2004\/nodes",
                                "name": "Categories Volume"
                            }, {
                                "href": "api\/v1\/nodes\/616849\/nodes",
                                "name": "000 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/7247375\/nodes",
                                "name": "00 MultiValueAttributes"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/7247375",
                                "name": "00 MultiValueAttributes"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/7247375\/nodes",
                                "name": "00 MultiValueAttributes"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": true,
                            "object_href": null,
                            "object_id": "DataId=12863085&Version=1",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/7459895\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 0,
                                "create_date": "2017-08-29T07:57:27",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "uk",
                                "description_multilingual": {
                                    "de_DE": "uk"
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 7459895,
                                "mime_type": null,
                                "modify_date": "2018-12-05T20:41:11",
                                "modify_user_id": 1000,
                                "name": "f12",
                                "name_multilingual": {
                                    "de_DE": "f12"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 526340,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 0,
                                "size_formatted": "0 Items",
                                "summary": [""],
                                "type": 0,
                                "type_name": "Folder",
                                "versions_control_advanced": true,
                                "volume_id": -2003
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2003",
                                "name": "Admin\u0027s Home"
                            }, {
                                "href": "api\/v1\/nodes\/526340",
                                "name": "aFolder"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2003\/nodes",
                                "name": "Admin\u0027s Home"
                            }, {
                                "href": "api\/v1\/nodes\/526340\/nodes",
                                "name": "aFolder"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/526340",
                                "name": "aFolder"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/526340\/nodes",
                                "name": "aFolder"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=7459895&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/1501259\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 14,
                                "create_date": "2016-07-28T10:18:01",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "1st 2nd 4th\nlinehttp:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/20031st linehttp:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/20031st linehttp:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003",
                                "description_multilingual": {
                                    "de_DE": "",
                                    "en": "1st 2nd 4th\nlinehttp:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/20031st linehttp:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/20031st linehttp:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003"
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 1501259,
                                "mime_type": null,
                                "modify_date": "2018-12-05T20:37:39",
                                "modify_user_id": 1000,
                                "name": "00 Navya test folder2",
                                "name_multilingual": {
                                    "de_DE": "Navya\u0027s folder",
                                    "en": "00 Navya test folder2"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 2003,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 14,
                                "size_formatted": "14 Items",
                                "summary": [""],
                                "type": 0,
                                "type_name": "Folder",
                                "versions_control_advanced": true,
                                "volume_id": -2003
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2003",
                                "name": "Admin\u0027s Home"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2003\/nodes",
                                "name": "Admin\u0027s Home"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/2003",
                                "name": "Admin\u0027s Home"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/2003\/nodes",
                                "name": "Admin\u0027s Home"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=1501259&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/1389036\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 2,
                                "create_date": "2016-07-19T15:44:48",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "eded",
                                "description_multilingual": {
                                    "de_DE": "eded",
                                    "en": ""
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 1389036,
                                "mime_type": null,
                                "modify_date": "2018-12-05T20:37:39",
                                "modify_user_id": 1000,
                                "name": "Dropdown test",
                                "name_multilingual": {
                                    "de_DE": "",
                                    "en": "Dropdown test"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 2003,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 2,
                                "size_formatted": "2 Items",
                                "summary": [""],
                                "type": 0,
                                "type_name": "Folder",
                                "versions_control_advanced": true,
                                "volume_id": -2003
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2003",
                                "name": "Admin\u0027s Home"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2003\/nodes",
                                "name": "Admin\u0027s Home"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/2003",
                                "name": "Admin\u0027s Home"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/2003\/nodes",
                                "name": "Admin\u0027s Home"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=1389036&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/11848235\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": ""
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 14,
                                "create_date": "2018-02-01T01:11:06",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "",
                                "description_multilingual": {
                                    "en": ""
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 11848235,
                                "mime_type": null,
                                "modify_date": "2018-12-09T20:36:28",
                                "modify_user_id": 1000,
                                "name": "Collect-Test",
                                "name_multilingual": {
                                    "en": "Collect-Test"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 10879731,
                                "permissions_model": "simple",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 14,
                                "size_formatted": "14 Items",
                                "summary": [""],
                                "type": 298,
                                "type_name": "Collection",
                                "versions_control_advanced": true,
                                "volume_id": -2000
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2000",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/10879731",
                                "name": "000 yamini"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2000\/nodes",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999\/nodes",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/10879731\/nodes",
                                "name": "000 yamini"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/10879731",
                                "name": "000 yamini"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/10879731\/nodes",
                                "name": "000 yamini"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=11848235&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }]
                }
            }));

            mocks.push(mockjax({
                url: "//server/otcs/cs/api/v1/volumes/141",
                responseText: {}
            }));

            mocks.push(mockjax({
                url: "//server/otcs/cs/api/v1/volumes/142",
                responseText: {}
            }));

            mocks.push(mockjax({
                url: "//server/otcs/cs/api/v2/members/targets?fields=properties&fields=versions.element(0)&expand=properties%7Boriginal_id%7D&orderBy=asc_type&actions=",
                responseText: {
                    "collection": {
                        "paging": {
                            "limit": 10,
                            "links": {
                                "next": {
                                    "body": "",
                                    "content_type": "",
                                    "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=2&where=*&cache_id=2002384794",
                                    "method": "GET",
                                    "name": "Next"
                                }
                            },
                            "page": 1,
                            "page_total": 1939,
                            "range_max": 10,
                            "range_min": 1,
                            "result_header_string": "Results 1 to 10 of 19380 sorted by Relevance",
                            "total_count": 19380
                        },
                        "searching": {
                            "cache_id": 2002384794,
                            "facets": {
                                "available": [{
                                    "count": 55,
                                    "count_exceeded": false,
                                    "display_name": "Creation Date",
                                    "facet_items": [{
                                        "count": 199,
                                        "display_name": "Last 3 days",
                                        "value": "lz3d"
                                    }, {
                                        "count": 376,
                                        "display_name": "Last 2 weeks",
                                        "value": "ly2w"
                                    }, {
                                        "count": 1849,
                                        "display_name": "Last 2 months",
                                        "value": "lx2m"
                                    }, {
                                        "count": 4984,
                                        "display_name": "Last 6 months",
                                        "value": "lw6m"
                                    }, {
                                        "count": 11899,
                                        "display_name": "Last 12 months",
                                        "value": "lv1y"
                                    }, {
                                        "count": 16792,
                                        "display_name": "Last 3 years",
                                        "value": "lu3y"
                                    }, {
                                        "count": 19092,
                                        "display_name": "Last 5 years",
                                        "value": "lt5y"
                                    }, {
                                        "count": 288,
                                        "display_name": "Older",
                                        "value": "ls5o"
                                    }],
                                    "name": "OTCreateDate",
                                    "type": "Date"
                                }, {
                                    "count": 110,
                                    "count_exceeded": false,
                                    "display_name": "Content Type",
                                    "facet_items": [{
                                        "count": 11339,
                                        "display_name": "Document",
                                        "value": "144"
                                    }, {
                                        "count": 2991,
                                        "display_name": "Folder",
                                        "value": "0"
                                    }, {
                                        "count": 1163,
                                        "display_name": "Wiki Page",
                                        "value": "5574"
                                    }, {
                                        "count": 743,
                                        "display_name": "MicroPost",
                                        "value": "1281"
                                    }, {
                                        "count": 470,
                                        "display_name": "Category",
                                        "value": "131"
                                    }, {
                                        "count": 323,
                                        "display_name": "ActiveView",
                                        "value": "30309"
                                    }, {
                                        "count": 300,
                                        "display_name": "Shortcut",
                                        "value": "1"
                                    }, {
                                        "count": 263,
                                        "display_name": "Wiki",
                                        "value": "5573"
                                    }, {
                                        "count": 205,
                                        "display_name": "URL",
                                        "value": "140"
                                    }, {
                                        "count": 164,
                                        "display_name": "Forum Topics & Replies",
                                        "value": "123470"
                                    }, {
                                        "count": 150,
                                        "display_name": "Asset Folder",
                                        "value": "955"
                                    }, {
                                        "count": 124,
                                        "display_name": "Collection",
                                        "value": "298"
                                    }, {
                                        "count": 109,
                                        "display_name": "Task List",
                                        "value": "204"
                                    }, {
                                        "count": 75,
                                        "display_name": "Business Workspace",
                                        "value": "848"
                                    }, {
                                        "count": 70,
                                        "display_name": "LiveReport",
                                        "value": "299"
                                    }, {
                                        "count": 55,
                                        "display_name": "RM Classification",
                                        "value": "551"
                                    }, {
                                        "count": 54,
                                        "display_name": "Email Folder",
                                        "value": "751"
                                    }, {
                                        "count": 51,
                                        "display_name": "Workflow Map",
                                        "value": "128"
                                    }, {
                                        "count": 44,
                                        "display_name": "Task",
                                        "value": "206"
                                    }, {
                                        "count": 41,
                                        "display_name": "Search Query",
                                        "value": "258"
                                    }],
                                    "name": "OTSubType",
                                    "type": "Text"
                                }, {
                                    "count": 56,
                                    "count_exceeded": false,
                                    "display_name": "File Type",
                                    "facet_items": [{
                                        "count": 3774,
                                        "display_name": "Text",
                                        "value": "Text"
                                    }, {
                                        "count": 3737,
                                        "display_name": "Picture",
                                        "value": "Picture"
                                    }, {
                                        "count": 3140,
                                        "display_name": "Folder",
                                        "value": "Folder"
                                    }, {
                                        "count": 2786,
                                        "display_name": "Photo",
                                        "value": "Photo"
                                    }, {
                                        "count": 1613,
                                        "display_name": "Microsoft Word",
                                        "value": "Microsoft Word"
                                    }, {
                                        "count": 1366,
                                        "display_name": "Adobe PDF",
                                        "value": "Adobe PDF"
                                    }, {
                                        "count": 1263,
                                        "display_name": "UNKNOWN",
                                        "value": "UNKNOWN"
                                    }, {
                                        "count": 1021,
                                        "display_name": "Microsoft Excel",
                                        "value": "Microsoft Excel"
                                    }, {
                                        "count": 743,
                                        "display_name": "Blog",
                                        "value": "Blog"
                                    }, {
                                        "count": 501,
                                        "display_name": "Classification",
                                        "value": "Classification"
                                    }, {
                                        "count": 318,
                                        "display_name": "ActiveView",
                                        "value": "ActiveView"
                                    }, {
                                        "count": 309,
                                        "display_name": "Graphics",
                                        "value": "Graphics"
                                    }, {
                                        "count": 296,
                                        "display_name": "Microsoft PowerPoint",
                                        "value": "Microsoft PowerPoint"
                                    }, {
                                        "count": 262,
                                        "display_name": "Web Page",
                                        "value": "Web Page"
                                    }, {
                                        "count": 161,
                                        "display_name": "Task",
                                        "value": "Task"
                                    }, {
                                        "count": 99,
                                        "display_name": "JPEG",
                                        "value": "JPEG"
                                    }, {
                                        "count": 94,
                                        "display_name": "Software Report",
                                        "value": "Software Report"
                                    }, {
                                        "count": 93,
                                        "display_name": "Compressed Archive",
                                        "value": "Compressed Archive"
                                    }, {
                                        "count": 66,
                                        "display_name": "Workflow",
                                        "value": "Workflow"
                                    }, {
                                        "count": 64,
                                        "display_name": "Video ",
                                        "value": "Video"
                                    }],
                                    "name": "OTFileType",
                                    "type": "Text"
                                }, {
                                    "count": 39,
                                    "count_exceeded": false,
                                    "display_name": "Classification",
                                    "facet_items": [{
                                        "count": 1534,
                                        "display_name": "MyClassification : Class1",
                                        "value": "1707840 2067849 2067850"
                                    }, {
                                        "count": 1407,
                                        "display_name": "MyClassification : Class 2",
                                        "value": "1707840 2067849 2120757"
                                    }, {
                                        "count": 963,
                                        "display_name": "Hyd-Classifications : Class1",
                                        "value": "1707840 9442390 15741379"
                                    }, {
                                        "count": 646,
                                        "display_name": "Classifications : Rm33",
                                        "value": "1707840 15741269"
                                    }, {
                                        "count": 577,
                                        "display_name": "Classifications : CWS classification tree",
                                        "value": "1707840 18121785"
                                    }, {
                                        "count": 349,
                                        "display_name": "CTree1 : C2",
                                        "value": "1707840 6271898 6272669"
                                    }, {
                                        "count": 206,
                                        "display_name": "RMClassification_testing_children : RM1",
                                        "value": "1707840 13815265 13815485"
                                    }, {
                                        "count": 188,
                                        "display_name": "CTree1 : C1",
                                        "value": "1707840 6271898 6272668"
                                    }, {
                                        "count": 76,
                                        "display_name": "CTree1 : C3",
                                        "value": "1707840 6271898 6272670"
                                    }, {
                                        "count": 68,
                                        "display_name": "ClassificationType : classificationSubType2",
                                        "value": "1707840 8750617 8750177"
                                    }, {
                                        "count": 46,
                                        "display_name": "Classifications : CTree1",
                                        "value": "1707840 6271898"
                                    }, {
                                        "count": 43,
                                        "display_name": "Classifications : Hyd-Classifications",
                                        "value": "1707840 9442390"
                                    }, {
                                        "count": 41,
                                        "display_name": "RMClassification_testing_children : RM3",
                                        "value": "1707840 13815265 13815925"
                                    }, {
                                        "count": 39,
                                        "display_name": "Classifications : test RM classification",
                                        "value": "1707840 12605817"
                                    }, {
                                        "count": 25,
                                        "display_name": "Hyd-Classifications : ~!@#$%^&*()_+|}{\u0022?><,.\/;\u0027[]\\==-` &lt; &gt; &nbsp; &amp; <SCRIPT> var pos=document.URL.indexOf(\u0022name=\u0022)+5; document.write(document.URL.substring(pos,document.URL.length)); <\/SCRIPT><script>alert(\u0022Hahaha\u0022);<\/script>",
                                        "value": "1707840 9442390 9442391"
                                    }, {
                                        "count": 24,
                                        "display_name": "RM Classifications : Finance",
                                        "value": "1707840 17863744 17863745"
                                    }, {
                                        "count": 12,
                                        "display_name": "test RM classification : 1",
                                        "value": "1707840 12605817 13289777"
                                    }],
                                    "name": "OTClassificationTree",
                                    "type": "Text"
                                }, {
                                    "count": 110,
                                    "count_exceeded": false,
                                    "display_name": "Container",
                                    "facet_items": [{
                                        "count": 895,
                                        "display_name": "Enterprise Workspace : 200 Documents",
                                        "value": "1275805"
                                    }, {
                                        "count": 401,
                                        "display_name": "Enterprise Workspace : Performance",
                                        "value": "191152"
                                    }, {
                                        "count": 289,
                                        "display_name": "Perspectives",
                                        "value": "388851"
                                    }, {
                                        "count": 245,
                                        "display_name": "000000Test HTML tile creation12 : Wiki container",
                                        "value": "11359205"
                                    }, {
                                        "count": 185,
                                        "display_name": "Comments for - 00000_55715 (3675682)",
                                        "value": "132097"
                                    }, {
                                        "count": 166,
                                        "display_name": "Enterprise Workspace : 007 Hyderabad",
                                        "value": "604999"
                                    }, {
                                        "count": 150,
                                        "display_name": "Perspective Assets",
                                        "value": "11019211"
                                    }, {
                                        "count": 150,
                                        "display_name": "assets_15185970638447420062166032542 : HTMLWidgetContentWiki",
                                        "value": "12231365"
                                    }, {
                                        "count": 147,
                                        "display_name": "Admin\u0027s Home : Large Folder",
                                        "value": "73279"
                                    }, {
                                        "count": 135,
                                        "display_name": "Enterprise Workspace",
                                        "value": "2000"
                                    }, {
                                        "count": 134,
                                        "display_name": "Comments for - 00000_55715 (3675682) : profile-photos",
                                        "value": "135406"
                                    }, {
                                        "count": 131,
                                        "display_name": "A Cost Analysis : 12345",
                                        "value": "293056"
                                    }, {
                                        "count": 127,
                                        "display_name": "Enterprise Workspace : A Cost Analysis",
                                        "value": "205659"
                                    }, {
                                        "count": 124,
                                        "display_name": "Kristen Home : 12345",
                                        "value": "567205"
                                    }, {
                                        "count": 120,
                                        "display_name": "Enterprise Workspace : Thoms",
                                        "value": "19835776"
                                    }, {
                                        "count": 110,
                                        "display_name": "assets_15186032722549366004128151315 : HTMLWidgetContentWiki",
                                        "value": "12234295"
                                    }, {
                                        "count": 106,
                                        "display_name": "Admin\u0027s Home",
                                        "value": "2003"
                                    }, {
                                        "count": 103,
                                        "display_name": "00 Navya Test folder : Test nodestable widget options",
                                        "value": "17879132"
                                    }, {
                                        "count": 101,
                                        "display_name": "00 Navya Test folder : 100 folders",
                                        "value": "8230344"
                                    }, {
                                        "count": 100,
                                        "display_name": "Subfolder02 : SFolder_02",
                                        "value": "12342928"
                                    }],
                                    "name": "OTParentID",
                                    "type": "Text"
                                }]
                            },
                            "result_title": "Search Results for: *"
                        },
                        "sorting": {
                            "links": {
                                "asc_OTObjectDate": {
                                    "body": "",
                                    "content_type": "",
                                    "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=1&where=*&cache_id=2002384794&sort=asc_OTObjectDate",
                                    "method": "GET",
                                    "name": "Date (Ascending)"
                                },
                                "asc_OTObjectSize": {
                                    "body": "",
                                    "content_type": "",
                                    "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=1&where=*&cache_id=2002384794&sort=asc_OTObjectSize",
                                    "method": "GET",
                                    "name": "Size (Ascending)"
                                },
                                "desc_OTObjectDate": {
                                    "body": "",
                                    "content_type": "",
                                    "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=1&where=*&cache_id=2002384794&sort=desc_OTObjectDate",
                                    "method": "GET",
                                    "name": "Date (Descending)"
                                },
                                "desc_OTObjectSize": {
                                    "body": "",
                                    "content_type": "",
                                    "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=1&where=*&cache_id=2002384794&sort=desc_OTObjectSize",
                                    "method": "GET",
                                    "name": "Size (Descending)"
                                },
                                "relevance": {
                                    "body": "",
                                    "content_type": "",
                                    "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=1&where=*&cache_id=2002384794",
                                    "method": "GET",
                                    "name": "Relevance"
                                }
                            }
                        }
                    },
                    "links": {
                        "data": {
                            "self": {
                                "body": "",
                                "content_type": "",
                                "href": "\/api\/v2\/search?actions=open&actions=download&expand=properties{original_id,owner_user_id,create_user_id,owner_id,reserved_user_id}&limit=10&options=highlight_summaries&options=facets&page=1&where=*&cache_id=2002384794",
                                "method": "GET",
                                "name": ""
                            }
                        }
                    },
                    "results": [{
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/19785506\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 5,
                                "create_date": "2018-11-07T20:34:42",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "Attempting to set focus to a hidden element causes an error in Internet Explorer. Take care to only use .focus() on elements that are visible. To run an element\u0027s focus event handlers without setting focus to the element, use .triggerHandler( \u0022focus\u0022 ) instead of .focus().\nAttempting to set focus to a hidden element causes an error in Internet Explorer. Take care to only use .focus() on elements that are visible. To run an element\u0027s focus event handlers without setting focus to the element, use .triggerHandler( \u0022focus\u0022 ) instead of .focus().",
                                "description_multilingual": {
                                    "en": "Attempting to set focus to a hidden element causes an error in Internet Explorer. Take care to only use .focus() on elements that are visible. To run an element\u0027s focus event handlers without setting focus to the element, use .triggerHandler( \u0022focus\u0022 ) instead of .focus().\nAttempting to set focus to a hidden element causes an error in Internet Explorer. Take care to only use .focus() on elements that are visible. To run an element\u0027s focus event handlers without setting focus to the element, use .triggerHandler( \u0022focus\u0022 ) instead of .focus()."
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 19785506,
                                "mime_type": null,
                                "modify_date": "2018-12-10T17:40:33",
                                "modify_user_id": 1000,
                                "name": "bala test 0001",
                                "name_multilingual": {
                                    "en": "bala test 0001"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 11445223,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 5,
                                "size_formatted": "5 Items",
                                "summary": [""],
                                "type": 0,
                                "type_name": "Folder",
                                "versions_control_advanced": true,
                                "volume_id": -2000
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2000",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/11445223",
                                "name": "000 Bala"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2000\/nodes",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999\/nodes",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/11445223\/nodes",
                                "name": "000 Bala"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/11445223",
                                "name": "000 Bala"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/11445223\/nodes",
                                "name": "000 Bala"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=19785506&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/11123387\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 24,
                                "create_date": "2017-08-02T00:15:15",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "gnhkjgk\nkjhjj\ngjhghj\nhjkh",
                                "description_multilingual": {
                                    "de_DE": "",
                                    "en": "gnhkjgk\nkjhjj\ngjhghj\nhjkh"
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 11123387,
                                "mime_type": null,
                                "modify_date": "2018-12-09T22:52:36",
                                "modify_user_id": 1000,
                                "name": "234-12",
                                "name_multilingual": {
                                    "de_DE": "Empty",
                                    "en": "234-12"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 10879731,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 24,
                                "size_formatted": "24 Items",
                                "summary": [""],
                                "type": 0,
                                "type_name": "Folder",
                                "versions_control_advanced": true,
                                "volume_id": -2000
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2000",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/10879731",
                                "name": "000 yamini"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2000\/nodes",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999\/nodes",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/10879731\/nodes",
                                "name": "000 yamini"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/10879731",
                                "name": "000 yamini"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/10879731\/nodes",
                                "name": "000 yamini"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=11123387&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/6774268\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": false,
                                "container_size": 0,
                                "create_date": "2018-04-19T23:45:39",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "mfkhgk",
                                "description_multilingual": {
                                    "en": "mfkhgk"
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 14091915,
                                "mime_type": null,
                                "modify_date": "2018-12-05T20:28:00",
                                "modify_user_id": 1000,
                                "name": "shortcut to Ravi folder 111222",
                                "name_multilingual": {
                                    "en": "shortcut to Ravi folder 111222"
                                },
                                "original_id": 6774268,
                                "original_id_expand": {
                                    "container": true,
                                    "container_size": 33,
                                    "create_date": "2017-08-06T22:21:40",
                                    "create_user_id": 1000,
                                    "description": "dfdfdfdfdf",
                                    "description_multilingual": {
                                        "de_DE": "sds dsds dsd",
                                        "en": "dfdfdfdfdf",
                                        "ja": ""
                                    },
                                    "external_create_date": null,
                                    "external_identity": "",
                                    "external_identity_type": "",
                                    "external_modify_date": null,
                                    "external_source": "",
                                    "favorite": false,
                                    "id": 6774268,
                                    "mime_type": null,
                                    "modify_date": "2018-12-03T18:22:06",
                                    "modify_user_id": 1000,
                                    "name": "006 Bhaskar Bonthala",
                                    "name_multilingual": {
                                        "de_DE": "006 Bhaskar Bonthala",
                                        "en": "006 Bhaskar Bonthala",
                                        "ja": "006 Bhaskar Bonthala"
                                    },
                                    "owner": "istrator, Admin",
                                    "owner_group_id": 1001,
                                    "owner_user_id": 1000,
                                    "parent_id": 604999,
                                    "permissions_model": "advanced",
                                    "reserved": false,
                                    "reserved_date": null,
                                    "reserved_shared_collaboration": false,
                                    "reserved_user_id": 0,
                                    "size": 33,
                                    "size_formatted": "33 Items",
                                    "type": 0,
                                    "type_name": "Folder",
                                    "versions_control_advanced": true,
                                    "volume_id": -2000,
                                    "wnd_att_7bgpv_5": null,
                                    "wnd_comments": null
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 10879731,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": null,
                                "size_formatted": "",
                                "summary": [""],
                                "type": 1,
                                "type_name": "Shortcut",
                                "versions_control_advanced": true,
                                "volume_id": -2000
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2000",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/10879731",
                                "name": "000 yamini"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2000\/nodes",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999\/nodes",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/10879731\/nodes",
                                "name": "000 yamini"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/10879731",
                                "name": "000 yamini"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/10879731\/nodes",
                                "name": "000 yamini"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=14091915&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "download": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/13962996\/content?download",
                                    "method": "GET",
                                    "name": "Download"
                                },
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/13962996\/content",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open", "download"]
                        },
                        "data": {
                            "properties": {
                                "container": false,
                                "container_size": 0,
                                "create_date": "2018-04-17T10:03:45",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "a",
                                "description_multilingual": {
                                    "en": "a"
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 13962996,
                                "mime_type": "image\/gif",
                                "modify_date": "2018-12-05T20:28:01",
                                "modify_user_id": 1000,
                                "name": "2018-03-19_New Labels.gif_renme",
                                "name_multilingual": {
                                    "en": "2018-03-19_New Labels.gif_renme"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 12729103,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 13364,
                                "size_formatted": "14 KB",
                                "summary": [""],
                                "type": 144,
                                "type_name": "Document",
                                "versions_control_advanced": true,
                                "volume_id": -2000
                            },
                            "versions": {
                                "create_date": "2018-04-17T10:03:45",
                                "description": null,
                                "file_create_date": "2018-04-17T10:03:45",
                                "file_modify_date": "2018-04-17T10:03:45",
                                "file_name": "2018-03-19_New Labels.gif",
                                "file_size": 13364,
                                "file_type": "gif",
                                "id": 13962996,
                                "locked": false,
                                "locked_date": null,
                                "locked_user_id": null,
                                "mime_type": "image\/gif",
                                "modify_date": "2018-04-17T10:03:45",
                                "name": "2018-03-19_New Labels.gif",
                                "owner_id": 1000,
                                "provider_id": 13962996,
                                "version_id": 13962996,
                                "version_number": 1,
                                "version_number_major": 0,
                                "version_number_minor": 1,
                                "version_number_name": "1"
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2000",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/749454",
                                "name": "00_Aihua\u0027s Folder"
                            }, {
                                "href": "api\/v1\/nodes\/12729103",
                                "name": "000_subfolder"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2000\/nodes",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/749454\/nodes",
                                "name": "00_Aihua\u0027s Folder"
                            }, {
                                "href": "api\/v1\/nodes\/12729103\/nodes",
                                "name": "000_subfolder"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/12729103",
                                "name": "000_subfolder"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/12729103\/nodes",
                                "name": "000_subfolder"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": true,
                            "object_href": null,
                            "object_id": "DataId=13962996&Version=1",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {},
                            "map": {
                                "default_action": ""
                            },
                            "order": []
                        },
                        "data": {
                            "properties": {
                                "container": false,
                                "container_size": 0,
                                "create_date": "2018-03-12T01:34:43",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "DSD",
                                "description_multilingual": {
                                    "en": "DSD"
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 18890205,
                                "mime_type": null,
                                "modify_date": "2018-10-16T19:43:30",
                                "modify_user_id": 1000,
                                "name": "Req_TKL_MV",
                                "name_multilingual": {
                                    "en": "Req_TKL_MV"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 616849,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 673,
                                "size_formatted": "",
                                "summary": [""],
                                "type": 131,
                                "type_name": "Category",
                                "versions_control_advanced": true,
                                "volume_id": -2004
                            },
                            "versions": {
                                "create_date": "2018-03-12T01:35:46",
                                "description": null,
                                "file_create_date": null,
                                "file_modify_date": null,
                                "file_name": "Req_TKL_MV",
                                "file_size": 673,
                                "file_type": null,
                                "id": 18890205,
                                "locked": false,
                                "locked_date": null,
                                "locked_user_id": null,
                                "mime_type": null,
                                "modify_date": "2018-03-12T01:35:46",
                                "name": "Req_TKL_MV",
                                "owner_id": 1000,
                                "provider_id": 12863085,
                                "version_id": 18890206,
                                "version_number": 1,
                                "version_number_major": 0,
                                "version_number_minor": 1,
                                "version_number_name": "1"
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2004",
                                "name": "Categories Volume"
                            }, {
                                "href": "api\/v1\/nodes\/616849",
                                "name": "000 Hyderabad"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2004\/nodes",
                                "name": "Categories Volume"
                            }, {
                                "href": "api\/v1\/nodes\/616849\/nodes",
                                "name": "000 Hyderabad"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/616849",
                                "name": "000 Hyderabad"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/616849\/nodes",
                                "name": "000 Hyderabad"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": true,
                            "object_href": null,
                            "object_id": "DataId=18890205&Version=1",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {},
                            "map": {
                                "default_action": ""
                            },
                            "order": []
                        },
                        "data": {
                            "properties": {
                                "container": false,
                                "container_size": 0,
                                "create_date": "2018-03-12T01:34:43",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "DSD",
                                "description_multilingual": {
                                    "en": "DSD",
                                    "ja": ""
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 12863085,
                                "mime_type": null,
                                "modify_date": "2018-10-08T20:29:22",
                                "modify_user_id": 1000,
                                "name": "Req_TKL_MV",
                                "name_multilingual": {
                                    "en": "",
                                    "ja": "Req_TKL_MV"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 7247375,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 673,
                                "size_formatted": "",
                                "summary": [""],
                                "type": 131,
                                "type_name": "Category",
                                "versions_control_advanced": true,
                                "volume_id": -2004
                            },
                            "versions": {
                                "create_date": "2018-03-12T01:35:46",
                                "description": null,
                                "file_create_date": null,
                                "file_modify_date": null,
                                "file_name": "Req_TKL_MV",
                                "file_size": 673,
                                "file_type": null,
                                "id": 12863085,
                                "locked": false,
                                "locked_date": null,
                                "locked_user_id": null,
                                "mime_type": null,
                                "modify_date": "2018-03-12T01:35:46",
                                "name": "Req_TKL_MV",
                                "owner_id": 1000,
                                "provider_id": 12863085,
                                "version_id": 12863085,
                                "version_number": 1,
                                "version_number_major": 0,
                                "version_number_minor": 1,
                                "version_number_name": "1"
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2004",
                                "name": "Categories Volume"
                            }, {
                                "href": "api\/v1\/nodes\/616849",
                                "name": "000 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/7247375",
                                "name": "00 MultiValueAttributes"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2004\/nodes",
                                "name": "Categories Volume"
                            }, {
                                "href": "api\/v1\/nodes\/616849\/nodes",
                                "name": "000 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/7247375\/nodes",
                                "name": "00 MultiValueAttributes"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/7247375",
                                "name": "00 MultiValueAttributes"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/7247375\/nodes",
                                "name": "00 MultiValueAttributes"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": true,
                            "object_href": null,
                            "object_id": "DataId=12863085&Version=1",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/7459895\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 0,
                                "create_date": "2017-08-29T07:57:27",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "uk",
                                "description_multilingual": {
                                    "de_DE": "uk"
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 7459895,
                                "mime_type": null,
                                "modify_date": "2018-12-05T20:41:11",
                                "modify_user_id": 1000,
                                "name": "f12",
                                "name_multilingual": {
                                    "de_DE": "f12"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 526340,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 0,
                                "size_formatted": "0 Items",
                                "summary": [""],
                                "type": 0,
                                "type_name": "Folder",
                                "versions_control_advanced": true,
                                "volume_id": -2003
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2003",
                                "name": "Admin\u0027s Home"
                            }, {
                                "href": "api\/v1\/nodes\/526340",
                                "name": "aFolder"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2003\/nodes",
                                "name": "Admin\u0027s Home"
                            }, {
                                "href": "api\/v1\/nodes\/526340\/nodes",
                                "name": "aFolder"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/526340",
                                "name": "aFolder"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/526340\/nodes",
                                "name": "aFolder"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=7459895&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/1501259\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 14,
                                "create_date": "2016-07-28T10:18:01",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "1st 2nd 4th\nlinehttp:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/20031st linehttp:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/20031st linehttp:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003",
                                "description_multilingual": {
                                    "de_DE": "",
                                    "en": "1st 2nd 4th\nlinehttp:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/20031st linehttp:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/20031st linehttp:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003http:\/\/murdock.opentext.com\/alpha\/cs.exe\/app\/nodes\/2003"
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 1501259,
                                "mime_type": null,
                                "modify_date": "2018-12-05T20:37:39",
                                "modify_user_id": 1000,
                                "name": "00 Navya test folder2",
                                "name_multilingual": {
                                    "de_DE": "Navya\u0027s folder",
                                    "en": "00 Navya test folder2"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 2003,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 14,
                                "size_formatted": "14 Items",
                                "summary": [""],
                                "type": 0,
                                "type_name": "Folder",
                                "versions_control_advanced": true,
                                "volume_id": -2003
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2003",
                                "name": "Admin\u0027s Home"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2003\/nodes",
                                "name": "Admin\u0027s Home"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/2003",
                                "name": "Admin\u0027s Home"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/2003\/nodes",
                                "name": "Admin\u0027s Home"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=1501259&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/1389036\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": "open"
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 2,
                                "create_date": "2016-07-19T15:44:48",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "eded",
                                "description_multilingual": {
                                    "de_DE": "eded",
                                    "en": ""
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 1389036,
                                "mime_type": null,
                                "modify_date": "2018-12-05T20:37:39",
                                "modify_user_id": 1000,
                                "name": "Dropdown test",
                                "name_multilingual": {
                                    "de_DE": "",
                                    "en": "Dropdown test"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 2003,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 2,
                                "size_formatted": "2 Items",
                                "summary": [""],
                                "type": 0,
                                "type_name": "Folder",
                                "versions_control_advanced": true,
                                "volume_id": -2003
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2003",
                                "name": "Admin\u0027s Home"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2003\/nodes",
                                "name": "Admin\u0027s Home"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/2003",
                                "name": "Admin\u0027s Home"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/2003\/nodes",
                                "name": "Admin\u0027s Home"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=1389036&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }, {
                        "actions": {
                            "data": {
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/11848235\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                }
                            },
                            "map": {
                                "default_action": ""
                            },
                            "order": ["open"]
                        },
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 14,
                                "create_date": "2018-02-01T01:11:06",
                                "create_user_id": 1000,
                                "create_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "description": "",
                                "description_multilingual": {
                                    "en": ""
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 11848235,
                                "mime_type": null,
                                "modify_date": "2018-12-09T20:36:28",
                                "modify_user_id": 1000,
                                "name": "Collect-Test",
                                "name_multilingual": {
                                    "en": "Collect-Test"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "owner_user_id_expand": {
                                    "birth_date": "1900-10-31T00:00:00",
                                    "business_email": "nkuchana@opentext.com",
                                    "business_fax": "67352895",
                                    "business_phone": "+78-5847684656500",
                                    "cell_phone": "+49-987654321",
                                    "deleted": false,
                                    "first_name": "Admin",
                                    "gender": null,
                                    "group_id": 2426,
                                    "home_address_1": null,
                                    "home_address_2": null,
                                    "home_fax": null,
                                    "home_phone": null,
                                    "id": 1000,
                                    "initials": "A",
                                    "last_name": "istrator",
                                    "middle_name": null,
                                    "name": "Admin",
                                    "name_formatted": "Admin",
                                    "office_location": "Hyderabad",
                                    "pager": null,
                                    "personal_email": null,
                                    "personal_interests": null,
                                    "personal_url_1": null,
                                    "personal_url_2": null,
                                    "personal_url_3": null,
                                    "personal_website": null,
                                    "photo_id": 0,
                                    "photo_url": null,
                                    "time_zone": 6,
                                    "title": "Murdock Administrator ",
                                    "type": 0,
                                    "type_name": "User"
                                },
                                "parent_id": 10879731,
                                "permissions_model": "simple",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "short_summary": [""],
                                "size": 14,
                                "size_formatted": "14 Items",
                                "summary": [""],
                                "type": 298,
                                "type_name": "Collection",
                                "versions_control_advanced": true,
                                "volume_id": -2000
                            }
                        },
                        "links": {
                            "ancestors": [{
                                "href": "api\/v1\/nodes\/2000",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/10879731",
                                "name": "000 yamini"
                            }],
                            "ancestors_nodes": [{
                                "href": "api\/v1\/nodes\/2000\/nodes",
                                "name": "Enterprise Workspace"
                            }, {
                                "href": "api\/v1\/nodes\/604999\/nodes",
                                "name": "007 Hyderabad"
                            }, {
                                "href": "api\/v1\/nodes\/10879731\/nodes",
                                "name": "000 yamini"
                            }],
                            "parent": {
                                "href": "api\/v1\/nodes\/10879731",
                                "name": "000 yamini"
                            },
                            "parent_nodes": {
                                "href": "api\/v1\/nodes\/10879731\/nodes",
                                "name": "000 yamini"
                            }
                        },
                        "search_result_metadata": {
                            "current_version": null,
                            "object_href": null,
                            "object_id": "DataId=11848235&Version=0",
                            "result_type": "264",
                            "source_id": "20945700",
                            "version_type": null
                        }
                    }]
                }
            }));

            mocks.push(mockjax({
                url: "//server/otcs/cs/api/v2/nodes/6774268?fields=properties",
                responseText: {
                    "links": {
                        "data": {
                            "self": {
                                "body": "",
                                "content_type": "",
                                "href": "/api/v2/nodes/6774268?fields=properties",
                                "method": "GET",
                                "name": ""
                            }
                        }
                    },
                    "results": {
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 33,
                                "create_date": "2017-08-06T22:21:40",
                                "create_user_id": 1000,
                                "description": "dfdfdfdfdf",
                                "description_multilingual": {
                                    "de_DE": "sds dsds dsd",
                                    "en": "dfdfdfdfdf",
                                    "ja": ""
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 6774268,
                                "mime_type": null,
                                "modify_date": "2018-12-03T18:22:06",
                                "modify_user_id": 1000,
                                "name": "006 Bhaskar Bonthala",
                                "name_multilingual": {
                                    "de_DE": "006 Bhaskar Bonthala",
                                    "en": "006 Bhaskar Bonthala",
                                    "ja": "006 Bhaskar Bonthala"
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "parent_id": 604999,
                                "permissions_model": "advanced",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "size": 33,
                                "size_formatted": "33 Items",
                                "type": 0,
                                "type_name": "Folder",
                                "versions_control_advanced": true,
                                "volume_id": -2000,
                                "wnd_att_7bgpv_5": null,
                                "wnd_comments": null
                            }
                        }
                    }
                }
            }));

            mocks.push(mockjax({
                url: "//server/otcs/cs/api/v2/nodes/11848235?fields=properties",
                responseText: {
                    "links": {
                        "data": {
                            "self": {
                                "body": "",
                                "content_type": "",
                                "href": "/api/v2/nodes/11848235?fields=properties",
                                "method": "GET",
                                "name": ""
                            }
                        }
                    },
                    "results": {
                        "data": {
                            "properties": {
                                "container": true,
                                "container_size": 14,
                                "create_date": "2018-02-01T01:11:06",
                                "create_user_id": 1000,
                                "description": "",
                                "description_multilingual": {
                                    "de_DE": "",
                                    "en": "",
                                    "ja": ""
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 11848235,
                                "mime_type": null,
                                "modify_date": "2018-12-10T22:42:01",
                                "modify_user_id": 1000,
                                "name": "Collect-Test",
                                "name_multilingual": {
                                    "de_DE": "",
                                    "en": "Collect-Test",
                                    "ja": ""
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "parent_id": 10879731,
                                "permissions_model": "simple",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "size": 14,
                                "size_formatted": "14 Items",
                                "type": 298,
                                "type_name": "Collection",
                                "versions_control_advanced": true,
                                "volume_id": -2000,
                                "wnd_att_1d5mb_2": null,
                                "wnd_comments": null
                            }
                        }
                    }
                }
            }));

            mocks.push(mockjax({
                url: "//server/otcs/cs/api/v1/nodes/11848235/nodes?extra=false&actions=false&expand=node&commands=addcategory&commands=addversion&commands=default&commands=open&commands=browse&commands=copy&commands=delete&commands=download&commands=ZipAndDownload&commands=edit&commands=editactivex&commands=editofficeonline&commands=editwebdav&commands=favorite&commands=nonfavorite&commands=rename&commands=move&commands=permissions&commands=favorite_rename&commands=reserve&commands=unreserve&commands=description&commands=thumbnail&commands=savefilter&commands=editpermissions&commands=collectionCanCollect&commands=removefromcollection&limit=30&page=1&sort=asc_type",
                responseText: {
                    "links": {
                        "data": {
                            "self": {
                                "body": "",
                                "content_type": "",
                                "href": "\/api\/v2\/nodes\/16087849?actions=addcategory&actions=addversion&actions=open&actions=copy&actions=delete&actions=download&actions=ZipAndDownload&actions=edit&actions=editactivex&actions=editofficeonline&actions=rename&actions=move&actions=permissions&actions=properties&actions=reserve&actions=unreserve&actions=collectioncancollect&actions=removefromcollection&actions=comment&actions=setasdefaultpage&actions=unsetasdefaultpage&expand=properties{original_id}&fields=columns&fields=properties&fields=versions{mime_type,owner_id}.element(0)&metadata",
                                "method": "GET",
                                "name": ""
                            }
                        }
                    },
                    "results": {
                        "actions": {
                            "data": {
                                "addcategory": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/16087849\/categories",
                                    "method": "POST",
                                    "name": "Add Category"
                                },
                                "collectionCanCollect": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "",
                                    "method": "GET",
                                    "name": "Collection can collect"
                                },
                                "copy": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "\/api\/v2\/forms\/nodes\/copy?id=16087849",
                                    "href": "\/api\/v2\/nodes",
                                    "method": "POST",
                                    "name": "Copy"
                                },
                                "delete": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/16087849",
                                    "method": "DELETE",
                                    "name": "Delete"
                                },
                                "move": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "\/api\/v2\/forms\/nodes\/move?id=16087849",
                                    "href": "\/api\/v2\/nodes\/16087849",
                                    "method": "PUT",
                                    "name": "Move"
                                },
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/16087849\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                },
                                "permissions": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "",
                                    "method": "",
                                    "name": "Permissions"
                                },
                                "properties": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/16087849",
                                    "method": "GET",
                                    "name": "Properties"
                                },
                                "rename": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "\/api\/v2\/forms\/nodes\/rename?id=16087849",
                                    "href": "\/api\/v2\/nodes\/16087849",
                                    "method": "PUT",
                                    "name": "Rename"
                                }
                            },
                            "map": {
                                "default_action": "",
                                "more": ["properties"]
                            },
                            "order": ["open", "collectionCanCollect", "addcategory", "rename", "copy", "move", "permissions", "delete"]
                        },
                        "data": {
                            "columns": [{
                                "data_type": 906,
                                "key": "type",
                                "name": "Type",
                                "sort_key": "x61031"
                            }, {
                                "data_type": 906,
                                "key": "name",
                                "name": "Name",
                                "sort_key": "x61028"
                            }, {
                                "data_type": 906,
                                "key": "size_formatted",
                                "name": "Size",
                                "sort_key": "x61029"
                            }, {
                                "data_type": 906,
                                "key": "modify_date",
                                "name": "Modified",
                                "sort_key": "x61027"
                            }, {
                                "data_type": 2,
                                "key": "wnd_comments",
                                "name": "Comments"
                            }],
                            "properties": {
                                "container": true,
                                "container_size": 0,
                                "create_date": "2018-07-18T19:38:25",
                                "create_user_id": 1000,
                                "description": "",
                                "description_multilingual": {
                                    "de_DE": "",
                                    "en": "",
                                    "ja": ""
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 16087849,
                                "mime_type": null,
                                "modify_date": "2018-12-03T18:22:19",
                                "modify_user_id": 1000,
                                "name": "collection",
                                "name_multilingual": {
                                    "de_DE": "",
                                    "en": "collection",
                                    "ja": ""
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "parent_id": 11445223,
                                "permissions_model": "simple",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "size": 0,
                                "size_formatted": "0 Items",
                                "type": 298,
                                "type_name": "Collection",
                                "versions_control_advanced": true,
                                "volume_id": -2000,
                                "wnd_comments": null
                            }
                        },
                        "metadata": {
                            "properties": {
                                "container": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "container",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Container",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": 5,
                                    "type_name": "Boolean",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "container_size": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "container_size",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Container Size",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "create_date": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "include_time": true,
                                    "key": "create_date",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Created",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": -7,
                                    "type_name": "Date",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "create_user_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "create_user_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Created By",
                                    "persona": "user",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "description": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "description",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": true,
                                    "multilingual": true,
                                    "name": "Description",
                                    "password": false,
                                    "persona": "",
                                    "read_only": false,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "external_create_date": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "include_time": true,
                                    "key": "external_create_date",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "External Create Date",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": -7,
                                    "type_name": "Date",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "external_identity": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "external_identity",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": false,
                                    "multilingual": false,
                                    "name": "External Identity",
                                    "password": false,
                                    "persona": "",
                                    "read_only": true,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "external_identity_type": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "external_identity_type",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": false,
                                    "multilingual": false,
                                    "name": "External Identity Type",
                                    "password": false,
                                    "persona": "",
                                    "read_only": true,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "external_modify_date": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "include_time": true,
                                    "key": "external_modify_date",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "External Modify Date",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": -7,
                                    "type_name": "Date",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "external_source": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "external_source",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": false,
                                    "multilingual": false,
                                    "name": "External Source",
                                    "password": false,
                                    "persona": "",
                                    "read_only": true,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "favorite": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "favorite",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Favorite",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": 5,
                                    "type_name": "Boolean",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "ID",
                                    "persona": "node",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "modify_date": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "include_time": true,
                                    "key": "modify_date",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Modified",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": -7,
                                    "type_name": "Date",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "modify_user_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "modify_user_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Modified By",
                                    "persona": "user",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "name": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "name",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": false,
                                    "multilingual": true,
                                    "name": "Name",
                                    "password": false,
                                    "persona": "",
                                    "read_only": false,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "owner": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "owner",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": false,
                                    "multilingual": false,
                                    "name": "Owner",
                                    "password": false,
                                    "persona": "",
                                    "read_only": true,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "owner_group_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "owner_group_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Owned By",
                                    "persona": "group",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "owner_user_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "owner_user_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Owned By",
                                    "persona": "user",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "parent_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "parent_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Parent ID",
                                    "persona": "node",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "reserved": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "reserved",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Reserved",
                                    "persona": "",
                                    "read_only": false,
                                    "required": false,
                                    "type": 5,
                                    "type_name": "Boolean",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "reserved_date": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "include_time": true,
                                    "key": "reserved_date",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Reserved",
                                    "persona": "",
                                    "read_only": false,
                                    "required": false,
                                    "type": -7,
                                    "type_name": "Date",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "reserved_user_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "reserved_user_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Reserved By",
                                    "persona": "member",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "type": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "type",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Type",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "type_name": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "type_name",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": false,
                                    "multilingual": false,
                                    "name": "Type",
                                    "password": false,
                                    "persona": "",
                                    "read_only": true,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "versions_control_advanced": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "versions_control_advanced",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Versions Control Advanced",
                                    "persona": "",
                                    "read_only": false,
                                    "required": false,
                                    "type": 5,
                                    "type_name": "Boolean",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "volume_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "volume_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "VolumeID",
                                    "persona": "node",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                }
                            }
                        },
                        "metadata_map": {},
                        "metadata_order": {
                            "properties": ["id", "type", "type_name", "name", "description", "parent_id", "volume_id", "create_date", "create_user_id", "modify_date", "modify_user_id", "owner_user_id", "owner_group_id", "reserved", "reserved_date", "reserved_user_id", "versions_control_advanced", "container", "container_size", "favorite", "external_create_date", "external_modify_date", "external_source", "external_identity", "external_identity_type", "owner"]
                        },
                        "perspective": {
                            "canEditPerspective": true,
                            "options": {
                                "rows": [{
                                    "columns": [{
                                        "heights": {
                                            "xs": "full"
                                        },
                                        "sizes": {
                                            "md": 12
                                        },
                                        "widget": {
                                            "options": {},
                                            "type": "nodestable"
                                        }
                                    }]
                                }]
                            },
                            "type": "grid"
                        }
                    }
                }
            }));

            mocks.push(mockjax({
                url: "//server/otcs/cs/api/v1/nodes/11848235/nodes?extra=false&actions=false&expand=node&commands=addcategory&commands=addversion&commands=default&commands=open&commands=browse&commands=copy&commands=delete&commands=download&commands=ZipAndDownload&commands=edit&commands=editactivex&commands=editofficeonline&commands=editwebdav&commands=favorite&commands=nonfavorite&commands=rename&commands=move&commands=permissions&commands=properties&commands=favorite_rename&commands=reserve&commands=unreserve&commands=description&commands=thumbnail&commands=savefilter&commands=editpermissions&commands=collectionCanCollect&commands=removefromcollection&limit=30&page=1&sort=asc_type",
                responseText: {
                    "links": {
                        "data": {
                            "self": {
                                "body": "",
                                "content_type": "",
                                "href": "\/api\/v2\/nodes\/16087849?actions=addcategory&actions=addversion&actions=open&actions=copy&actions=delete&actions=download&actions=ZipAndDownload&actions=edit&actions=editactivex&actions=editofficeonline&actions=rename&actions=move&actions=permissions&actions=properties&actions=reserve&actions=unreserve&actions=collectioncancollect&actions=removefromcollection&actions=comment&actions=setasdefaultpage&actions=unsetasdefaultpage&expand=properties{original_id}&fields=columns&fields=properties&fields=versions{mime_type,owner_id}.element(0)&metadata",
                                "method": "GET",
                                "name": ""
                            }
                        }
                    },
                    "results": {
                        "actions": {
                            "data": {
                                "addcategory": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/16087849\/categories",
                                    "method": "POST",
                                    "name": "Add Category"
                                },
                                "collectionCanCollect": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "",
                                    "method": "GET",
                                    "name": "Collection can collect"
                                },
                                "copy": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "\/api\/v2\/forms\/nodes\/copy?id=16087849",
                                    "href": "\/api\/v2\/nodes",
                                    "method": "POST",
                                    "name": "Copy"
                                },
                                "delete": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/16087849",
                                    "method": "DELETE",
                                    "name": "Delete"
                                },
                                "move": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "\/api\/v2\/forms\/nodes\/move?id=16087849",
                                    "href": "\/api\/v2\/nodes\/16087849",
                                    "method": "PUT",
                                    "name": "Move"
                                },
                                "open": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/16087849\/nodes",
                                    "method": "GET",
                                    "name": "Open"
                                },
                                "permissions": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "",
                                    "method": "",
                                    "name": "Permissions"
                                },
                                "properties": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "",
                                    "href": "\/api\/v2\/nodes\/16087849",
                                    "method": "GET",
                                    "name": "Properties"
                                },
                                "rename": {
                                    "body": "",
                                    "content_type": "",
                                    "form_href": "\/api\/v2\/forms\/nodes\/rename?id=16087849",
                                    "href": "\/api\/v2\/nodes\/16087849",
                                    "method": "PUT",
                                    "name": "Rename"
                                }
                            },
                            "map": {
                                "default_action": "",
                                "more": ["properties"]
                            },
                            "order": ["open", "collectionCanCollect", "addcategory", "rename", "copy", "move", "permissions", "delete"]
                        },
                        "data": {
                            "columns": [{
                                "data_type": 906,
                                "key": "type",
                                "name": "Type",
                                "sort_key": "x61031"
                            }, {
                                "data_type": 906,
                                "key": "name",
                                "name": "Name",
                                "sort_key": "x61028"
                            }, {
                                "data_type": 906,
                                "key": "size_formatted",
                                "name": "Size",
                                "sort_key": "x61029"
                            }, {
                                "data_type": 906,
                                "key": "modify_date",
                                "name": "Modified",
                                "sort_key": "x61027"
                            }, {
                                "data_type": 2,
                                "key": "wnd_comments",
                                "name": "Comments"
                            }],
                            "properties": {
                                "container": true,
                                "container_size": 0,
                                "create_date": "2018-07-18T19:38:25",
                                "create_user_id": 1000,
                                "description": "",
                                "description_multilingual": {
                                    "de_DE": "",
                                    "en": "",
                                    "ja": ""
                                },
                                "external_create_date": null,
                                "external_identity": "",
                                "external_identity_type": "",
                                "external_modify_date": null,
                                "external_source": "",
                                "favorite": false,
                                "id": 16087849,
                                "mime_type": null,
                                "modify_date": "2018-12-03T18:22:19",
                                "modify_user_id": 1000,
                                "name": "collection",
                                "name_multilingual": {
                                    "de_DE": "",
                                    "en": "collection",
                                    "ja": ""
                                },
                                "owner": "istrator, Admin",
                                "owner_group_id": 1001,
                                "owner_user_id": 1000,
                                "parent_id": 11445223,
                                "permissions_model": "simple",
                                "reserved": false,
                                "reserved_date": null,
                                "reserved_shared_collaboration": false,
                                "reserved_user_id": 0,
                                "size": 0,
                                "size_formatted": "0 Items",
                                "type": 298,
                                "type_name": "Collection",
                                "versions_control_advanced": true,
                                "volume_id": -2000,
                                "wnd_comments": null
                            }
                        },
                        "metadata": {
                            "properties": {
                                "container": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "container",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Container",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": 5,
                                    "type_name": "Boolean",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "container_size": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "container_size",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Container Size",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "create_date": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "include_time": true,
                                    "key": "create_date",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Created",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": -7,
                                    "type_name": "Date",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "create_user_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "create_user_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Created By",
                                    "persona": "user",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "description": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "description",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": true,
                                    "multilingual": true,
                                    "name": "Description",
                                    "password": false,
                                    "persona": "",
                                    "read_only": false,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "external_create_date": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "include_time": true,
                                    "key": "external_create_date",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "External Create Date",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": -7,
                                    "type_name": "Date",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "external_identity": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "external_identity",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": false,
                                    "multilingual": false,
                                    "name": "External Identity",
                                    "password": false,
                                    "persona": "",
                                    "read_only": true,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "external_identity_type": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "external_identity_type",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": false,
                                    "multilingual": false,
                                    "name": "External Identity Type",
                                    "password": false,
                                    "persona": "",
                                    "read_only": true,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "external_modify_date": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "include_time": true,
                                    "key": "external_modify_date",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "External Modify Date",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": -7,
                                    "type_name": "Date",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "external_source": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "external_source",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": false,
                                    "multilingual": false,
                                    "name": "External Source",
                                    "password": false,
                                    "persona": "",
                                    "read_only": true,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "favorite": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "favorite",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Favorite",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": 5,
                                    "type_name": "Boolean",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "ID",
                                    "persona": "node",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "modify_date": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "include_time": true,
                                    "key": "modify_date",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Modified",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": -7,
                                    "type_name": "Date",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "modify_user_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "modify_user_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Modified By",
                                    "persona": "user",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "name": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "name",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": false,
                                    "multilingual": true,
                                    "name": "Name",
                                    "password": false,
                                    "persona": "",
                                    "read_only": false,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "owner": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "owner",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": false,
                                    "multilingual": false,
                                    "name": "Owner",
                                    "password": false,
                                    "persona": "",
                                    "read_only": true,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "owner_group_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "owner_group_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Owned By",
                                    "persona": "group",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "owner_user_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "owner_user_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Owned By",
                                    "persona": "user",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "parent_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "parent_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Parent ID",
                                    "persona": "node",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "reserved": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "reserved",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Reserved",
                                    "persona": "",
                                    "read_only": false,
                                    "required": false,
                                    "type": 5,
                                    "type_name": "Boolean",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "reserved_date": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "include_time": true,
                                    "key": "reserved_date",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Reserved",
                                    "persona": "",
                                    "read_only": false,
                                    "required": false,
                                    "type": -7,
                                    "type_name": "Date",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "reserved_user_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "reserved_user_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Reserved By",
                                    "persona": "member",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "type": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "type",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "Type",
                                    "persona": "",
                                    "read_only": true,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "type_name": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "type_name",
                                    "key_value_pairs": false,
                                    "max_length": null,
                                    "min_length": null,
                                    "multi_value": false,
                                    "multiline": false,
                                    "multilingual": false,
                                    "name": "Type",
                                    "password": false,
                                    "persona": "",
                                    "read_only": true,
                                    "regex": "",
                                    "required": false,
                                    "type": -1,
                                    "type_name": "String",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "versions_control_advanced": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "versions_control_advanced",
                                    "key_value_pairs": false,
                                    "multi_value": false,
                                    "name": "Versions Control Advanced",
                                    "persona": "",
                                    "read_only": false,
                                    "required": false,
                                    "type": 5,
                                    "type_name": "Boolean",
                                    "valid_values": [],
                                    "valid_values_name": []
                                },
                                "volume_id": {
                                    "allow_undefined": false,
                                    "bulk_shared": false,
                                    "default_value": null,
                                    "description": null,
                                    "hidden": false,
                                    "key": "volume_id",
                                    "key_value_pairs": false,
                                    "max_value": null,
                                    "min_value": null,
                                    "multi_value": false,
                                    "name": "VolumeID",
                                    "persona": "node",
                                    "read_only": false,
                                    "required": false,
                                    "type": 2,
                                    "type_name": "Integer",
                                    "valid_values": [],
                                    "valid_values_name": []
                                }
                            }
                        },
                        "metadata_map": {},
                        "metadata_order": {
                            "properties": ["id", "type", "type_name", "name", "description", "parent_id", "volume_id", "create_date", "create_user_id", "modify_date", "modify_user_id", "owner_user_id", "owner_group_id", "reserved", "reserved_date", "reserved_user_id", "versions_control_advanced", "container", "container_size", "favorite", "external_create_date", "external_modify_date", "external_source", "external_identity", "external_identity_type", "owner"]
                        },
                        "perspective": {
                            "canEditPerspective": true,
                            "options": {
                                "rows": [{
                                    "columns": [{
                                        "heights": {
                                            "xs": "full"
                                        },
                                        "sizes": {
                                            "md": 12
                                        },
                                        "widget": {
                                            "options": {},
                                            "type": "nodestable"
                                        }
                                    }]
                                }]
                            },
                            "type": "grid"
                        }
                    }
                }
            }));

            mocks.push(mockjax({
                url: "//server/otcs/cs/api/v1/nodes/11848235/ancestors",
                responseText: {
                    "ancestors": [{
                            "name": "Enterprise Workspace",
                            "volume_id": -2000,
                            "parent_id": -1,
                            "type": 141,
                            "id": 2000,
                            "type_name": "Enterprise Workspace"
                        },
                        {
                            "name": "007 Hyderabad",
                            "volume_id": -2000,
                            "parent_id": 2000,
                            "type": 0,
                            "id": 604999,
                            "type_name": "Folder"
                        },
                        {
                            "name": "000 yamini",
                            "volume_id": -2000,
                            "parent_id": 604999,
                            "type": 0,
                            "id": 10879731,
                            "type_name": "Folder"
                        },
                        {
                            "name": "Collect-Test",
                            "volume_id": -2000,
                            "parent_id": 10879731,
                            "type": 298,
                            "id": 11848235,
                            "type_name": "Collection"
                        }
                    ]
                }
            }));

            mocks.push(mockjax({
                url: "//server/otcs/cs/api/v2/nodes/19785506",
                responseText: {}
            }));
        },


        disable: function () {
            var mock;
            while ((mock = mocks.pop()) != null) {
                mockjax.clear(mock);
            }
        }
    };
});