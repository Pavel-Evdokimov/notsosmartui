# TeamView (widgets/team)

 The team view provides an overview of the roles and members of the selected workspace. The
 collapsed view can be configured to be displayed in a workspace perspective and displays a list
 of team members and empty roles. The expanded view provides a list for all members and a list for
 all roles. In the expanded view the members and roles can also be edited.

# Example

    var contentRegion = new Marionette.Region({el: "body"}),
        pageContext = new PageContext(),
        team = new TeamView({
            context: pageContext,
            data: {
                title: 'Team',
                titleBarIcon: 'title-icon title-team',
                showTitleIcon: true,
                showWorkspaceIcon: false
            }
        });

    contentRegion.show(team);
    pageContext.fetch();

# Parameters

## options

context
: The page context

data
: The team configuration data

### data

title
: Defines the title of the collapsed view.

titleBarIcon
: Defines the default titlebar icon for the view.

showTitleIcon
: Defines whether to show the titlebar icon or not.

showWorkspaceIcon
: Defines whether to show the default titlebar icon or to show the workspace icon. This only
applies to the expanded view.

# Configuration

The team view is configured within the perspective configuration. See sample below.

    ...
    "tabs": [
      {
        "colums":[
          {
            "sizes": {
              "lg": 4,
              "md": 5,
              "sm": 6
            },
            "widget": {
              "type": "conws/widgets/team",
              "data": {
                "title": "Team",
                "titleBarIcon": "title-icon title-team",
                "showTitleIcon": true,
                "showWorkspaceIcon": false
              }
            }
          }
        ],
        "title": "Overview"
      }
    ]
    ...
