# SidePanelView (controls/side.panel)

Shows a panel sliding from left/right based on configuration provided. Sidepanel can be used to show a single view inside it or multiple views (as steps) provided to it. If steps provided to the panel, it will show navigation buttons on footer along with button provided to the respective step.


### Example

      var pageContext = new PageContext(), // holds the model
          favoritesView = new FavoritesView({context: pageContext});
      pageContext.fetch();

      var sidePanel = new SidePanelView({
        slides: [{
            title: 'Search',
            content: favoritesView,
            buttons: [{
              label: 'Search',
              type: 'action',
              className: 'binf-btn binf-btn-primary'
            }]
          }
        ]
      });
      sidePanel.show();

## Constructor Summary

### constructor(options)

  Creates a new SidePanelView.

#### Parameters:
* `options` - *Object* The view's options object.
* `options.connection.url` - *String* url to authenticate against.
* `options.connection.supportPath` - *String* support path directory.

#### Returns:

  The newly created object instance.

## Events

### before:show

### after:show

### before:hide

### after:hide

### show:slide
This event will be fired before showing a slide
#### Parameters:
* `slide` - 
* `slideIndex` - 

### shown:slide
 This event will be fired after showing a slide
#### Parameters:
* `slide` - 
* `slideIndex` - 

## API

### show

### hide

### destroy

### updateButton

#### Example:

  See the [SidePanelView](#) object for an example.



## Localizations Summary

The following localization keys are used
