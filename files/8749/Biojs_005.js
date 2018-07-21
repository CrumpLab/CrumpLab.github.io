/**
 * Annotations order (Insert all the new providers after GenerRif and before Nactem):
 * Europepmc
 * GeneRif
 * Disgenet
 * Greco
 * NCBI
 * Nactem
 * IntAct
 * OpenTarget
 */
Biojs.Annotator = Biojs.AnnotatorBase.extend(
/** @lends Biojs.Annotator# */
{
	constructor: function(options){
		
		if (this.opt.proxyUrl == undefined){
			this.opt.proxyUrl= '../biojs/dependencies/proxy/proxy.php';
		}
		
		if (this.opt.allowDuplicates == false){
			this.opt.optimizedVersion = false;
			this.opt.splitted = false;
		}
		
		if (this.opt.elaborationAnnotation == false){
			this.opt.smartSelect = false;
		}
		
		this._className= Biojs.AnnotatorBase.CLASSNAME_RDF;
	},
	
	 /** 
	    * Default options (and its values) for the Citation component. 
	    * @name Biojs.Citation-opt
	    * @type Object
	    */
	opt: {
	   target: undefined,
	   pmcId: undefined,
	   annotationTypesStart:[],
	   noAnnotationStart:true,
	   idLegend:'',
	   charactersMatch:-1,
	   allowDuplicates:true,
	   optimizedVersion: true,
	   optimizationStrategy:"NORMAL",
	   splitted: true,
	   splitInterval: 800,
	   splitSize:100,
	   splitIntervalPreElaborate: 800,
	   splitSizePreElaborate:1000,
	   loadingStatusImage:"/docs/spin_annotatations.gif",
	   prehighlight: true,
	   elaborationAnnotation: true,
	   smartSelect: true,
	   onlyFirstAnnotation:true,
	   preFilter:false,
	   numberOfPrefiltered:2,
	   caseSensitive: true,
	   alert: 0,
	   checkAnnotationDiscoverability: true,
	   regExpSearch: false,
	   regExpByCharacter: false,
	   isAbstract:0,
	   src:'',
	   extId:'',
	   entity:'article',
	   specificId:0,
	   annotationId:'',
	   showDetailedItems: 1,
	   numerItemLegends: 12,
	   fuzzySearch: false,
	   fuzzyThreshold: 0.01,
	   //fuzzyThreshold: 0.1,
	   fuzzyThresholdSuffixes: 0.25,
	   fuzzyPreserveWhiteSpaces: false
	},
	
	_annotationsData:[],
	_annotationsMarked:[],
	_annotationsHighlighted:[],
	_annotationsCompletelyMarked:[],
	_idAnnotationsMarked:[],
	_indexStart: -1,
	_indexStartElaboration: -1,
	_annotationStartIndex: 0,
	_timeElapsed: 0,
	_dataResult: [],
	_dataResultUnselected: [],
	_originalText:'',
	_className:"",
	_sharedData: new AnnotatorSharedData(),
	_loadingTime : 0,
	_lastStep : false,
	_openedPopupFigures : false,
	_plainSentences : [],
	
	
	resetStatus: function(){
		this._annotationsData=[];
		this._annotationsMarked=[];
		this._annotationsHighlighted=[];
		this._annotationsCompletelyMarked=[];
		this._idAnnotationsMarked=[];
		this._indexStart= -1;
		this._annotationStartIndex= 0;
		this._timeElapsed= 0;
		this._indexStartElaboration = -1;
	},
	
	_preOrderAnnotationsByPopularity: function (){
		var annotationsCounter = [];
		var k;
		var i;
		var alreadyInserted;
		var type;
		var mostPopularAnnotations= [];
		for (k=0; k<this._annotationsData.length; k++){
			type = this._getAnnotationType(this._annotationsData[k]);
			alreadyInserted = false;
			for (i=0; i<annotationsCounter.length; i++){
				if (annotationsCounter[i].type == type){
					annotationsCounter[i].counter = annotationsCounter[i].counter + 1;
					alreadyInserted = true;
					break;
				}
			}
			
			if (alreadyInserted == false){
				annotationsCounter[annotationsCounter.length] = {type: type, counter: 1};
			}
			
		}
		
		
		
		 if (annotationsCounter.length > 0){
			 annotationsCounter.sort(function(a, b){ 
	         		if (a.counter >= b.counter){
	         			return -1;
	         		}else{
	         			return 1;
	         		}
	         });
			 
			 
			 for (i=0; i<annotationsCounter.length;i++){
				 mostPopularAnnotations[mostPopularAnnotations.length] = annotationsCounter[i].type;
				 if (mostPopularAnnotations.length >= this.opt.numberOfPrefiltered){
					 break;
				 }
			 }
		 }
		 
		 return mostPopularAnnotations;
		
	},
	
	_getFixedAnnotationsStartup: function (){
		 return [Biojs.AnnotatorBase.ACCESSION_NUMBERS];
	},
	
	_filterAnnotations: function (){
		var mostPopularAnnotations = this._preOrderAnnotationsByPopularity();
		var annotationsTypesFiltered = this._getFixedAnnotationsStartup();
		var i;
		for (i=0; i<mostPopularAnnotations.length;i++){
			annotationsTypesFiltered[annotationsTypesFiltered.length] = mostPopularAnnotations[i];
		}
		
		return annotationsTypesFiltered;
	},

	/**
	 * Array containing the supported event names
	 * @name Biojs.Citation-eventTypes
	 */
	eventTypes : [
  		/**
  		 * @name Biojs.Citation#onRequestError
  		 * @event Event raised when there's a problem during the citation data loading. An example could be that some mandatory parameters are missing, or no citation is identified by the specified parameters in the Europe PMC system.
  		 * @param {function} actionPerformed A function which receives an {@link Biojs.Event} object as argument.
  		 * @eventData {Object} source The component which did triggered the event.
  		 * @eventData {string} error Error message explaining the reason of the failure.
  		 * 
  		 * @example 
  		 * instance.onRequestError(
  		 *    function( e ) {
  		 *       alert ('Error during citation data retrieving:'+e.error);
  		 *    }
  		 * ); 
  		 * 
  		 * */
  		"onRequestError",
  		/**
  		 * @name Biojs.Citation#onCitationLoaded
  		 * @event  Event raised when the citation data loading process is successful
  		 * @param {function} actionPerformed A function which receives an {@link Biojs.Event} object as an argument.
  		 * 
  		 * @example 
  		 * instance.onCitationLoaded(
  		 *    function( e ) {
  		 *      alert ('Citation loaded successfully');
  		 *    }
  		 * ); 
  		 * 
  		 * */
  		"onAnnotationsLoaded",
  		"onTextChanged"
	],
	

	_getAnnotatorTypeLabel: function(){
		return "europepmc";
	},
	
	_getParamRequest: function(){
		var self=this;
		if (self.opt.isAbstract==1){
			if (self.opt.specificId==0){ 
				return {"src": self.opt.src, "ext_id": self.opt.extId,"type": self._getAnnotatorTypeLabel()};
			}else{
				return {"src": self.opt.src, "ext_id": self.opt.extId,"annotationId": self.opt.annotationId};
			}
		}else{
			if (self.opt.specificId==0){ 
				return {"pmcid": self.opt.pmcId,"type": self._getAnnotatorTypeLabel()};
			}else{
				return {"pmcid": self.opt.pmcId,"annotationId": self.opt.annotationId};
			}
		}
	},
	
	load: function() {
		
		if ((this.opt.isAbstract==0) && (this.opt.pmcId==undefined || this.opt.pmcId ==0)){
			 this.raiseEvent(Biojs.Annotator.EVT_ON_REQUEST_ERROR, {error:"pmcId parameter mandatory"});
		}else if ((this.opt.isAbstract==1) && (this.opt.src==undefined || this.opt.src =='')){
			 this.raiseEvent(Biojs.Annotator.EVT_ON_REQUEST_ERROR, {error:"src parameter mandatory"});
		}else if ((this.opt.isAbstract==1) && (this.opt.extId==undefined || this.opt.extId =='')){
			 this.raiseEvent(Biojs.Annotator.EVT_ON_REQUEST_ERROR, {error:"extId parameter mandatory"});
		}else if (this.opt.target==undefined || this.opt.target ==''){
			 this.raiseEvent(Biojs.Annotator.EVT_ON_REQUEST_ERROR, {error:"target parameter mandatory"});
		}else{
		
			/**var urlRequest = ''+ this.opt.hostVirtuoso + this.opt.restRdfUrl;
			urlRequest = urlRequest.replace(new RegExp("{pmcid}", "g"),this.opt.pmcId);*/
			
			var self = this;
			var legendaContainer = jQuery('#'+self.opt.idLegend);
			
			if ((legendaContainer!== undefined) && (legendaContainer.html()=="") && (self.opt.loadingStatusImage !== undefined)) {
       			
       			legendaContainer.html('<div class="legend_annotation_loading"></div>');
       			var legendaContainerInside = jQuery('#'+self.opt.idLegend+' .legend_annotation_loading');
       			
       			//legendaContainerInside.html('<div class=\"annotation_visualization_loading_icon\"><i class=\"fa fa-spinner fa-spin fa-2x\"></i></div><div class=\"annotation_visualization_loading_label\">Loading annotations...</div>');
       			legendaContainerInside.html('<div class=\"annotation_visualization_loading_icon\"><img src=\"'+self.opt.loadingStatusImage+'\"/></div><div class=\"annotation_visualization_loading_label\">Loading annotations...</div>');

       			/**legendaContainerInside.css('width','32px');
       			legendaContainerInside.css('height','32px');
       			legendaContainerInside.css('margin-left','81px');
       			legendaContainerInside.css('margin-top','41px');
       			
       			legendaContainerInside.css( 'background-image', 'url(' + self.opt.loadingStatusImage + ')' );
       			legendaContainerInside.css( 'background-repeat', 'no-repeat' );*/
       			legendaContainer.show();
    		}
			
			this._loadingTime = new Date().getTime();
			if (this._originalText==''){ 
				this._originalText = this._getTextContainer();
				this._splitSentences();
				
			}
			
			 jQuery.ajax({
		            type: "GET",
		            url: self.opt.proxyUrl,
		            dataType: 'json',
		            encoding:"UTF-8",
		            contentType: "text/plain; charset=UTF-8",
		            data: self._getParamRequest(),
		            headers: {
		                Accept: "application/json",
		                "Access-Control-Allow-Origin": "*"
		            },
		            success: function(resp) {
		               if (resp.results.bindings!=undefined && resp.results.bindings.length>0){
		            	   
		            	   self._loadingTime = new Date().getTime() - self._loadingTime;
		            	   
		            	   self._annotationsData = resp.results.bindings;
		            	   
		            	   self._manipulateResponse();

		           		   self._annotationsData.sort(function(a, b){ 
		           			                      		return self._sortAnnotations(a,b);
		           			                      });
		           		   
		           		   if (self.opt.preFilter){
		           			 self.opt.annotationTypesStart = self._filterAnnotations();
		           		   }
		           		   
			               self._highlightAnnotations();
		              }else{
		            	   self.raiseEvent(Biojs.Annotator.EVT_ON_REQUEST_ERROR, {error:"Impossible to find an annotation for the pmcId "+self.opt.pmcId});
		            	   if (self.opt.alert==1){ 
		            		   alert(self._createAlertMessageNoDataFound());
		            	   }
			               if (self.opt.loadingStatusImage !== undefined ) {
			            	   if (self._sharedData.getAnnotationFound().length==0 && self._lastStep==true){
			            		   var legendaContainer = jQuery('#'+self.opt.idLegend);
			            		   legendaContainer.html('');
			            	   }
			     				
			     		   }
			               
			               self._postHighlightDone();
			               
			               self._postHighlightDoneSpecificId();
		              }
		              
		            },
		            error: function(e) {
		            	self.raiseEvent(Biojs.Annotator.EVT_ON_REQUEST_ERROR, {error:"Generic error"});
		            	if (self.opt.loadingStatusImage !== undefined ) {
		            		 if (self._sharedData.getAnnotationFound().length==0 && self._lastStep==true){
		            			 var legendaContainer = jQuery('#'+self.opt.idLegend);
		    					 legendaContainer.html('');
		            		 }
		    			}
		            	if (self.opt.alert==1){ 
		            		alert(self._createAlertMessageError());
		            	}
		            	self._postErrorDone();
		            }
		      });
			
			
		}
	},
	
	_manipulateResponse: function (){
		
	},
	
	_postHighlightDone: function(){
		if (this.opt.specificId==0){ 
			var geneRefAnnotator= new Biojs.AnnotatorGeneRef({});
			geneRefAnnotator.setOptionsFromAncestor(this, Biojs.AnnotatorBase.CLASSNAME_GENE_REF, this._sharedData);
			geneRefAnnotator.load();
		}
		
	},
	
	_hideLegend: function(){
		if (this.opt.idLegend!= undefined && this.opt.idLegend!='' && this._sharedData.getAnnotationFound().length==0){
			jQuery('#'+this.opt.idLegend).html('');
		}
	},
	
	_postErrorDone: function(){
		this._postHighlightDone();
		
		this._postHighlightDoneSpecificId();
	},
	
	_highlightAnnotations: function (){

		
		var startTime = new Date().getTime();

		var self = this;
		var type = "";
		var annotation;
		var originalText;
		
		
		originalText = this._getTextContainer();
		
		if (this._originalText==''){ 
			this._originalText = this._getTextContainer();
			this._splitSentences();
		}
		
		if (this.opt.splitted == false){
			this._indexStart= -1;
	    }

		var indexStart =0;
		if (this.opt.splitted){
			indexStart = this._annotationStartIndex;
		}
		
		var numberAnnotationProcessed=0;
		for (var i=indexStart; i<this._annotationsData.length; i++){ 
			annotation= this._annotationsData[i];
			type = this._getAnnotationType(annotation); 
			
			if (type!=null){
				if (this._sharedData.isAnnotationFound(type)==false){
					
					if ((this.opt.checkAnnotationDiscoverability==false) || (this._checkAnnotationDiscoverability(originalText, annotation))){ 
						if (this._isAnnotationAllowedStart(type)==false){
							this._sharedData.appendAnnotationFound({type: type, annotator: this, total:1}, this._getAnnotationExactDetails(annotation));
						}else{
							this._sharedData.appendAnnotationFound({type: type, annotator: this, total:0}, null);
						}
					}
				}else{
					if (this._isAnnotationAllowedStart(type)==false){
						this._sharedData.incAnnotationFound(type, this._getAnnotationExactDetails(annotation));
					}
				}
				
				if (this._isAnnotationAllowedStart(type)){
					
					if (this.opt.prehighlight){
						originalText = this._highligthAnnotation(originalText, annotation, i);
					}
				
				   if (this.opt.elaborationAnnotation){ 
					   this._elaborateAnnotation(annotation, i);
				   }
				   
				   if ((this._isAnnotationMarked(type)==false) && (this.opt.specificId==0)){
						this._annotationsMarked[this._annotationsMarked.length]=type;
				   }
				
				}
			}
			
			numberAnnotationProcessed = numberAnnotationProcessed + 1;
			if (((this.opt.splitted) && (numberAnnotationProcessed == this.opt.splitSizePreElaborate)) || (i== (this._annotationsData.length -1))){
				this._annotationStartIndex = i + 1;
				break;
			}
		}
		
		this._setTextContainer(originalText);
		
		var endTime = new Date().getTime();
		this._timeElapsed = this._timeElapsed + (endTime - startTime);
		
		if (((this.opt.splitted==false) || (this._annotationStartIndex == this._annotationsData.length)) ==false){
			setTimeout(function(){self._highlightAnnotations()}, self.opt.splitIntervalPreElaborate);
		}else{
			if (this.opt.idLegend!= undefined && this.opt.idLegend!='' && (this._sharedData.getAnnotationFound().length>0) && (this.opt.specificId==0)){
				this._buildAgenda();
			}
			if (this.opt.alert==1){ 
				alert (this._createAlertMessageDone());
			}
			//self.raiseEvent(Biojs.Annotator.EVT_ON_ANNOTATIONS_LOADED, {});
			
			this._postHighlightDone();
			
			this._postHighlightDoneSpecificId();
			
		}
	},
	
	_postHighlightDoneSpecificId: function (){
		if (this.opt.specificId==1){
			if ((jQuery('#'+Biojs.Annotator.ANNOTATION_ID_LINK_BACK)!=undefined) && (jQuery('#'+Biojs.Annotator.ANNOTATION_ID_LINK_BACK).length>0)){ 
				this._scrollToAnnotation(Biojs.Annotator.ANNOTATION_ID_LINK_BACK);
				jQuery('#'+Biojs.Annotator.ANNOTATION_ID_LINK_BACK).addClass('annotationFound');
				setTimeout(function(){ jQuery('#'+Biojs.Annotator.ANNOTATION_ID_LINK_BACK).removeClass('annotationFound'); }, 500);
			}
			
			this.resetStatus();
			this._sharedData.resetStatus();
			
			if (this.opt.isAbstract==0){
				loadAnnotationsFullText(this.opt.pmcId,this.opt.target,this.opt.idLegend,true,'');
			}else{
				loadAnnotationsAbstract(this.opt.src,this.opt.extId,this.opt.target,this.opt.idLegend,true,'',this.opt.entity);
			}
			
		}
	},
	
	_createAlertMessageDone: function (){
		return 'Annotations loaded from triple store totally in '+this._loadingTime+' ms \n Annotations highlighted totally in '+this._timeElapsed+' ms';
	},
	
	_createAlertMessageNoDataFound: function (){ 
		return "No annotations found from TRIPLE STORE for the pmcId "+this.opt.pmcId;
	},
	
	_createAlertMessageError: function (){ 
		return "Error calling the TRIPLE STORE ";
	},
	
	_addDataResult: function (startOffset, endOffset, annotation){
		
		var typeAnnotation= this._getAnnotationType(annotation);
		var annotationDataResult = {type: typeAnnotation, offset:{startIndex: startOffset, endIndex: endOffset}, annotationsConnected: [{data: annotation, annotator:this._className, offset:{startIndex: startOffset, endIndex: endOffset}}]};
		
		return this._sharedData.appendDataResult(annotationDataResult);
		//this._dataResult [this._dataResult.length] = annotationDataResult;
		
	},
	
	_mergeDataResult: function(checkSize, keepCurrentIndex){
		this._dataResult = this._sharedData.getDataResult();
		if ((this._dataResult.length > 0) || (checkSize==false)){
		
			 //alert(' this._dataResult '+ this._dataResult.length);
			 
			 this._dataResult.sort(function(a, b){ 
	          		if (a.offset.startIndex <= b.offset.startIndex){
	          			return -1;
	          		}else{
	          			return 1;
	          		}
	          });
			 
			 var k;
			 var dataResultMerged = [];
			 var sortedDataResult = null;
			 var j;
			 var self=this;
			 for (k=0; k<this._dataResult.length; k++){
				 if (sortedDataResult == null){
					 sortedDataResult = this._dataResult[k];
				 }else{
					 
					 if (this._dataResult[k].offset.startIndex > sortedDataResult.offset.endIndex){
						 //no overlap with next annotation
						 sortedDataResult.annotationsConnected.sort(function(a, b){ 
				          		if (self._getAnnotationTextGeneral(a.data, a.annotator).length >= self._getAnnotationTextGeneral(b.data, b.annotator).length){
				          			return -1;
				          		}else{
				          			return 1;
				          		}
				          });
						 sortedDataResult.type = this._getAnnotationTypeGeneral(sortedDataResult.annotationsConnected[0].data, sortedDataResult.annotationsConnected[0].annotator);
						 dataResultMerged[dataResultMerged.length] = sortedDataResult;
						 sortedDataResult = this._dataResult[k];
					 }else{
						 //overlap with previous annotation
						 for (j=0;j<this._dataResult[k].annotationsConnected.length;j++){
							 sortedDataResult.annotationsConnected[sortedDataResult.annotationsConnected.length] = this._dataResult[k].annotationsConnected[j];
						 }
						 
						 if (this._dataResult[k].offset.endIndex > sortedDataResult.offset.endIndex){
							 //need to update end index
							 sortedDataResult.offset.endIndex = this._dataResult[k].offset.endIndex;
						 }
						 
					 }
				 }
			 }
			 
			 if (sortedDataResult!=null){
				 //update last
				 sortedDataResult.annotationsConnected.sort(function(a, b){ 
		          		if (self._getAnnotationTextGeneral(a.data, a.annotator).length >= self._getAnnotationTextGeneral(b.data, b.annotator).length){
		          			return -1;
		          		}else{
		          			return 1;
		          		}
		          });
				 sortedDataResult.type = this._getAnnotationTypeGeneral(sortedDataResult.annotationsConnected[0].data, sortedDataResult.annotationsConnected[0].annotator);
				 dataResultMerged[dataResultMerged.length] = sortedDataResult;
			 }
			 
			 //alert('dataResultMerged '+dataResultMerged.length+' this._dataResult '+ this._dataResult.length);
			 
			 this._dataResult = dataResultMerged;
			 this._dataResult.sort(function(a, b){ 
	       		if (a.offset.startIndex <= b.offset.startIndex){
	       			return -1;
	       		}else{
	       			return 1;
	       		}
	        });
			 
			 
			 
			 this._reHighlightAnnotations(this._dataResult, keepCurrentIndex);
			 
			 this._sharedData.setDataResult(this._dataResult);
		}
		 
	},
	
	_reHighlightAnnotations : function(dataResultMerged, keepCurrentIndex){
		
		var increasedOffset = 0;
		var k=0;
		var textArticle = this._originalText;
		var textAnnotation;
		var prefixHTML;
		var postfixHTML;
		var idAnnotation;
		var idAnnotationDialog;
		var style_class;
		var actionAnnotator= new Biojs.AnnotatorAction({});
		var currentAnnotationData;
		this._sharedData.incRehighlightIteration();
		var rehighlightIteration = this._sharedData.getRehighlightIteration();
		
		this._resetRegisterIdSingleAnnotation(keepCurrentIndex);
		
		for (k=0; k<dataResultMerged.length; k++){
			currentAnnotationData = dataResultMerged[k];
			style_class = this._getAnnotationStyle(currentAnnotationData.type);
			textAnnotation = textArticle.substring (currentAnnotationData.offset.startIndex + increasedOffset, currentAnnotationData.offset.endIndex + increasedOffset);
			
			prefixHTML = textArticle.substr(0, currentAnnotationData.offset.startIndex + increasedOffset);
			postfixHTML = textArticle.substr(currentAnnotationData.offset.startIndex + increasedOffset + textAnnotation.length);
			
			if (this.opt.specificId==0){ 
				idAnnotation = "rdf_annotation_"+rehighlightIteration+"_"+k;
			}else{
				idAnnotation = Biojs.Annotator.ANNOTATION_ID_LINK_BACK;
				style_class = Biojs.Annotator.ANNOTATION_ID_LINK_BACK_CLASS;
			}
			idAnnotationDialog = idAnnotation+"_dialog";
			
			if (this.opt.specificId==0){ 
				replacement = "<span id=\""+idAnnotation+"\" class=\""+style_class+"\">"+textAnnotation+"</span><span style=\"display:inline-block;width:0px;height:0px;\" class=\"annotation_dialog_container\" id=\""+idAnnotationDialog+"\"></span>";
				this._linkClickSingleAnnotation(actionAnnotator, idAnnotation, currentAnnotationData.annotationsConnected, idAnnotationDialog, k);
				
				this._registerIdSingleAnnotation(idAnnotation, currentAnnotationData.annotationsConnected);
			}else{
				replacement = "<span id=\""+idAnnotation+"\" class=\""+style_class+"\">"+textAnnotation+"</span>";
			}
			
			textArticle = prefixHTML + replacement+postfixHTML;
			
			increasedOffset = increasedOffset + (replacement.length - textAnnotation.length);
			
			//this._setTextContainer(textArticle);
		}
		
		this._setTextContainer(textArticle);
		
		if (this.opt.isAbstract==0){ 
			
			if (window.MathJax != undefined){ 
				MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
			}
		}

	},
	
	_linkClickSingleAnnotation : function(actionAnnotator, idAnnotation, annotationsConnected, idAnnotationDialog, k){
		var self=this;
		if (self.opt.specificId==0){ 
			
			jQuery(document).off('click', '#'+idAnnotation);
			jQuery(document).on('click', '#'+idAnnotation ,function(pos){
				jQuery('#'+idAnnotation).addClass('annotationClicked');
				actionAnnotator.load(annotationsConnected, idAnnotationDialog, k, pos.clientX, pos.clientY, self.opt.pmcId, self.opt.src, self.opt.extId, self.opt.isAbstract, pos, idAnnotation);
				
			});
		}
		
	},
	
	_registerIdSingleAnnotation : function(idAnnotation, annotationsConnected){
		var typeAnn;
		var exactDetailsAnn;
		for (var i = 0; i< annotationsConnected.length; i++){
			typeAnn = this._getAnnotationTypeGeneral(annotationsConnected[i].data, annotationsConnected[i].annotator);
			exactDetailsAnn = this._getAnnotationExactDetailsGeneral(annotationsConnected[i].data, annotationsConnected[i].annotator);
			this._sharedData.registerIdAnnotationFound(idAnnotation, typeAnn, exactDetailsAnn);
		}
		
	},
	
    _resetRegisterIdSingleAnnotation : function(keepCurrentIndex){
    	this._sharedData.resetRegisterIdAnnotationFound(keepCurrentIndex);
	},
	
	_goToNextAnnotation : function(type){
		var labelLegend = this._getAnnotationLabel(type);
		var idNextAnnotation = this._sharedData.goToNextAnnotation(type, labelLegend);
		if (idNextAnnotation !=""){
			this._scrollToAnnotation(idNextAnnotation);
		}
		//this._manageUpDownIconsAgenda(type);
	},
	
	_goToPreviousAnnotation : function(type){
		var labelLegend = this._getAnnotationLabel(type);
		var idPreviousAnnotation = this._sharedData.goToPreviousAnnotation(type, labelLegend);
		if (idPreviousAnnotation !=""){
			this._scrollToAnnotation(idPreviousAnnotation);
		}
		//this._manageUpDownIconsAgenda(type);
	},
	
	_scrollToAnnotation: function (idAnnotation){
		this._sharedData.scrollToAnnotation(idAnnotation);
	},
		
	_elaborateAnnotation: function(annotation, orderInfo){
	    	var textAnnotation = this._getAnnotationText(annotation);
	    	var exactDetailsAnnotation = this._getAnnotationExactDetails(annotation)
			var prefixAnnnotation= this._elaboratePreFixAnnotation(this._getAnnotationPrefix(annotation));
			var postfixAnnotation= this._elaboratePostFixAnnotation(this._getAnnotationPostfix(annotation));
			var typeAnnotation=   this._getAnnotationType(annotation);
			
			var start=0;
			if (this.opt.optimizedVersion && (this._indexStartElaboration>0)){
				start = this._indexStartElaboration;
			}

			var firstFinding = true;
	
			var resultSearch = this._findText(textAnnotation, this._originalText, start, true);
			
			indexFound = resultSearch.index;
			
			var prefixHTML,prefixPlain,postfixHTML,postfixPlain;
			
			var annotationToAdd;
			
			var matchResult;
		
			while(indexFound >0){
				prefixHTML = this._originalText.substr(0, indexFound);
				prefixPlain = this._elaboratePreFixHtml(this._stripsHTMLTags(prefixHTML));
				postfixHTML = this._originalText.substr(indexFound + resultSearch.matchedText.length);
				postfixPlain = this._elaboratePostFixHtml(this._stripsHTMLTags(postfixHTML));
				
				matchResult= this._isAnnotationMatching(prefixPlain, prefixAnnnotation, postfixPlain, postfixAnnotation);
				if (matchResult.matched){
					if (this.opt.optimizedVersion){ 
						if (firstFinding && (matchResult.fuzzy==false) && (this._isToOptimize(orderInfo))){
							this._indexStartElaboration = indexFound;
							firstFinding = false;
						}
					}
					
					annotationToAdd=this._addDataResult(indexFound, indexFound + resultSearch.matchedText.length, annotation);
					if (annotationToAdd){
						this._sharedData.incAnnotationFound(typeAnnotation,  exactDetailsAnnotation);
					}
					
					if (this.opt.onlyFirstAnnotation && ((annotationToAdd==false && matchResult.fuzzy)==false)){
						break;
					}
					
				}
				
				start = indexFound + resultSearch.matchedText.length;
				resultSearch = this._findText(textAnnotation, this._originalText, start, true);
				indexFound = resultSearch.index;
			}
	},
	
	
	_highligthAnnotation: function(originalText, annotation, orderInfo){
		
	    var highligthedAnnotation= this._isAnnotationHighlighted(annotation);
	    var originalTextResult = originalText;
	    
	    if (highligthedAnnotation==false){ 
	    	var textAnnotation = this._getAnnotationTextSummary(annotation);
	    	var type = this._getAnnotationType(annotation);
	    	originalTextResult = this._highligthAnnotationDirectly(originalText, annotation, orderInfo, false);
			
			if ((originalTextResult != originalText) && (this.opt.allowDuplicates==false)){
				this._annotationsHighlighted[this._annotationsHighlighted.length]= {"type": type, "exact": textAnnotation.toLowerCase()};
			}
			
			if (this.opt.allowDuplicates){
				if (this._isAnnotationCompletelyMarked(type, textAnnotation)==false){
					this._annotationsCompletelyMarked[this._annotationsCompletelyMarked.length]= {"type": type, "exact": textAnnotation.toLowerCase()};
				}
			}
		
	    }
		
		return originalTextResult;
	},
	
    _highligthAnnotationDirectly: function(originalText, annotation, orderInfo, fromContextualMenu){
		
    	    var self = this;
    	     
	    	var textAnnotation = this._getAnnotationText(annotation);
	    	var type= this._getAnnotationType(annotation);
			var style_class = this._getAnnotationStyle(type);
			
			var prefixAnnnotation= this._elaboratePreFixAnnotation(this._getAnnotationPrefix(annotation));
			var postfixAnnotation= this._elaboratePostFixAnnotation(this._getAnnotationPostfix(annotation));
			
			var start=0;
			if (this.opt.optimizedVersion && (this._indexStart>0)){
				start = this._indexStart;
			}
			var replacement="";
			var idAnnotation;
			var idAnnotationDialog;
			var actionAnnotator= new Biojs.AnnotatorAction({});

			var firstFinding = true;
			
			var matchingAnnotation;
			var notDoubledAnnotation;
			var notMarkedAnnotation;
	
            var resultSearch = this._findText(textAnnotation, originalText, start, true);
			
			indexFound = resultSearch.index;
			
			while(indexFound >0){
				prefixHTML = originalText.substr(0, indexFound);
				prefixPlain = this._elaboratePreFixHtml(this._stripsHTMLTags(prefixHTML));
				postfixHTML = originalText.substr(indexFound + resultSearch.matchedText.length);
				postfixPlain = this._elaboratePostFixHtml(this._stripsHTMLTags(postfixHTML));
				
				matchingAnnotation = this._isAnnotationMatching(prefixPlain, prefixAnnnotation, postfixPlain, postfixAnnotation).matched;
				notDoubledAnnotation = (this._isDoubledAnnotation(annotation, prefixHTML)==false);
				notMarkedAnnotation = (this._isIdAnnotationsMarked(orderInfo)==false);
				
				if ( matchingAnnotation && notMarkedAnnotation && notDoubledAnnotation){

					if (this.opt.specificId==0){ 
						idAnnotation = "rdf_annotation_"+orderInfo;
					}else{
						idAnnotation = Biojs.Annotator.ANNOTATION_ID_LINK_BACK;
						style_class = Biojs.Annotator.ANNOTATION_ID_LINK_BACK_CLASS;
					}
					
					
					idAnnotationDialog = idAnnotation+"_dialog";
					replacement = "<span id=\""+idAnnotation+"\" class=\""+style_class+"\">"+resultSearch.matchedText+"</span><span style=\"display:inline-block;width:0px;height:0px;\" class=\"annotation_dialog_container\" id=\""+idAnnotationDialog+"\"></span>";
					
					this._linkClickSingleAnnotation(actionAnnotator, idAnnotation, [{data: annotation, annotator: self._className, offset:{startIndex: indexFound, endIndex: indexFound + resultSearch.matchedText.length}}], idAnnotationDialog, orderInfo);
					
					
					originalText = prefixHTML + replacement+postfixHTML;
					start = indexFound + replacement.length;
	                
					if (this.opt.optimizedVersion){ 
						if (firstFinding && (this._isToOptimize(orderInfo))){
							this._indexStart = indexFound;
							firstFinding = false;
						}
					}
					
					this._idAnnotationsMarked[this._idAnnotationsMarked.length]= orderInfo;
					
					if (this.opt.onlyFirstAnnotation){
						break;
					}
				}else{
	
					start = indexFound + textAnnotation.length;
					
					if (this.opt.optimizedVersion){ 
						if (firstFinding && this._endsWith(prefixPlain, prefixAnnnotation) && this._startsWith(postfixPlain, postfixAnnotation) && (this._isIdAnnotationsMarked(orderInfo)==false) && (this._isToOptimize(orderInfo))){
							this._indexStart = indexFound;
							firstFinding = false;
							
						}
					}
				}
				
				resultSearch = this._findText(textAnnotation, originalText, start, true);
				
				indexFound = resultSearch.index;
				
			}
			
			if (fromContextualMenu){
				var textAnnotationSummary = this._getAnnotationTextSummary(annotation);
				if (this._isAnnotationCompletelyMarked(type, textAnnotationSummary)==false){
					this._annotationsCompletelyMarked[this._annotationsCompletelyMarked.length]= {"type": type, "exact": textAnnotationSummary.toLowerCase()};

				}
				
			}
			
		   return originalText;
	},
	
	 _checkAnnotationDiscoverability: function(originalText, annotation){
 	     
    	var textAnnotation = this._getAnnotationText(annotation);
    	var type= this._getAnnotationType(annotation);
		var style_class = this._getAnnotationStyle(type);
		
		var prefixAnnnotation= this._elaboratePreFixAnnotation(this._getAnnotationPrefix(annotation));
		var postfixAnnotation= this._elaboratePostFixAnnotation(this._getAnnotationPostfix(annotation));

        var indexFound;
        var matchingAnnotation;
        var prefixHTML;
        var prefixPlain;
        var postfixHTML;
        var postfixPlain;

        var resultSearch = this._findText(textAnnotation, originalText, 0, false);
		
		indexFound = resultSearch.index;
		
		while(indexFound >0){
			prefixHTML = originalText.substr(0, indexFound);
			prefixPlain = this._elaboratePreFixHtml(this._stripsHTMLTags(prefixHTML));
			postfixHTML = originalText.substr(indexFound + resultSearch.matchedText.length);
			postfixPlain = this._elaboratePostFixHtml(this._stripsHTMLTags(postfixHTML));
			
			matchingAnnotation = this._isAnnotationMatching(prefixPlain, prefixAnnnotation, postfixPlain, postfixAnnotation).matched;
			
			if ( matchingAnnotation){
				return true;
			}
			
			resultSearch = this._findText(textAnnotation, originalText, indexFound + resultSearch.matchedText.length, false);
			
			indexFound = resultSearch.index;
			
		}
		
	   return false;
	},
	
	_isAnnotationMatching: function(prefixPlain, prefixAnnotation, postfixPlain, postfixAnnotation){
		var ret; 
		var fuzzyMatch=false;
		
		prefixAnnotation= this._htmlEncode(prefixAnnotation);
		postfixAnnotation = this._htmlEncode(postfixAnnotation);
		
		if (this.opt.caseSensitive){ 
			ret = this._endsWith(prefixPlain, prefixAnnotation) && this._startsWith(postfixPlain, postfixAnnotation);
		}else{
			ret = this._endsWith(prefixPlain.toLowerCase(), prefixAnnotation.toLowerCase()) && this._startsWith(postfixPlain.toLowerCase(), postfixAnnotation.toLowerCase());
		}
		
		if (ret==false && ((prefixAnnotation!=undefined && prefixAnnotation != "") || (postfixAnnotation!=undefined && postfixAnnotation != ""))){
			fuzzyMatch=true;
			var sentences;
			var fuzzySearchOptions;
			var fuse;
			var resultFuzzy;
			var sentenceSuffix;
			ret = true;
			if (prefixAnnotation!=undefined && prefixAnnotation != ""){
					fuzzySearchOptions = {
							  shouldSort: true,
							  includeScore: true,
							  includeMatches: true,
							  threshold: this.opt.fuzzyThresholdSuffixes,
							  location: 0,
							  distance: prefixAnnotation.length,
							  maxPatternLength: 1000,
							  minMatchCharLength: 3,
							  keys: [
							    "sentence",
							]
					};
				
					sentenceSuffix=prefixPlain.substring(prefixPlain.length - prefixAnnotation.length);
				    sentences=[{"sentence":sentenceSuffix}];
					fuse = new Fuse(sentences, fuzzySearchOptions); // "list" is the item array
					resultFuzzy = fuse.search(prefixAnnotation);
					ret = ret && (resultFuzzy.length>0);
			}
			            
			if (ret && (postfixAnnotation!=undefined && postfixAnnotation != "")){
				fuzzySearchOptions = {
						  shouldSort: true,
						  includeScore: true,
						  includeMatches: true,
						  threshold: this.opt.fuzzyThresholdSuffixes,
						  location: 0,
						  distance: postfixAnnotation.length,
						  maxPatternLength: 1000,
						  minMatchCharLength: 3,
						  keys: [
						    "sentence",
						]
				};
			
				sentenceSuffix=postfixPlain.substring(0, postfixAnnotation.length);
			    sentences=[{"sentence":sentenceSuffix}];
				fuse = new Fuse(sentences, fuzzySearchOptions); // "list" is the item array
				resultFuzzy = fuse.search(postfixAnnotation);
				ret = ret && (resultFuzzy.length>0);
			}
		}
		
		return {"matched":ret, "fuzzy": fuzzyMatch};
	},
	
	_sortAnnotations: function (a,b){
		var positionA = this._getAnnotationPosition(a);
		var indexFound = positionA.indexOf(".", 0);
		var sentenceAIndex = parseInt(positionA.substr(0, indexFound));
		var wordAIndex = parseInt(positionA.substr(indexFound + 1));
		
		var positionB = this._getAnnotationPosition(b);
		indexFound = positionB.indexOf(".", 0);
		var sentenceBIndex = parseInt(positionB.substr(0, indexFound));
		var wordBIndex = parseInt(positionB.substr(indexFound + 1));
		
		if (sentenceAIndex < sentenceBIndex){
			return -1;
		}else if (sentenceAIndex > sentenceBIndex){
			return 1;
		}else{
			if (wordAIndex < wordBIndex){
				return -1;
			}else{
				return 1;
			}
		}
		return -1;
	},
	
	highlightAnnotationFromContextualMenu: function (annotationData){
		var annotation;
		
		var typeAnnotation;
		var textAnnotation;
		var originalText = this._getTextContainer();
		var type = this._getAnnotationType(annotationData); 
		var text = this._getAnnotationTextSummary(annotationData);
		this._indexStart= -1;
		
		for (var i=0; i<this._annotationsData.length; i++){ 
			annotation= this._annotationsData[i];
			 typeAnnotation = this._getAnnotationType(annotation); 
			 textAnnotation = this._getAnnotationTextSummary(annotation);
			
			if (type==typeAnnotation && textAnnotation.toLowerCase()==text.toLowerCase()){ 
				originalText = this._highligthAnnotationDirectly(originalText, annotation, i, true);
			}
		}
		
		this._setTextContainer(originalText);
	},
	
	highlightOnlyFirstAnnotationFromContextualMenu: function (annotationData){
		this._indexStart= -1;
		var self=this;
		var annotation;
		
		var typeAnnotation;
		var textAnnotation;
		var originalText = this._getTextContainer();
		
		var type = this._getAnnotationType(annotationData); 
		var text = this._getAnnotationText(annotationData);
		var textSummary = this._getAnnotationTextSummary(annotationData);
		
		//deselect all the annotation of that type
		var style_class = this._getAnnotationStyle(type);
		
		originalText = originalText.replace(new RegExp("<div id=\"rdf_annotation_\\d{1,}\" class=\""+style_class+"\">"+text+"</div><span style=\"display:inline-block;width:0px;height:0px;\" class=\"annotation_dialog_container\" id=\"rdf_annotation_\\d{1,}_dialog\"></span>", "ig"), function extractAnnotation(x){ return self._extractAnnotation(annotationData, x);});
		
		originalText = originalText.replace(new RegExp("<span id=\"rdf_annotation_\\d{1,}\" class=\""+style_class+"\">"+text+"</span>", "ig"), function extractAnnotation(x){ return self._extractAnnotation(annotationData, x);});
		
		var originalTextBefore;
		
		//select only the first annotation again
		for (var i=0; i<this._annotationsData.length; i++){ 
			annotation= this._annotationsData[i];
			 typeAnnotation = this._getAnnotationType(annotation); 
			 textAnnotation = this._getAnnotationTextSummary(annotation);
			
			if (type==typeAnnotation && textAnnotation.toLowerCase()==textSummary.toLowerCase()){
				this._removeIdAnnotationsMarked(i);
				originalTextBefore = originalText;
				originalText = this._highligthAnnotationDirectly(originalText, annotation, i, true);
				if (originalTextBefore != originalText){
					this._removeAnnotationCompletelyMarked(typeAnnotation, textAnnotation);
					break;
				}
			}
		}
		
		this._setTextContainer(originalText);
	},
	
	_extractAnnotation : function(annotationData, textAnnotated){
		var type = this._getAnnotationType(annotationData); 
		
		//deselect all the annotation of that type
		var style_class = this._getAnnotationStyle(type);
		
		textAnnotated = textAnnotated.replace(new RegExp("<span id=\"rdf_annotation_\\d{1,}\" class=\""+style_class+"\">", "ig"), "");
		textAnnotated = textAnnotated.replace(new RegExp("</span>", "ig"), "");
		textAnnotated = textAnnotated.replace(new RegExp("<span style=\"display:inline-block;width:0px;height:0px;\" class=\"annotation_dialog_container\" id=\"rdf_annotation_\\d{1,}_dialog\">", "ig"), "");
		return textAnnotated;
		
	},
	
	_isToOptimize: function (orderInfo){
		var ret=true;
		if (this.opt.optimizationStrategy!="GREEDY"){ 
			var text = this._getAnnotationTextSummary(this._annotationsData[orderInfo]);
			
			var textAnnotation;
			if (this._annotationsData.length > (orderInfo + 1)){
				for (var i=orderInfo + 1; i<this._annotationsData.length; i++){ 
					textAnnotation = this._getAnnotationTextSummary(this._annotationsData[i]);
					if (textAnnotation.toLowerCase()==text.toLowerCase()){ 
							ret= false;
					}
				
				}
			}
			
		}else{ 
		
			var section = this._getAnnotationSection(this._annotationsData[orderInfo]);
			
			ret = (section!="http://purl.org/orb/Figure") && (section!="http://purl.org/orb/Table");
			
		}
		return ret;
	},
	
	_isDoubledAnnotation : function(annotationData, prefixHTML){
		var type = this._getAnnotationType(annotationData); 
		
		//deselect all the annotation of that type
		var style_class = this._getAnnotationStyle(type);
		
		ret = this._endsWith(prefixHTML,"class=\""+style_class+"\">");
		
		return ret;
		
	},
	
	_isIdAnnotationsMarked: function (orderInfo){
		
		if (this._idAnnotationsMarked.length==0){
			return false;
		}else{
			for (var i=0;i<this._idAnnotationsMarked.length; i++){
				if (this._idAnnotationsMarked[i]==orderInfo){
					return true;
				}
			}
		}
		
		return false;
	},
	
	_removeIdAnnotationsMarked: function (orderInfo){
		var indextoRemove= -1;
		for (var i=0;i<this._idAnnotationsMarked.length; i++){
			if (this._idAnnotationsMarked[i]==orderInfo){
				indextoRemove = i;
				break;
			}
		}
		
		if (indextoRemove>=0){ 
			this._idAnnotationsMarked.splice( indextoRemove, 1 );
		}
	},
	
	_isAnnotationAllowedStart: function (type){
		
		if (this.opt.noAnnotationStart){
			return false;
		}else{ 
			if (this.opt.annotationTypesStart.length==0){
				return true;
			}else{
				for (var i=0;i<this.opt.annotationTypesStart.length; i++){
					if (this.opt.annotationTypesStart[i]==type){
						return true;
					}
				}
			}
		}
		
		return false;
	},
	
    _isAnnotationHighlighted: function (annotation){
		var ret=false;
		var exactText;
		var type
		if (this.opt.allowDuplicates){
			ret=false;
		}else{ 
			type= this._getAnnotationType(annotation);
			exactText = this._getAnnotationTextSummary(annotation);
			if (this._annotationsHighlighted.length ==0){
				ret=false;
			}else{
				for (var i=0;i<this._annotationsHighlighted.length; i++){
					if ((this._annotationsHighlighted[i].type==type) && (this._annotationsHighlighted[i].exact.toLowerCase()==exactText.toLowerCase())){
						ret=true;
						break;
					}
				}
			}
		}
		
		return ret;
	},
	
   _isAnnotationMarked: function (type){
		
		if (this._annotationsMarked.length==0){
			return false;
		}else{
			for (var i=0;i<this._annotationsMarked.length; i++){
				if (this._annotationsMarked[i]==type){
					return true;
				}
			}
		}
		
		return false;
	},
	
    _isAnnotationCompletelyMarked: function (type, textAnnotation){
    	var ret= false;
		if (this._annotationsCompletelyMarked.length ==0){
			ret=false;
		}else{
			for (var i=0;i<this._annotationsCompletelyMarked.length; i++){
				if ((this._annotationsCompletelyMarked[i].type==type) && (this._annotationsCompletelyMarked[i].exact.toLowerCase()==textAnnotation.toLowerCase())){
					ret=true;
					break;
				}
			}
		}
		
		return ret;
	},
	
	
	_removeAnnotationCompletelyMarked: function (type, textAnnotation){
		var indextoRemove= -1;
		for (var i=0;i<this._annotationsCompletelyMarked.length; i++){
			if ((this._annotationsCompletelyMarked[i].type==type) && (this._annotationsCompletelyMarked[i].exact.toLowerCase()==textAnnotation.toLowerCase())){
				indextoRemove = i;
				break;
			}
		}
		
		if (indextoRemove>=0){ 
			this._annotationsCompletelyMarked.splice( indextoRemove, 1 );
			
		}
	},
	
	
	_elaboratePreFixAnnotation: function (prefix){
		
		if ((this.opt.charactersMatch > 0) && (prefix.length > this.opt.charactersMatch)){
    		return prefix.substr((prefix.length - this.opt.charactersMatch));
    	}else{
    		return prefix;
    	}
		
	},
	
	_elaboratePostFixAnnotation: function (postfix){
		
		if (this._endsWith(postfix, " ")){
			postfix = postfix.substr(0, postfix.length-1);
		}
		
		if ((this.opt.charactersMatch > 0) && (postfix.length > this.opt.charactersMatch)){
    		return postfix.substr(0, this.opt.charactersMatch);
    	}else{
    		return postfix;
    	}
		
	},
	
    _elaboratePreFixHtml: function (prefix){
		
		if ((this.opt.charactersMatch > 0) && (prefix.length > (this.opt.charactersMatch + 5))){
    		return prefix.substr((prefix.length - (this.opt.charactersMatch + 5)));
    	}else{
    		return prefix;
    	}
		
	},
	
	_elaboratePostFixHtml: function (postfix){
		
		if ((this.opt.charactersMatch > 0) && (postfix.length > (this.opt.charactersMatch + 5))){
    		return postfix.substr(0, (this.opt.charactersMatch + 5));
    	}else{
    		return postfix;
    	}
		
	},
	
	_stripsHTMLTags:function(inputHTML){
		var retStripped = inputHTML.replace(/(<([^>]+)>)/ig,"");
		//retStripped = retStripped.replace(new RegExp("&nbsp;", "ig"), " ");
		
		return retStripped;
	},
	
	_buildAgenda: function(){
		if (this._sharedData.getAnnotationFound().length>0){
			var self = this;
			
			var legendaContainer = jQuery('#'+self.opt.idLegend);
			//legendaContainer.html('');
			
			if (this._startsWith(this.opt.pmcId, "-")){
				self.opt.entity='preprint';
			}
			
			var entityHelp = self.opt.entity+'s';
			
			if (self.opt.entity=='theses'){
				entityHelp = self.opt.entity+'es';
			}
			
			var helpText = 'SciLite annotations in Europe PMC are text mined, biological terms and concepts which can be highlighted in the text of '+entityHelp+'. To show annotations on the text, tick the relevant checkbox in the panel below.'+
			                '<ul>'+
			                 '<li>Gene Ontology terms are part of a controlled vocabulary of properties relating to genes and gene products, including RNA and proteins.</li>'+
			                 '<li>Gene function (also known as a GeneRIF) describes the function of a gene.</li>'+
			                 '</ul>';
			
			//legendaContainer.append('<div class="legenda_annotation_header"><div class="legenda_annotation_header_title">'+self._legendTitle+'</div><div id="legenda_annotation_header_help" class="legenda_annotation_header_help" onmouseover="TipAllowed(\''+helpText+'\');" onmouseout="UnTipAllowed();"><img src="/images/qmark.png"/></div></div>');
			 
			var htmlLegend='<div class="legenda_annotation_header"><div class="legenda_annotation_header_title">Show annotations in this '+self.opt.entity+'</div><div id="legenda_annotation_header_help" class="legenda_annotation_header_help" onmouseover="TipAllowed(\''+helpText+'\');" onmouseout="UnTipAllowed();"><img src="/images/qmark.png"/></div></div>';

			
			var legendaElementHTML;
			
			var type;
			
			var styleclass;
			var checkboxId;
			var labelLegendId, labelLegendContainer;
			var upIconId;
			var downIconId;
			var expandIconId;
			var collapseIconId;
			var upDownIconVisibility;
			var checkBoxContainerId;
			var legendaElementCountId;
			var checkedValueCheckbox;
			var typesAlreadChecked=[];
			var currentIndexesAlreadChecked=[];
			var legendContainerStyle, legendContainerId;
			
			this._sharedData.getAnnotationFound().sort(function (a,b){
				if (self._getAnnotationLabel(a.type).toLowerCase() <= self._getAnnotationLabel(b.type).toLowerCase()){
					return -1;
				}else{
					return 1;
				}
			});
			
			for (var i=0; i<this._sharedData.getAnnotationFound().length; i++){ 
				
				type=this._sharedData.getAnnotationFound()[i].type;
				checkboxId='checkbox_annotation_'+type;
				labelLegendId='label_legend_annotation_'+type;
				labelLegendContainer='label_legend_annotation_container';
				checkBoxContainerId='checkbox_container_annotation_'+type;
				legendaElementCountId='legenda_element_count_'+type;
				legendaElementId='legenda_element_'+type;
				upIconId="legend_up_"+type;
				downIconId="legend_down_"+type;
				expandIconId="expand_icon_"+type;
				collapseIconId="collapse_icon_"+type;
				legendLabelStyle='legenda_element_label';
				legendContainerId="label_legend_annotation_container_"+type;
				
				if ((jQuery('#'+legendaElementId)!=undefined) && (jQuery('#'+legendaElementId).length>0)){ 
					legendaElementHTML= '<div id="'+legendaElementId+'" class="legenda_element">' +jQuery('#'+legendaElementId).html()+'</div>';
					
					if ( (jQuery('#'+checkboxId).prop("checked")==true) || (jQuery('#'+checkboxId).attr('checked')=="checked")){
						typesAlreadChecked[typesAlreadChecked.length] = type;
						currentIndexesAlreadChecked[currentIndexesAlreadChecked.length] = this._sharedData.getCurrentIndex(type);
					}
				}else{	
					
					styleclass = self._getAnnotationStyle(type);
					
					if ((this.opt.showDetailedItems==1) && (this._isAnnotationTypeExpandible(type))){ 
						labelLegendContainer='label_legend_annotation_container_expandible';
						legendLabelStyle='legenda_element_label_expandible';
						//legendContainerStyle=styleclass;
					}
					
					
					legendaElementHTML='<div id="'+legendaElementId+'" class="legenda_element">';
					
					if (this._isAnnotationAllowedStart(type)){ 
						upDownIconVisibility="display:block";
						legendaElementHTML+='<div id='+checkBoxContainerId+' class="legenda_element_checkbox"><input name="'+type+'" type="checkbox" id="'+checkboxId+'" checked="checked"/></div><div id='+legendContainerId+' class="'+labelLegendContainer+'"><div style="display:none" class="expand_icon" id="'+collapseIconId+'"><span class="fa fa-chevron-left fa-2"></span></div><div id="'+labelLegendId+'" class="'+legendLabelStyle+'">';
					}else{
						upDownIconVisibility="display:none";
						legendaElementHTML+='<div id='+checkBoxContainerId+' class="legenda_element_checkbox"><input name="'+type+'" type="checkbox" id="'+checkboxId+'"/></div><div id='+legendContainerId+' class="'+labelLegendContainer+'"><div style="display:none" class="expand_icon" id="'+collapseIconId+'"><span class="fa fa-chevron-left fa-2"></span></div><div id="'+labelLegendId+'" class="'+legendLabelStyle+'">';
					}
					
					legendaElementHTML+= ' '+self._getAnnotationLabel(type)+'</div>';
					
					
					legendaElementHTML+= '<div style="display:none" class="legend_up_down_icon" id="'+upIconId+'"><span class="fa fa-chevron-up fa-2"></span></div>';
					legendaElementHTML+= '<div style="display:none" class="legend_up_down_icon" id="'+downIconId+'"><span class="fa fa-chevron-down fa-2"></span></div>';
					legendaElementHTML+= '<div style="'+upDownIconVisibility+'" class="legend_up_down_icon_invisible" id="'+downIconId+'">...</div>';
					legendaElementHTML+= '<div style="display:none" class="expand_icon" id="'+expandIconId+'"><span class="fa fa-chevron-right fa-2"></span></div>';
					legendaElementHTML+= '</div>';
					legendaElementHTML+= '<div class="legend_type_exact_details" id="legend_type_exact_details_'+type+'"></div>';
					
					legendaElementHTML+="</div>";
				}
				
				//legendaContainer.append(legendaElementHTML);
				htmlLegend = htmlLegend+legendaElementHTML;
				
			}
			
			legendaContainer.attr('class','legenda_annotation');
			legendaContainer.html(htmlLegend);
			
			for (var i=0; i<this._sharedData.getAnnotationFound().length; i++){ 
				
				type=this._sharedData.getAnnotationFound()[i].type;
				checkboxId='checkbox_annotation_'+type;
				labelLegendId='label_legend_annotation_'+type;
				checkBoxContainerId='checkbox_container_annotation_'+type;
				legendaElementCountId='legenda_element_count_'+type;
				legendaElementId='legenda_element_'+type;
				upIconId="legend_up_"+type;
				downIconId="legend_down_"+type;
				expandIconId="expand_icon_"+type;
				collapseIconId="collapse_icon_"+type;
				legendContainerId="label_legend_annotation_container_"+type;
				
				this._linkClickAgenda(checkboxId, labelLegendId, upIconId, downIconId, legendaElementCountId, this._sharedData.getAnnotationFound()[i].annotator, type, legendaElementId, expandIconId, collapseIconId, legendContainerId);
				
				for (var k=0; k<typesAlreadChecked.length; k++){
					if (typesAlreadChecked[k]==type){
						 if (this.opt.isAbstract==0 && (this._startsWith(this.opt.pmcId, "-")==false)){ 
							jQuery('#'+checkboxId).attr('checked', 'checked');
						 }else{
							 jQuery('#'+checkboxId).prop({
								  checked: true
							 });
						 }
						 this._manageUpDownIconsAgenda(type);
						 this._sharedData.setCurrentIndex(type, currentIndexesAlreadChecked[k]);
					}
				}
			}
			
			//PiwikAnalyticsTracker.tracking();
		}
	},
	
	_clickAllType: function(showAll){
		if (this._sharedData.getAnnotationFound().length>0){
			var type;
			var checkboxId;
			for (var i=0; i<this._sharedData.getAnnotationFound().length; i++){ 
				type=this._sharedData.getAnnotationFound()[i].type;
				checkboxId='checkbox_annotation_'+type;
				if (showAll){
					if ((jQuery('#'+checkboxId).attr('checked')!='checked' && (this.opt.isAbstract==0 && (this._startsWith(this.opt.pmcId, "-")==false))) || (jQuery('#'+checkboxId).prop("checked")==false && (this.opt.isAbstract==1 || (this._startsWith(this.opt.pmcId, "-"))))){
						//jQuery('#'+checkboxId).attr('checked','checked');
						this._sharedData.getAnnotationFound()[i].annotator.selectAnnotationType(type, true, i, false);
						break;
					}
				}else{
					if ((jQuery('#'+checkboxId).attr('checked')=='checked' && (this.opt.isAbstract==0 && (this._startsWith(this.opt.pmcId, "-")==false))) || (jQuery('#'+checkboxId).prop("checked")==true && (this.opt.isAbstract==1 || (this._startsWith(this.opt.pmcId, "-"))))){
						
						if (this.opt.isAbstract==0 && (this._startsWith(this.opt.pmcId, "-")==false)){
							jQuery('#'+checkboxId).removeAttr('checked');
						}else{
							 jQuery('#'+checkboxId).prop({
								  checked: false
							 });
						}
						
						this._sharedData.getAnnotationFound()[i].annotator.unselectAnnotationType(type);
					}
				}
				
			}
		}
	},
	
	_linkClickAgenda: function(checkboxId, labelLegendId, upIconId, downIconId, legendaElementCountId, self, type, legendaElementId, expandIconId, collapseIconId, labelLegendContainerId){
		
		if ((self.opt.showDetailedItems==1) /**&& (self._isAnnotationTypeExpandible(type)==false)*/){ 
			jQuery('#'+labelLegendId).css('cursor','default');
		}
		
		
		jQuery('#'+checkboxId).off('click');
		jQuery('#'+checkboxId).on('click', function(){
			
			if ((jQuery(this).attr('checked')=='checked' && (self.opt.isAbstract==0 && (self._startsWith(self.opt.pmcId, "-")==false))) || (jQuery(this).prop("checked")==true && (self.opt.isAbstract==1 || (self._startsWith(self.opt.pmcId, "-"))))){
				self.selectAnnotationType(jQuery(this).attr('name'), false, 0, false);
				//jQuery('#'+upIconId).css('display','block');
				//jQuery('#'+downIconId).css('display','block');
				
			}else{
				self.unselectAnnotationType(jQuery(this).attr('name'));
				jQuery('#'+upIconId).css('display','none');
				jQuery('#'+downIconId).css('display','none');
				//jQuery('#'+legendaElementCountId).html('');
			}
			
		});
		
		jQuery('#'+labelLegendId).off('click');
		jQuery('#'+labelLegendId).on('click', function(){
			if (self.opt.showDetailedItems==0){ 
				if ((jQuery('#'+checkboxId).attr('checked')!='checked' && (self.opt.isAbstract==0 && (self._startsWith(self.opt.pmcId, "-")==false))) || (jQuery('#'+checkboxId).prop("checked")==false && (self.opt.isAbstract==1 || (self._startsWith(self.opt.pmcId, "-"))))){
					self.selectAnnotationType(type, false, 0, false);
					if (self.opt.isAbstract==0 && (self._startsWith(self.opt.pmcId, "-")==false)){
						jQuery('#'+checkboxId).attr('checked','checked');
					}else{
						 jQuery('#'+checkboxId).prop({
							  checked: true
						 });
					}
					/**jQuery('#'+upIconId).css('display','block');
				    jQuery('#'+downIconId).css('display','block');*/
					
				}else{
					self.unselectAnnotationType(type);
					if (self.opt.isAbstract==0 && (self._startsWith(self.opt.pmcId, "-")==false)){
						jQuery('#'+checkboxId).removeAttr('checked');
					}else{
						 jQuery('#'+checkboxId).prop({
							  checked: false
						 });
					}
					jQuery('#'+upIconId).css('display','none');
					jQuery('#'+downIconId).css('display','none');
					
				}
			
			}
		});
		
		if (self.opt.showDetailedItems==1 && self._isAnnotationTypeExpandible(type)){
			
			jQuery('#'+labelLegendContainerId).off('click');
			jQuery('#'+labelLegendContainerId).on('click', function(){
				if ((jQuery('#'+checkboxId).attr('checked')!='checked' && (self.opt.isAbstract==0 && (self._startsWith(self.opt.pmcId, "-")==false))) || (jQuery('#'+checkboxId).prop("checked")==false && (self.opt.isAbstract==1 || (self._startsWith(self.opt.pmcId, "-"))))){
					/**self.selectAnnotationType(type, false, 0, true);
					if (self.opt.isAbstract==0 && (self._startsWith(self.opt.pmcId, "-")==false)){
						jQuery('#'+checkboxId).attr('checked','checked');
					}else{
						 jQuery('#'+checkboxId).prop({
							  checked: true
						 });
					}*/
				}else{
					if (self._sharedData._isAnnotationTypeExactsDetailsVisible(type)==false){
						self._expandLegendDetails(type);	
					}else{
						self._hideLegendDetails(type, true);
					}
					
				}
			});
		}
		
		jQuery('#'+upIconId).off('click');
		jQuery('#'+upIconId).on('click', function(){
			self._goToPreviousAnnotation(type);	
		});
		
		jQuery('#'+downIconId).off('click');
		jQuery('#'+downIconId).on('click', function(){
			self._goToNextAnnotation(type);	
			
		});
		
		/**jQuery('#'+expandIconId).off('click');
		jQuery('#'+expandIconId).on('click', function(){
			self._expandLegendDetails(type);	
			
		});
		
		jQuery('#'+collapseIconId).off('click');
		jQuery('#'+collapseIconId).on('click', function(){
			self._hideLegendDetails(type, true);	
			
		});*/
	},
	
	_manageUpDownIconsAgenda: function(type){
		var self=this;
		var annotationTypeInfo = this._sharedData.getAnnotationFoundType(type);
		var checkboxId='checkbox_annotation_'+type;
		var labelLegendId='label_legend_annotation_'+type;
		var upIconId="legend_up_"+type;
		var downIconId="legend_down_"+type;
		var checkBoxContainerId='checkbox_container_annotation_'+type;
		//var legendaElementCountId='legenda_element_count_'+type;
		var legendaElementId='legenda_element_'+type;
		if (annotationTypeInfo.total==0){
			jQuery("#"+labelLegendId).attr("class", "disabled_legend_element");
			jQuery("#"+labelLegendId).off("click");
			jQuery("#"+upIconId).css("display","none");
			jQuery("#"+downIconId).css("display","none");
			jQuery('#'+upIconId).off('click');
			jQuery('#'+downIconId).off('click');
			jQuery('#'+upIconId).addClass("legend_up_down_icon_disabled");
			jQuery('#'+upIconId).removeClass("legend_up_down_icon");
			jQuery('#'+downIconId).addClass("legend_up_down_icon_disabled");
			jQuery('#'+downIconId).removeClass("legend_up_down_icon");
			/**jQuery("#"+checkboxId).attr("disabled","true");
			jQuery("#"+checkboxId).removeAttr("checked");*/
			jQuery("#"+checkboxId).css("display","none");
			jQuery("#"+checkBoxContainerId).addClass("checkbox_legend_disabled");
			//jQuery('#'+legendaElementCountId).html('');
			jQuery("#"+legendaElementId).addClass("legend_element_zero"); 
			jQuery("#"+legendaElementId+ " .legend_up_down_icon_invisible").css("display","none");
		}else {
			
			if ((self._isAnnotationTypeExpandible(type)==false) || self.opt.showDetailedItems==0){
				
				jQuery("#"+legendaElementId+ " .legend_up_down_icon").css("display","block");
				jQuery("#"+legendaElementId+ " .legend_up_down_icon_invisible").css("display","none");
				
				jQuery('#'+legendaElementId).off('mouseenter');
				jQuery('#'+legendaElementId).on('mouseenter', function(){
					if ((jQuery('#'+checkboxId).attr('checked')=='checked' && (self.opt.isAbstract==0 && (self._startsWith(self.opt.pmcId, "-")==false))) || (jQuery('#'+checkboxId).prop("checked")==true && (self.opt.isAbstract==1 || (self._startsWith(self.opt.pmcId, "-"))))){
						jQuery('#'+legendaElementId+' .legend_up_down_icon_invisible').css("display","none");
						jQuery('#'+legendaElementId+' .legend_up_down_icon').css("display","block");
					}else{
						jQuery('#'+legendaElementId+' .legend_up_down_icon_invisible').css("display","none");
						jQuery('#'+legendaElementId+' .legend_up_down_icon').css("display","none");
					}
				});
				
				jQuery('#'+legendaElementId).off('mouseleave');
				jQuery('#'+legendaElementId).on('mouseleave', function(){
					if ((jQuery('#'+checkboxId).attr('checked')=='checked' && (self.opt.isAbstract==0 && (self._startsWith(self.opt.pmcId, "-")==false))) || (jQuery('#'+checkboxId).prop("checked")==true && (self.opt.isAbstract==1 || (self._startsWith(self.opt.pmcId, "-"))))){
						if (self._endsWith(jQuery('#'+labelLegendId).html(),'(0)')==false){
							jQuery('#'+legendaElementId+' .legend_up_down_icon_invisible').css("display","block");
						}
						jQuery('#'+legendaElementId+' .legend_up_down_icon').css("display","none");
					}else{
						jQuery('#'+legendaElementId+' .legend_up_down_icon_invisible').css("display","none");
						jQuery('#'+legendaElementId+' .legend_up_down_icon').css("display","none");
					}
				});
				
			}
		}
	},
	
	_expandLegendDetails: function(type){
		if (this._isAnnotationTypeExpandible(type) && this.opt.showDetailedItems==1){ 
			if (this._sharedData.isAnnotationTypeExactsDetailsPopulated(type)==false){
				this._sharedData.getAnnotationTypeExactsDetails(type, this.opt.numerItemLegends);
			}else{
				this._sharedData.showAnnotationTypeExactsDetails(type, true);
			}
			
			var expandIconId="expand_icon_"+type;
			var collapseIconId="collapse_icon_"+type;
			var checkBoxContainerId='checkbox_container_annotation_'+type;
			var labelLegendId='label_legend_annotation_'+type;
			var labelLegendContainerid = 'label_legend_annotation_container_'+type;
			
			jQuery('#'+collapseIconId).css('display','block');
			jQuery('#'+expandIconId).css('display','none');
			jQuery('#'+checkBoxContainerId).css('display','none');
			jQuery('#'+labelLegendId).css('cursor','pointer');
			jQuery('#'+labelLegendContainerid).addClass('expanded');
			
			var typeAnnotation;
			var legendaElementId;
			for (var i=0; i<this._sharedData.getAnnotationFound().length; i++){ 
				typeAnnotation=this._sharedData.getAnnotationFound()[i].type;
				if (type!=typeAnnotation){
					legendaElementId='legenda_element_'+typeAnnotation;
					jQuery('#'+legendaElementId).css('display','none');
				}
			}
		}
	},
	
	_hideLegendDetails: function(type, showExpand){
		if (this._isAnnotationTypeExpandible(type) && this.opt.showDetailedItems==1){ 
			this._sharedData.showAnnotationTypeExactsDetails(type, false);
			var expandIconId="expand_icon_"+type;
			var collapseIconId="collapse_icon_"+type;
			var checkBoxContainerId='checkbox_container_annotation_'+type;
			var labelLegendId='label_legend_annotation_'+type;
			var labelLegendContainerid = 'label_legend_annotation_container_'+type;
			if (showExpand){ 
				jQuery('#'+expandIconId).css('display','block');
			}else{
				jQuery('#'+expandIconId).css('display','none');
			}
			jQuery('#'+collapseIconId).css('display','none');
			jQuery('#'+checkBoxContainerId).css('display','block');
			jQuery('#'+labelLegendId).css('cursor','pointer');
			jQuery('#'+labelLegendContainerid).removeClass('expanded');
			
			var typeAnnotation;
			var legendaElementId;
			for (var i=0; i<this._sharedData.getAnnotationFound().length; i++){ 
				typeAnnotation=this._sharedData.getAnnotationFound()[i].type;
				if (type!=typeAnnotation){
					legendaElementId='legenda_element_'+typeAnnotation;
					jQuery('#'+legendaElementId).css('display','block');
				}
			}
		}
	},
	
	
	unselectAnnotationType: function (type){
		
		if (this.opt.smartSelect == false){ 
			var originalText = this._getTextContainer();
			
			var styleclass = this._getAnnotationStyle(type);
			
			originalText = originalText.replace(new RegExp("class=\""+styleclass+"\"", "ig"),"class=\""+styleclass+"_disabled\"");
		
			this._setTextContainer(originalText);
		}else{
			
			var newDataResult = [];
			
			var k=0;
			var j=0;
			var i=0;
			var changedAnnotation = false;
			var newAnnotationsConnected = [];
			var annotationsRemoved = [];
			var sortedDataResult;
			var alreadyUnselected=false;
			var unSelectedAnalyzed=false;
			
			for (j=0; j<this._dataResultUnselected.length; j++){
				if (this._dataResultUnselected[j].type == type){ 
					unSelectedAnalyzed=true;
					break;
				}
			}
			
			this._dataResult = this._sharedData.getDataResult();
			
			for (k=0; k<this._dataResult.length; k++){
				 changedAnnotation = false;
				 newAnnotationsConnected = [];
				 annotationsRemoved = [];
				 
				 for (j=0;j<this._dataResult[k].annotationsConnected.length;j++){
					 if (this._getAnnotationTypeGeneral(this._dataResult[k].annotationsConnected[j].data, this._dataResult[k].annotationsConnected[j].annotator) == type){
						 changedAnnotation = true;
						 annotationsRemoved[annotationsRemoved.length] = {type: this._getAnnotationTypeGeneral(this._dataResult[k].annotationsConnected[j].data, this._dataResult[k].annotationsConnected[j].annotator), offset:{startIndex: this._dataResult[k].annotationsConnected[j].offset.startIndex, endIndex: this._dataResult[k].annotationsConnected[j].offset.endIndex}, annotationsConnected: [this._dataResult[k].annotationsConnected[j]]};
						 
					 }else{
						 newAnnotationsConnected[newAnnotationsConnected.length] = {type: this._getAnnotationTypeGeneral(this._dataResult[k].annotationsConnected[j].data, this._dataResult[k].annotationsConnected[j].annotator), offset:{startIndex: this._dataResult[k].annotationsConnected[j].offset.startIndex, endIndex: this._dataResult[k].annotationsConnected[j].offset.endIndex}, annotationsConnected: [this._dataResult[k].annotationsConnected[j]]};
					 }
				 }	
				 
				 if (changedAnnotation){
					 for (j=0; j<newAnnotationsConnected.length; j++){
						 newDataResult[newDataResult.length] = newAnnotationsConnected[j]
					  }
					 
					 alreadyUnselected=false;
					 
					 if (unSelectedAnalyzed == false){ 
						 for (j=0; j<this._dataResultUnselected.length; j++){
							if (this._dataResultUnselected[j].type == type){ 
								
								for (i=0;i<annotationsRemoved.length;i++ ){
									this._dataResultUnselected[j].data.push(annotationsRemoved[i]);
							    }
								alreadyUnselected=true;
								break;
							}
						}
						 
						 if (alreadyUnselected==false){
							 this._dataResultUnselected[this._dataResultUnselected.length]={type: type, data:annotationsRemoved};
						 }
					 }
					 
				 }else{
					 newDataResult[newDataResult.length] = this._dataResult[k];
				 }	
			 }
			
			 this._dataResult = newDataResult;
			 this._sharedData.setDataResult(this._dataResult);
			 this._mergeDataResult(false, true);
			 this._sharedData.setCurrentIndex(type, -1);
			 
			 var labelLegendId='label_legend_annotation_'+type;
			 var labelLegend= ' '+this._getAnnotationLabel(type);
			 jQuery('#'+labelLegendId).html(labelLegend);
			 
			 var legendContainerId="label_legend_annotation_container_"+type;
			 
			//removeExacts
			this._hideLegendDetails(type, false);
			//end 
			 
			var styleType = this._getAnnotationStyle(type);
			if (jQuery('#'+labelLegendId).hasClass(styleType)){
				jQuery('#'+labelLegendId).removeClass(styleType);
			}
			
			if (jQuery('#'+legendContainerId).hasClass(styleType)){
				jQuery('#'+legendContainerId).removeClass(styleType);
				
			}
			
			jQuery('#'+labelLegendId).css('cursor','default');
		}
	},
	
	selectAnnotationType: function (type, totalHighlight, indexType, expandLegendAtEnd){
		
		var originalText = this._getTextContainer();
		if (this._isAnnotationMarked(type)){
			if (this.opt.smartSelect == false){ 
				var styleclass = this._getAnnotationStyle(type);
				originalText = originalText.replace(new RegExp("class=\""+styleclass+"_disabled\"", "ig"),"class=\""+styleclass+"\"");
				this._setTextContainer(originalText);
			}else{
				var i=0;
				var k=0;
				for (i=0; i<this._dataResultUnselected.length; i++){
					if (this._dataResultUnselected[i].type == type){ 
						for (k=0; k<this._dataResultUnselected[i].data.length;k++){
							this._sharedData.appendDataResult( this._dataResultUnselected[i].data[k]);
						}
						break;
					}
				}
				
				this._mergeDataResult(false, true);
				this._manageUpDownIconsAgenda(type);
				
				var labelLegendId='label_legend_annotation_'+type;
				var labelLegend= ' '+this._getAnnotationLabel(type)+' ('+this._sharedData.getAnnotationFoundTotal(type)+')';
				jQuery('#'+labelLegendId).html(labelLegend);
				
				var styleType = this._getAnnotationStyle(type);
				
				//addingExacts
				if (this._isAnnotationTypeExpandible(type) && this.opt.showDetailedItems==1){
					var expandIconId="expand_icon_"+type;
					var collapseIconId="collapse_icon_"+type;
					jQuery('#'+expandIconId).css('display','block');
					jQuery('#'+collapseIconId).css('display','none');
					if (expandLegendAtEnd){ 
						this._expandLegendDetails(type);
					}
					
					var legendContainerId="label_legend_annotation_container_"+type;
					if (jQuery('#'+legendContainerId).hasClass(styleType)==false){
						jQuery('#'+legendContainerId).addClass(styleType);
					}
					jQuery('#'+labelLegendId).css('cursor','pointer');
				}
				//end 

				if ((this._isAnnotationTypeExpandible(type)==false) || (this.opt.showDetailedItems==0)){
					if (jQuery('#'+labelLegendId).hasClass(styleType)==false){
						jQuery('#'+labelLegendId).addClass(styleType);
					}
				}
			}
			
			if (totalHighlight){
		         var checkboxId='checkbox_annotation_'+type;
		         if (this.opt.isAbstract==0 && (this._startsWith(this.opt.pmcId, "-")==false)){
		        	 jQuery('#'+checkboxId).attr('checked','checked');
		         }else{
		        	 jQuery('#'+checkboxId).prop({
		   			  checked: true
		   		 });
		         }
			     var nextIndexType = this._getNextAnnotationTypeToSelect(indexType);
			     if (nextIndexType > 0){
				        var nextType =  this._sharedData.getAnnotationFound()[nextIndexType].type;
				    	this._sharedData.getAnnotationFound()[nextIndexType].annotator.selectAnnotationType(nextType, true, nextIndexType, false);
				 }
		    }
		}else{
			
			var labelLegendId='label_legend_annotation_'+type;
			var labelLegend= ' '+this._getAnnotationLabel(type)+' <i class=\"fa fa-cog fa-spin fa-1x\"></i>';
			jQuery('#'+labelLegendId).html(labelLegend);
			
			this._indexStartElaboration= -1;
			
			this._indexStart= -1;
			
			this._annotationStartIndex = 0;
			
			this._timeElapsed = 0;
			
			//this.opt.splitInterval = 1000;
			
			this._sharedData.resetAnnotationFoundTotal(type);
			
			this._highlightAnnotationsSelect(type, totalHighlight, indexType, expandLegendAtEnd);
			
		}
		
		
	},
	
	_getNextAnnotationTypeToSelect: function(indexType){
		var ret = -1;
		for (var i=indexType+1;i<this._sharedData.getAnnotationFound().length;i++){
			var checkboxId='checkbox_annotation_'+this._sharedData.getAnnotationFound()[i].type;
			if ((jQuery('#'+checkboxId).attr('checked')!='checked' && (this.opt.isAbstract==0 && (this._startsWith(this.opt.pmcId, "-")==false))) || (jQuery('#'+checkboxId).prop("checked")==false && (this.opt.isAbstract==1 || (this._startsWith(this.opt.pmcId, "-"))))){
				ret = i;
				break;
			}
		}
		 
	    return ret;
	},
	
    _highlightAnnotationsSelect: function (inputType, totalHighlight, indexType, expandLegendAtEnd){
		
		var startTime = new Date().getTime();

		var self = this;
		var type = "";
		var annotation;
		var originalText;
		
		
		originalText = this._getTextContainer();
		
		if (this.opt.splitted == false){
			this._indexStart= -1;
	    }

		var indexStart =0;
		if (this.opt.splitted){
			indexStart = this._annotationStartIndex;
		}
		
		var numberAnnotationProcessed=0;
		for (var i=indexStart; i<this._annotationsData.length; i++){ 
			annotation= this._annotationsData[i];
			type = this._getAnnotationType(annotation); 
			
			if (type==inputType){ 
				
				if (this.opt.prehighlight){
					originalText = this._highligthAnnotation(originalText, annotation, i);
					
				}
			
			   if (this.opt.elaborationAnnotation){ 
				   this._elaborateAnnotation(annotation, i);
			   }
			}
			
			numberAnnotationProcessed = numberAnnotationProcessed + 1;
			if (((this.opt.splitted) && (numberAnnotationProcessed == this.opt.splitSize)) || (i== (this._annotationsData.length -1))){
				this._annotationStartIndex = i + 1;
				break;
			}
		}
		
		this._setTextContainer(originalText);
		
		var endTime = new Date().getTime();
		this._timeElapsed = this._timeElapsed + (endTime - startTime);
		
		if (((this.opt.splitted==false) || (this._annotationStartIndex == this._annotationsData.length)) ==false){
			setTimeout(function(){self._highlightAnnotationsSelect(inputType, totalHighlight, indexType, expandLegendAtEnd)}, self.opt.splitInterval/this._sharedData.getAnnotationFound().length);
		}else{
			 
		    
		    if (totalHighlight){
		         var checkboxId='checkbox_annotation_'+inputType;
		         if (this.opt.isAbstract==0 && (this._startsWith(this.opt.pmcId, "-")==false)){ 
		        	 jQuery('#'+checkboxId).attr('checked','checked');
		         }else{
		        	 jQuery('#'+checkboxId).prop({
		   			  checked: true
		   		 });
		         }
			     
			     var nextIndexType = this._getNextAnnotationTypeToSelect(indexType);
			     if (nextIndexType > 0){ 
				     var nextType =  this._sharedData.getAnnotationFound()[nextIndexType].type;
				     this._sharedData.getAnnotationFound()[nextIndexType].annotator.selectAnnotationType(nextType, true, nextIndexType, false);
			     }
		    	
		    }else{
				if (this.opt.elaborationAnnotation){ 
					var startTime = new Date().getTime();
			    	this._mergeDataResult(false, true);
					var endTime = new Date().getTime();
				//alert ('Annotations merged in '+ (endTime - startTime) + ' ms');
				}
			}
			
			this._annotationsMarked[this._annotationsMarked.length]=inputType;
			
			var labelLegendId='label_legend_annotation_'+inputType;
			var labelLegend= ' '+self._getAnnotationLabel(inputType)+' ('+self._sharedData.getAnnotationFoundTotal(inputType)+')';
			jQuery('#'+labelLegendId).html(labelLegend);
			
			var styleType = this._getAnnotationStyle(inputType);
			//addingExacts
			if (self._isAnnotationTypeExpandible(inputType) && self.opt.showDetailedItems==1){
				var expandIconId="expand_icon_"+inputType;
				var collapseIconId="collapse_icon_"+inputType;
				jQuery('#'+expandIconId).css('display','block');
				jQuery('#'+collapseIconId).css('display','none');
				
				if (expandLegendAtEnd){ 
					this._expandLegendDetails(inputType);
				}
				
				var legendContainerId="label_legend_annotation_container_"+inputType;
				if (jQuery('#'+legendContainerId).hasClass(styleType)==false){
					jQuery('#'+legendContainerId).addClass(styleType);
				}
				
				jQuery('#'+labelLegendId).css('cursor','pointer');
				
			}
			//end 
			if ((self._isAnnotationTypeExpandible(inputType)==false) || (self.opt.showDetailedItems==0)){
				if (jQuery('#'+labelLegendId).hasClass(styleType)==false){
					jQuery('#'+labelLegendId).addClass(styleType);
				}
			}
			
			this._manageUpDownIconsAgenda(inputType);
			//alert ('Annotations loaded totally in '+this._timeElapsed+' ms');
		}
	},
	
	isAllowedDuplicates : function(){
		return this.opt.allowDuplicates;
	},
	
	_setTextContainer: function(htmlText){
		jQuery('#'+this.opt.target).html(htmlText);
		this._callBackJSFunctionality();
		//this.raiseEvent(Biojs.Annotator.EVT_ON_TEXT_CHANGED, {});
	},
	
	_getTextContainer: function(){
		return jQuery('#'+this.opt.target).html();
	},
	
	_getAnnotationTextSummary: function(annotation){
		return this._getAnnotationText(annotation);
	},
	
	_getAnnotationType: function (annotation){
		var tagValue= this._getAnnotationBody(annotation);
		var type_ret=null;
		if (this._startsWith(tagValue, "http://purl.uniprot.org/uniprot/")){
			type_ret = Biojs.AnnotatorBase.GENES_PROTEINS;
		}else if (this._startsWith(tagValue, "http://identifiers.org/taxonomy/")){
			type_ret = Biojs.AnnotatorBase.ORGANISMS;
		}else if (this._startsWith(tagValue, "http://purl.obolibrary.org/obo/CHEBI_")){
			type_ret = Biojs.AnnotatorBase.CHEMICALS;
		}else if (this._startsWith(tagValue, "http://purl.obolibrary.org/obo/GO:") || this._startsWith(tagValue, "http://identifiers.org/go/GO:")){
			type_ret = Biojs.AnnotatorBase.GO_TERMS;
		}else if (this._startsWith(tagValue, "http://linkedlifedata.com/resource/umls-concept/")){
			type_ret = Biojs.AnnotatorBase.DISEASE;
		}else if (this._startsWith(tagValue, "http://www.ebi.ac.uk/efo/")){
			type_ret = Biojs.AnnotatorBase.EFO;
		}else if (this._startsWith(tagValue, "http://identifiers.org/")){
			type_ret = Biojs.AnnotatorBase.ACCESSION_NUMBERS;
		}
		
		return  type_ret;
	},
	
	_getAnnotationExactDetails: function (annotation){
		if (this.opt.showDetailedItems==1){ 
			return annotation.exact.value;
		}else{
			return '';
		}
	},
	
	_getAnnotationText: function (annotation){
		return annotation.exact.value;
	},
	
	_getAnnotationPosition: function (annotation){
		return annotation.position.value;
	},
	
	_getAnnotationSection: function (annotation){
		return annotation.section.value;
	},

	_getAnnotationUrl: function (annotation){
		var type= this._getAnnotationType(annotation);
		if (type==Biojs.AnnotatorBase.GENES_PROTEINS){
			return 'http://www.uniprot.org/uniprot/?query=name:\"'+this._getAnnotationText(annotation)+'\"';
		}else{ 
			
			var annotationUrl = this._getAnnotationBody(annotation);
			return annotationUrl;
		}
	},
	
	_getAnnotationPrefix: function (annotation){
		return annotation.prefix.value;
	},
	
	_getAnnotationUri: function (annotationData){
		return annotationData.annotation.value;
	},
	
	_getAnnotationBody: function (annotationData){
		var annotationBody;
		if (annotationData.tag!=undefined && annotationData.tag!=null){
			annotationBody = annotationData.tag.value;
		}else{
			annotationBody = annotationData.tags[0].uri;
		}
		
		return annotationBody;
	},
	
	_getAnnotationPostfix: function (annotation){
		return annotation.postfix.value;
	},
	
	_getAnnotationStyle: function (type){
		var style_class="";
		if (type==Biojs.AnnotatorBase.ACCESSION_NUMBERS){
			style_class="accession_numbers_annotation";
		}else if (type==Biojs.AnnotatorBase.GENES_PROTEINS){
			style_class="genes_proteins_annotation";
		}else if (type==Biojs.AnnotatorBase.ORGANISMS){
			style_class="organisms_annotation";
		}else if (type==Biojs.AnnotatorBase.CHEMICALS){
			style_class="chemicals_annotation";
		}else if (type==Biojs.AnnotatorBase.GO_TERMS){
			style_class="go_terms_annotation";
		}else if (type==Biojs.AnnotatorBase.DISEASE){
			style_class="disease_annotation";
		}else if (type==Biojs.AnnotatorBase.EFO){
			style_class="efo_annotation";
		}else if (type==Biojs.AnnotatorBase.PHOSPHORYLATE_NACTEM){
			style_class="phosphorylate_annotation";
		}else if (type==Biojs.AnnotatorBase.GENE_REF){
			style_class="generef_annotation";
		}else if (type==Biojs.AnnotatorBase.OPEN_TARGET){
			style_class="opentarget_annotation";
		}else if (type==Biojs.AnnotatorBase.DISGENET){
			style_class="disgenet_annotation";
		}else if (type==Biojs.AnnotatorBase.NCBI){
			style_class="ncbi_annotation";
		}else if (type==Biojs.AnnotatorBase.INTACT){
			style_class="intact_annotation";
		}else if (type==Biojs.AnnotatorBase.GRECO){
			style_class="greco_annotation";
		}
		
		return style_class;
	},
	
	_getAnnotationLabel: function (type){
		var label="";
		if (type==Biojs.AnnotatorBase.ACCESSION_NUMBERS){
			label="Accession Numbers";
		}else if (type==Biojs.AnnotatorBase.GENES_PROTEINS){
			label="Genes/Proteins";
		}else if (type==Biojs.AnnotatorBase.ORGANISMS){
			label="Organisms";
		}else if (type==Biojs.AnnotatorBase.CHEMICALS){
			label="Chemicals";
		}else if (type==Biojs.AnnotatorBase.GO_TERMS){
			label="Gene Ontology";
		}else if (type==Biojs.AnnotatorBase.DISEASE){
			label="Diseases";
		}else if (type==Biojs.AnnotatorBase.EFO){
			label="EFO";
		}else if (type==Biojs.AnnotatorBase.PHOSPHORYLATE_NACTEM){
			label="Phosphorylation Event";
		}else if (type==Biojs.AnnotatorBase.GENE_REF){
			label="Gene Function";
		}else if (type==Biojs.AnnotatorBase.OPEN_TARGET){
			label="Gene-Disease OpenTargets";
		}else if (type==Biojs.AnnotatorBase.DISGENET){
			label="Gene-Disease DisGeNET";
		}else if (type==Biojs.AnnotatorBase.NCBI){
			label="Genetic mutations";
		}else if (type==Biojs.AnnotatorBase.INTACT){
			label="Protein-protein Interactions";
		}else if (type==Biojs.AnnotatorBase.GRECO){
			label="Transcription factor – Target gene";
		}
		
		return label;
	},
	
	_getAnnotationDetailsLink: function (type, url){
		var label="";
		if (type==Biojs.AnnotatorBase.ACCESSION_NUMBERS){
			if (this._startsWith(url.toLowerCase(),"http://identifiers.org/pdb/")){ 
				label="PDB";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/treefam/")){ 
				label="TreeFam";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/uniprot/")){ 
				label="UniProt";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/arrayexpress/")){ 
				label="ArrayExpress";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/bioproject/")){ 
				label="BioProject";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/biosample/")){ 
				label="BioSample";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/clinicaltrials/")){ 
				label="Clinical Trial";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/doi/")){ 
				label="DOI";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/ega.study/")){ 
				label="EGA";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/emdb/")){ 
				label="EMDB";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/ensembl/")){ 
				label="Ensembl";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/ena.embl/")){ 
				label="ENA";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/go/")){ 
				label="Gene Ontology";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/interpro/")){ 
				label="InterPro";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/omim/")){ 
				label="OMIM";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/pfam/")){ 
				label="Pfam";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/proteomexchange/")){ 
				label="ProteomeXchange";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/refseq/")){ 
				label="RefSeq";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/dbsnp/")){ 
				label="RefSNP";
			}else{
				label="Details";
			}
		}else if (type==Biojs.AnnotatorBase.GENES_PROTEINS){
			label="UniProt";
		}else if (type==Biojs.AnnotatorBase.ORGANISMS){
			label="Taxonomy";
		}else if (type==Biojs.AnnotatorBase.CHEMICALS){
			label="ChEBI";
		}else if (type==Biojs.AnnotatorBase.GO_TERMS){
			label="GO Term";
		}else if (type==Biojs.AnnotatorBase.DISEASE){
			label="Linked Life Data";
		}else if (type==Biojs.AnnotatorBase.EFO){
			label="EBI";
		}else if (type==Biojs.AnnotatorBase.PHOSPHORYLATE_NACTEM){
			label="UniProt";
		}else if (type==Biojs.AnnotatorBase.GENE_REF){
			label="UniProt";
		}else if (type==Biojs.AnnotatorBase.OPEN_TARGET){
			label="OpenTargets";
		}else if (type==Biojs.AnnotatorBase.DISGENET){
			label="DisGeNET";
			if (url.indexOf("ncbi") >= 0) {
				label = "NCBI";
			} else if (url.indexOf("umls") >= 0) {
				label = "UMLS";
			}
		}else if (type==Biojs.AnnotatorBase.NCBI){
			label="NCBI";
		}else if (type==Biojs.AnnotatorBase.INTACT){
			label="IntAct";
		}else if (type==Biojs.AnnotatorBase.GRECO){
			label="Ensembl";
		}
		
		return label;
	},
	
	_getAnnotationUrlEPMCsearch: function (annotation){
		var search= this._getAnnotationText(annotation);
		return "http://europepmc.org/search?query=\""+search+"\"";
	},
	
	_getAnnotationUrlEPMCsearchRefine: function (annotation){
		var search= this._getAnnotationText(annotation);
		var originalQuery= jQuery('#textfield').val();
		if (originalQuery!=undefined && originalQuery!=""){
			originalQuery = "http://europepmc.org/search?query="+originalQuery+" AND \""+search+"\"";
		}else{
			originalQuery="";
		}
		return originalQuery
		
	},
	
	_getAnnotationProvider: function(){
		return "Europe PMC";
	},
	
	_callBackJSFunctionality: function(){
		var self=this;
		
		if (self.opt.specificId==0){
			if ((jQuery('#'+Biojs.Annotator.ANNOTATION_ID_LINK_BACK)!=undefined) && (jQuery('#'+Biojs.Annotator.ANNOTATION_ID_LINK_BACK).length>0)){
				setTimeout(function(){ jQuery('#'+Biojs.Annotator.ANNOTATION_ID_LINK_BACK).removeClass('annotationFound'); }, 200);
			}
		}
		
		if (self.opt.isAbstract==0 && (self._startsWith(self.opt.pmcId, "-")==false)){ 
			jQuery('div.goto').remove();
			jQuery.ui.jig.scan(jQuery('#'+this.opt.target));
			
			
			var idPopup="popup_figures";
			jQuery('#popup_figures').mouseleave( function(pos){
				
				if (jQuery("#"+idPopup).hasClass("ui-dialog-content") &&
						jQuery("#"+idPopup).dialog("isOpen") && (self._openedPopupFigures==true)){
					jQuery("#"+idPopup).dialog("close");
					self._openedPopupFigures=false;
				}
			});
			
			jQuery('div.fig.iconblock').each(function(){
				var idBlockImage=jQuery(this).attr('id');
			
				jQuery('#'+idBlockImage).mouseleave( function(pos){
					
					//alert(pos.target.tagName.toUpperCase());
					setTimeout(function(){
						 if (jQuery("#"+idPopup).hasClass("ui-dialog-content") &&
								jQuery("#"+idPopup).dialog("isOpen") && (self._openedPopupFigures==true) && (jQuery('.figuresPopup').is(':hover')==false)){
							jQuery("#"+idPopup).dialog("close");
							self._openedPopupFigures=false;
						}
					}, 1000);
					
				});
				
				
				jQuery(document).on('mouseenter', '#'+idBlockImage+' a.icnblk_img.figpopup img', function(pos){
					self._registerFiguresPopup(idPopup, idBlockImage, jQuery(this), 120, 0);
				});
				
				jQuery(document).on('mouseenter', '#'+idBlockImage+' div.icnblk_cntnt div a.figpopup', function(){
					self._registerFiguresPopup(idPopup, idBlockImage, jQuery(this), 60, 0);
				});
			});
			
		}
		
		if (self.opt.isAbstract==0 && (self._startsWith(self.opt.pmcId, "-")==true)){ 
			$.epmc.tooltip($('a.abstract--affiliation-group'), 'target', 'author-refine-dialog', authorToolTip);
		}
		
		//PiwikAnalyticsTracker.tracking();
		
	},
	
	_registerFiguresPopup: function (idPopup, idBlockImage, element, xOffset, yOffset){
		if (((jQuery("#"+idPopup).hasClass("ui-dialog-content") &&
				jQuery("#"+idPopup).dialog("isOpen"))==false) && (this._openedPopupFigures==false)) {
			this._openedPopupFigures= true;
			
			
			var imgUrl= jQuery('#'+idBlockImage+' a.icnblk_img.figpopup img').attr("src-large");
			var figUrl= jQuery('#'+idBlockImage+' a.icnblk_img.figpopup').attr("href");
			var figNumber = jQuery('#'+idBlockImage+' div.icnblk_cntnt div a.figpopup').text();
			var legendText = jQuery('#'+idBlockImage+' div.icnblk_cntnt div:nth-child(2)').html();
			
			var popupContainer =jQuery('#'+idPopup);
			var coContainer = jQuery("<div class=\"mainContainerFigurePopup\"></div>").appendTo(popupContainer);
			var coInnerContainer = jQuery("<div class=\"mainContainerInnerFigurePopup\" style=\"text-align:center\"></div>").appendTo(coContainer);
			var imagesBoxContainer = jQuery("<div class=\"imageBoxFigurePopup\"></div>").appendTo(coInnerContainer);
			var linkImageContainer= jQuery("<a href=\""+figUrl+"\" target=\"figure\"></a>").appendTo(imagesBoxContainer);
			var ImageContainer= jQuery("<img src=\""+imgUrl+"\" class=\"\"></img>").appendTo(linkImageContainer);
			var legendContainer = jQuery("<div class=\"\" style=\"text-align:center\"></div>").appendTo(coInnerContainer); 
			var linkLegendContainer= jQuery("<a href=\""+figUrl+"\" target=\"figure\"></a>").appendTo(legendContainer);
			jQuery("<div class=\"figureLegendFigurePopup\">"+figNumber+"</div>").appendTo(linkLegendContainer);
			jQuery("<div class=\"figureLegendFigurePopup\">"+legendText+"</div>").appendTo(linkLegendContainer);
			
			
			var xPos = element.offset().left;
			var yPos = element.offset().top;
			jQuery("#"+idPopup).dialog({
	             autoOpen: true, 
	             height:"auto",
	             width:"auto",
	             title: '',
	             modal:false,
	             position:[xPos + xOffset, yPos-yOffset],
	             draggable: false,
	             open: function(){
	                 jQuery('.ui-widget-overlay').bind('click',function(){
	                	jQuery("#"+idPopup).dialog("close");
	             		
	                 })
	             },
	             close: function(){
	            	 jQuery("#"+idPopup).dialog("destroy");
	            	 jQuery("#"+idPopup).html("");
	            	 self._openedPopupFigures=false;
	             },
	             dialogClass: 'figuresPopup',
	             closeText: ''
	          });
		}
	},
	
	_findText: function (pattern, articleText, startpos, checkTagsPosition){
		
		var resultSearch = this._findTextRegExpr(pattern, articleText, startpos, checkTagsPosition);
		
		if (resultSearch.index < 0){
			
			//pattern="ResultsIn comparing deregulation of oncogenic pathways between age groups, a higher probability of PI3K (p = 0.006) and Myc (p = 0.03) pathway deregulation was observed in breast tumors arising in younger women";
			if (this.opt.fuzzySearch==true){ 
				var fuzzySearchOptions = {
					  shouldSort: true,
					  includeScore: true,
					  includeMatches: true,
					  threshold: this.opt.fuzzyThreshold,
					  location: 0,
					  distance: pattern.length,
					  maxPatternLength: 1000,
					  minMatchCharLength: 3,
					  keys: [
					    "sentence",
					]
				};
				
				var fuse = new Fuse(this._plainSentences, fuzzySearchOptions);
				
				var optionsSbd = {
					    "newline_boundaries" : false,
					    "html_boundaries"    : false,
					    "sanitize"           : false,
					    "allowed_tags"       : false,
					    //"preserve_whitespace": false,
					    "abbreviations"      : null
				};
				var patternSentences=tokenizer.sentences(pattern, optionsSbd);
				
				var resultFuzzy = fuse.search(patternSentences[0]);
				if (resultFuzzy.length>0){	
					var indicesFuzzy = resultFuzzy[0].matches[0].indices;
					var sentenceFuzzy= resultFuzzy[0].item.sentence;
					var matchedTextFuzzy = sentenceFuzzy;
					/**if (indicesFuzzy.length>0){
						matchedTextFuzzy = sentenceFuzzy.substring(indicesFuzzy[0][0] + 1, indicesFuzzy[indicesFuzzy.length - 1][1] + 1);
					}*/
					
					if (patternSentences.length>1){
						var matchedTextFuzzyPartial;
						var sentencesFuzzyPartial;
						var numMatch=-1;
						for (var i=0; i <this._plainSentences.length; i++){
							if (this._plainSentences[i].sentence==resultFuzzy[0].item.sentence){
								numMatch=i;
								break;
							}
						}
						
						for (var i=1; i <patternSentences.length; i++){
							fuzzySearchOptions.distance=patternSentences[i].length;
							sentencesFuzzyPartial = [this._plainSentences[numMatch+i]];
							fuse = new Fuse(sentencesFuzzyPartial, fuzzySearchOptions);
							resultFuzzy = fuse.search(patternSentences[i]);
							if (resultFuzzy.length>0){
								indicesFuzzy = resultFuzzy[0].matches[0].indices;
								sentenceFuzzy= resultFuzzy[0].item.sentence;
								matchedTextFuzzyPartial = sentenceFuzzy;
								/**if (indicesFuzzy.length>0){
									matchedTextFuzzyPartial = sentenceFuzzy.substring(indicesFuzzy[0][0] + 1, indicesFuzzy[indicesFuzzy.length - 1][1] + 1);
								}*/
								
								if (this._endsWith(matchedTextFuzzy,".")){ 
									matchedTextFuzzy= matchedTextFuzzy+" "+matchedTextFuzzyPartial;
								}else{
									matchedTextFuzzy= matchedTextFuzzy+"."+matchedTextFuzzyPartial;
								}
							}
						}
					}
					
					if (this._endsWith(matchedTextFuzzy,".")){ 
						matchedTextFuzzy = matchedTextFuzzy.substring(0, matchedTextFuzzy.length - 1);
					}
					resultSearch = this._findTextRegExpr(matchedTextFuzzy, articleText, startpos, checkTagsPosition);
				}
			}
		}
		
		return resultSearch;
	},
	
	_findTextRegExpr: function (pattern, articleText, startpos, checkTagsPosition){
		
		pattern = this._htmlEncode(pattern);
		//pattern="bFig 2Eb";
		
		//articleText="cccb<a href=\"aaaaatt.ss\">Fig 2<em>E</span>bdsddssdsdsd";
		//articleText="a<span href=\"httpeuropepmcorg.articlesPMCfiguref\" rid-figpopup=\"f2\" co-legend-rid=\"lgnd_f2\" rid-ob=\"ob-f2\" class=\"fig-table-link fig figpopup\">Fig. 2E</span>b";

		if (this.opt.caseSensitive==false){
			pattern = pattern.toLowerCase();
			articleText = articleText.toLowerCase();
		}
		
		var result={};
		var patternElements;
		if (this.opt.regExpByCharacter==false){
			patternElements = pattern.split(" ");
		}else{
			patternElements = pattern.split("");
		}
			
		if ((patternElements.length==1) || (this.opt.regExpSearch==false)){
			result.index= articleText.indexOf(pattern, startpos);
			result.matchedText = pattern;
		}else{
			
			var spaceSeparator="";
			if (this.opt.regExpByCharacter==false){
				spaceSeparator="\\s";
			}else{
				spaceSeparator="";
			}
			
			var regExpHtmlTag = this._getRegularExpression();
			var regExpToSearchText= "(<([^>]+)>){0,1}";
			var regularExpressionElement;
			for (var i=0; i<patternElements.length;i++){
			    regularExpressionElement= this._escapeRegExpText(patternElements[i]);
			    
				if ((this._startsWith(patternElements[i],"[") && this._endsWith(patternElements[i],"]")) || (this._startsWith(patternElements[i],"(") && this._endsWith(patternElements[i],")"))){
					var parenthesisCharacterStart, parenthesisCharacterEnd;
					if (this._startsWith(patternElements[i],"[")){
						parenthesisCharacterStart="[";
						parenthesisCharacterEnd="]";
					}else{
						parenthesisCharacterStart="(";
						parenthesisCharacterEnd=")";
					}
					
					var linksReferencesPattern = patternElements[i].substring(1, (patternElements[i].length - 1)).split(",");
					
					regularExpressionElement= "\\"+parenthesisCharacterStart;
					for (var k=0; k<linksReferencesPattern.length;k++){
						regularExpressionElement= regularExpressionElement+regExpHtmlTag+this._escapeRegExpText(linksReferencesPattern[k])+regExpHtmlTag;
						
						if (k< (linksReferencesPattern.length - 1)){
							regularExpressionElement=regularExpressionElement+",";
						}
					}
					
					regularExpressionElement=regularExpressionElement+"\\"+parenthesisCharacterEnd;
					
				}
					
				if (i< (patternElements.length - 1)){
					regExpToSearchText=regExpToSearchText +regularExpressionElement+regExpHtmlTag;
					regExpToSearchText=regExpToSearchText +spaceSeparator+regExpHtmlTag;
				}else{
					regExpToSearchText=regExpToSearchText +regularExpressionElement+"(<([^>]+)>){0,1}";
				}
			}
			
			
			var regExpToSearch = new RegExp(regExpToSearchText);
			var resultRegExp = regExpToSearch.exec(articleText.substring(startpos));
			if (resultRegExp!=null){ 
				//alert('Found' +pattern+ ' in article '+articleText.substring(startpos));
				result.index = resultRegExp.index + startpos;
				result.matchedText = resultRegExp[0];
				
				if (checkTagsPosition){
					var textToAnalyze= resultRegExp[0];
					var regExpToSearchInner = new RegExp("(<([^>]+)>)");
					var resultRegExpInner = regExpToSearchInner.exec(textToAnalyze);
					if (resultRegExpInner!=null && resultRegExpInner.index==0 && (this._startsWith(textToAnalyze, "</")==false)){
			
						var tagParts = resultRegExpInner[0].split(" ");
						var tagName="";
						if (tagParts.length>0 && tagParts[0].length>1){ 
							tagName=tagParts[0].substring(1);
						}
						
						if (tagName!=undefined && tagName!=""){
						    if (this._endsWith(tagName, ">")){
						    	tagName = tagName.substring(0, tagName.length - 1);
						    }
						     
							var closingTagPosition = articleText.substring(resultRegExp.index + startpos).indexOf("</"+tagName);
							var closingTag="</"+tagName+">";
							
							if (closingTagPosition > resultRegExp[0].length){
								result.index = result.index +  resultRegExpInner[0].length;
								result.matchedText = result.matchedText.substring(resultRegExpInner[0].length);
							}else if ((this._endsWith(textToAnalyze, closingTag)) && (tagName=="h1" || tagName=="h2" || tagName=="h3" || tagName=="h4" || tagName=="h5" || tagName=="p")){
								result.index = result.index +  resultRegExpInner[0].length;
								result.matchedText = result.matchedText.substring(resultRegExpInner[0].length, result.matchedText.length - closingTag.length);
							}
						}
						
					}
					
					var annotatorIdTag="<span id=\""+Biojs.Annotator.ANNOTATION_ID_LINK_BACK+"\" class=\""+Biojs.Annotator.ANNOTATION_ID_LINK_BACK_CLASS+" annotationfound\">";
					if (this._startsWith(result.matchedText, annotatorIdTag) && this._endsWith(result.matchedText, "</span>")){
						result.index = result.index +  annotatorIdTag.length;
						result.matchedText = result.matchedText.substring(annotatorIdTag.length,  result.matchedText.length - 7);
					}
				
				}
			}else{
				result.index = -1;
				result.matchedText = "";
			}
		}
		
		return result;
	},
	
	_escapeRegExpText: function(text) {
		  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	},
	
	_htmlEncode: function(text){
	  var el = document.createElement("div");
	  el.innerText = el.textContent = text;
	  var ret = el.innerHTML;
	  ret = ret.replace(/&amp;nbsp/g, "&nbsp");
	  ret = ret.replace(/&amp;lt;/g, "&lt;");
	  ret = ret.replace(/&amp;gt;/g, "&gt;");
	  ret = ret.replace(/&amp;quot;/g, "&quot;");
	  //ret = ret.replace(/</g, "&lt;").replace(/"/g, "&quot;");
	  return ret;
	},
	
	_getRegularExpression:function(){
		//return "(<{1}\/{0,1}(\\w|\\s|:|;|#|\"|\/|=)+>){0,1}";
		return "(<([^>]+)>)*"
	},
	
	_setClassName: function(className){
		this._className= className;
	},
	
	_splitSentences: function(){
		//var plainSentencesArticle = this._stripsHTMLTags(this._originalText).match(/([^\.!\?]+[\.!\?]+)|([^\.!\?]+$)/g);
		var optionsSbd = {
			    "newline_boundaries" : false,
			    "html_boundaries"    : false,
			    "sanitize"           : false,
			    "allowed_tags"       : false,
			    //"preserve_whitespace": this.opt.fuzzyPreserveWhiteSpaces,
			    "abbreviations"      : null
		};
		var textToSplit= this._originalText.replace(/(<h3>(Abstract|ABSTRACT|Introduction|Funding Statement|Disclosure statement|Conclusions|Background|Results|Discussuion|Methods|Abbreviations|Competing interests|Acknowledgement|References|Authors' contributions)<\/h3>)/ig,"");
		textToSplit= textToSplit.replace(/(<h2([^>]+)>(Abstract|ABSTRACT|Introduction|Funding Statement|Disclosure statement|Conclusions|Background|Results|Discussuion|Methods|Abbreviations|Competing interests|Acknowledgement|References|Authors' contributions)<\/h2>)/ig,"");
		
		var regExpToSearchTitle = new RegExp(/<h1 class="content-title">.*<\/h1>/ig);
		var resultRegExpTitle = regExpToSearchTitle.exec(textToSplit);
		if (resultRegExpTitle!=null){ 
			resultRegExpTitle[0] = resultRegExpTitle[0].replace(/<h1 class="content-title">/ig,"");
			resultRegExpTitle[0] = resultRegExpTitle[0].replace(/<\/h1>/ig,"");
			textToSplit= textToSplit.replace(/<h1 class="content-title">.*<\/h1>/ig,". "+resultRegExpTitle[0]+". ");
		}
		
	    textToSplit = this._stripsHTMLTags(textToSplit);
		
		var plainSentencesArticle= tokenizer.sentences(textToSplit, optionsSbd);
		
		for (var i=0; i<plainSentencesArticle.length; i++){ 
			this._plainSentences[this._plainSentences.length]= {"sentence":plainSentencesArticle[i]}
		}
			
	}
},{
	//Events 
	EVT_ON_ANNOTATIONS_LOADED: "onAnnotationsLoaded",
	EVT_ON_REQUEST_ERROR: "onRequestError",
	EVT_ON_TEXT_CHANGED: "onTextChanged",
	ANNOTATION_ID_LINK_BACK:"annotation_id_link_back",
	ANNOTATION_ID_LINK_BACK_CLASS:"annotation_class_link_back"
});