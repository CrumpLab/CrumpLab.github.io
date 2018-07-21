/*
 * Author: Katie Portwin (katieportwin@yahoo.com)
 * 
 * Source: http://imageweb.zoo.ox.ac.uk/pub/2008/plospaper/latest/
 * 
 * Last visited: 2009-11-20
 */

function highlight(terms){
	
	// available styles
	
	var styleOff = terms+'_highlightoff';
	var styleOn = terms+'_highlighton';


	// is it currently on or off?
	var currentStyle=YAHOO.util.Dom.get('highlighting-container').className;	
	var on = (currentStyle.indexOf(styleOn)>-1 ? true : false);
	
    // toggle
    YAHOO.util.Dom.removeClass('highlighting-container', (on ? styleOn : styleOff));
    YAHOO.util.Dom.addClass('highlighting-container', (on ? styleOff : styleOn));   
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



    
