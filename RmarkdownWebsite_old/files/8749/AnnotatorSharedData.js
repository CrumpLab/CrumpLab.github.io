function AnnotatorSharedData() {
	this._dataResult =[];
	this._rehighlightIteration = 0;
	this._annotationsFound = [];
}

AnnotatorSharedData.prototype.setDataResult = function (dataResult){
	this._dataResult = dataResult;
}

AnnotatorSharedData.prototype.resetStatus = function (dataResult){
	this._dataResult =[];
	this._rehighlightIteration = 0;
	this._annotationsFound = [];
}

AnnotatorSharedData.prototype.appendDataResult = function (dataResult){
	
	var appendDataResultOk=true;
	if (this._dataResult.length>0){
		for (var i=0;i<this._dataResult.length; i++){
			if ((this._dataResult[i].type==dataResult.type) && (this._dataResult[i].offset.startIndex == dataResult.offset.startIndex) && (this._dataResult[i].offset.endIndex == dataResult.offset.endIndex)){
				appendDataResultOk=false;
				if (dataResult.type==Biojs.AnnotatorBase.INTACT){
					for (var k=0;k<dataResult.annotationsConnected[0].data.tags.length; k++){
						this._dataResult[i].annotationsConnected[0].data.tags.push(dataResult.annotationsConnected[0].data.tags[k]);
					}
					
					//alert('Merged to '+this._dataResult[i].annotationsConnected[0].data.tags.length);
				}
				
				if (dataResult.type==Biojs.AnnotatorBase.OPEN_TARGET || dataResult.type==Biojs.AnnotatorBase.DISGENET){
					for (var k=0;k<dataResult.annotationsConnected[0].data.tags.length; k= k + 2){
						if (this._isGeneDiseaseDuplicate(this._dataResult[i].annotationsConnected[0].data.tags, dataResult.annotationsConnected[0].data.tags[k], dataResult.annotationsConnected[0].data.tags[k+1]) ==false){ 
							this._dataResult[i].annotationsConnected[0].data.tags.push(dataResult.annotationsConnected[0].data.tags[k]);
							this._dataResult[i].annotationsConnected[0].data.tags.push(dataResult.annotationsConnected[0].data.tags[k+1]);
						}
					}
					
					//alert('Merged to '+this._dataResult[i].annotationsConnected[0].data.tags.length);
				}
				
				break;
			}
		}
	}
	
	if (appendDataResultOk==true){ 
		this._dataResult[this._dataResult.length] = dataResult;
	}
	
	return appendDataResultOk;
}

AnnotatorSharedData.prototype._isGeneDiseaseDuplicate = function (taglist, geneTag, diseaseTag){
	var duplicated = false;
	
	for (var k=0;k<taglist.length; k=k+2){
		if ( ((taglist[k].name==geneTag.name) || (taglist[k+1].name==geneTag.name)) && ((taglist[k].name==diseaseTag.name) || (taglist[k+1].name==diseaseTag.name)) ){
			duplicated = true;
			break;
		}
	}
	
	return duplicated
}

AnnotatorSharedData.prototype.getDataResult = function (){
	return this._dataResult;
}

AnnotatorSharedData.prototype.incRehighlightIteration = function (){
	this._rehighlightIteration = this._rehighlightIteration + 1;
}

AnnotatorSharedData.prototype.getRehighlightIteration = function (){
	return this._rehighlightIteration;
}

AnnotatorSharedData.prototype.appendAnnotationFound = function (annotationsFound, exact){
	annotationsFound.idAnnotations=[];
	annotationsFound.currentIndex=-1;
	var indexAdd= this._annotationsFound.length;
	this._annotationsFound[indexAdd] = annotationsFound;
	this._annotationsFound[indexAdd].termsMap={};
	if (exact!=null && exact!=""){
		this._annotationsFound[indexAdd].termsMap[exact]={total:1, idAnnotations:[], currentIndex:-1};
	}
}

AnnotatorSharedData.prototype.getAnnotationFound = function (){
	return this._annotationsFound;
}

AnnotatorSharedData.prototype.isAnnotationFound = function (annotation){
	if (this._annotationsFound.length==0){
		return false;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==annotation){
				return true;
			}
		}
	}
	
	return false;
}

AnnotatorSharedData.prototype.incAnnotationFound = function (type, exact){
	if (this._annotationsFound.length==0){
		return;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				this._annotationsFound[i].total = this._annotationsFound[i].total + 1;
				if (exact!=null && exact!=""){
					if (this._annotationsFound[i].termsMap[exact]==null || this._annotationsFound[i].termsMap[exact]==undefined){
						this._annotationsFound[i].termsMap[exact]={total:0, idAnnotations:[], currentIndex:-1};
					}
					this._annotationsFound[i].termsMap[exact].total = this._annotationsFound[i].termsMap[exact].total + 1;
				}
				break;
			}
		}
	}
}

AnnotatorSharedData.prototype.resetAnnotationFoundTotal = function (type){
	if (this._annotationsFound.length==0){
		return;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				this._annotationsFound[i].total = 0;
				this._annotationsFound[i].termsMap={};
				break;
			}
		}
	}
}

AnnotatorSharedData.prototype.getAnnotationFoundTotal = function (type){
	var ret=0;
	if (this._annotationsFound.length==0){
		return ret;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				ret = this._annotationsFound[i].total;
				break;
			}
		}
	}
	
	return ret;
}

AnnotatorSharedData.prototype._getAnnotationFoundTotalExact = function (type, exact){
	var ret=0;
	if (this._annotationsFound.length==0){
		return ret;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				if (this._annotationsFound[i].termsMap[exact]!=undefined && this._annotationsFound[i].termsMap[exact]!=null){ 
					ret = this._annotationsFound[i].termsMap[exact].total;
				}
				break;
			}
		}
	}
	
	return ret;
}

AnnotatorSharedData.prototype.getAnnotationTypeExactsDetails = function (type, maxNumItems){
	var ret="";
    //alert('Building legend '+type);
	var self=this;
    var totalExact;
	var annotationsExacts=[];
	if (this._annotationsFound.length==0){
		return ret;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				for (var propertyName in this._annotationsFound[i].termsMap) {
				    if (this._annotationsFound[i].termsMap.hasOwnProperty(propertyName)) {
				    	totalExact = this._getAnnotationFoundTotalExact(type, propertyName);
				    	annotationsExacts.push({exact:propertyName, total:totalExact});
				    }
				}
				
				break;
			}
			
		}
	}
	
	if (annotationsExacts.length>0){ 
		annotationsExacts.sort(
				function(a, b){ 
	         		if (a.total >= b.total){
	         			return -1;
	         		}else{
	         			return 1;
	         		}
	         }
		);
		
		var idExactLink, upIconId, downIconId, containerExactId;
		
		for (var k=0; k< annotationsExacts.length; k++){
			if ((maxNumItems < 0) || (k < maxNumItems)){
			
				idExactLink='annotation_exact_details_'+type+'_'+k;
				upIconId='annotation_exact_details_up_'+type+'_'+k;
				downIconId='annotation_exact_details_down_'+type+'_'+k;
				containerExactId='annotation_exact_details_container_'+type+'_'+k;
				ret+= '<div class="legend_type_exact_details_element_container" id="'+containerExactId+'">';
				ret+= '<div data-exact="'+annotationsExacts[k].exact+'" class="legend_type_exact_details_element" id="'+idExactLink+'">'+annotationsExacts[k].exact+' ('+annotationsExacts[k].total+')</div>';
				
				ret+= '<div style="display:none" data-exact="'+annotationsExacts[k].exact+'" class="legend_up_down_icon_details" id="'+upIconId+'"><span class="fa fa-chevron-up fa-2"></span></div>';
				ret+= '<div style="display:none" data-exact="'+annotationsExacts[k].exact+'" class="legend_up_down_icon_details" id="'+downIconId+'"><span class="fa fa-chevron-down fa-2"></span></div>';
				ret+= '<div style="display:block" class="legend_up_down_icon_details_invisible" id="'+downIconId+'">...</div>';
				
				ret+= '</div>';
			
				/**jQuery(document).off('click', '#'+idExactLink);
				jQuery(document).on('click', '#'+idExactLink ,function(pos){
					self._goToFirstExact(type, jQuery(this).attr('data-exact'));
				});*/
				
				jQuery(document).off('click', '#'+upIconId);
				jQuery(document).on('click', '#'+upIconId ,function(pos){
					self._goToPreviousExact(type, jQuery(this).attr('data-exact'), jQuery(this).parent().find('.legend_type_exact_details_element').attr('id'));
				});
				
				jQuery(document).off('click', '#'+downIconId);
				jQuery(document).on('click', '#'+downIconId ,function(pos){
					self._goToNextExact(type, jQuery(this).attr('data-exact'), jQuery(this).parent().find('.legend_type_exact_details_element').attr('id'));
				});
				
				
				jQuery(document).off('mouseenter', '#'+containerExactId);
				jQuery(document).on('mouseenter', '#'+containerExactId, function(){
					   
						jQuery(this).find('.legend_up_down_icon_details_invisible').css("display","none");
						jQuery(this).find('.legend_up_down_icon_details').css("display","block");
				});
				
				jQuery(document).off('mouseleave', '#'+containerExactId);
				jQuery(document).on('mouseleave', '#'+containerExactId, function(){
					
					jQuery(this).find('.legend_up_down_icon_details_invisible').css("display","block");
					jQuery(this).find('.legend_up_down_icon_details').css("display","none");
				});
			
			}else{
				break;
			}
			
		}
		
		jQuery('#legend_type_exact_details_'+type).html(ret);
		jQuery('#legend_type_exact_details_'+type).css('margin-bottom','3px');
		jQuery('#legend_type_exact_details_'+type).css('margin-top','3px');
	}
}

AnnotatorSharedData.prototype.isAnnotationTypeExactsDetailsPopulated = function(type){
	var textExactDetails = jQuery('#legend_type_exact_details_'+type).html();
	return (textExactDetails!=undefined && textExactDetails!="");
}

AnnotatorSharedData.prototype._isAnnotationTypeExactsDetailsVisible = function(type){
	var visibility = jQuery('#legend_type_exact_details_'+type).css('display');
	//alert (visibility);
	return (visibility!=undefined && visibility=="block" && this.isAnnotationTypeExactsDetailsPopulated(type));
}

AnnotatorSharedData.prototype.showAnnotationTypeExactsDetails = function (type, show){
	if (show){
		jQuery('#legend_type_exact_details_'+type).show();
		jQuery('#legend_type_exact_details_'+type).css('margin-bottom','3px');
		jQuery('#legend_type_exact_details_'+type).css('margin-top','3px');
	}else{
		jQuery('#legend_type_exact_details_'+type).hide();
		jQuery('#legend_type_exact_details_'+type).css('margin-bottom','0px');
		jQuery('#legend_type_exact_details_'+type).css('margin-top','0px');
	}
}

AnnotatorSharedData.prototype._goToFirstExact = function (type, exact){
	
	for (var i=0;i<this._annotationsFound.length; i++){
		if (this._annotationsFound[i].type==type){
			for (var propertyName in this._annotationsFound[i].termsMap) {
			    if (this._annotationsFound[i].termsMap.hasOwnProperty(propertyName)) {
			    	if (propertyName==exact){
			    		var idAnnotation=this._annotationsFound[i].termsMap[exact].idAnnotations[0];
			    		jQuery('#'+idAnnotation).addClass('annotationFound');
						setTimeout(function(){ jQuery('#'+idAnnotation).removeClass('annotationFound'); }, 350);
						this.scrollToAnnotation(idAnnotation);
						
			    		break;
			    	}
			    }
			}
			
			break;
		}
	
	}
}


AnnotatorSharedData.prototype._goToNextExact = function (type, exact, idExactLink){
	
	for (var i=0;i<this._annotationsFound.length; i++){
		if (this._annotationsFound[i].type==type){
			for (var propertyName in this._annotationsFound[i].termsMap) {
			    if (this._annotationsFound[i].termsMap.hasOwnProperty(propertyName)) {
			    	if (propertyName==exact){
			    		
			    		if (this._annotationsFound[i].termsMap[exact].idAnnotations.length > (this._annotationsFound[i].termsMap[exact].currentIndex + 1)){
							if (this._annotationsFound[i].termsMap[exact].currentIndex >= 0){ 
								jQuery('#'+this._annotationsFound[i].termsMap[exact].idAnnotations[this._annotationsFound[i].termsMap[exact].currentIndex]).removeClass('annotationFound');
							}
							this._annotationsFound[i].termsMap[exact].currentIndex = this._annotationsFound[i].termsMap[exact].currentIndex + 1;
						}else{
							jQuery('#'+this._annotationsFound[i].termsMap[exact].idAnnotations[this._annotationsFound[i].termsMap[exact].currentIndex]).removeClass('annotationFound');
							this._annotationsFound[i].termsMap[exact].currentIndex = 0;
						}
			    		
			    		
			    		var idAnnotationNext = this._annotationsFound[i].termsMap[exact].idAnnotations[this._annotationsFound[i].termsMap[exact].currentIndex];
						jQuery('#'+idAnnotationNext).addClass('annotationFound');
						
						var self=this;
						setTimeout(function(){ jQuery('#'+idAnnotationNext).removeClass('annotationFound'); }, 350);
					
						var lebelLegendExact = exact+' ('+(this._annotationsFound[i].termsMap[exact].currentIndex + 1)+'/'+this._annotationsFound[i].termsMap[exact].total+')';
						jQuery('#'+idExactLink).html(lebelLegendExact);
						
						this.scrollToAnnotation(idAnnotationNext);

			    		break;
			    	}
			    }
			}
			
			break;
		}
	
	}
}

AnnotatorSharedData.prototype._goToPreviousExact = function (type, exact, idExactLink){
	
	for (var i=0;i<this._annotationsFound.length; i++){
		if (this._annotationsFound[i].type==type){
			for (var propertyName in this._annotationsFound[i].termsMap) {
			    if (this._annotationsFound[i].termsMap.hasOwnProperty(propertyName)) {
			    	if (propertyName==exact){
			    		if ((this._annotationsFound[i].termsMap[exact].currentIndex >=1)){
							jQuery('#'+this._annotationsFound[i].termsMap[exact].idAnnotations[this._annotationsFound[i].termsMap[exact].currentIndex]).removeClass('annotationFound');
							this._annotationsFound[i].termsMap[exact].currentIndex = this._annotationsFound[i].termsMap[exact].currentIndex - 1;
						}else{
							if (this._annotationsFound[i].termsMap[exact].currentIndex >= 0){ 
								jQuery('#'+this._annotationsFound[i].termsMap[exact].idAnnotations[this._annotationsFound[i].termsMap[exact].currentIndex]).removeClass('annotationFound');
							}
							this._annotationsFound[i].termsMap[exact].currentIndex = this._annotationsFound[i].termsMap[exact].idAnnotations.length - 1;
						}
			    		
			    		
			    		var idAnnotationPrevious = this._annotationsFound[i].termsMap[exact].idAnnotations[this._annotationsFound[i].termsMap[exact].currentIndex];
						jQuery('#'+idAnnotationPrevious).addClass('annotationFound');
						
						var self=this;
						setTimeout(function(){ jQuery('#'+idAnnotationPrevious).removeClass('annotationFound'); }, 350);
					
						var lebelLegendExact = exact+' ('+(this._annotationsFound[i].termsMap[exact].currentIndex + 1)+'/'+this._annotationsFound[i].termsMap[exact].total+')';
						jQuery('#'+idExactLink).html(lebelLegendExact);
						
						this.scrollToAnnotation(idAnnotationPrevious);
						
			    		break;
			    	}
			    }
			}
			
			break;
		}
	
	}
}

AnnotatorSharedData.prototype.scrollToAnnotation = function (idAnnotation){
	var scrollPositionAnnotation = jQuery('#'+idAnnotation).offset().top;
	scrollPositionAnnotation = scrollPositionAnnotation - (jQuery(window).height()/2);
	jQuery(document).scrollTop(scrollPositionAnnotation);
},

AnnotatorSharedData.prototype.resetRegisterIdAnnotationFound = function (keepCurrentIndex){
	if (this._annotationsFound.length==0){
		return;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			this._annotationsFound[i].idAnnotations= [];
			
			for (var propertyName in this._annotationsFound[i].termsMap) {
			    if (this._annotationsFound[i].termsMap.hasOwnProperty(propertyName)) {
			    	this._annotationsFound[i].termsMap[propertyName].idAnnotations=[];
			    	if (keepCurrentIndex==false){ 
						this._annotationsFound[i].termsMap[propertyName].currentIndex=-1;
					}
			    }
			}
			
			if (keepCurrentIndex==false){ 
				this._annotationsFound[i].currentIndex=-1;
			}
		}
	}
}

AnnotatorSharedData.prototype.registerIdAnnotationFound = function (idAnnotation, type, exact){
	if (this._annotationsFound.length==0){
		return;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				this._annotationsFound[i].idAnnotations[this._annotationsFound[i].idAnnotations.length] = idAnnotation;	
				if (exact!=null && exact!=""){
					this._annotationsFound[i].termsMap[exact].idAnnotations.push(idAnnotation);
				}
				break;
			}
		}
		return idAnnotation;
	}
}


AnnotatorSharedData.prototype.goToNextAnnotation = function (type, label){
	var idAnnotation="";
	if (this._annotationsFound.length==0){
		return idAnnotation;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				if (this._annotationsFound[i].idAnnotations.length > (this._annotationsFound[i].currentIndex + 1)){
					if (this._annotationsFound[i].currentIndex >= 0){ 
						jQuery('#'+this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex]).removeClass('annotationFound');
					}
					this._annotationsFound[i].currentIndex = this._annotationsFound[i].currentIndex + 1;
				}else{
					jQuery('#'+this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex]).removeClass('annotationFound');
					this._annotationsFound[i].currentIndex = 0;
				}
				
				idAnnotation = this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex];
				jQuery('#'+this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex]).addClass('annotationFound');
				
				var self=this;
				setTimeout(function(){ jQuery('#'+self._annotationsFound[i].idAnnotations[self._annotationsFound[i].currentIndex]).removeClass('annotationFound'); }, 500);
				var labelLegendId='label_legend_annotation_'+type;
				var labelLegend= ' '+label+' ('+(this._annotationsFound[i].currentIndex+ 1)+"/"+this._annotationsFound[i].total+')';
				jQuery('#'+labelLegendId).html(labelLegend);
				
				break;
			}
		}
		return idAnnotation;
	}
}

AnnotatorSharedData.prototype.goToPreviousAnnotation = function (type, label){
	var idAnnotation="";
	if (this._annotationsFound.length==0){
		return idAnnotation;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				if ((this._annotationsFound[i].currentIndex >=1)){
					jQuery('#'+this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex]).removeClass('annotationFound');
					this._annotationsFound[i].currentIndex = this._annotationsFound[i].currentIndex - 1;
				}else{
					if (this._annotationsFound[i].currentIndex >= 0){ 
						jQuery('#'+this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex]).removeClass('annotationFound');
					}
					this._annotationsFound[i].currentIndex= this._annotationsFound[i].idAnnotations.length - 1;
				}
				
				idAnnotation = this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex];
				jQuery('#'+this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex]).addClass('annotationFound');
				
				var self=this;
				setTimeout(function(){ jQuery('#'+self._annotationsFound[i].idAnnotations[self._annotationsFound[i].currentIndex]).removeClass('annotationFound'); }, 500);
				
				var labelLegendId='label_legend_annotation_'+type;
				var labelLegend= ' '+label+' ('+(this._annotationsFound[i].currentIndex+ 1)+"/"+this._annotationsFound[i].total+')';
				jQuery('#'+labelLegendId).html(labelLegend);
				break;
			}
		}
		return idAnnotation;
	}
}

AnnotatorSharedData.prototype.getAnnotationFoundType = function (type){
	var ret=null;
	
	for (var i=0;i<this._annotationsFound.length; i++){
		if (this._annotationsFound[i].type==type){
			ret = this._annotationsFound[i];
			break;
		}
	}
	
	return ret;
}

AnnotatorSharedData.prototype.getCurrentIndex = function (type){
	if (this._annotationsFound.length==0){
		return -1;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				return this._annotationsFound[i].currentIndex;	
			}
		}
		
	}
	
	return -1;
}

AnnotatorSharedData.prototype.setCurrentIndex = function (type, currentIndex){
	for (var i=0;i<this._annotationsFound.length; i++){
		if (this._annotationsFound[i].type==type){
			this._annotationsFound[i].currentIndex = currentIndex;	
			break;
		}
	}
	
}
