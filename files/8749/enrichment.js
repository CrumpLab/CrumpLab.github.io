/*
 * Author: Katie Portwin (katieportwin@yahoo.com)
 * 
 * Source: http://imageweb.zoo.ox.ac.uk/pub/2008/plospaper/latest/
 * 
 * Last visited: 2009-11-20
 */

function highlightOnLabelClick(terms){
	 highlight(terms);
	 
	 var checkBoxContainerId="";
		
	if (terms=="species"){
		checkBoxContainerId="whatizit_highlight3";
	}else if (terms=="protein"){
		checkBoxContainerId="whatizit_highlight2";
	}else if (terms=="chemical"){
		checkBoxContainerId="whatizit_highlight6";
	}else if (terms=="geneOntology"){
		checkBoxContainerId="whatizit_highlight";
	}else if (terms=="disease"){
		checkBoxContainerId="whatizit_highlight1";
	}
		
	 /**if (jQuery('#'+checkBoxContainerId).attr('checked')!='checked'){
		
		 jQuery('#'+checkBoxContainerId).attr('checked','checked');
		 alert(jQuery('#'+checkBoxContainerId).attr("checked")+" CHECKED");
	 }else{
		 
		 jQuery('#'+checkBoxContainerId).removeAttr('checked');
		 alert(jQuery('#'+checkBoxContainerId).attr("checked")+" UNCHECKED");
	 }*/
	
	if (jQuery('#'+checkBoxContainerId).prop("checked")==false){
		
		 jQuery('#'+checkBoxContainerId).prop({
			  checked: true
		 });
		 //alert(jQuery('#'+checkBoxContainerId).checked+" PROP CHECKED");
	 }else{
		 
		 jQuery('#'+checkBoxContainerId).prop({
			  checked: false
		 });
		 //alert(jQuery('#'+checkBoxContainerId).checked+" PROP UNCHECKED");
	 }
}
function highlight(terms){
	
	// available styles
	//alert("Highlighting");
	var styleOff = terms+'_highlightoff';
	var styleOn = terms+'_highlighton';
	
	var labelLegendId="";
	var styleType="";
	
	if (terms=="species"){
		styleType="organisms_annotation";
		labelLegendId="label_legend_annotation_ORGANISMS";
	}else if (terms=="protein"){
		styleType="genes_proteins_annotation";
		labelLegendId="label_legend_annotation_GENES_PROTEINS";
	}else if (terms=="chemical"){
		styleType="chemicals_annotation";
		labelLegendId="label_legend_annotation_CHEMICALS";
	}else if (terms=="geneOntology"){
		styleType="go_terms_annotation";
		labelLegendId="label_legend_annotation_GO_TERMS";
	}else if (terms=="disease"){
		styleType="disease_annotation";
		labelLegendId="label_legend_annotation_DISEASE";
	}
	
	// is it currently on or off?
	var currentStyle=jQuery('#highlighting-container').attr('class');	
	var on = (currentStyle.indexOf(styleOn)>-1 ? true : false);
	
	if ((jQuery('#'+labelLegendId).hasClass(styleType)==false) && (on==false)){
		jQuery('#'+labelLegendId).addClass(styleType);
	}
	
	if ((jQuery('#'+labelLegendId).hasClass(styleType)) && (on==true)){
		jQuery('#'+labelLegendId).removeClass(styleType);
	}
	
    // toggle
	jQuery('#highlighting-container').removeClass((on ? styleOn : styleOff));
	jQuery('#highlighting-container').addClass((on ? styleOff : styleOn)); 
}

function openPopupHighlight(rdfAnnotationDiv, type, text, url, linkLabel, pos, k){
	
	jQuery("#"+rdfAnnotationDiv).html("<span class=\"menu_annotation_rdf\"></span>");
	var containerMenu = jQuery("#"+rdfAnnotationDiv+" .menu_annotation_rdf");
	
	var menuAnnotationTypeContainer = jQuery("<span class=\"menu_annotation_type\"></span>").appendTo(containerMenu);
	
	jQuery("<span class=\"menu_annotation_type_title\">"+type+"</span>").appendTo(menuAnnotationTypeContainer);
	
	menuAnnotationSingleContainer = jQuery("<span class=\"menu_annotation_single\"></span>").appendTo(menuAnnotationTypeContainer);
	
	//title
	jQuery("<span class=\"menu_annotation_single_title\">"+text+"</span>").appendTo(menuAnnotationSingleContainer);
	
	//links
	menuAnnotationSingleLinksContainer = jQuery("<span class=\"menu_annotation_single_links\"></span>").appendTo(menuAnnotationSingleContainer);
	
	var urlRefineSearch= jQuery('#banner--search-input').val();
	var urlSearch="";
	if (urlRefineSearch!=undefined && urlRefineSearch!=""){
		urlRefineSearch = "http://europepmc.org/search?query="+urlRefineSearch+" AND \""+text+"\"";
	}else{
		urlRefineSearch="";
		urlSearch="http://europepmc.org/search?query=\""+text+"\"";
	}
	
	var linkRefineSearch="";
	var linkSearchArticle="";
	if (urlRefineSearch!=""){
		linkRefineSearch=" <span class=\"menu_annotation_refine_search\" id=\""+rdfAnnotationDiv+"_"+k+"_refinesearchepmc\"><i class=\"fa fa-search\" style=\"color:#62a744;\"></i> Refine Search</span>";
	}else{
		linkSearchArticle=" <span class=\"menu_annotation_search\" id=\""+rdfAnnotationDiv+"_"+k+"_searchepmc\"><i class=\"fa fa-search\" style=\"color:#62a744;\"></i> Search Articles</span>";
	}
	
	
    menuAnnotationSingleLinksContainer.html("<span class=\"menu_annotation_details\" id=\""+rdfAnnotationDiv+"_"+k+"_details\"><i class=\"fa fa-external-link\" style=\"color:#62a744;\"></i> "+linkLabel+"</span> |"+linkRefineSearch+linkSearchArticle);
    
	
	//provider
	 jQuery("<span class=\"menu_annotation_provider\">Annotation source: EuropePMC</span>").appendTo(menuAnnotationSingleContainer);
	
	
	menuAnnotationTypeContainer.css("border-bottom","0px");
	
	
	jQuery("#"+rdfAnnotationDiv+"_"+k+"_details").off("click");
	jQuery("#"+rdfAnnotationDiv+"_"+k+"_details").on("click", function(){window.open(url,"_blank");});
		
	if (jQuery("#"+rdfAnnotationDiv+"_"+k+"_searchepmc")!=undefined && jQuery("#"+rdfAnnotationDiv+"_"+k+"_searchepmc").length>0){
		jQuery("#"+rdfAnnotationDiv+"_"+k+"_searchepmc").off("click");
		jQuery("#"+rdfAnnotationDiv+"_"+k+"_searchepmc").on("click", function(){window.open(urlSearch,"_blank");});
	}
			
	if (jQuery("#"+rdfAnnotationDiv+"_"+k+"_refinesearchepmc")!=undefined && jQuery("#"+rdfAnnotationDiv+"_"+k+"_refinesearchepmc").length>0){
		jQuery("#"+rdfAnnotationDiv+"_"+k+"_refinesearchepmc").off("click");
		jQuery("#"+rdfAnnotationDiv+"_"+k+"_refinesearchepmc").on("click", function(){window.open(urlRefineSearch,"_blank");});
	}

	var sizeWindow = 440;
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
         },
         close: function(event, ui) {
      		jQuery("#"+rdfAnnotationDiv).dialog("destroy");
      		jQuery("#"+rdfAnnotationDiv).html("");
         },
         
         dialogClass: 'noTitleDialogRDF',
         closeText: ''
      });
}

function registerHighlightClicks(){
	jQuery(document).on('click', "#highlighting-container.species_highlighton span.species a", function(pos){
		pos.preventDefault();
		rdfAnnotationDiv="div_highlight_dialog_id";
		
		var prefixToSearch= "?whatizit_url_Species=";
		var indexLink= jQuery(this).attr("href").indexOf(prefixToSearch);
		var urlLink = jQuery(this).attr("href").substring((indexLink+ prefixToSearch.length));
		
		openPopupHighlight(rdfAnnotationDiv, "Organisms", jQuery(this).text(), urlLink, "Taxonomy",  pos, 1);
		
	});
	
	jQuery(document).on('click', "#highlighting-container.species_highlightoff span.species a", function(pos){
		pos.preventDefault();	
	});
	
	jQuery(document).on('click', "#highlighting-container.geneOntology_highlighton span.geneOntology a", function(pos){
		pos.preventDefault();
		rdfAnnotationDiv="div_highlight_dialog_id";
		
		var prefixToSearch= "?whatizit_url_go_term=";
		var indexLink= jQuery(this).attr("href").indexOf(prefixToSearch);
		var urlLink = jQuery(this).attr("href").substring((indexLink+ prefixToSearch.length));
		
		openPopupHighlight(rdfAnnotationDiv, "Gene Ontology", jQuery(this).text(), urlLink, "GO Term",  pos, 1);
		
	});
	
	jQuery(document).on('click', "#highlighting-container.geneOntology_highlightoff span.geneOntology a", function(pos){
		pos.preventDefault();	
	});
	
	jQuery(document).on('click', "#highlighting-container.disease_highlighton span.disease a", function(pos){
		pos.preventDefault();
		rdfAnnotationDiv="div_highlight_dialog_id";
		
		var prefixToSearch= "?whatizit_url=";
		var indexLink= jQuery(this).attr("href").indexOf(prefixToSearch);
		var urlLink = jQuery(this).attr("href").substring((indexLink+ prefixToSearch.length));
		
		openPopupHighlight(rdfAnnotationDiv, "Diseases", jQuery(this).text(), urlLink, "Disease",  pos, 1);
		
	});
	
	jQuery(document).on('click', "#highlighting-container.disease_highlightoff span.disease a", function(pos){
		pos.preventDefault();	
	});
	
	jQuery(document).on('click', "#highlighting-container.protein_highlighton span.protein a", function(pos){
		pos.preventDefault();
		rdfAnnotationDiv="div_highlight_dialog_id";
		
		var prefixToSearch= "?whatizit_url_gene_protein=";
		var indexLink= jQuery(this).attr("href").indexOf(prefixToSearch);
		var urlLink = jQuery(this).attr("href").substring((indexLink+ prefixToSearch.length));
		
		openPopupHighlight(rdfAnnotationDiv, "Genes/Proteins", jQuery(this).text(), urlLink, "UniProt",  pos, 1);
		
	});
	
	jQuery(document).on('click', "#highlighting-container.protein_highlightoff span.protein a", function(pos){
		pos.preventDefault();	
	});
	
	jQuery(document).on('click', "#highlighting-container.chemical_highlighton span.chemical a", function(pos){
		pos.preventDefault();
		rdfAnnotationDiv="div_highlight_dialog_id";
		
		var prefixToSearch= "?whatizit_url_Chemicals=";
		var indexLink= jQuery(this).attr("href").indexOf(prefixToSearch);
		var urlLink = jQuery(this).attr("href").substring((indexLink+ prefixToSearch.length));
		
		openPopupHighlight(rdfAnnotationDiv, "Chemicals", jQuery(this).text(), urlLink, "ChEBI",  pos, 1);
		
	});
	
	jQuery(document).on('click', "#highlighting-container.chemical_highlightoff span.chemical a", function(pos){
		pos.preventDefault();	
	});
	
	
}


function allonoff(){
	
	// is it currently on or off?
	var currentStyle=YAHOO.util.Dom.get('button_allonoff').className;	
	var on = (currentStyle.indexOf('button_allon')>-1 ? true : false);

	var onofftextelem = "***highlight on/off***";
	if (on) {
		onofftextelem = YAHOO.util.Dom.get('highlighton');
	} else {
		onofftextelem = YAHOO.util.Dom.get('highlightoff');
	}

    //alert("allon="+on);

	for(n=0; n<arguments.length; n++){
		var styleOff = arguments[n]+'_highlightoff';
		var styleOn = arguments[n]+'_highlighton';

        YAHOO.util.Dom.removeClass('highlighting-container', (on ? styleOn : styleOff));
        YAHOO.util.Dom.addClass('highlighting-container', (on ? styleOff : styleOn));  		
	}	
	
	// change button itself
	var styleOff = 'button_alloff';
	var styleOn = 'button_allon';
	
    YAHOO.util.Dom.removeClass('button_allonoff', (on ? styleOn : styleOff));
    YAHOO.util.Dom.addClass('button_allonoff', (on ? styleOff : styleOn));
    //YAHOO.util.Dom.get('button_allonoff').innerHTML=(on ? "turn all highlighting on" : "turn all highlighting off");
    YAHOO.util.Dom.get('button_allonoff').innerHTML=onofftextelem.innerHTML;
}


function initTooltips(){

	tt1 = new YAHOO.widget.Tooltip("tt1",  
	                        { context:"tooltip_ref6_occ1",  
	                          text:document.getElementById("tooltip_ref6_occ1_body").innerHTML,
	                          autodismissdelay:60000});
	                          		
	                          			  
	tt3 = new YAHOO.widget.Tooltip("tt3",  
	                        { context:"tooltip_ref6_occ3",  
	                          text:document.getElementById("tooltip_ref6_occ3_body").innerHTML,
	                          autodismissdelay:60000});
	                          	                           
}


 
function sort_references(order){
	
	
	var container = document.getElementById('references')
	
	// store existing ones
	var refElements = new Array();
	
	//for(n=0; n<=YAHOO.util.Dom.getElementsByClassName('ref').length; n++){//performs too slowly  todo - think of alternative
	for(n=1; n<=52; n++){
		var refElement = document.getElementById("ref"+n);
		if(refElement!=null){
			refElements[n]= refElement;
		}	
	}	
	
	
	// remove existing ones from DOM
	while(container.hasChildNodes()){
		container.removeChild(container.firstChild);
	}	
	
	// put them back in new order
	if(order[0][0]!=null){
		//2d array for grouping
		for(n=0; n<order.length; n++){
			var innerarr = order[n];
			var li = document.createElement("li");
			var p = document.createElement("p");
			var br = document.createElement("br");
			var ol = document.createElement("ol");
			container.appendChild(li);
			li.appendChild(p);
			p.appendChild(br);
			p.appendChild(ol);
			
			for(m=0; m<innerarr.length; m++){
				if(refElements[innerarr[m]]!=null){
					ol.appendChild(refElements[innerarr[m]]);
				}
			}
		}		
	}else{	
		//single list
		for(n=0; n<order.length; n++){
			if(refElements[order[n]]!=null){
				container.appendChild(refElements[order[n]]);
			}
		}
	}
}

function references_frequency_tagcloud_on(){
	YAHOO.util.Dom.addClass('references', 'references_citedfrequencyon');
}

function references_frequency_tagcloud_off(){
	YAHOO.util.Dom.removeClass('references', 'references_citedfrequencyon');
}


function addToConnotea() {
	var encodeUri=window.encodeURIComponent;
  	  w=open('http://www.connotea.org/addpopup?continue=confirm&uri='+encodeUri(location.href)+'&title='+encodeUri(document.title),'add','width=660,height=600,scrollbars,resizable=yes');
 	  window.setTimeout('w.focus()',200);
}



    
