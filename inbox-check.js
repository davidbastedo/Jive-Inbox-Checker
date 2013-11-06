// Initialize logging
var bkg = chrome.extension.getBackgroundPage();
bkg.console.debug('Starting the extension!');


//
// Action when the button is clicked in Chrome
//
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.debug('User Clicked the browserAction Button');
  chrome.tabs.create({url: localStorage["jiveurl"]+'/inbox'})
});



// This starts the entire checking timer/loop
beta_setURLtoBrewspace();
startAPICheckTimer();


//
//
// Functions
//
//


//
// Internal beta only - Set URL to be brewspace if the URL hasn't been set. 
// TODO: Remove this when this plugin is released outside of internal testing
//
function beta_setURLtoBrewspace()
{
  if (localStorage["jiveurl"] == null) // custom polling rate set locally
  {
    localStorage["jiveurl"] = 'https://brewspace.jiveland.com'
  }
}


//
// Polling
//

function getPollingFrequency()
{
	if (localStorage["polling-frequency"]) // custom polling rate set locally
	{
		return parseInt(localStorage["polling-frequency"]);
	}else // no custom polling rate configured. using default recommendation
	{
		return 30000;
	// in milliseconds
	}
}




//
// Timer Loop Managers
//


function startAPICheckTimer()
{
	console.debug("Starting check timer");
	bkg.console.debug("Running loop every " + getPollingFrequency() / 1000 + " seconds.");
// Check immediately on start - don't wait for the setInterval loop
	InboxAPICheckerLoop=setInterval(checkJiveURL,getPollingFrequency());
}

function stopAPICheckTimer()
{
	console.debug("stopping check timer");
	clearInterval(InboxAPICheckerLoop);
}


// Resets the CheckTimer and uses the latest polling rate value
function restartAPICheckTimer()
{
	console.debug("restarting check timer");
	clearInterval(InboxAPICheckerLoop);
	startAPICheckTimer();

}


//
//
// API Processors
//
//


//
// Before we run the API call we will check to see that the jiveURL isn't blank
//

function checkJiveURL()
{	
	if (localStorage["jiveurl"])
	  {
			
		  runAPIcall();
	  }else
	  {
		bkg.console.debug("jiveurl is blank. skipping API call.");
		chrome.browserAction.setBadgeBackgroundColor({ color: "#C0C0C0"});
		chrome.browserAction.setBadgeText( { text: "?" });
	  }
}


//
// API Call setup and trigger
//

function runAPIcall()
{
  //bkg.console.debug("Entering runAPIcall()...");
  var xhr = new XMLHttpRequest();
  xhr.onload = parseAPIresponse;
  xhr.onerror = requestError;
  bkg.console.debug("Checking: " + localStorage["jiveurl"]+"/api/core/v3/inbox?filter=unread");
  xhr.open("GET", localStorage["jiveurl"]+"/api/core/v3/inbox?filter=unread", true);
  xhr.send();
  //bkg.console.debug("Exiting runAPIcall()...");
}

//
// Function is triggered if the an error happens when requesting the API endpoint. Likely a bad or malformed Jive URL from the user.
//
function requestError()
{
	bkg.console.error("Error making the api call with URL: " + localStorage["jiveurl"]+"/api/core/v3/inbox?filter=unread");
	bkg.console.error(this);
	chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000"});
    chrome.browserAction.setBadgeText( { text: "ERR" });
}


//
// Function will parse the API response from the web server
//
function parseAPIresponse()
{
  //bkg.console.debug("Entering parseAPIresponse()...");
  //bkg.console.debug(this.responseText);

  if (this.status == 401) // Logged out
  {

    bkg.console.error("Status Code: " + this.status + ". You're logged out");
    chrome.browserAction.setIcon({path:"icon-grey.png"});
    chrome.browserAction.setBadgeBackgroundColor({ color: "#C0C0C0"});
    chrome.browserAction.setBadgeText( { text: "?" });
  } 
  else if ( this.status == 200) // Good
  {
    chrome.browserAction.setIcon({path:"icon-grey.png"});
    var inboxCount = JSON.parse(this.responseText.replace(/^throw [^;]*;/, '')).unread;
    bkg.console.debug("Number of unread items: " + inboxCount);

    bkg.console.debug("Updating chrome badge...");
    if (inboxCount <= 0)
    {
      chrome.browserAction.setIcon({path:"icon-grey.png"});
      chrome.browserAction.setBadgeText( { text: "" });
    }
    else
    {


      //chrome.browserAction.getBadgeText({tabId:null}, function(result){ alert( result ) });
      chrome.browserAction.getBadgeText({tabId:null}, DidItChange);


      function DidItChange(result){

        currentCount = result;
        if ( currentCount < inboxCount )
        {
          animateFlip();
        }
           
      }
      chrome.browserAction.setIcon({path:"icon.png"})
      chrome.browserAction.setBadgeBackgroundColor({ color: "#F89838"});
      chrome.browserAction.setBadgeText( { text: inboxCount.toString() } );
    }
  } 
  else // other HTTP error
  {
    bkg.console.error("Error retrieving API call")
    chrome.browserAction.setIcon({path:"icon-grey.png"});
    chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000"});
    chrome.browserAction.setBadgeText( { text: "ERR" });
  }


  //bkg.console.debug("Exiting parseAPIresponse()...");
}


var animationFrames = 36;
var animationSpeed = 10; // ms
var rotation = 0;
var canvas = document.getElementById('canvas');
var canvasContext = canvas.getContext('2d');
var loggedInImage = document.getElementById('logged_in');

function animateFlip() {
  rotation += 1/animationFrames;
  drawIconAtRotation();

  if (rotation <= 1) {
    setTimeout(animateFlip, animationSpeed);
  } else {
    rotation = 0;
  }
}


function drawIconAtRotation() {
  canvasContext.save();
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.translate(
      Math.ceil(canvas.width/2),
      Math.ceil(canvas.height/2));
  canvasContext.rotate(2*Math.PI*ease(rotation));
  canvasContext.drawImage(loggedInImage,
      -Math.ceil(canvas.width/2),
      -Math.ceil(canvas.height/2));
  canvasContext.restore();

  chrome.browserAction.setIcon({imageData:canvasContext.getImageData(0, 0,
      canvas.width,canvas.height)});
}

function ease(x) {
  return (1-Math.sin(Math.PI/2+x*Math.PI))/2;
}