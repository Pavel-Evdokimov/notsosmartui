# MyWorkspacesView (widgets/myworkspaces)

  The my workspaces view provides a list of workspaces of a passed workspace type.
  It allows for filtering on the workspaces by opening a search field and entering filter criteria.
  Clicking on a single workspaces opens the default action for the workspace.
  The icon displayed in the header is the standard icon for business workspaces. If a specific icon
  for the workspace is configured in the server, this icon is used.

  The models and "query properties" like filtering, sorting, ... are independent for the collapsed and
  expanded view of the widget. For example in case a filter is set in the collapsed view, this has no 
  influence in case the expanded view is opened.
  
## Collapsed view:

The workspaces are sorted by recently usage.
It allows for filtering on the workspaces by name with the search field.
In case it's scrolled down in the collapsed view, the next workspaces are fetched from server.

## Expanded view:

The expanded view shows the columns:
*    type: The default icon for the business workspace
*    name: The business workspace name
*    size: The size of the business workspace
*    modify_date: The modify date of the business workspace
*    favorite: Interactive icon that indicates if the business workspace is part of user favorites

Additionally custom columns are configurable.  
Important: For all columns the "Column availability" must be set to "Available everywhere" in Content Server.

Filtering works on all columns and custom columns of type string (e.g. name).

Sorting is possible for the workspace name and the custom columns where "sortable" is enabled in the server.

# Example

      var contentRegion = new Marionette.Region({el: '#content'}),
          pageContext = new PageContext(),
          myWorkspacesView = new MyWorkspacesView({
              "context": pageContext,
              "data": {
                  "title": "Sales Opportunity",
                  "workspaceTypeId": 1,
                  "collapsedView":{
                      "noResultsPlaceholder": "There are no sales opportunities to display."
                  },
                  "expandedView": {
                      "orderBy": {
                        "sortColumn": "{name}",
                        "sortOrder": "desc"
                      }
                      "customColumns": [
                          {
                              "key": "{wnf_att_141g_5}"
                          },
                          {
                              "key": "{wnf_att_141g_4}"
                          }
                      ]
                  }
              }
          });

      contentRegion.show(myWorkspacesView);
      pageContext.fetch();

# Parameters

## options

context
: The page context

data
: The common widget configuration

### data

workspaceTypeId
: The id of workspace type of the displayed workspaces. In case a specific icon is configured for the
  workspace type, this is used in the header.
  
title
: The displayed widget header title.

collapsedView
: The configuration for the collapsed view.

expandedView
: The configuration for the expanded view

#### collapsedView

noResultsPlaceholder
: Optional parameter - Message displayed in case there are no proper workspaces available

#### expandedView

orderBy
: Optional parameter - A custom sort order of the displayed workspaces in the expanded view
  (order in collapsed view is not configurable). It's possible to sort by all sortable columns
  e.g. by workspace name: { "sortColumn": "{name}", "sortOrder": "asc"} (default).

customColumns
: The custom columns to be displayed in the expanded view in curly braces.
  the columns appear between the modify_date and favorite columns.
  Additionally, custom workspace columns can be specified here
  Some columns exists that are displayed by default (cannot be changed):
*    *type*: The default icon for the business workspace (not the configured one), for this no header is displayed
*    *name*: The business workspace name
*    *size*: The size of the business workspace
*    *modify_date*: The modify date of the business workspace
*    *favorite*: Icon that indicates if the business workspace is part of user favorites, for this no header is displayed

##### customColumns

key
: The identifier of the custom column, e.g. "{wnf_att_141g_5}"
