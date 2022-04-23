$(document).ready(function () {
$("#logout").click( function() {
var orcidUrlDomain = $("#orcidurlId").html();
var orcidUrl = orcidUrlDomain.concat("/userStatus.json?logUserOut=true");
$("#logging_out").css({"visibility":"visible"});
if (orcidUrlDomain) {
var orcidUrl = orcidUrl.replace("http://", "https://");
$.ajax({
url: orcidUrl,
jsonp: "callback",
dataType: "jsonp",
success: function() {
console.info("Logged out from ORCID.");
}
});
 
} else {
console.info("Logged out.");
}
return true;
}); 
});