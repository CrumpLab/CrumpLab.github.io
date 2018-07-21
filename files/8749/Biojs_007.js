
Biojs.AnnotatorBase = Biojs.extend(
/** @lends Biojs.Annotator# */
{
	constructor: function(options){
		
	},
	
	opt: {
	  
	},
	
	 /**
	 * Array containing the supported event names
	 * @name Biojs.Citation-eventTypes
	 */
	eventTypes : [
	],
	
	_startsWith: function (str, prefix){
		if (str==undefined){
			return false;
		}else{ 
			return str.indexOf(prefix) == 0;
		}
	},
	
	_endsWith: function (str, suffix){
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	},
	
	_getAnnotationTypeGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationType(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationTextGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationText(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationExactDetailsGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationExactDetails(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationUrlGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationUrl(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationUriGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationUri(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationUrlEPMCsearchGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationUrlEPMCsearch(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationUrlEPMCsearchRefineGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationUrlEPMCsearchRefine(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationLabelGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationLabel(this._getAnnotationTypeGeneral(annotation, className));
	      }
	      
	      return "";
	},
	
	_getAnnotationProviderGeneral: function(className){
		if (!className) return "";
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationProvider();
	      }
	      
	      return "";
	},
	
	_getAnnotationBodyGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationBody(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationDetailsLinkGeneral: function(className, type, url){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationDetailsLink(type, url);
	      }
	      
	      return "";
	},
	
	_getAnnotationPrefixGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationPrefix(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationPostfixGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationPostfix(annotation);
	      }
	      
	      return "";
	},
	
	
	_getAnnotator: function(className){
		var annotator=null;
	      if (className==Biojs.AnnotatorBase.CLASSNAME_RDF){
	    	  annotator = new Biojs.Annotator({});
	      }else if (className==Biojs.AnnotatorBase.CLASSNAME_EVENT){
	    	  annotator = new Biojs.AnnotatorEvent({});
	      }else if (className==Biojs.AnnotatorBase.CLASSNAME_GENE_REF){
	    	  annotator = new Biojs.AnnotatorGeneRef({});
	      }else if (className==Biojs.AnnotatorBase.CLASSNAME_OPEN_TARGET){
	    	  annotator = new Biojs.AnnotatorOpenTarget({});
	      }else if (className==Biojs.AnnotatorBase.CLASSNAME_DISGENET){
	    	  annotator = new Biojs.AnnotatorDisgenet({});
	      }else if (className==Biojs.AnnotatorBase.CLASSNAME_NCBI){
	    	  annotator = new Biojs.AnnotatorNCBI({});
	      }else if (className==Biojs.AnnotatorBase.CLASSNAME_INTACT){
	    	  annotator = new Biojs.AnnotatorIntact({});
	      }else if (className==Biojs.AnnotatorBase.CLASSNAME_GRECO){
	    	  annotator = new Biojs.AnnotatorGreco({});
	      }
	      
	      return annotator;
	},
	
    _isAnnotationTypeExpandible: function (type){
    	var expandible;
    	if (type==Biojs.AnnotatorBase.ACCESSION_NUMBERS){
    		expandible=true;
		}else if (type==Biojs.AnnotatorBase.GENES_PROTEINS){
			expandible=true;
		}else if (type==Biojs.AnnotatorBase.ORGANISMS){
			expandible=true;
		}else if (type==Biojs.AnnotatorBase.CHEMICALS){
			expandible=true;
		}else if (type==Biojs.AnnotatorBase.GO_TERMS){
			expandible=true;
		}else if (type==Biojs.AnnotatorBase.DISEASE){
			expandible=true;
		}else if (type==Biojs.AnnotatorBase.EFO){
			expandible=true;
		}else if (type==Biojs.AnnotatorBase.PHOSPHORYLATE_NACTEM){
			expandible=true;
		}else if (type==Biojs.AnnotatorBase.GENE_REF){
			expandible=false;
		}else if (type==Biojs.AnnotatorBase.OPEN_TARGET){
			expandible=true;
		}else if (type==Biojs.AnnotatorBase.DISGENET){
			expandible=true;
		}else if (type==Biojs.AnnotatorBase.NCBI){
			expandible=true;
		}else if (type==Biojs.AnnotatorBase.INTACT){
			expandible=false;
		}else if (type==Biojs.AnnotatorBase.GRECO){
			expandible=true;
		}
		
		return expandible;
    }
	
},{
	 //List of possible annotation types
	GENES_PROTEINS:"GENES_PROTEINS",
	ACCESSION_NUMBERS:"ACCESSION_NUMBERS",
	ORGANISMS:"ORGANISMS",
	CHEMICALS:"CHEMICALS",
	GO_TERMS:"GO_TERMS",
	DISEASE:"DISEASE",
	EFO:"EFO",	
	GRECO:"GRECO",
	CLASSNAME_RDF:"AnnotatorBase",
	CLASSNAME_EVENT:"Event",
	CLASSNAME_GENE_REF:"GeneRef",
	CLASSNAME_OPEN_TARGET:"OpenTarget",
	CLASSNAME_DISGENET:"DisGenet",
	CLASSNAME_NCBI:"Ncbi",
	CLASSNAME_INTACT:"IntAct",
	CLASSNAME_GRECO:"FNL",
	PHOSPHORYLATE_NACTEM:"PHOSPHORYLATE_NACTEM",
	GENE_REF:"GENERIF",
	OPEN_TARGET:"OPEN_TARGET",
	DISGENET:"DISGENET",
	NCBI:"NCBI",
	INTACT:"INTACT",
	//Events 
	EVT_ON_ANNOTATIONS_LOADED: "onAnnotationsLoaded",
	EVT_ON_REQUEST_ERROR: "onRequestError"
});