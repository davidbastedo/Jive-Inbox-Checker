
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


//
// Configuration Options
//

var INBOX_CHECKER_FREQ = 3000
// in milliseconds


//
// Script
//

InboxCheckerLoop=setInterval(function(){
  bkg.console.debug("Running loop every " + INBOX_CHECKER_FREQ / 1000 + " seconds.");
  if (localStorage["jiveurl"])
  {
	  runAPIcall();
  }else
  {
	bkg.console.debug("jiveurl is blank. skipping API call.");
	chrome.browserAction.setBadgeBackgroundColor({ color: "#C0C0C0"});
    chrome.browserAction.setBadgeText( { text: "?" });
  }
},INBOX_CHECKER_FREQ);

// to stop the loop...
// clearInterval(InboxCheckerLoop)


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
// Triggered if the an error happens when requesting the API endpoint. Likely a bad or malformed Jive URL from the user.
//
function requestError()
{
	bkg.console.error("Error making the api call with URL: " + localStorage["jiveurl"]+"/api/core/v3/inbox?filter=unread");
	bkg.console.error(this);
	chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000"});
    chrome.browserAction.setBadgeText( { text: "ERR" });
}


//
// Parse the API response from the web server
//
function parseAPIresponse()
{
  //bkg.console.debug("Entering parseAPIresponse()...");
  //bkg.console.debug(this.responseText);

  if (this.status == 401) // Logged out
  {

    bkg.console.error("Status Code: " + this.status + ". You're logged out");
    chrome.browserAction.setIcon({path:"beer-icon-grey.png"});
    chrome.browserAction.setBadgeBackgroundColor({ color: "#C0C0C0"});
    chrome.browserAction.setBadgeText( { text: "?" });
  } 
  else if ( this.status == 200) // Good
  {
    chrome.browserAction.setIcon({path:"beer-icon-grey.png"});
    var inboxCount = JSON.parse(this.responseText.replace(/^throw [^;]*;/, '')).unread;
    bkg.console.debug("Number of unread items: " + inboxCount);

    bkg.console.debug("Updating chrome badge...");
    if (inboxCount <= 0)
    {
      chrome.browserAction.setIcon({path:"beer-icon-grey.png"});
      chrome.browserAction.setBadgeText( { text: "" });
    }
    else
    {
      chrome.browserAction.setIcon({path:"beer-icon.png"})
      chrome.browserAction.setBadgeBackgroundColor({ color: "#D1B500"});
      chrome.browserAction.setBadgeText( { text: inboxCount.toString() } );
    }
  } 
  else // other HTTP error
  {
    bkg.console.error("Error retrieving API call")
    chrome.browserAction.setIcon({path:"beer-icon-grey.png"});
    chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000"});
    chrome.browserAction.setBadgeText( { text: "ERR" });
  }


  //bkg.console.debug("Exiting parseAPIresponse()...");
}