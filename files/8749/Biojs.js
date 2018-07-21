
Biojs.AnnotatorNCBI = Biojs.Annotator.extend(
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
		
		this.resetStatus();
	},
	
	_getAnnotatorTypeLabel: function(){
		return "NCBI";
	},
	
	 /** 
	    * Default options (and its values) for the Citation component. 
	    * @name Biojs.Citation-opt
	    * @type Object
	    */
	opt: {
		_startSearch : 0,
		_startSearchElaboration : 0
	},
	
	eventTypes : [
	],
	
	//_legendTitle: "SENTENCES",
	
	setOptionsFromAncestor: function(ancestorAnnotator, className, sharedData){
		for (prop in ancestorAnnotator.opt) {
		    if (ancestorAnnotator.opt.hasOwnProperty(prop)) {
		        if (prop!="restRdfUrl" && prop!="annotationTypesStart" && prop!="prehighlight" && prop!="regExpSearch"){
		        	
		        	this.opt[prop] = ancestorAnnotator.opt[prop];
		        }
		    }
		}
		
		this._dataResultUnselected = ancestorAnnotator._dataResultUnselected;
		this._originalText = ancestorAnnotator._originalText;
		this._className= className;
		this._sharedData = sharedData;
		this.opt.optimizedVersion = true;
		this.opt.caseSensitive = false;
		this.opt.prehighlight=false;
		this.opt.regExpSearch=true;
		this.opt.regExpByCharacter=true;
		this.opt.fuzzySearch=false;
		this.opt.fuzzyThresholdSuffixes=0.5;
	},
	
	_getFixedAnnotationsStartup: function (){
		 return [];
	},
	
	
	
	
	
	
	
	
	
	_createAlertMessageDone: function (){
		return 'Annotations loaded from GeneRIF totally in '+this._loadingTime+' ms \n Annotations highlighted totally in '+this._timeElapsed+' ms';
	},
	
	_createAlertMessageNoDataFound: function (){ 
		return "No annotations found from GeneRIF for the pmcId "+this.opt.pmcId;
	},
	
	_createAlertMessageError: function (){ 
		return "Error calling the GeneRIF TRIPLE STORE ";
	},
	
	_postHighlightDone: function(){
		
		if (this.opt.elaborationAnnotation){ 
			var startTime = new Date().getTime();
		    this._mergeDataResult(true, true);
			var endTime = new Date().getTime();
		}
		
		if (this.opt.specificId==0){ 
			var eventAnnotator= new Biojs.AnnotatorEvent({});
			eventAnnotator.setOptionsFromAncestor(this, Biojs.AnnotatorBase.CLASSNAME_EVENT, this._sharedData);
			eventAnnotator.load();
		}
		
	},
	
	
	_getAnnotationType: function (annotation){
		var type_ret = Biojs.AnnotatorBase.NCBI;
		return  type_ret;
	},
	
	_getAnnotationText: function (annotation){
		var textAnnotation =  annotation.exact.value;
		if (this._endsWith(textAnnotation, ".")){
			textAnnotation = textAnnotation.substr(0, textAnnotation.length-1);
		}
		
	   return  textAnnotation;
	},
	
	_getAnnotationProvider: function(){
		return "Genetic mutations from PubTator (NCBI)";
	}
	
},{
	
});