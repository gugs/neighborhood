var map;

// Empty markers list
var markers = [];

// Set of markers with some parameters like: title and location(lat/lng)
var locations = ko.observableArray([
    {
      title: 'Brennand Institute',
      location: {lat: -8.064923447876673, lng: -34.96304512023926},
      show: ko.observable(true)
    },
    {
      title: 'Cristo Redentor',
      location: {lat: -22.947204, lng: -43.203899},
      show: ko.observable(true)
    },
    {
      title: 'Palácio do Planalto',
      location: {lat: -15.799007, lng: -47.861966},
      show: ko.observable(true)
    },
    {
      title: 'Farol do Cabo Branco',
      location: {lat: -7.148667070076936, lng: -34.797393681696775},
      show: ko.observable(true)
    },
    {
      title: 'Museu de Arte Popular da Paraíba',
      location: {lat: -7.223999317879056, lng: -35.87894640162092},
      show: ko.observable(true)
    }
  ]);

var initMap = function() 
{

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('main'), {
    center: {lat: 14.2350, lng: 51.9253},
    zoom: 13,
    mapTypeControl: false
  });

  this.largeInfowindow = new google.maps.InfoWindow({maxWidth: 150});

  // Markers style - Default Icon, Highlighted and Clicked
  var defaultIcon = makeMarkerIcon('0091ff');
  var highlightedIcon = makeMarkerIcon('FF0000');
  var clickedIcon = makeMarkerIcon('FFE500');

  // Set places in the markers from location list
  for (var i = 0; i < locations().length; i++) 
  {
    var position = locations()[i].location;
    var title = locations()[i].title;
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

    // Set location and add listener event to the markers
    markers.push(marker);
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

// Handle exception concern Google's API 
function gm_authFailure()
{
  alert('Error in auth process! Check you client ID.');
}

function showPlaces() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }

  var viewModel = function() {
    self = this;
    self.query = ko.observable("");
    this.query.subscribe(function(newValue){
        newValue = newValue.toLowerCase();
        for(var i=0; i < locations().length; i++){
            if(locations()[i].title.toLowerCase().indexOf(newValue) >= 0) {
              locations()[i].show(true);
              markers[i].setVisible(true);
            } else {
              locations()[i].show(false);
              markers[i].setVisible(false);
            }
          }
    }, this);
  
    this.listClick = function() {
      for(var i=0; i < markers.length; i++) {
        if (markers[i]['title'] == this.title) {
          google.maps.event.trigger(markers[i], 'click');
          return;
        }
      }
    };
  }

// Populate infoWindow with foursquare location's description acquired
function populateInfoWindow(marker, infowindow) 
{
    if (infowindow.marker != marker) 
    {
      infowindow.marker = marker;
      var url = "https://api.foursquare.com/v2/venues/search?ll=" + marker.position.lat() + 
      "," + marker.position.lng() + "&client_id=G1ZA0AFLPJYQFVCGOO33DZ5CBMGHF34R24LW4LJJHOR" +
      "3RJW5&client_secret=LB353RXSJ20CZJFYPTBWAIPMYWUKBHMACMRYHIUVIXNJDZAN&v=20190210";
  
      // Get VENUE_ID of selected place
      $.ajax({
        url: url,
        dataType: "jsonp",
        success: function(response){
          var venue_id = response.response.venues[0].id;
          var venue_url = "https://api.foursquare.com/v2/venues/" + venue_id + 
          "?client_id=G1ZA0AFLPJYQFVCGOO33DZ5CBMGHF34R24LW4LJJHOR3RJW5&client_secret=" +
          "LB353RXSJ20CZJFYPTBWAIPMYWUKBHMACMRYHIUVIXNJDZAN&v=20190210";
          //Requests informations from the 4Square Venue
          $.ajax({
            url: venue_url,
            dataType: "jsonp",
            success: function(response){
              infowindow.setContent('<h2>' + marker.title + '</h2><br><p>' + 
              response.response.venue.description + '</p><br><b> by FourSquare </b>');
            },
            error: function(){
              infowindow.setContent("Information cannot be loaded!");
            }
          });
        },
        error: function(){
          infowindow.setContent("Information cannot be loaded!");
        }
      });
  
      infowindow.addListener('closeclick', function() {
        marker.clicked = false;
        marker.setIcon(makeMarkerIcon('0091ff'));
        infowindow.marker = null;
      });
      infowindow.open(map, marker);
    }
  }
  
  // Places markers to display in the map
  function showPlaces() {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }
  
  // Adjust marker's style
  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  }

ko.applyBindings(new viewModel());
