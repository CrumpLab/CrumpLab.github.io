$(document).ready(function() {
	//if no pmcid and one of MED, PPR, CTX and AGR
    var pageUrlSeg = window.location.href.split('/')
    var pageUrlSegLength = pageUrlSeg.length
    var src = pageUrlSeg[pageUrlSegLength - 2]
    var availableSrc = ['MED', 'PPR', 'CTX', 'AGR']
    
    var cond1 = availableSrc.includes(src.toUpperCase())
	var cond2 = $('.abs_nonlink_metadata').length && $('.abs_nonlink_metadata').text().toLowerCase().indexOf('pmcid') == -1
	var cond3 = !(src=='PPR'&&fulltextLinkSource('PPR'))
	if(cond1 && cond2 && cond3) {
		var doiFound = false
		if($('.metaData a').length) {
			$('.metaData a').each(function(index) {
				//if has doi
				if(this.href.indexOf('doi.org') != -1) {
					doiFound = true
					var doi = $(this).text()
					var fulltextlabel = $(".list_article_link .fulltext-label")
					var fulltextlink = null
					if(fulltextlabel.length) {
						fulltextlink = fulltextlabel.parent()
						fulltextlink.css('pointer-events', 'none')
					}
					
					$.ajax({url:'https://api.oadoi.org/v2/'+ doi +'?email=literature@ebi.ac.uk', timeout: 5000}).done(function(response) {
						var best_oa_location = response.best_oa_location
						//if has result
						if(best_oa_location != null) {
							var url = best_oa_location.url
							//if not contains doi.org
							if(url != null) {
								var type = best_oa_location.host_type
								//if type valid
								if(type == 'publisher') {
									updateUnpayWall(url, 'Read research paper for free, via Unpaywall')
								} else if(type == 'repository') {
									updateUnpayWall(url, 'Read research paper for free, via Unpaywall')
								} else{
									updateOtherFavicon();
								}
							} else {
								updateOtherFavicon();
							}
						} else {
							updateOtherFavicon();
						}
					}).fail(function(e) {
						updateOtherFavicon();
					}).always(function() {
						if(fulltextlink != null) {
							fulltextlink.css('pointer-events', 'auto')						
						}
					});
				}
				if(index == $('.metaData a').length - 1 && !doiFound)
					updateOtherFavicon();
			})
		} else
			updateOtherFavicon();
	} else {
		updateOtherFavicon();
	}
	
	function updateUnpayWall(url, popup_message) {
		var fulltextlabel = $(".list_article_link .fulltext-label")
		if(fulltextlabel.length) {
			var fulltextlink = fulltextlabel.parent()
			fulltextlink.attr('href', url)
			fulltextlink.find('img').attr('src', '/images/provenance_favicon/unpaywall.gif')
			fulltextlink.unbind('mouseover')
			fulltextlink.bind('mouseover', function() {
				TipAllowed(popup_message, DELAY, 500)
			})
		}
	}
	
	function updateOtherFavicon() {
		var fulltextlabel = $(".list_article_link .fulltext-label")
		if(fulltextlabel.length) {
			var fulltextlink = fulltextlabel.parent()
			var img = fulltextlink.find('img')
			var urlSeg = fulltextlink.attr('href').split('/')
			var length = urlSeg.length
			if(($('.abs_nonlink_metadata').length && $('.abs_nonlink_metadata').text().toLowerCase().indexOf('pmcid') != -1) || fulltextLinkSource('PPR') || fulltextLinkSource('NBK')) {
				img.attr('src', '/images/provenance_favicon/small_logo.gif')
			} else if(fulltextlink.attr('href').indexOf('nih.gov') != -1) {
				img.attr('src', '/images/provenance_favicon/us_pmc_logo_sm.gif')
			} else
				img.attr('src', '/images/provenance_favicon/exit_icon.gif')
		}
	}
	
	function fulltextLinkSource(source) {
		var fulltextlabel = $(".list_article_link .fulltext-label")
		if(fulltextlabel.length) {
			var fulltextlink = fulltextlabel.parent()
			var img = fulltextlink.find('img')
			var urlSeg = fulltextlink.attr('href').split('/')
			var length = urlSeg.length
			if(urlSeg[length - 1].includes(source))
				return true
		}
		return false
	}
});