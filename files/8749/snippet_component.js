new Vue({
	el : '#snippetApp',
	template: `
		<div id="snippetSection" v-if="fulltextSnippetsHtml.length">
	  	<h3>{{ showTitle() }}</h3>
		<ul>
			<li v-for="snippet in fulltextSnippetsHtml">
				<span>... </span><span class="snippet" v-html="snippet"></span><span>.</span> <a v-bind:href="fulltextLink" v-on:click="gotoFulltext">Go&nbsp;<i class="fa fa-chevron-right" aria-hidden="true"></i></a>
			</li>
		</ul>
		</div>
	  `,
	data : {
		title : "",
		fulltextLink: '/articles/',
		fulltextSnippetsHtml : [],
		snippetItem: null
	},
	methods : {
		showTitle : function() {
			this.title = "Search terms '" + $('[name="searchString"]').val()
					+ "' in full text";
			return this.title;
		},
		gotoFulltext: function(e) {
			if (this.snippetItem && this.fulltextSnippetsHtml && this.fulltextSnippetsHtml.length > 0) {
				this.saveSnippetItem($(e.target).parent().find('span.snippet').html());
			}			
		},
		loadSnippetsAbstract: function(idDivContainer, snippet){
			log.info("loadSnippetAbstract start.");
			var annotatorAbstract = new Biojs.Annotator({
				target: idDivContainer,
				proxyUrl:"/bioJs/annotation_biojs_abstract.jsp",
				isAbstract:1,
				regExpSearch: true,
				regExpByCharacter: true
		    });	
			
			var result = annotatorAbstract._findText(snippet, $('#'+idDivContainer).html(), 0, true);
			log.info("_findText result: ", result);

			var innerHTML = $('#'+idDivContainer).html();
			if (result && result.index >= 0) {
				var text = result.matchedText;
				var index = result.index;
				
			    innerHTML = innerHTML.substring(0, index) 
			      + "<span class='snippet-highlight'>" 
			      + innerHTML.substring(index, index + text.length) 
			      + "</span>" 
			      + innerHTML.substring(index + text.length);
			    
			    $('#'+idDivContainer).html(innerHTML);
			}
			return result;
		},
		doSearch: function(text) {
			// https://stackoverflow.com/questions/5886858/full-text-search-in-html-ignoring-tags
			log.info("doSearch: " + text);
			var found = false;
			
		    if (window.find && window.getSelection) {
		        document.designMode = "on";
		        var sel = window.getSelection();
		        sel.collapse(document.body, 0);
		        
		        while (window.find(text)) {
		        	found = true;
		            document.execCommand("HiliteColor", false, "rgba(248, 231, 28, 0.4)");
		            sel.collapseToEnd();
		        }
		        document.designMode = "off";
		    }
		    
		    return found;
		},
		stripHtmlTags: function(htmlStr) {
			var text = htmlStr.replace(/<\/?[^>]+(>|$)/g, "");
			return text;
		},
		setLogLevel: function() {
			var level = $.cookie("loglevel");
			
			if ("trace" == level) {
				log.setLevel(log.levels.TRACE, true);
			} else if ("debug" == level) {
				log.setLevel(log.levels.DEBUG, true);
			} else if ("info" == level) {
				log.setLevel(log.levels.INFO, true);
			} else {
				log.setLevel(log.levels.WARN, true);
			}			
		},
		retrieveSnippetItem: function() {
			var abstractUrl = $("meta[name='citation_abstract_html_url']").attr("content");
			log.info('About to retrieve snippets for URL: ' + abstractUrl);
			return SnippetStorage.readByUrl(abstractUrl);
		},
		saveSnippetItem: function(target) {
			log.info("saveSnippetItem: " + target);
			var abstractUrl = $("meta[name='citation_abstract_html_url']").attr("content");
			var snippet = SnippetStorage.readByUrl(abstractUrl);
			snippet.target = target;
			SnippetStorage.upsertByUrl(abstractUrl, snippet);
		}
	},
	
	created() {
		this.setLogLevel();
		
		// fulltext link
		var pmcid = $('meta[name="citation_pmcid"]').attr('content');
		this.fulltextLink += pmcid;

		// snippets with tags
		var snippetsHtmlArray;
		this.snippetItem = this.retrieveSnippetItem();

		if (this.snippetItem) {
			snippetsHtmlArray = this.snippetItem.fulltextSnippets;
		}
		log.info("snippetsHtmlArray: ", snippetsHtmlArray);
		
		// snippets in plain text
		for (var i = 0; snippetsHtmlArray && i < snippetsHtmlArray.length; i++) {
			var snippetText = this.stripHtmlTags(snippetsHtmlArray[i]);
			if (snippetText) {
				// Search and highlight snippets in the abstract page
				var result = this.loadSnippetsAbstract("abstract_text_plain", snippetText);
				var found = result && result.index > 0 ? true : false;
				if (!found) {
					found = this.doSearch(snippetText);
					if (found) {
						log.info("find() works");
					}
				}
				if (!found && pmcid) {					
					// Fulltext snippets
					this.fulltextSnippetsHtml.push(snippetsHtmlArray[i]);
				}
			}
		}
		
		// Fade out highlight if any
		/*
		setTimeout(function() {
			$('.snippet-highlight').removeClass('snippet-highlight').addClass('snippet-fade-out'); 
		}, 4000);
		*/
	},
	
	mounted() {
//		if ($('.target-snippet').length <= 0 && $('.snippet-highlight').length > 0) {
//			$($('.snippet-highlight').get(0)).addClass("target-snippet");
//		}
		
		// Scroll to target snippet
//		var position = $('.target-snippet').position();
//		if (position) {
//			var top = position.top;
//			$(window).scrollTop(top);
//		}
	}
});

