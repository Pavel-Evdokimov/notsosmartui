# HeaderView (widgets/header)

The header view provides a summary of the selected workspace. It provides multiple
sections that can be configured in the perspective configuration like title, workspace
type, info, description, workspace icon and a section to embed a child view like the
commenting view.

# Example

    var contentRegion = new Marionette.Region({el: "body"}),
        pageContext = new PageContext(),
        header = new HeaderView({
            context: pageContext,
            data: {
                iconFileTypes: 'image/png',
                iconFileSize: '512000',
                workspace: {
                    properties: {
                        title: 'Workspace Title',
                        type: 'Workspace Type',
                        description: 'Workspace Description'
                    }
                },
                widget:{
                    type: 'activityfeed'
                }
            }
        });

    contentRegion.show(header);
    pageContext.fetch();

# Parameters

## options

context
: The page context

data
: The header configuration data

### data

iconFileTypes
: Defines the file types that are allowed to upload. They are used to filter the HTML file input
  element. The defaults are the same as supported by the server.

iconFileSize
: Defines the maximum upload file size. The default of 1000000 bytes matches the server setting and is used
  to render a hint to the user.

workspace
: The header view can display workspace metadata information. There are different sections
  in the metadata area that can be configured to display e.g. node, business object or category
  properties.

widget
: Another section in the header is reserved to embed a child view to display other related
workspace information.

#### workspace

title
: Header title usually used to display the workspace title. Replacement tags are supported with the
  following syntax:

  - {name}
  : Displays the workspace node property 'name'.

  - {categories.20368_2}
  : Displays the value of the workspace category with the id '20368' and the field id '2'.

  - {business_properties.workspace_type_name}
  : Displays the workspace type name that is configured for the business workspace type.

type
: The type area is usually used to display the workspace type. Replacement tags are supported.

description
: Configurable area to display a workspace description. Replacement tags are supported.

#### widget

type
: Defines the child view type in the standard style. Following widgets are supported:

	- 'activityfeed'
	: Displays the activity events for the workspace and its children with the default options:
	
		options: {
			feedtype: 'all',
			feedsize: 10,
			feedSettings: {
				enableComments: true,
				enableFilters: false
			},
			hideExpandIcon: true
		}

# Configuration

The header view is configured within the perspective configuration. See sample below.

    ...
    "header": {
        "widget": {
            "type": "conws/widgets/header",
            "options": {
                "workspace": {
                    "properties": {
                        "title": "{name}",
                        "type": "{business_properties.workspace_type_name}",
                        "description": "{categories.23228_18_1_19} {categories.23228_18_1_21}. {categories.23228_2_1_8}"
                    }
                }
            }
        }
    ...
