
// Saves options to localStorage.
function save_options() {
  var jiveurl = document.getElementById("jiveurl").value;
  localStorage["jiveurl"] = jiveurl;

  var pollingfrequency = document.getElementById("polling-frequency").value;
  localStorage["polling-frequency"] = pollingfrequency;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);


  chrome.runtime.sendMessage({savedOptions: true}, function(response) {
    console.log(response)
  });

}


// Restores select box state to saved value from localStorage.
function restore_options() {
  var jiveurl = localStorage["jiveurl"];
  if (!jiveurl) {
    return;
  }
  var select = document.getElementById("jiveurl");
  select.value = localStorage["jiveurl"];

  var pollingfrequency = localStorage["polling-frequency"];
  if (!pollingfrequency) {
    return;
  }
  var select = document.getElementById("polling-frequency");
  select.value = localStorage["polling-frequency"];


}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);