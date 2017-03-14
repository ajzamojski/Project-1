


/*			**************** NOTES *************************
							TO DO
	-----------------------------------------------------
				Todos/Ideas/Issues.
	
	Hi guys. How are you making out with the snow?  Here are some thoughts and outstanding issues I came up with.  If anyone wants to tackle any one item or sees something else that needs attention it would be a good idea to just comment on slack so we're all on the same page and not wasting time.

	General:
		
	1. For some reason when map is initally hidden it takes a long time to load when submit is clicked.
		When map is loaded when the page loads its fine.
		Does anyone have issue with always showing the map?
		If we do it would help solve the sticky footer issue and some other issues I'm having with the code.			
	2. How do we want inform/display to user if the search has no results?
	
	3. Optional. Maybe instead of infowindows for markers we could have a panel (see mockup pictures) which also could be usee to show directions in.

	4. When done we need to make sure all html, css, and js is clean, formatted nice, and commented.	



	Issues we need to work on I can think of.  Add if you know of more.

	Front-End

		1. Map responsiveness issue.
		2. How do we want inform/display to user if search has no results?
		3. Footer if still an issue.
		4. Optional. Maybe instead of infowindows for markers we should have a panel (see picture) which we could also show directions in.


	Back-End

		1.) New Search Clear Markers
		2.) draw/center map based on location not marker
				notes:
				look in queryYelp drawMap() call
				geolocation centered on location
				yelp centered on marker


		2a.) vertical map radius (zoom) distance is off since map is more wide than tall.
				notes:
				to test draw circle on map of radius.
				then recalculate zoom to fit.	
		
		3.) In info window location address array loop.
				notes:
				console.log results.businsess array in yelp ajax.
				look at location.display_address.

		4.) Add 'error' callback function to ajax calls.
			
		Optional.) Directions:
			maybe have panel with query result info, 
			then when click directions text direction populate panel?
		
---------------------------------------------------------------------------------------------------
		Note
		1.) Inherent issue with yelp radius search. If business "service area" or "delivery area"
		is within your search radius. Business shows up in search.
		
	
	------------------------------------------------------		
							
		Check if variable need to be global 

		
			

*/

/*==============================================================================
================================ Variables ====================================
===============================================================================*/


var latitude;
var longitude;
var radius;
var zipCode;

//This is the map on the page.
var map; 
var geoFlag = false;


/*==============================================================================
================================ Functions ====================================
===============================================================================*/

$(document).ready(function()
{
	// $("#googleMap").hide();
	

	//prevent unwanted characters from being entered
	 $(function () 
	 {
		$('#searchInput').keydown(function (e) 
		{
			if (e.shiftKey || e.ctrlKey || e.altKey) 
			{
				e.preventDefault();
			} 
			else 
			{
				var key = e.keyCode;
				if (!((key == 8) || (key == 32) || (key == 46) || (key >= 35 && key <= 40) || (key >= 65 && key <= 90)))
				{
				 	e.preventDefault();
				}
			}
		});
	 });//END prevent numbers

    
    $(function () 
    {
    	$('#locationInput').keydown(function (e) 
    	{
    		if (e.shiftKey || e.ctrlKey || e.altKey) {
   			e.preventDefault();
   		} 
   		else 
   		{
   			 var key = e.keyCode;
   			 if (!((key == 8) || (key == 32) || (key == 188)|| (key == 46) || (key >= 35 && key <= 40) || (key >= 48 && key <= 105))) 
   			 {
    			e.preventDefault();
   			 }
    	}
    	});
    });//END 

	
	$("#submitTopic").on('click', function(event){
		
		event.preventDefault();

		// $("#googleMap").show();

		//NEED TO CHECK INPUTS FOR VALIDITY
		var searchTerm = $("#searchInput").val().trim();
		var locationInput = $("#locationInput").val().trim();        
		var radius = parseInt($("#radius").val());

		
		//if locationInput is blank, use zipcode from geolocation in search.
		if(locationInput === "")
		{
			place = zipCode;
			geoFlag = true;
		}
		else
		{
			place = locationInput;
			geoFlag = false;
		}
					
		queryYelp(searchTerm, place, radius);


	});//END #submitTopic.on("click")


	// Triggers modal for instructions
	$("#myBtn").click(function(){
        $("#myModal").modal();
    });

});//END document.ready


//========================================= runGoogle Query ===============================
	
/*Yelp search query is sorted by 'rating' in which "The rating sort is not strictly sorted by 
the rating value, but by an adjusted rating value that takes into account the number of 
ratings, similar to a bayesian average. This is so a business with 1 rating of 5 stars 
doesn’t immediately jump to the top.". 
*/
function queryYelp(searchTerm, place, radius) 
{	

	const YELP_HEROKU_ENDPOINT = "https://floating-fortress-53764.herokuapp.com/"

	var queryURL = YELP_HEROKU_ENDPOINT + "?term=" + searchTerm + "&location="+ place + "&radius="+ radiusToMeters(radius);

console.log("queryURL: " + queryURL);

	$.ajax({
	      url: queryURL,
	      method: "GET"
    }).done(function(response) {

    	var yelpBusinessesArray = JSON.parse(response).businesses;

    	//contains object data of first element 'best' in response.businesses
    	var best = yelpBusinessesArray[0];

    	if(!geoFlag)
    	{
    		drawMap(best.coordinates.latitude, best.coordinates.longitude, radius); 
    	}
    	
    	addMarker(best, searchTerm);

    });
}//END queryYelp()
//============================= drawMap =============================================


// Use Google Maps API to display a map of given parameters.
function drawMap(latitude, longitude, radius) 
{	
	var uluru = {lat: latitude, lng: longitude};
	
	var zoom = radiusToZoom(radius);
	
	map = new google.maps.Map(document.getElementById('googleMap'),
	{
		zoom: zoom,
		center: uluru
	});

}//END drawMap()

//============================= drawMap =============================================

//When page first loads this is called via <script> tag in html.
//Initally generic map is displayed of center USA showing whole country.
//If geolocation is detected map is displayed based on that location
//with a radius of about 5 miles.
function initMap() 
{

	//Inital map displayed coordinates of center of US.
	latitude = 39.8282;
	longitude = -98.5795;
	radius = 1000;
	drawMap(latitude, longitude, radius);

//If goeloaction is detected display map of users locaction.
	if(navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(function(position)
		{
			latitude = position.coords.latitude;
          	longitude = position.coords.longitude;
          	radius = 5;
          	revGeoCode();//This assign global variable zipCode from latitiude and longitude.
          	drawMap(latitude, longitude, radius);
             
        });  
    }    
}//END initMap()

//=============================================================

//Converts radius in miles to approx zoom #
function radiusToZoom(radius)
{
    return Math.round(14-Math.log(radius)/Math.LN2);
}

//=============================================================

//Converts miles to meters for radius
function radiusToMeters(radius)
{
	return parseInt((radius * 1000)/.62);
}

//====================================================================

//Used Google API geocode to assign zipCode a zip code from latitue and longitude.
function revGeoCode()
{

	const GOOGLE_GEOCODE_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
	const GOOGLE_API_KEY = "&key=AIzaSyDr-DLJtSliHGOsZhoI76ETn6jsk8kVYGo";
	
	//corrdinates string used in endpoint from latitude and longitude
	var coordinates = latitude + "," + longitude;

	//REVERSE GEOCODE LOOK UP 
	var geocodeUrl = GOOGLE_GEOCODE_ENDPOINT + coordinates + "&result_type=postal_code" + GOOGLE_API_KEY;

	$.ajax(
	{
		url: geocodeUrl,
		method: "GET"

	})
	.done (function(response)
	{			
		zipCode = response.results[0].address_components[0].long_name;					
	});//END ajax
		
}// END revGeoCode()

//=============================================================================


function addMarker(bestData, searchTerm)
{
	
	var uluru = {lat: bestData.coordinates.latitude, lng: bestData.coordinates.longitude};

	var marker = new google.maps.Marker({
	    
	    position: uluru,
	    map: map

	    
	    //different icon TEST CODE
	    //icon:'assets/images/ribbon-sm.png',
	    //animation:google.maps.Animation.BOUNCE
	});//END marker


 
  	var infoWindowData = 
    	"<div class='infoWindow'>"+
	    	"<h1 class='infoHeading'>THE BEST "  + searchTerm.toUpperCase() + "</h1>" +
	    	"<br>" +
	    	"<address class='infoAddress'>" +
	     		"<h3 class='infoName'>" + bestData.name + "</h3>"+
	     		bestData.location.display_address[0] + "<br>" +
	    		bestData.location.display_address[1] + "<br>" +
	     		bestData.display_phone + "</p>" +   	    		
	   			"<p>" + 
	   				"<a href=" + bestData.url + ">" + "Visit On Yelp</a>" + 
	   			"</p>" +
	   		"</address>"+	
		"</div>";
     
        
    var infowindow = new google.maps.InfoWindow({content: infoWindowData});

   	marker.addListener('click', function() 
   	{      
          infowindow.open(map, marker);
    });

}//END addMarker()



//=================================== THE END =======================================






//================================= TEST Code Below ====================================
function clearOverlays() {
  
	var markersArray =[];

  for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
}