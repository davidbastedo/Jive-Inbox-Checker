
// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("jiveurl");
  var jiveurl = select.value;
  localStorage["jiveurl"] = jiveurl;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}


// Restores select box state to saved value from localStorage.
function restore_options() {
  var jiveurl = localStorage["jiveurl"];
  if (!jiveurl) {
    return;
  }
  var select = document.getElementById("jiveurl");
  select.value = localStorage["jiveurl"];
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);