/*
 RELATED ARTICLES EXPANSION AND CONTRACTION

 showHideRelatedClick is called when a "Show all items" link is clicked
 on Citations, BioEntities or Related Articles tabs. Or any tab that has
 links wrapped in a .showHideRelated holder. It is not nearly as well
 documented as the checkHeights function below, but it's pretty basic.
 So use your noggin, buddy.

 Actually I take it back. I just went through and documented it. I'm your
 coding pal from the past, looking out for you! Pay it forward. ;)

 Change the variable "debugging" to true in order to enable
 debug logging. console.log throws errors in older versions of
 Internet Explorer and is not recommended for live builds,
 so debugging should be set to false in that scenario.

 */

(function (window, $) {
	$(function () {
		tweakAutoFill();
	});

	/**
	 *
	 * @see https://www.ebi.ac.uk/panda/jira/browse/CIT-2344
	 * @see http://stackoverflow.com/questions/39975406/hide-existing-chrome-firefox-autofill-dropdown-through-javascript
	 */
	function tweakAutoFill() {

		$('#banner--search-input').removeAttr('autocomplete').focus(function () {
			$(this).attr('autocomplete', 'on');
		}).blur(function () {
			$(this).removeAttr('autocomplete');
		});

		$('.dropdown').on('mouseenter', function () {
			$('#banner--search-input').trigger('blur');
		});
	}

})(window, jQuery);

/* Moved from jquery.cookie.js (CIT-2171) */
jQuery.cookie = function (name, value, options) {
	if (typeof value != 'undefined') { // name and value given, set cookie
		options = options || {};
		if (value === null) {
			value = '';
			options.expires = -1;
		}
		var expires = '';
		if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
			var date;
			if (typeof options.expires == 'number') {
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
			} else {
				date = options.expires;
			}
			expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
		}
		// CAUTION: Needed to parenthesize options.path and options.domain
		// in the following expressions, otherwise they evaluate to undefined
		// in the packed version for some reason...
		var path = options.path ? '; path=' + (options.path) : '';
		var domain = options.domain ? '; domain=' + (options.domain) : '';
		var secure = options.secure ? '; secure' : '';
		document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
	} else { // only name given, get cookie
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
};

var parentIdexpanded = new Array();

// When a "Show all items" link is clicked...
jQuery(document).on('click', ".showHideRelated a", function () { // We use .live('click') because jQuery cannot use .click on content loaded via ajax

	// Call the showHideRelatedClick function, pass the parent's ID and class,
	// and the grandparent's ID (for determining what section we're in).
	// AND the great-grandparent's ID (for the related articles tab, which requires
	// this b/c that's the only way we can differentiate between the two different
	// content containers).


	// Find the holder element's ID
	var parentID = "";
	var parentClass = jQuery(this).parent().parent().attr('class');

	var collapsedStatus = "";
	var classCrossReference = "";
	var classList = "";

	if (parentClass.indexOf("btmsmr") > -1) {
		//tmsummary links
		classCrossReference = "btmsmr";
		parentID = jQuery(this).parent().parent().parent().attr('id');
		classList = "relartsdiv";
	} else if (parentClass.indexOf("bxref1") > -1) {
		//crossreference link
		classCrossReference = "bxref1";
		parentID = jQuery(this).parent().parent().parent().attr('id');
		classList = "relartsdiv";
	} else if (parentClass.indexOf("bxref2") > -1) {
		//crossreference link
		classCrossReference = "bxref2";
		parentID = jQuery(this).parent().parent().parent().attr('id');
		classList = "relartsdiv";
	} else if (parentClass.indexOf("citesFollowingHolder") > -1) {
		//citation to
		classCrossReference = "citesFollowingHolder";
		parentID = jQuery(this).parent().parent().parent().parent().parent().parent().attr('id');
		classList = "citations_listing";
	} else if (parentClass.indexOf("citedByHolder") > -1) {
		//cited by
		classCrossReference = "citedByHolder";
		parentID = jQuery(this).parent().parent().parent().parent().parent().parent().attr('id');
		classList = "citations_listing";
	} else if (parentClass.indexOf("citationsHolder") > -1) {
		//related articles
		classCrossReference = "citationsHolder";
		parentID = jQuery(this).parent().parent().parent().parent().attr('id');
		classList = "citations_listing";
	}


	if (parentClass.indexOf("collapsed") == -1) {
		collapsedStatus = "expanded";
	} else {
		collapsedStatus = "collapsed";
	}

	showHideRelatedClick(parentID, collapsedStatus, classCrossReference, classList);
});

function showHideRelatedClick(clickedItemParent, collapsedStatus, classCrossReference, classList) {

	// To display debug messages, set this variable to true.
	var debugging = false;

	if (debugging) {
		console.log('clickedItemParent = ' + clickedItemParent);
		console.log('classCrossReference = ' + classCrossReference);
		console.log('classList = ' + classList);
		console.log('collapsedStatus = ' + collapsedStatus);
	}

	var fullHeight = jQuery('#' + clickedItemParent + ' .' + classCrossReference + ' .' + classList)[0].scrollHeight;


	// If the holder has the "collapsed" class (which it does by default, 
	// and when it has previously been collapsed), run the expansion functions.
	if (collapsedStatus == 'collapsed') {
		jQuery('#' + clickedItemParent + ' .' + classCrossReference + ' .' + classList).animate({
			maxHeight: fullHeight
		}, 500, function () {
			// And change its link's text so that when the user sees it
			// again, it's telling them to collapse instead of expand
			jQuery('#' + clickedItemParent + ' .' + classCrossReference + ' .showHideRelated a').html('Show fewer items');
		});
		// Swap classes so on the next click it collapses instead of expanding
		jQuery('#' + clickedItemParent + ' .' + classCrossReference).removeClass('collapsed');
		jQuery('#' + clickedItemParent + ' .' + classCrossReference).addClass('expanded');
	} else {
		// If the holder does not have the "collapsed" class (which it only looses when
		// it has been expanded previously), run the contraction functions.
		// Animate the holder closed by setting its max-height CSS value
		// to the standard height of 220.

		jQuery('#' + clickedItemParent + ' .' + classCrossReference + ' .' + classList).animate({
			maxHeight: 220
		}, 500, function () {
			// And change its link's text so that when the user sees
			// it again, it's telling them to expand instead of contract
			jQuery('#' + clickedItemParent + ' .' + classCrossReference + ' .showHideRelated a').html('Show all items');
		});

		// Swap classes so on the next click it expands instead of contracting
		jQuery('#' + clickedItemParent + ' .' + classCrossReference).removeClass('expanded');
		jQuery('#' + clickedItemParent + ' .' + classCrossReference).addClass('collapsed');
	}
}


/*
 LINK HIDER

 checkHeights is a looping function which is called the first
 time on load. It checks for .showHideRelated a's, and when it
 finds them, it does various checks on their parent's content
 container's heights. If the container's height is less
 than the value set in epmc.css (220px), the link is hidden.

 This function loops because it can only run when the user actually
 clicks on a tab. Before that, the content has been loaded through
 ajax and while it's in the DOM, it hasn't been rendered, and thus
 it does not have a height. A nice next step would be to code a
 cleanup function so that when the user has clicked every possible
 tab, it stops running. However pretty lightweight so it should not
 bog things down too much.

 Change the variable "debugging" to true in order to enable
 debug logging. console.log throws errors in older versions of
 Internet Explorer and is not recommended for live builds,
 so debugging should be set to false in that scenario.
 */

function checkHeights() {

	// To display debug messages, set this variable to true.
	var debugging = false;

	if (debugging) {
		console.log('== checkHeights() CALLED ==');
	}

	// BUG FIXING:
	// Call bioEntitiesFixer() to see if there are any double content box instances
	// that'll need to have their buttons swapped out.
	//bioEntitiesFixer();

	jQuery('.showHideRelated a').each(function () {
		if (debugging) {
			console.log('== FOR EACH ==');
		}

		var parentID = "";
		var parentClass = jQuery(this).parent().parent().attr('class');
		var classList = "";

		if (parentClass.indexOf("btmsmr") > -1) {
			//tmsummary links
			parentClass = "btmsmr";
			parentID = jQuery(this).parent().parent().parent().parent().parent().parent().parent().attr('id');
			classList = "relartsdiv";
		} else if (parentClass.indexOf("bxref1") > -1) {
			//crossreference link
			parentClass = "bxref1";
			parentID = jQuery(this).parent().parent().parent().parent().parent().parent().parent().attr('id');
			classList = "relartsdiv";
		} else if (parentClass.indexOf("bxref2") > -1) {
			//crossreference link
			parentClass = "bxref2";
			parentID = jQuery(this).parent().parent().parent().parent().parent().parent().parent().attr('id');
			classList = "relartsdiv";
		} else if (parentClass.indexOf("citesFollowingHolder") > -1) {
			//citation to
			parentClass = "citesFollowingHolder";
			parentID = jQuery(this).parent().parent().parent().parent().parent().parent().attr('id');
			classList = "citations_listing";
		} else if (parentClass.indexOf("citedByHolder") > -1) {
			//cited by
			parentClass = "citedByHolder";
			parentID = jQuery(this).parent().parent().parent().parent().parent().parent().attr('id');
			classList = "citations_listing";
		} else if (parentClass.indexOf("citationsHolder") > -1) {
			//related articles
			parentClass = "citationsHolder";
			parentID = jQuery(this).parent().parent().parent().parent().attr('id');
			classList = "citations_listing";
		}

		if (debugging) {
			console.log("parentID = " + parentID + " parentClass" + parentClass);
		}

		// Then grab the parent's content container's height and scrollHeight
		var containerHeight = jQuery('#' + parentID + " ." + parentClass + " ." + classList).height();

		// If the containerHeight is null or 0, it means the user hasn't clicked into
		// a tab yet. If they haven't done so, checking the scrollHeight in IE
		// throws an error and stops the function from running. So we wrap the
		// scrollHeight in an if statement to avoid that.
		if (containerHeight > 0) {
			if (debugging) {
				console.log(parentID + 's ' + parentClass + ' content containers height is > 0. Grab scrollHeight.');
			}
			var containerScrollHeight = 0;

			containerScrollHeight = jQuery('#' + parentID + " ." + parentClass + " ." + classList)[0].scrollHeight;

			if (debugging) {
				console.log(parentID + 's ' + parentClass + ' content container is ' + containerHeight + 'px tall.');
				console.log(parentID + 's ' + parentClass + ' content containers scrollHeight is ' + containerScrollHeight + 'px.');

			}
		}
		else {
			if (debugging) {
				console.log(parentID + 's ' + parentClass + ' content containers height is 0. Do not grab srollHeight.');
			}
		}

		// Now check if the link is shown or not. If it hasn't been shown yet...
		if (jQuery(this).is(":visible") == false) {
			if (debugging) {
				console.log('Found a hidden link.');
				console.log(containerScrollHeight + ' ?? 220');
			}

			// ... if the content contanier's height is higher than the set height (set in CSS) show it!
			if (containerScrollHeight > 220) {
				if (debugging) {
					console.log('Hidden link content is higher than 220px. Showing link.');
				}

				if (ie8) {
					jQuery('#' + parentID + " ." + parentClass + ' .showHideRelated a').css("display", "block");
				} else {
					if (parentIdexpanded.indexOf(parentID + " ." + parentClass) < 0) {
						// Show the link.

						jQuery('#' + parentID + " ." + parentClass + ' .showHideRelated a').css("display", "block");
					}
				}

				if (debugging) {
					console.log(parentID + " " + parentClass + 's link has been shown.');
				}
			} else {
				if (debugging) {
					console.log('Container ' + parentID + " " + parentClass + ' is shorter than 220px. Link should be hidden.');
				}
			}
		}
		if (debugging) {
			console.log('== END EACH ==');
		}
	});

	// Set the timeout to run checkHeights again, 
	// as this has to run the first time a user clicks into
	// a new tab.
	setTimeout('checkHeights()', 1000);
}

/* 
 INIT

 Call checkHeights for the first time to set off the whole shebang.

 */
/*
 jQuery(document).ready(function(){

 // IE7 cannot pull scrollHeight reliably and generally sucks and has a low market share
 // (~1% as of Sept. 2012). Thus we don't do anything if the user is on IE7.
 // ie7 variable is set in the HTML head in a if IE 7 statement.
 if (!ie7) {
 checkHeights();
 checkHeightsLabsLinks();
 }
 });
 */
//LABS LINKS WORKING


//When a "Show all items" link is clicked...
jQuery(document).on('click', ".labs_links_showHideRelated a", function () { // We use .live('click') because jQuery cannot use .click on content loaded via ajax
	// Call the showHideRelatedClick function, pass the parent's ID and class,
	// and the grandparent's ID (for determining what section we're in).
	// AND the great-grandparent's ID (for the related articles tab, which requires
	// this b/c that's the only way we can differentiate between the two different
	// content containers).

	// Find the holder element's ID
	var parentID = jQuery(this).parent().parent().attr("id");
	var parentClass = jQuery('#' + parentID + ' .links_summary').attr("class");

	var collapsedStatus = "";

	if (parentClass.indexOf("collapsed") == -1) {
		collapsedStatus = "expanded";
	} else {
		collapsedStatus = "collapsed";
	}

	showHideLabsLinks(parentID, collapsedStatus);
});

function showHideLabsLinks(parentID, collapsedStatus) {
	var parentClass = 'links_summary';

	var fullHeight = jQuery('#' + parentID + ' .' + parentClass)[0].scrollHeight;


	// If the holder has the "collapsed" class (which it does by default, 
	// and when it has previously been collapsed), run the expansion functions.
	if (collapsedStatus == 'collapsed') {
		jQuery('#' + parentID + ' .' + parentClass).animate({
			maxHeight: fullHeight
		}, 500, function () {
			// And change its link's text so that when the user sees it
			// again, it's telling them to collapse instead of expand
			jQuery('#' + parentID + ' .labs_links_showHideRelated a').html('Show fewer items');
		});
		// Swap classes so on the next click it collapses instead of expanding
		jQuery('#' + parentID + ' .' + parentClass).removeClass('collapsed');
		jQuery('#' + parentID + ' .' + parentClass).addClass('expanded');
	} else {
		// If the holder does not have the "collapsed" class (which it only looses when
		// it has been expanded previously), run the contraction functions.
		// Animate the holder closed by setting its max-height CSS value
		// to the standard height of 220.

		jQuery('#' + parentID + ' .' + parentClass).animate({
			maxHeight: 220
		}, 500, function () {
			// And change its link's text so that when the user sees
			// it again, it's telling them to expand instead of contract
			jQuery('#' + parentID + ' .labs_links_showHideRelated a').html('Show all items');
		});

		// Swap classes so on the next click it expands instead of contracting
		jQuery('#' + parentID + ' .' + parentClass).removeClass('expanded');
		jQuery('#' + parentID + ' .' + parentClass).addClass('collapsed');
	}
}


function checkHeightsLabsLinks() {

	jQuery('.labs_links_showHideRelated a').each(function () {

		var parentID = jQuery(this).parent().parent().attr("id");
		var parentClass = "links_summary";

		// Then grab the parent's content container's height and scrollHeight
		var containerHeight = jQuery('#' + parentID + " ." + parentClass).height();

		// If the containerHeight is null or 0, it means the user hasn't clicked into
		// a tab yet. If they haven't done so, checking the scrollHeight in IE
		// throws an error and stops the function from running. So we wrap the
		// scrollHeight in an if statement to avoid that.
		if (containerHeight > 0) {
			var containerScrollHeight = containerScrollHeight = jQuery('#' + parentID + " ." + parentClass)[0].scrollHeight;
		}

		// Now check if the link is shown or not. If it hasn't been shown yet...
		if (jQuery(this).is(":visible") == false) {
			// ... if the content contanier's height is higher than the set height (set in CSS) show it!
			if (containerScrollHeight > 220) {
				// Show the link.
				jQuery('#' + parentID + ' .' + parentClass).addClass('collapsed');
				jQuery('#' + parentID + " .labs_links_showHideRelated a").css("display", "block");

			}

		}
	});

	// Set the timeout to run checkHeights again, 
	// as this has to run the first time a user clicks into
	// a new tab.
	setTimeout('checkHeightsLabsLinks()', 1000);
}

/**
 Functions to use the tooltip in all devices except from request coming from IPAD, IPhone, IPOD
 */
function isTipAllowed() {
	var ret = true;
	var useragent = navigator.userAgent;
	if ((useragent.match(/iPhone/i)) || (useragent.match(/iPod/i)) || (useragent.match(/iPad/i))) {
		ret = false;
	}
	return ret;
}

/**params for tooltip in input**/
function TipAllowed() {
	if (isTipAllowed()) {
		if (arguments.length == 1) {
			Tip(arguments[0]);
		} else if (arguments.length == 2) {
			Tip(arguments[0], arguments[1]);
		} else if (arguments.length == 3) {
			Tip(arguments[0], arguments[1], arguments[2]);
		} else if (arguments.length == 5) {
			Tip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
		} else if (arguments.length == 7) {
			Tip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
		} else if (arguments.length == 9) {
			Tip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8]);
		} else if (arguments.length == 11) {
			Tip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10]);
		} else if (arguments.length == 13) {
			Tip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12]);
		} else if (arguments.length == 15) {
			Tip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12], arguments[13], arguments[14]);
		} else if (arguments.length == 17) {
			Tip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12], arguments[13], arguments[14], arguments[15], arguments[16]);
		} else if (arguments.length == 19) {
			Tip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12], arguments[13], arguments[14], arguments[15], arguments[16], arguments[17], arguments[18]);
		} else if (arguments.length == 21) {
			Tip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12], arguments[13], arguments[14], arguments[15], arguments[16], arguments[17], arguments[18], arguments[19], arguments[20]);
		}
	}
}

function TagToTipAllowed() {
	if (isTipAllowed()) {
		if (arguments.length == 1) {
			TagToTip(arguments[0]);
		} else if (arguments.length == 2) {
			TagToTip(arguments[0], arguments[1]);
		} else if (arguments.length == 3) {
			TagToTip(arguments[0], arguments[1], arguments[2]);
		} else if (arguments.length == 5) {
			TagToTip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
		} else if (arguments.length == 7) {
			TagToTip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
		} else if (arguments.length == 9) {
			TagToTip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8]);
		} else if (arguments.length == 11) {
			TagToTip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10]);
		} else if (arguments.length == 13) {
			TagToTip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12]);
		} else if (arguments.length == 15) {
			TagToTip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12], arguments[13], arguments[14]);
		} else if (arguments.length == 17) {
			TagToTip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12], arguments[13], arguments[14], arguments[15], arguments[16]);
		} else if (arguments.length == 19) {
			TagToTip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12], arguments[13], arguments[14], arguments[15], arguments[16], arguments[17], arguments[18]);
		} else if (arguments.length == 21) {
			TagToTip(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12], arguments[13], arguments[14], arguments[15], arguments[16], arguments[17], arguments[18], arguments[19], arguments[20]);
		}
	}
}


function UnTipAllowed() {
	if (isTipAllowed()) {
		UnTip();
	}
}
