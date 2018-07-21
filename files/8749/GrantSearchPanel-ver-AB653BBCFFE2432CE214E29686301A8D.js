var Grant = {
grantTips: {},
grantPublications: {},
init: function(event, element) {
var thiz = this;
var grantSpinner = $(element).prev();
if (grantSpinner && grantSpinner.hasClass("grant_spinner")) {
$(element).prev().find("i").removeClass("fa-exclamation-triangle").addClass("fa-cog").addClass("fa-spin");
grantSpinner.show();
} else {
$(element).before('<span class="grant_spinner" style="position:absolute; margin-left:-20px;"><i class="fa fa-cog fa-spin" style="color:#707070; font-size:1em"></i></span>');
}
thiz.popupGrantTips(element);
},
popupGrantTips: function(element) {
log.debug("Popping up grant tips: ", element);
var clazz = Object.getPrototypeOf(this);
var myRegexp = /funder_(\d+)_(\d+)/;
var match = myRegexp.exec($(element).attr('class'));
log.debug($(element).attr('class'));
log.debug("a#funder_"+match[1]);
var funderName = $("a#funder_"+match[1]).find("span").text();
var grantID = $(element).find("span").text();
var grantTipTitle = this.constructTipTitle(funderName, grantID);
log.debug(grantTipTitle);
log.debug($(element).parent());
log.debug($(element).parent().parent());
log.debug($(element).parent().parent().parent());
log.debug($(element).parent().parent().parent().prev().find("span").text());
if (clazz.grantTips.hasOwnProperty(grantTipTitle) && clazz.grantPublications.hasOwnProperty(grantTipTitle)) {
$('div#grant_info').trigger("popup", [funderName, grantID, element]);
} else {
if (!clazz.grantTips.hasOwnProperty(grantTipTitle)) {
this.popupGrantDetails(funderName, grantID, element);
}
if (!clazz.grantPublications.hasOwnProperty(grantTipTitle)) {
this.popupGrantPublications(funderName, grantID, element);
}
}
},
constructTipTitle: function(funderName, grantID) {
return funderName + ' - ' + grantID;
},
getRecord: function(grantID, grantDetails) {
log.debug("getRecord...");
log.info(grantID);
log.info(grantDetails);
if (grantDetails == null || grantDetails.RecordList == null || grantDetails.RecordList.Record == null) {
return null;
}
if (grantDetails.RecordList.Record.constructor === Array) {
for (var i = 0; i < grantDetails.RecordList.Record.length; i++) {
var record = grantDetails.RecordList.Record[i];
if (record.Grant.Id == grantID) {
return record;
}
}
} else {
return grantDetails.RecordList.Record;
}
},
doPopup: function(funderName, grantID, grantDetails, grantPublications, element) {
log.debug("doPopup funderName: " + funderName, element);
$(element).prev().hide();
if (grantDetails == null || grantPublications == null) {
return;
}
var grantTitle = "";
var pi = "";
var piForSearch = "";
var record = this.getRecord(grantID, grantDetails);
if (record) {
log.debug("Record: ", record);
var grant = record.Grant;
var person = record.Person;
var institution = record.Institution;
grantTitle = grant.Title;
if (person) {
var personTitle = person.Title;
if(typeof personTitle == 'undefined')
personTitle = "";
pi = personTitle + " " + person.Initials + " " + person.FamilyName;
piForSearch = person.FamilyName + " " + person.Initials;
if (institution) {
pi += ", " + institution.Name
}
} else {
if (institution) {
pi = institution.Name
}
}
log.debug("Grant title: " + grantTitle);
log.debug("Grant PI: " + pi);
} else {
log.debug("No record");
}
var grantTipTitle = this.constructTipTitle(funderName, grantID);

 
 var linkToSearch = '/search?query=GRANT_AGENCY_ID:%22' + grantID + '_agency_' + funderName + '%22';
log.debug("linkToSearch: " + linkToSearch);
var publicationStr = (grantPublications.hitCount > 1) ? "Publications" : "Publication";
var pubDiv = '<div><a href="'+linkToSearch+'">'+grantPublications.hitCount+' ' + publicationStr + '</a></div>'
log.debug("pubDiv: " + pubDiv);
$(element).after(pubDiv);
var piDiv = '<div>'+pi+'</div>';
$(element).after(piDiv);
log.info($(element).find("span").text());
log.info("Grant title: " + (grantTitle ? grantTitle : "(empty)"));
if (grantTitle) {
$(element).find("span").text(grantTitle);
$(element).after("&nbsp;(" + grantID + ")");
} else {
var elementClassName = $(element).attr('class');
$(element).replaceWith("<div class='" + elementClassName + "'>" + grantID + "</div>");
}
var grantDetailsUrl = 'gid:"' + grantID + '"';
if (piForSearch) {
grantDetailsUrl += ' pi:"' + piForSearch + '"';
}
grantDetailsUrl += ' ga:"' + funderName + '"';
grantDetailsUrl = '/grantfinder/grantdetails?query='+encodeURIComponent(grantDetailsUrl);
$(element).attr("href", grantDetailsUrl);
$(element).unbind('click');
this.showNext(element);
},
showNext: function(element) {
var myRegexp = /funder_(\d+)_(\d+)/;
var match = myRegexp.exec($(element).attr('class'));
var next = 1 + parseInt(match[2]);
next = '.funder_'+match[1]+'_'+next;
log.debug("Show next: " + next);
if ($(next).length) {
if ($(next).prev().find("i").hasClass("fa-exclamation-triangle")) {
log.debug("Error history. Stop.");
} else {
log.debug("No error history. Continue.");
$(next).trigger("click");
}
}
},
popupGrantDetails: function(funderName, grantID, element) {
log.debug("popupGrantDetails - funderName: " + funderName);
var clazz = Object.getPrototypeOf(this);
var url = '/grist/rest/get/query=gid:"' + grantID + '" ga:"' + funderName + '"&resultType=core&format=json';
var jqxhr = $.get(url, function(data) {
log.debug( "popupGrantDetails: success" );
log.debug(data);
if (!jQuery.isEmptyObject(data)) {
var grantTipTitle = clazz.constructTipTitle(funderName, grantID);
clazz.grantTips[grantTipTitle] = data;
$('div#grant_info').trigger("popup", [funderName, grantID, element]);
}
}).done(function() {
log.debug( "popupGrantDetails: second success" );
}).fail(function() {
log.debug( "popupGrantDetails: error" );
$('div#grant_info').trigger("error", [funderName, grantID, element]);
}).always(function() {
log.debug( "popupGrantDetails: finished" );
});

 jqxhr.always(function() {
log.debug( "popupGrantDetails: second finished" );
});
},
popupGrantPublications: function(funderName, grantID, element) {
var clazz = Object.getPrototypeOf(this); 
var url = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=GRANT_AGENCY_ID:"' + grantID + '_agency_' + funderName + '"&format=json';
var jqxhr = $.get(url, function(data) {
log.debug( "popupGrantPublications: success" );
log.debug(data);
if (!jQuery.isEmptyObject(data)) {
var grantTipTitle = clazz.constructTipTitle(funderName, grantID);
clazz.grantPublications[grantTipTitle] = data;
$('div#grant_info').trigger("popup", [funderName, grantID, element]);
}
}).done(function() {
log.debug( "popupGrantPublications: second success" );
}).fail(function() {
log.debug( "popupGrantPublications: error" );
$('div#grant_info').trigger("error", [funderName, grantID, element]);
}).always(function() {
log.debug( "popupGrantPublications: finished" );
});

 jqxhr.always(function() {
log.debug( "popupGrantPublications: second finished" );
});
},
extend : function ( config ) {
var tmp = Object.create( this );
for ( var key in config ) {
if ( config.hasOwnProperty( key ) ) {
tmp[key] = config[key];
}
}
return tmp;
},
setLogLevel : function(level) {
if ("trace" == level) {
log.setLevel(log.levels.TRACE);
} else if ("debug" == level) {
log.setLevel(log.levels.DEBUG);
} else if ("info" == level) {
log.setLevel(log.levels.INFO);
} else {
log.setLevel(log.levels.WARN);
}
}
};
$(document).ready(function(){
var level = $.cookie("loglevel");
Grant.setLogLevel(level);
$('div#grant_info').on("popup", function(event, funderName, grantID, element){
log.debug("Popping up now: " + funderName);
log.debug(element);
log.debug(Grant);
var grantTipTitle = Grant.constructTipTitle(funderName, grantID);
if (Grant.grantTips.hasOwnProperty(grantTipTitle) && Grant.grantPublications.hasOwnProperty(grantTipTitle)) {
Grant.doPopup(funderName, grantID, Grant.grantTips[grantTipTitle], Grant.grantPublications[grantTipTitle], element);
} else {
log.debug("Not ready yet.");
}
});
$('div#grant_info').on("error", function(event, funderName, grantID, element){
log.debug("Error handling: " + funderName + " (" + grantID + ")", element);
$(element).prev().find("i").removeClass("fa-cog").removeClass("fa-spin").addClass("fa-exclamation-triangle");
Grant.showNext(element);
});
$('[id^=funder]').on('click', function(event){

 if ($('.'+$(this).attr('id')+'_0').length) {

 if ($(this).find("i").hasClass("fa-caret-right")) {
$(this).parent().next().show();
$(this).find("i").removeClass("fa-caret-right").addClass("fa-caret-down");

 if (!$('.'+$(this).attr('id')+'_0').next().length) {
$('.'+$(this).attr('id')+'_0').trigger("click");
}
} else {

 $(this).parent().next().hide();
$(this).find("i").removeClass("fa-caret-down").addClass("fa-caret-right");
}
}
});
$('[class^=funder]').on("click", function(event){
log.info("About to pop up funder " + $(this).attr('class'));
var grant = Grant.extend();
grant.init(event, this); 
});
});
