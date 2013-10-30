
//
// Action when the button is clicked in Chrome
//
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.log('User Clicked the browserAction Button');
  chrome.tabs.create({url: localStorage["jiveurl"]+'/inbox'})
});


//
// Configuration Options
//

var INBOX_CHECKER_FREQ = 5000
// in milliseconds


//
// Script
//

var bkg = chrome.extension.getBackgroundPage();
bkg.console.log('Starting the extension!');


InboxCheckerLoop=setInterval(function(){
  bkg.console.log("Checking inbox");
  runAPIcall();
},INBOX_CHECKER_FREQ);

// to stop...
// clearInterval(InboxCheckerLoop)


function runAPIcall()
{
  //bkg.console.log("Entering runAPIcall()...");
  var xhr = new XMLHttpRequest();
  xhr.onload = parseAPIresponse;
  bkg.console.log("Checking: " + localStorage["jiveurl"]+"/api/core/v3/inbox?filter=unread");
  xhr.open("GET", localStorage["jiveurl"]+"/api/core/v3/inbox?filter=unread", true);
  xhr.send();
  //bkg.console.log("Exiting runAPIcall()...");
}

function parseAPIresponse()
{
  //bkg.console.log("Entering parseAPIresponse()...");
  //bkg.console.log(this.responseText);

  if (this.status == 401)
  {
    chrome.browserAction.setIcon({path:"beer-icon-grey.png"});
    bkg.console.log("Status Code: " + this.status + ". You're logged out");
    chrome.browserAction.setBadgeText( { text: "" });
  } 
  else if ( this.status == 200)
  {
    chrome.browserAction.setIcon({path:"beer-icon.png"});
    var inboxCount = JSON.parse(this.responseText.replace(/^throw [^;]*;/, '')).unread;
    bkg.console.log("Number of unread items: " + inboxCount);

    bkg.console.log("Updating chrome badge...");
    if (inboxCount <= 0)
    {
      chrome.browserAction.setBadgeText( { text: "" });

    }
    else
    {
      chrome.browserAction.setBadgeText( { text: inboxCount.toString() } );
      chrome.browserAction.setBadgeBackgroundColor({ color: "#D1B500"});
    }
  } 
  else
  {
    chrome.browserAction.setIcon({path:"beer-icon-grey.png"});
    bkg.console.log("Error retrieving API call")
    chrome.browserAction.setBadgeText( { text: "ERR" });
  }


  //bkg.console.log("Exiting parseAPIresponse()...");
}