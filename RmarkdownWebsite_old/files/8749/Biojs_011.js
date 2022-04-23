
Biojs.AnnotatorIntact = Biojs.AnnotatorGeneRef.extend(
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
		return "IntAct";
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
		this.opt.optimizedVersion = false;
		this.opt.caseSensitive = false;
		this.opt.prehighlight=false;
		this.opt.regExpSearch=true;
		this.opt.regExpByCharacter=true;
		this.opt.fuzzySearch=true;
	},
	
	_postHighlightDone: function(){
		
		if (this.opt.elaborationAnnotation){ 
			var startTime = new Date().getTime();
		    this._mergeDataResult(true, true);
			var endTime = new Date().getTime();
		}
		
		if (this.opt.specificId==0){ 
			var openTargetAnnotator= new Biojs.AnnotatorOpenTarget({});
			openTargetAnnotator.setOptionsFromAncestor(this, Biojs.AnnotatorBase.CLASSNAME_OPEN_TARGET, this._sharedData);
			openTargetAnnotator.load();
		}
		
		//jQuery.ui.jig.scan(jQuery('#'+this.opt.target)); 
	},

	_getAnnotationType: function (annotation){
		var type_ret = Biojs.AnnotatorBase.INTACT;
		return  type_ret;
	},
	
	_getAnnotationProvider: function(){
		return "IntAct";
	},
	
	_getAnnotationExactDetails: function (annotation){
		if (this.opt.showDetailedItems==1){ 
			return annotation.tags[0].name;
		}else{
			return '';
		}
	}
	
},{
	
});