$(document).ready(function () {
var logoutOrcidFn = function() {
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
};
var logoutPlusFn = function() {
var plusLogoutUrl = $("#plusLogoutUrl").html();

 
 $.ajax({
url: plusLogoutUrl,
jsonp: "callback",
dataType: "jsonp",
success: function() {
console.info("Logged out from Plus.");
}
});
return true;
};
var logoutFn = function() {
logoutOrcidFn(); 
logoutPlusFn();
return true;
};
$("#top-menu--sign-out").click(logoutFn);
$(".accounts--delete-account").click(logoutFn);
$("a.accounts--submit-manuscript").attr("target", "_blank"); 
$('.merge-accounts--disconnect-link-orcid').click(logoutOrcidFn);
$('.connect-accounts--disconnect-link-plus').click(logoutPlusFn);
$('.pmid_free_text_information .pmid').each(function(i, item) {
var $item = $(item);
var original = $item.text();
var index = original.indexOf('DOI: ');
if (index >= 0) {
var doi = original.substring(index + 5, original.length - 2);
var doiWithLink = original.substring(0, index + 5) + '<a style="color: #588fb5" href="https://doi.org/' + doi + '">' + doi + '</a>)';
$item.html(doiWithLink);
}
});
$('#deleteAccountFormId').submit(logoutFn);
});