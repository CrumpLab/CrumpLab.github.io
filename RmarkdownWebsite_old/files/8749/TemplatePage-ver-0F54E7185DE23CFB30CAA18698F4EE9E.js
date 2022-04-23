var isOutSide = true;
var isExportPanelClickListenerAdded = false;
$(function () {
$("#searchForm11").submit(function (event) {
event.preventDefault();
var query = $("#banner--search-input").val();
var encodedQuery = encodeURIComponent(query);
window.location.href = "/search?query=" + encodedQuery;
});
if (!document.body.addEventListener) {
document.body.attachEvent('onclick', function (e) {
if (isOutSide) {
var speed = 500;
$("#exportPanel").slideUp(speed);
setTimeout(function () {
$(".wicket-mask-dark.export").remove();
}, speed);
$(".results_pagination_range").fadeIn(speed + 150);
}
isOutSide = true;
});
} else {
document.body.addEventListener('click', function (e) {
var id = e.target.id;
if (isOutSide && id != "exportPanelLink") {
var speed = 500;
$("#exportPanel").slideUp(speed);
setTimeout(function () {
$(".wicket-mask-dark.export").remove();
}, speed);
$(".results_pagination_range").fadeIn(speed + 150);
}
isOutSide = true;
});
}
$('#saved_search_message_box #boxclose').click(function () {
$('#saved_search_message_box').hide("slow");
});
checkExportWindow();
});
function registerExportPanel() {
if (isExportPanelClickListenerAdded) {
return;
}
var exportPanel = document.getElementById('exportForm');
if (exportPanel != null) {
if (!exportPanel.addEventListener) {
exportPanel.attachEvent('onclick', function () {
isOutSide = false;
});
} else {
exportPanel.addEventListener('click', function () {
isOutSide = false;
});
}
isExportPanelClickListenerAdded = true;
}
}
function displaySearchSavedMessage(searchName) {
$('#saved_search_message_box_label').html('Your search \'' + searchName + '\' has been saved!');
$('#saved_search_message_box').slideDown("slow", function () {
setTimeout(function () {
$('#saved_search_message_box').hide("slow");
}, 6000);
});
}
function continueToSignIn() {
setTimeout(function () {
console.log("Redirecting to the Login page...");

 window.location.href = "/accounts/login";
}, 100);
}
var exportUrl;
var exportWindow;

function startDownload(url) {
console.log("Ready to download " + url);
exportUrl = url;
$('#file_1st_page').hide();
$('#export_submit_section').hide();
$('#export_download_section').show();
}
function downloadExport() {

	var strVar = "";
strVar += "<html>";
strVar += "<head>";
strVar += "	<title>Europe PMC file download in progress<\/title>";
strVar += "	<link href=\"\/template\/font-awesome\/css\/font-awesome.min.css\" rel=\"stylesheet\"><\/link>";
strVar += "	<style>";
strVar += "	span {";
strVar += "    	font-size: 13px;";
strVar += "    	color: #58595b;";
strVar += "    	font-family: Helvetica, Arial, Verdana, sans-serif;";
strVar += "    	text-align: left;";
strVar += "    	font-weight: light;";
strVar += "	}";
strVar += "<\/style>";
strVar += "<\/head>";
strVar += "<body>";
strVar += "	<span>Europe PMC file download in progress.<\/span>";
strVar += "	<p style=\"border-style: solid; border-width: 1px; padding: 10px; background-color: #fbeed5; border-color: #ddd7cc; margin: 10px 0;\">";
strVar += "		<i class=\"fa fa-exclamation-triangle\"><\/i> ";
strVar += "		<span>Do not close this window until your file download is complete.<\/span>";
strVar += "	<\/p>";
strVar += "	<span>There may be a delay while the file is downloaded.<\/span>";
strVar += "<\/body>";
strVar += "<\/html>";

	exportWindow = window.open("about:blank", "Europe_PMC_Export_Window", "height=200, width=520");
exportWindow.document.write(strVar);
exportUrl && (exportWindow.location.href = exportUrl);
$.cookie("export_window_cookie", exportWindow, {expires: 10, path: '/'});
$("#exportPanel").slideUp(500);
setTimeout(function () {
$(".wicket-mask-dark.export").remove();
}, 500);
window.location.reload(true);
}
function resetExportSections() {
$('#export_submit_section').show();
$('#export_download_section').hide();
$('#emailSentSuccessful').hide();

 if ($('#maxExport').text().indexOf("50,000") >= 0) {
$('#export_tip').show();
} else {
$('#export_tip').hide();
}
}
function checkExportConfig() {
if ($("#startWithItem").val() <= 0 || $("#startWithItem").val() > $("#availableCitationsToExport").text()) {
$("#startWithErrMsg").show();
} else {
$("#startWithErrMsg").hide();
}
if ($("#numberToExport").val() <= 0 || $("#numberToExport").val() > $("#maxExport").text()) {
console.log("Number to export wrong");
$("#numberToExportErrMsg").show();
} else {
$("#numberToExportErrMsg").hide();
}
}
function closeExportWindow() {
console.log("About to close the export window.");
var exportWindowCookie = $.cookie("export_window_cookie");
if (typeof(exportWindowCookie) == 'undefined' || exportWindowCookie.closed || exportWindowCookie == null) {
console.log("Export Window closed");
} else {
console.log("Close it.");
var win = window.open("", "Europe_PMC_Export_Window", "height=200, width=500");
win.close();
console.log("Remove the cookie.");
$.cookie("export_window_cookie", null, {path: '/'});
}
}
function checkExportWindow() {

	var exportWindowCookie = $.cookie("export_window_cookie");
if (typeof(exportWindowCookie) == 'undefined' || exportWindowCookie == null) {

	} else if (exportWindowCookie.closed) {
console.log("Export Window closed already");
} else {
setTimeout(function () {

 return;
}, 1000);
}
}
