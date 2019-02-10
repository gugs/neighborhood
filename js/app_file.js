

var initMap = function() {

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('main'), {
    center: {lat: -7.221367, lng: -35.888176},
    zoom: 13,
    mapTypeControl: false
  });

  this.largeInfowindow = new google.maps.InfoWindow({maxWidth: 150});

  // Style the markers a bit. This will be our marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');
  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FF0000');
  //Style the marker when clicked
  var clickedIcon = makeMarkerIcon('FFE500');
  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations().length; i++) {
    // Get the position from the location array.
    var position = locations()[i].location;
    var title = locations()[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon
    });

    marker.clicked = false;

    function resetMarkers() {
      console.log("reset");
      markers.forEach(function(m){
        if(m.clicked) {
          m.clicked = false;
          m.setIcon(defaultIcon);
        }
      });
    }

    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      map.setCenter(this.getPosition());
      resetMarkers();
      this.clicked = true;
      populateInfoWindow(this, largeInfowindow);
      this.setIcon(clickedIcon);
    });
    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      if( this.clicked === false) {
        this.setIcon(highlightedIcon);
      }
    });
    marker.addListener('mouseout', function() {
      if( this.clicked === false) {
        this.setIcon(defaultIcon);
      }
    });
  }

  showPlaces();

};


ko.applyBindings(new viewModel());
