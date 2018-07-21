Biojs.AnnotatorAction = Biojs.AnnotatorBase.extend(
/** @lends Biojs.Annotator# */
{
	constructor: function(options){
		
	},
	
	 /** 
	    * Default options (and its values) for the Citation component. 
	    * @name Biojs.Citation-opt
	    * @type Object
	    */
	opt: {
	},
	
	 /**
	 * Array containing the supported event names
	 * @name Biojs.Citation-eventTypes
	 */
	eventTypes : [
	],
	
	
	_createBlockAnnotation: function (annotationData, startIndex, type, containerMenu, rdfAnnotationDiv, xpos, ypos, pmcid, src, extId, isAbstract, pos){
		
		var menuAnnotationTypeContainer = jQuery("<div class=\"" + (startIndex === 0 ? "active" : "inactive") + " menu_annotation_type " + (startIndex === 0 ? "" : type.toLowerCase()) + "\" data_type=\""+type.toLowerCase()+"\"></div>").appendTo(containerMenu);
		
		jQuery("<h4 class=\"menu_annotation_type_title " + type.toLowerCase() + "\"><span class=\"menu_annotation_type_title_text\">"+this._getAnnotationLabelGeneral(annotationData[startIndex].data, annotationData[startIndex].annotator)+"</span></h4>").appendTo(menuAnnotationTypeContainer);
		var menuAnnotationTypeContent = jQuery("<div class=\"menu_annotation_type_content\"></div>").appendTo(menuAnnotationTypeContainer);
		
		var k = startIndex;
		
		var currentAnnotationData;
		
		var menuAnnotationSingleContainer;
		
		var menuAnnotationSingleLinksContainer;
		
		for (k=startIndex; k<annotationData.length; k++){ 
			currentAnnotationData =  annotationData[k];
			
			typeAnnotation = this._getAnnotationTypeGeneral(currentAnnotationData.data, currentAnnotationData.annotator);
			
			if (typeAnnotation==type) {

				text = this._getAnnotationTextGeneral(currentAnnotationData.data, currentAnnotationData.annotator);
				url = this._getAnnotationUrlGeneral(currentAnnotationData.data, currentAnnotationData.annotator);

				menuAnnotationSingleContainer = jQuery("<div class=\"menu_annotation_single clearfix\"></div>").appendTo(menuAnnotationTypeContent);

				// If the annotation has `tags` array, it is for `gene disease association`.
				var data = currentAnnotationData.data;
				var isAssociation = false;
				console.log(data);
				if (type === Biojs.AnnotatorBase.OPEN_TARGET || type === Biojs.AnnotatorBase.DISGENET || type === Biojs.AnnotatorBase.GRECO) {
					isAssociation = true;
					var $title = jQuery("<div class=\"menu_annotation_single_title\"></div>");
					for (var i = 0; i < data.tags.length; i++) {
						var tag = data.tags[i];
						if (!tag) continue;
						var $tag = $('<div class="annotation--tag"></div>');
						$tag.append('<div>' + tag.name + '</div>');
						$tag.append('<a class="annotation--tag-href" target="_blank" href="' + this._getTagsUrl(tag.uri) + '">' + this._getAnnotationDetailsLinkGeneral(currentAnnotationData.annotator, typeAnnotation, tag.uri) + '</a>');
						$tag.append(' <i class="green fa fa-external-link"></i>');
						$title.append($tag);
						(i % 2 === 0) && $title.append('<span class="separator annotation--tag"> &#x2015; </span>');
					}
					menuAnnotationSingleContainer.append($title);
				} else if (type === Biojs.AnnotatorBase.INTACT || type === Biojs.AnnotatorBase.PHOSPHORYLATE_NACTEM) {
					isAssociation = true;
					var $title = jQuery("<div class=\"menu_annotation_single_title\"></div>");
					for (var i = 0; i < data.tags.length; i++) {
						var tag = data.tags[i];
						if (!tag) continue;
						var $tag = $('<div class="annotation--single-tag-item"></div>');
						$tag.append('<div class="annotation--single-tag">' + tag.name + '</div>');
						$tag.append('<a class="annotation--single-tag-href" target="_blank" href="' + tag.uri + '">' + this._getAnnotationDetailsLinkGeneral(currentAnnotationData.annotator, typeAnnotation, tag.uri) + '</a>');
						$tag.append(' <i class="green fa fa-external-link"></i>');
						$title.append($tag);
					}
					menuAnnotationSingleContainer.append($title);
				} else {
					//title
					jQuery("<div class=\"menu_annotation_single_title\">" + text + "</div>").appendTo(menuAnnotationSingleContainer);
				}

					//links
					menuAnnotationSingleLinksContainer = jQuery("<div class=\"menu_annotation_single_links\"></div>").appendTo(menuAnnotationSingleContainer);

					var idPdbContainerLink = rdfAnnotationDiv + "_" + k + "_pdbstructure";
					var idPdbContainer = rdfAnnotationDiv + "_container_pdb_" + k;

					/**if ((type== Biojs.AnnotatorBase.ACCESSION_NUMBERS) && (this._startsWith(url.toLowerCase(),"http://identifiers.org/pdb/"))){
					
					menuAnnotationSingleLinksContainer.html("<span class=\"menu_annotation_details\" id=\""+rdfAnnotationDiv+"_"+k+"_details\"><i class=\"fa fa-external-link\" style=\"color:#62a744;\"></i> "+this._getAnnotationDetailsLinkGeneral(currentAnnotationData.annotator, typeAnnotation, url)+"</span> | <span class=\"menu_annotation_pdb\" id=\""+idPdbContainerLink+"\"><i class=\"fa fa-caret-down fa-1x\" style=\"color:#62a744;\"></i> PDB Structure</span> |"+linkRefineSearch+linkSearchArticle);
					
			    }else{
			    	menuAnnotationSingleLinksContainer.html("<span class=\"menu_annotation_details\" id=\""+rdfAnnotationDiv+"_"+k+"_details\"><i class=\"fa fa-external-link\" style=\"color:#62a744;\"></i> "+this._getAnnotationDetailsLinkGeneral(currentAnnotationData.annotator, typeAnnotation, url)+"</span> |"+linkRefineSearch+linkSearchArticle);
			    }*/

					//links
					if (isAssociation) {
						menuAnnotationSingleLinksContainer.html("<span id=\"" + rdfAnnotationDiv + "_" + k + "_feedback\" class=\"menu_annotation_feedback\"><i class=\"green fa fa-thumbs-up\" aria-hidden=\"true\"></i> <i class=\"green fa fa-caret-down fa-1x\"></i></span><span id=\"feedback_form_choice" + rdfAnnotationDiv + "_" + k + "\"></span>");
					} else {
						menuAnnotationSingleLinksContainer.html("<span class=\"menu_annotation_single_links_text\"><i class=\"green fa fa-external-link\"></i> <span class=\"menu_annotation_details\" id=\"" + rdfAnnotationDiv + "_" + k + "_details\">" + this._getAnnotationDetailsLinkGeneral(currentAnnotationData.annotator, typeAnnotation, url) + "</span>" + "</span><span id=\"" + rdfAnnotationDiv + "_" + k + "_feedback\" class=\"menu_annotation_feedback\"><i class=\"green fa fa-thumbs-up\" aria-hidden=\"true\"></i> <i class=\"green fa fa-caret-down fa-1x\"></i></span><span id=\"feedback_form_choice" + rdfAnnotationDiv + "_" + k + "\"></span>");
					}

					if ((type == Biojs.AnnotatorBase.ACCESSION_NUMBERS) && (this._startsWith(url.toLowerCase(), "http://identifiers.org/pdb/"))) {
						jQuery("<div class=\"pdb_visualization\" id=\"" + idPdbContainer + "\"+></div>").appendTo(menuAnnotationSingleContainer);
						jQuery("<div class=\"pdb_visualization_loading\" id=\"" + idPdbContainer + "_loading\"+><div class=\"pdb_visualization_loading_icon\"><i class=\"fa fa-cog fa-spin fa-3x\"></i></div><div class=\"pdb_visualization_loading_label\">Loading PDB structure...</div></div>").appendTo(menuAnnotationSingleContainer);
					}


					this._linkActionClick(type, url, rdfAnnotationDiv, k, currentAnnotationData, xpos, ypos, idPdbContainer, idPdbContainerLink, pmcid, src, extId, isAbstract, pos);

				}
		}
		//provider
		var annotationSource = this._getAnnotationProviderGeneral((annotationData[startIndex] || {}).annotator);
		if (annotationSource)
			jQuery("<div class=\"menu_annotation_provider\">Annotation source: "+ annotationSource +"</div>").appendTo(menuAnnotationTypeContent);
	},

	_getTagsUrl: function (apiUrl) {
		var parts = apiUrl.split('/');
		var url = apiUrl;
		var id = parts[parts.length - 1];
		if (apiUrl.indexOf('uniprot') >= 0) {
			url = 'http://www.targetvalidation.org/search?src=q:' + id
		}
		if (apiUrl.indexOf('efo') >= 0) {
			url = 'http://www.targetvalidation.org/disease/' + id + '/associations';
		}
		return url || '';
	},
	
	_isAnnotationTypeAnalyzed: function (annotationTypes, type){
		for (var i=0;i<annotationTypes.length; i++){
			if (annotationTypes[i]==type){
				return true;
			}
		}
		
		return false;
	},
	
	
	_openPdbStructures: function(annotationData, rdfAnnotationDiv, xpos, ypos) {
		
		var titleDialog="INFO ";
		var sizeWindow;
		var self=this;
		var type;
		var text;
		var url;
		
		var k = 0;
		var currentAnnotationData;
		for (k=0; k<annotationData.length; k++){ 
			currentAnnotationData =  annotationData[k];
			
			type = this._getAnnotationTypeGeneral(currentAnnotationData.data, currentAnnotationData.annotator);
			url =  this._getAnnotationUrlGeneral(currentAnnotationData.data, currentAnnotationData.annotator);
			
			if ((type== Biojs.AnnotatorBase.ACCESSION_NUMBERS) && (this._startsWith(url.toLowerCase(),"http://identifiers.org/pdb/"))){ 
				var idPdbContainerLink=rdfAnnotationDiv+"_"+k+"_pdbstructure";
				var idPdbContainer=rdfAnnotationDiv+"_container_pdb_"+k;
				this._showPDBstructure(currentAnnotationData.data, rdfAnnotationDiv, xpos, ypos, currentAnnotationData.annotator, idPdbContainer, idPdbContainerLink);
			}
		
		}
   },
	
	load: function(annotationData, rdfAnnotationDiv, orderInfo, xpos, ypos, pmcid, src, extId, isAbstract, pos, idAnnotation) {
		
		var titleDialog="INFO ";
		var sizeWindow;
		var self=this;
		var type;
		var text;
		var url;
		
		var annotationTypes = [];
		
		if (isAbstract==0 && (this._startsWith(pmcid, "-")==false)){ 
			jQuery("#"+rdfAnnotationDiv).dialog("destroy");
		}
		jQuery("#"+rdfAnnotationDiv).html("<div class=\"menu_annotation_rdf\"></div>");
		var containerMenu = jQuery("#"+rdfAnnotationDiv+" .menu_annotation_rdf");
		
		var k = 0;
		var currentAnnotationData;
		for (k=0; k<annotationData.length; k++){ 
			currentAnnotationData =  annotationData[k];
			
			type = this._getAnnotationTypeGeneral(currentAnnotationData.data, currentAnnotationData.annotator);
			
			if (this._isAnnotationTypeAnalyzed(annotationTypes, type)==false){
				this._createBlockAnnotation(annotationData, k, type, containerMenu, rdfAnnotationDiv, xpos, ypos, pmcid, src, extId, isAbstract, pos);
				annotationTypes[annotationTypes.length] = type;
			}
		
		}
		
		var sizeWindow = 440;
		if (isAbstract==0 && (this._startsWith(pmcid, "-")==false)){ 
			jQuery("#"+rdfAnnotationDiv).dialog({
	             autoOpen: true,
	             //height: sizeWindow + 26,
	             //width : sizeWindow + 26,
	             height:"auto",
	             width:"auto",
	             title: '',
	             modal:true,
	             position:[xpos - 20 , ypos + 22],
	             //position:[xpos + 200 , ypos + 22],
	             draggable: false,
	             open: function(){
	                 jQuery('.ui-widget-overlay').bind('click',function(){
	                     self. _unload(annotationData, rdfAnnotationDiv);
	                 });
	                
	                 jQuery(this).parent().promise().done(function () {
	                	 self._openPdbStructures(annotationData, rdfAnnotationDiv, xpos, ypos);
	                	 //PiwikAnalyticsTracker.tracking();
	                 });
	                 
	             },
	             close: function(event, ui) {
			      		jQuery('#'+idAnnotation).removeClass('annotationClicked');
			     },
	             dialogClass: 'noTitleDialogRDF annotation--details-popup',
	             closeText: ''
	          });
		}else{
			jQuery("#"+rdfAnnotationDiv).dialog({
		         autoOpen: true,
		         height:"auto",
		         width:"auto",
		         title: '',
		         modal:true,
		         position: {
		             my: 'left-20 top+22',
		             at: 'left-20 top+22',
		             collision: 'fit',
		             of: pos
		         },
		         draggable: false,
		         open: function(){
		             jQuery('.ui-widget-overlay').bind('click',function(){
		            	 jQuery("#"+rdfAnnotationDiv).dialog("close");
		             });
		             
		             jQuery(this).parent().promise().done(function () {
		            	 self._openPdbStructures(annotationData, rdfAnnotationDiv, xpos, ypos);
		            	 //PiwikAnalyticsTracker.tracking();
		             });
		         },
		         close: function(event, ui) {
		      		jQuery("#"+rdfAnnotationDiv).dialog("destroy");
		      		jQuery("#"+rdfAnnotationDiv).html("");
		      		jQuery('#'+idAnnotation).removeClass('annotationClicked');
		         },
		         
		         dialogClass: 'noTitleDialogRDF annotation--details-popup',
		         closeText: ''
		      });
		}
		
		//jQuery("#"+rdfAnnotationDiv).css("width", sizeWindow+"px");
		//jQuery("#"+rdfAnnotationDiv).css("height",sizeWindow+"px");
	},
	
	_linkActionClick: function(type, url, rdfAnnotationDiv, k, currentAnnotationData, xpos, ypos, idPdbContainer, idPdbContainerLink, pmcid, src, extId, isAbstract, pos){
	    var self=this;
	    	
	    jQuery("#"+rdfAnnotationDiv+"_"+k+"_details").off("click");
		jQuery("#"+rdfAnnotationDiv+"_"+k+"_details").on("click", function(){self._openDetails(currentAnnotationData.data, rdfAnnotationDiv, currentAnnotationData.annotator)});
		
		jQuery("#"+rdfAnnotationDiv+"_"+k+"_feedback").off("click");
		//jQuery("#"+rdfAnnotationDiv+"_"+k+"_feedback").on("click", function(){self._openFeedbackForm(currentAnnotationData.data, rdfAnnotationDiv, currentAnnotationData.annotator, xpos, ypos, pmcid);});
		jQuery("#"+rdfAnnotationDiv+"_"+k+"_feedback").on("click", function(pos){self._openChoiceFeedbackForm(currentAnnotationData.data, rdfAnnotationDiv, currentAnnotationData.annotator, pos.clientX, pos.clientY, pmcid, k, src, extId, isAbstract, pos);});
		
		if (jQuery("#"+rdfAnnotationDiv+"_"+k+"_searchepmc")!=undefined && jQuery("#"+rdfAnnotationDiv+"_"+k+"_searchepmc").length>0){
			jQuery("#"+rdfAnnotationDiv+"_"+k+"_searchepmc").off("click");
			jQuery("#"+rdfAnnotationDiv+"_"+k+"_searchepmc").on("click", function(){self._openEPMCsearch(currentAnnotationData.data, rdfAnnotationDiv, currentAnnotationData.annotator)});
		}

		/**if ((type== Biojs.AnnotatorBase.ACCESSION_NUMBERS) && (this._startsWith(url.toLowerCase(),"http://identifiers.org/pdb/"))){ 
			jQuery("#"+rdfAnnotationDiv+"_"+k+"_pdbstructure").off("click");
			jQuery("#"+rdfAnnotationDiv+"_"+k+"_pdbstructure").on("click", function(pos){self._showPDBstructure(currentAnnotationData.data, rdfAnnotationDiv, xpos, ypos, currentAnnotationData.annotator, idPdbContainer, idPdbContainerLink)});
		}*/
	},
	
    _unload: function(annotationData, rdfAnnotationDiv) {
		jQuery("#"+rdfAnnotationDiv).dialog("close");
		jQuery("#"+rdfAnnotationDiv).dialog("destroy");
		jQuery("#"+rdfAnnotationDiv).html('');
	},
	
	_hidePDBstructure: function(annotationData, rdfAnnotationDiv, xpos, ypos, annotator, idPdbContainer, idPdbContainerLink) {
		if(jQuery('#'+idPdbContainer).is(':visible')==true){
			jQuery("#"+idPdbContainer).toggle(0);
			jQuery("#"+idPdbContainerLink+" i").attr("class","fa fa-caret-down fa-1x");
			jQuery("#"+idPdbContainerLink).off("click");
			var self=this;
			jQuery("#"+idPdbContainerLink).on("click", function(pos){self._showPDBstructure(annotationData, rdfAnnotationDiv, xpos, ypos, annotator, idPdbContainer, idPdbContainerLink)});
		}
	},
	
	_showPDBstructure: function(annotationData, rdfAnnotationDiv, xpos, ypos, annotator, idPdbContainer, idPdbContainerLink) {
		//this._unload([annotationData], rdfAnnotationDiv);
		if(jQuery('#'+idPdbContainer).is(':visible')==false){
			var self=this;
			if(jQuery('#'+idPdbContainer).html()==undefined || jQuery('#'+idPdbContainer).html()==""){ 
				var size=460;
				//jQuery("#"+idPdbContainer+"_loading .fa-cog").css("margin-left", size/2);
				jQuery("#"+idPdbContainer+"_loading .fa-cog").css("margin-top", "50px");
				jQuery("#"+idPdbContainer+"_loading").toggle(0);
				
				var instancePdb = new Biojs.Protein3DCanvas({
					target: idPdbContainer,
					jsmolFolder: '/bioJs/dependencies/jsmol-14.29.10/jsmol',
					height: size,
			    	width: size,
			    	style: Biojs.Protein3D.STYLE_CARTOON,
			    	loadingStatusImage:"/images/ajax-loader.gif",
			    	//default
			    	use:"HTML5 JAVA",
			    	proxyUrl:"/bioJs/jsmol.jsp",
			    	viewControls: false,
			    });
				
				var text= this._getAnnotationTextGeneral(annotationData, annotator);
				instancePdb.setPdb(text.toLowerCase());
				
				instancePdb.onPdbLoaded(function (e){
					//sleep(10000);
					jQuery("#"+idPdbContainer+"_loading").toggle(0);
					jQuery("#"+idPdbContainer).toggle(0);
					
					/**jQuery("#"+idPdbContainerLink+" i").attr("class","fa fa-caret-up fa-1x");
					jQuery("#"+idPdbContainerLink).off("click");
					jQuery("#"+idPdbContainerLink).on("click", function(pos){self._hidePDBstructure(annotationData, rdfAnnotationDiv, xpos, ypos, annotator, idPdbContainer, idPdbContainerLink)});*/
				});
			}else{
				jQuery("#"+idPdbContainer).toggle(0);
				
				/**jQuery("#"+idPdbContainerLink+" i").attr("class","fa fa-caret-up fa-1x");
				jQuery("#"+idPdbContainerLink).off("click");
				jQuery("#"+idPdbContainerLink).on("click", function(pos){self._hidePDBstructure(annotationData, rdfAnnotationDiv, xpos, ypos, annotator, idPdbContainer, idPdbContainerLink)});*/
			}
			
		}
	},
	
	_highlightall: function(annotator, annotationData, rdfAnnotationDiv) {
		this._unload(annotationData, rdfAnnotationDiv);
		
		annotator.highlightAnnotationFromContextualMenu(annotationData);
		
	},
	
	_highlightfirst: function(annotator, annotationData, rdfAnnotationDiv) {
		this._unload(annotationData, rdfAnnotationDiv);
		
		annotator.highlightOnlyFirstAnnotationFromContextualMenu(annotationData);

	},
	
	_openDetails: function(annotationData, rdfAnnotationDiv, annotator) {
		//this._unload([annotationData], rdfAnnotationDiv);
		var url = this._getAnnotationUrlGeneral(annotationData, annotator);
		window.open(url,"_blank");
	},
	
	_openEPMCsearch: function(annotationData, rdfAnnotationDiv, annotator) {
		//this._unload([annotationData], rdfAnnotationDiv);
		var url = this._getAnnotationUrlEPMCsearchGeneral(annotationData, annotator);
		window.open(url,"_blank");
	},
	
	_openEPMCsearchRefined: function(urlToOpen) {
		//this._unload([annotationData], rdfAnnotationDiv);
		window.open(urlToOpen,"_blank");
	},
	
	_openFeedbackForm: function(annotationData, rdfAnnotationDiv, annotator, xpos, ypos, pmcid, k, src, extId, isAbstract){
		var self=this;
		var htmlForm="<div class=\"annotations-feedback-container clearfix\"><div class=\"title_feedback_annotation\">Report problem annotation</div>";
		var text= this._getAnnotationTextGeneral(annotationData, annotator);
		htmlForm = htmlForm+"<div class=\"label_feedback_annotation\"> What's wrong with this instance of <span class=\"text_feedback_annotation\">\""+text+"\"</span>?</div>";
		
		htmlForm = htmlForm+"<div  class=\"radiobutton_feedback_annotation\">";
		//htmlForm = htmlForm+"<div  class=\"radiobutton_feedback_annotation_element\"><input type=\"radio\" name=\"annotation_feedback\" value=\"good\"/> Correct </div>";
		htmlForm = htmlForm+"<div  class=\"radiobutton_feedback_annotation_element\"><input type=\"radio\" name=\"annotation_feedback\" checked=\"checked\" value=\"incorrect\"/> It is incorrect </div>"; 
		htmlForm = htmlForm+"<div  class=\"radiobutton_feedback_annotation_element\"><input type=\"radio\" name=\"annotation_feedback\" value=\"too_generic\"/> Too Generic </div>"; 
		htmlForm = htmlForm+"<div  class=\"radiobutton_feedback_annotation_element\"><input type=\"radio\" name=\"annotation_feedback\" value=\"other\"/> Other</div>"; 
		htmlForm = htmlForm+"</div>";  
		
		htmlForm = htmlForm+"<div class=\"label_feedback_annotation\">";
		htmlForm = htmlForm+" It would be really helpful if you could briefly explain the problem <i>(optional)</i>";
		htmlForm = htmlForm+"</div>"; 
		
		htmlForm = htmlForm+"<div class=\"textarea_feedback_annotation\">";
		htmlForm = htmlForm+"<textarea id=\"annotation_comment\" name=\"annotation_comment\"></textarea>";
		htmlForm = htmlForm+"</div>"; 
		
		htmlForm = htmlForm+"<div class=\"label_feedback_annotation\">";
		htmlForm = htmlForm+" Email <i>(optional)</i>";
		htmlForm = htmlForm+"</div>"; 
		
		htmlForm = htmlForm+"<div class=\"email_feedback_annotation\">";
		htmlForm = htmlForm+"<input size=\"40\" type=\"text\" id=\"email_user"+rdfAnnotationDiv+"_"+k+"\" name=\"email_user\"/>";
		htmlForm = htmlForm+"<div id=\"email_userError"+rdfAnnotationDiv+"_"+k+"\" class=\"error_text formInputClientError email_feedback_annotation_error\" style=\"display:none\"/></div>"; 
		
		//for GDPR
		var sect_id = "check_privacy_policy_sect"+rdfAnnotationDiv+"_"+k;
		var checkbox_id = "check_privacy_policy"+rdfAnnotationDiv+"_"+k; 
		var submit_button_id = "send_feedback_annotation"+rdfAnnotationDiv+"_"+k;
		var email_id = "email_user"+rdfAnnotationDiv+"_"+k;
		var ifAcceptedPrivacyPolicy = document.getElementById("ifAcceptedPrivacyPolicy");
		if(!ifAcceptedPrivacyPolicy) {
			htmlForm = htmlForm + "<div class='label_feedback_annotation' id='"+sect_id+"'>";
			htmlForm = htmlForm + "<input type='checkbox' id='"+ checkbox_id +"'/> I have read and accept the <a href='//www.ebi.ac.uk/data-protection/privacy-notice/europe-pmc-plus' target='_blank'>privacy notice for Europe PMC’s Advanced User Services</a>.";
			//htmlForm = htmlForm + "<br/><span id='privacy-policy-unchecked' style='display: none;'>Please accept the privacy notice.</span>";
			htmlForm = htmlForm + "</div>";
		}

		htmlForm = htmlForm + "</div>";
		htmlForm = htmlForm+"<div class=\"button_feedback_annotation\">";
		//for GDPR
		htmlForm = htmlForm+"<input type='button' id='cancel_feedback_annotation"+rdfAnnotationDiv+"_"+k+"' class='clear_button secondary' value='Cancel'/> <input type='button' id='" + submit_button_id + "' class='submit_button' value='Send Feedback'/>";
		htmlForm = htmlForm+"</div></div>";
		
		jQuery("#"+rdfAnnotationDiv).html(htmlForm);
		
		//for GDPR
		if(!ifAcceptedPrivacyPolicy) {
			if(typeof initPrivacyPolicyCheck != 'function') {
			    var script = document.createElement("script");
			    var html = "function disableButton(submit_button_id, disabled) {var button = document.getElementById(submit_button_id); if(disabled) {button.style.background = '#BEBCBC';} else {button.style.background = '-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #20699C), color-stop(1, #1c5b87))';} button.disabled = disabled;} ";
			    
			    html += "function submitPermissionCheck(checkbox_id, submit_button_id) {var checkbox = document.getElementById(checkbox_id); if(checkbox.checked) {disableButton(submit_button_id, false);} else {disableButton(submit_button_id, true);}} ";
			    
			    html += "function disablePrivacyPolicyCheckbox(sect_id, checkbox_id, disabled) {var checkbox = document.getElementById(checkbox_id); checkbox.disabled = disabled; var sect = document.getElementById(sect_id); if(disabled){ sect.style.color = 'rgb(190, 188, 188)';} else {sect.style.color = '#494949';}} ";
			    
			    html += "function privacyCheck(sect_id, email_id, checkbox_id, submit_button_id) {var email = document.getElementById(email_id);var checkbox = document.getElementById(checkbox_id); var onCheckboxChange = function() {submitPermissionCheck(checkbox_id, submit_button_id);}; if(email.value.trim() == '') {disablePrivacyPolicyCheckbox(sect_id, checkbox_id, true); disableButton(submit_button_id, false); checkbox.checked = false; checkbox.removeEventListener('change', onCheckboxChange);} else {disablePrivacyPolicyCheckbox(sect_id, checkbox_id, false); submitPermissionCheck(checkbox_id, submit_button_id); checkbox.addEventListener('change', onCheckboxChange);}} ";
			    
			    html += "function initPrivacyPolicyCheck(sect_id, email_id, checkbox_id, submit_button_id) {disablePrivacyPolicyCheckbox(sect_id, checkbox_id, true); privacyCheck(sect_id, email_id, checkbox_id, submit_button_id); document.getElementById(email_id).onkeyup = function() {privacyCheck(sect_id, email_id, checkbox_id, submit_button_id); }} ";
			    script.innerHTML = html;
			    document.body.appendChild(script);
			}
			initPrivacyPolicyCheck(sect_id, email_id, checkbox_id, submit_button_id);
		}
		
		jQuery("#cancel_feedback_annotation"+rdfAnnotationDiv+"_"+k).off("click");
		jQuery("#cancel_feedback_annotation"+rdfAnnotationDiv+"_"+k).on("click", function(){self._cancelFeedbackForm(annotationData, rdfAnnotationDiv, annotator, xpos, ypos)});
		
		jQuery("#send_feedback_annotation"+rdfAnnotationDiv+"_"+k).off("click");
		jQuery("#send_feedback_annotation"+rdfAnnotationDiv+"_"+k).on("click", function(){self._sendFeedbackForm(annotationData, rdfAnnotationDiv, annotator, xpos, ypos, jQuery('#annotation_comment').val(), jQuery("input[type='radio'][name='annotation_feedback']:checked").val(), jQuery("#email_user"+rdfAnnotationDiv+"_"+k).val(), pmcid, k, src, extId, isAbstract)});
		
		jQuery("#email_user"+rdfAnnotationDiv+"_"+k).off("keydown");
		jQuery("#email_user"+rdfAnnotationDiv+"_"+k).on("keydown", function(){
			self._validateEmail(jQuery(this).val(),  rdfAnnotationDiv, k);
               
		});
		
		jQuery("#email_user"+rdfAnnotationDiv+"_"+k).off("keyup");
		jQuery("#email_user"+rdfAnnotationDiv+"_"+k).on("keyup", function(){
			self._validateEmail(jQuery(this).val(), rdfAnnotationDiv, k);
               
		});
		
		//this._closeChoiceFeedbackForm(annotationData, rdfAnnotationDiv);
		
	},
	
	_openThanksFeedback: function(resp, annotationData, rdfAnnotationDiv, k){
		//this._closeChoiceFeedbackForm(annotationData, rdfAnnotationDiv);
		var self=this;
		var htmlForm="";
		/**if (this._startsWith(resp,"OK")){
			htmlForm="<div class=\"title_feedback_annotation\">Thanks for your feedback!</div>";
			htmlForm = htmlForm+"<div class=\"label_feedback_annotation\">We really appreciate you taking the time to send us feedback</div>";
			htmlForm = htmlForm+"<div class=\"label_feedback_annotation\">Our annotations are text mined and we will improve their quality and relevance with your help. Our support staff will review your comments soon</div>";
			
			htmlForm = htmlForm+"<div class=\"button_feedback_annotation\">";
			htmlForm = htmlForm+"<input type=\"button\" id=\"close_feedback_annotation\" class=\"submit_button\" value=\"Finish\"/>";
			htmlForm = htmlForm+"</div>"; 
		}else{
			htmlForm="<div class=\"title_feedback_annotation\">Thanks for your feedback|</div>";
			htmlForm = htmlForm+"<div class=\"label_feedback_annotation\">We really appreciate you taking the time to send us feedback</div>";
			htmlForm = htmlForm+"<div class=\"label_feedback_annotation\">Our annotations are text mined and we will improve their quality and relevance with your help. Our support staff will review your comments soon</div>";
			
			htmlForm = htmlForm+"<div class=\"button_feedback_annotation\">";
			htmlForm = htmlForm+"<input type=\"button\" id=\"close_feedback_annotation"+rdfAnnotationDiv+"_"+k+"\" class=\"submit_button\" value=\"Finish\"/>";
			htmlForm = htmlForm+"</div>"; 
		}*/
		
		htmlForm="<div class=\"annotations-feedback-container clearfix\"><div class=\"title_feedback_annotation\">Thanks for your feedback!</div>";
		htmlForm = htmlForm+"<div class=\"label_feedback_annotation\">Our support staff will review your comments soon.</div>";
		htmlForm = htmlForm+"<div class=\"label_feedback_annotation\">With your help we will improve the quality and relevance of annotations.</div>";
		
		htmlForm = htmlForm+"<div class=\"button_feedback_annotation\">";
		htmlForm = htmlForm+"<input type=\"button\" id=\"close_feedback_annotation"+rdfAnnotationDiv+"_"+k+"\" class=\"submit_button\" value=\"Finish\"/>";
		htmlForm = htmlForm+"</div></div>";
		
		
		jQuery("#"+rdfAnnotationDiv).html(htmlForm);
		
		jQuery("#close_feedback_annotation"+rdfAnnotationDiv+"_"+k).off("click");
		jQuery("#close_feedback_annotation"+rdfAnnotationDiv+"_"+k).on("click", function(){self._unload(annotationData, rdfAnnotationDiv)});
		
	},
	
	_cancelFeedbackForm: function(annotationData, rdfAnnotationDiv, annotator, xpos, ypos){
		this._unload(annotationData, rdfAnnotationDiv);
	},
	
	_sendFeedbackForm: function(annotationData, rdfAnnotationDiv, annotator, xpos, ypos, commentText, radioButtonValue, email, pmcid, k, src, extId, isAbstract){
		
		if (this._validateEmail(email,  rdfAnnotationDiv, k)){
			var text= this._getAnnotationTextGeneral(annotationData, annotator);
			var messageMail = 'Comment on '+text +' was '+radioButtonValue+' with text value '+commentText;
			var type= this._getAnnotationTypeGeneral(annotationData, annotator);
			var prefix= this._getAnnotationPrefixGeneral(annotationData, annotator);
			var postfix= this._getAnnotationPostfixGeneral(annotationData, annotator);
			var uri= this._getAnnotationUriGeneral(annotationData, annotator);
			var body= this._getAnnotationBodyGeneral(annotationData, annotator);
			
			var self=this;
			
			jQuery.ajax({
	            type: "GET",
	            url: "/sendFeedbackAnnotation.jsp",
	            dataType: 'html',
	            encoding:"UTF-8",
	            contentType: "text/plain; charset=UTF-8",
	            processData: true,
	            data: {"feedback_message": commentText, "judge":radioButtonValue, "semantic_type": type, "exact": text, "prefix":prefix, "postfix": postfix, "email":email, "pmcid": pmcid, "uri": uri, "body": body, "src": src, "ext_id": extId, "isAbstract": isAbstract},
	            headers: {
	                Accept: "application/json",
	                "Access-Control-Allow-Origin": "*"
	            },
	            success: function(resp){
	            	self._openThanksFeedback(resp, annotationData, rdfAnnotationDiv, k);
	              
	            },
	            error: function(e) {
	            	self._openThanksFeedback("KO", annotationData, rdfAnnotationDiv, k);
	            }
	      });
		}
		//this._unload(annotationData, rdfAnnotationDiv);
	},
	
	_openChoiceFeedbackForm: function(annotationData, rdfAnnotationDiv, annotator, xpos, ypos, pmcid, k, src, extId, isAbstract, pos){
		var self=this;
		
		if (isAbstract==0 && (this._startsWith(pmcid, "-")==false)){
			self._closeChoiceFeedbackForm(annotationData, rdfAnnotationDiv, k);
		}
		var htmlFormChoice="<div id=\"feedback_form_negative_"+rdfAnnotationDiv+"_"+k+"\" class=\"choice_feedback_annotation\"><div class=\"choice_feedback_annotation_text negative_annotation_feedback\"><i class=\"fa  fa-warning\"></i> Report problem with annotation</div></div>";
		htmlFormChoice=htmlFormChoice+"<div id=\"feedback_form_positive_"+rdfAnnotationDiv+"_"+k+"\" class=\"choice_feedback_annotation\"><div class=\"choice_feedback_annotation_text positive_annotation_feedback\"><i class=\"fa fa-thumbs-up\"></i> Endorse annotation</div></div>";
		
		        
		//this._unload(annotationData, rdfAnnotationDiv);
		
		jQuery("#feedback_form_choice"+rdfAnnotationDiv+"_"+k).html(htmlFormChoice);
		
		
		jQuery("#feedback_form_negative_"+rdfAnnotationDiv+"_"+k).off("click");
		jQuery("#feedback_form_negative_"+rdfAnnotationDiv+"_"+k).on("click", function(){self._closeChoiceFeedbackForm(annotationData, rdfAnnotationDiv, k); self._openFeedbackForm(annotationData, rdfAnnotationDiv, annotator, xpos, ypos, pmcid, k, src, extId, isAbstract)});
		
		jQuery("#feedback_form_positive_"+rdfAnnotationDiv+"_"+k).off("click");
		jQuery("#feedback_form_positive_"+rdfAnnotationDiv+"_"+k).on("click", function(){self._closeChoiceFeedbackForm(annotationData, rdfAnnotationDiv, k); self._sendFeedbackForm(annotationData, rdfAnnotationDiv, annotator, xpos, ypos, "", "good", "", pmcid, k, src, extId, isAbstract)});
		
		if (isAbstract==0 && (this._startsWith(pmcid, "-")==false)){
		
			jQuery("#feedback_form_choice"+rdfAnnotationDiv+"_"+k).dialog({
	            autoOpen: true, 
	            //height: sizeWindow + 26,
	            //width : sizeWindow + 26,
	            height:"auto",
	            width:"auto",
	            title: '',
	            modal:true,
	            position:[xpos - 200 , ypos + 10],
	            draggable: false,
	            open: function(){
	                jQuery('.ui-widget-overlay').bind('click',function(){
	                	self._closeChoiceFeedbackForm(annotationData, rdfAnnotationDiv, k);
	                });
	                
	            },
	            dialogClass: 'choiceFeedbackRDF',
	            closeText: ''
	         });
		}else{
			jQuery("#feedback_form_choice"+rdfAnnotationDiv+"_"+k).dialog({
	            autoOpen: true, 
	            //height: sizeWindow + 26,
	            //width : sizeWindow + 26,
	            height:"auto",
	            width:"auto",
	            title: '',
	            modal:true,
	            position: {
		             my: 'left-200 top+10',
		             at: 'left-200 top+10',
		             collision: 'fit',
		             of: pos
		         },
	            draggable: false,
	            open: function(){
	                jQuery('.ui-widget-overlay').bind('click',function(){
	                	self._closeChoiceFeedbackForm(annotationData, rdfAnnotationDiv, k);
	                });
	                
	            },
	            dialogClass: 'choiceFeedbackRDF',
	            closeText: ''
	         });
		}
		
		
	},
	
	_closeChoiceFeedbackForm: function(annotationData, rdfAnnotationDiv, k){
		jQuery("#feedback_form_choice"+rdfAnnotationDiv+"_"+k).dialog("close");
		jQuery("#feedback_form_choice"+rdfAnnotationDiv+"_"+k).dialog("destroy");
		jQuery("#feedback_form_choice"+rdfAnnotationDiv+"_"+k).html('');
	},
	
	_validateEmail: function(email, rdfAnnotationDiv, k){
		var retEmail;
	    if(email==undefined || email.length == 0 || email==""){ 
	    	retEmail = true;
	    }else{
	    	var emailRE = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	    	retEmail = emailRE.test(email);
	    }
		
	    if (retEmail){
            jQuery("#email_user"+rdfAnnotationDiv+"_"+k).css("border", "1px solid #999");
			
			jQuery("#email_userError"+rdfAnnotationDiv+"_"+k).text("");
			jQuery("#email_userError"+rdfAnnotationDiv+"_"+k).hide();
		}else{
			jQuery("#email_user"+rdfAnnotationDiv+"_"+k).css("border", "1px solid  red");
			
			jQuery("#email_userError"+rdfAnnotationDiv+"_"+k).text("Enter a valid email address.");
			jQuery("#email_userError"+rdfAnnotationDiv+"_"+k).show();
		}
		
	    return retEmail;
	},
	
	//for GDPR
//	validatePrivacyPolicyCheck: function(rdfAnnotationDiv, k) {
//		var ifAcceptedPrivacyPolicy = document.getElementById("ifAcceptedPrivacyPolicy");
//		var checkbox_id = "check_privacy_policy"+rdfAnnotationDiv+"_"+k; 
//		var checkbox = document.getElementById(checkbox_id);
//		var email_id = "email_user"+rdfAnnotationDiv+"_"+k;
//		var email = document.getElementById(email_id);
//		
//		if(!ifAcceptedPrivacyPolicy && email.value.trim() != "" && !checkbox.checked) 
//			return false;
//
//		return true;
//	}
},{
});