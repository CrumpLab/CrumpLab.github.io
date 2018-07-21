var isOutSide = true;
var isExportPanelClickListenerAdded = false;
$(function() {
$("#searchForm11").submit(function(event) {
event.preventDefault();
var query = $("#textfield").val();
var encodedQuery = encodeURIComponent(query);
window.location.href = "/search?query=" + encodedQuery;
});
if (!document.body.addEventListener) {
document.body.attachEvent('onclick', function(e) {
if (isOutSide) {
var speed = 500;
$("#exportPanel").slideUp(speed);
$(".results_pagination_range").fadeIn(speed + 150);
}
isOutSide = true;
});
} else {
document.body.addEventListener('click', function(e) {
var id = e.target.id;
if (isOutSide && id != "exportPanelLink") {
var speed = 500;
$("#exportPanel").slideUp(speed);
$(".results_pagination_range").fadeIn(speed + 150);
}
isOutSide = true;
});
}
$('#saved_search_message_box #boxclose').click(function(){
$('#saved_search_message_box').hide("slow");
});
});
function registerExportPanel() {
if (isExportPanelClickListenerAdded) {
return;
}
var exportPanel = document.getElementById('exportPanel');
if (exportPanel != null) {
if (!exportPanel.addEventListener) {
exportPanel.attachEvent('onclick', function() {
isOutSide = false;
});
} else {
exportPanel.addEventListener('click', function() {
isOutSide = false;
});
}
isExportPanelClickListenerAdded = true;
}
}
function displaySearchSavedMessage(searchName) {
$('#saved_search_message_box_label').html('Your search \''+searchName+'\' has been saved!');
$('#saved_search_message_box').slideDown( "slow", function() {
setTimeout(function() { $('#saved_search_message_box').hide("slow"); }, 6000);
});
}
function continueToSignIn() {
setTimeout(function() {
console.log("Redirecting to the Login page...");

 window.location.href = "/accounts/login";
}, 100);
}