TW.Runtime.Widgets.floatingmarkers= function () {
	var valueElem;
	var thisWidget = this;
	var backendObjKeyword;
	var clickIdentifyClass = "FMClick";
	var rootIdentifyClass = "FMRoot";
	var idFieldName, featureFeildName,xPosFieldName, yPosFieldName;

	this.renderHtml = function () {
		// return any HTML you want rendered for your widget
		// If you want it to change depending on properties that the user
		// has set, you can use this.getProperty(propertyName). In
		// this example, we'll just return static HTML
		TW.log.warn("renderHtml:"+thisWidget.jqElementId);
		clickIdentifyClass += thisWidget.jqElementId;	//in order to avoid multiple instance of widget.
		rootIdentifyClass += thisWidget.jqElementId;	//same as above.
		backendObjKeyword =this.getProperty('ImageElementName');
		idFieldName = this.getProperty('IDField');	//which field from data plays IDValue;
		featureFeildName = this.getProperty('TextField');
		xPosFieldName = this.getProperty('XposField');
		yPosFieldName = this.getProperty('YposField');


		return 	'<div class="widget-content widget-floatingmarkers circle" id="' +
			thisWidget.jqElementId + '" >' +
					'<span id="thisismytest" idvalue="123">' + backendObjKeyword + '</span>' +
				'</div>';
	};

	
	this.afterRender = function () {
		// NOTE: this.jqElement is the jquery reference to your html dom element
		// 		 that was returned in renderHtml()

		// get a reference to the value element
		//valueElem = this.jqElement.find('.ImageElementName');
		// update that DOM element based on the property value that the user set
		// in the mashup builder
		//valueElem.text(this.getProperty('FloatingMarkers Property'));
		var grandparent = $(this).parent().parent();
		var html='<div class="widget-content widget-floatingmarkers circle" id="abcd" style="top: 0px;left: 0px; width: 100px;height: 100px">' +
					'<span>' + "How" + '</span>' +
				'</div>';
		TW.log.warn("After Render grandparent.append(html):"+grandparent.append(html));
		TW.log.warn("After Render grandparent.attr('class'):"+grandparent.attr("class"));
		
		
		//TW.log.warn("After Render:"+ this.parent().parent());
		TW.log.warn("After Render:$(thisWidget).parent().parent()"+$(thisWidget).parent().parent());
		TW.log.warn("After Render, Width:"+grandparent.width());
		if($(thisWidget).parent().parent()===grandparent){
			TW.log.warn("After Render: we are same.");
		}else{
			TW.log.warn("We are different.");
		}
		var span = $(this).find("span");
		TW.log.warn("After Render span attr id:"+span.attr("id"));
		TW.log.warn("After Render span attr idvalue:"+span.attr("idvalue"));
		TW.log.warn("Document level:document.getElementById(thisWidget.jqElementId).getAttribute('class')->"+document.getElementById(thisWidget.jqElementId).getAttribute("class"));
		TW.log.warn("Document parentnode level:class->"+document.getElementById(thisWidget.jqElementId).parentNode.parentNode.getAttribute("class"));
		TW.log.warn("Document parentnode level:id->"+document.getElementById(thisWidget.jqElementId).parentNode.parentNode.getAttribute("id"));
		TW.log.warn("Document parentnode level:style->"+document.getElementById(thisWidget.jqElementId).parentNode.parentNode.getAttribute("style"));
	};

	// this is called on your widget anytime bound data changes
	this.updateProperty = function (updatePropertyInfo) {
		// TargetProperty tells you which of your bound properties changed
		if (updatePropertyInfo.TargetProperty === 'Data') {
			dataRows = updatePropertyInfo.ActualDataRows;
			TW.log.warn("dataRows:"+dataRows.length);
			//document.getElementById(thisWidget.jqElementId).style.visibility="visible";
			removeExistingElement(rootIdentifyClass);
			for(var index=0;index<dataRows.length;index++){
				var row=dataRows[index];
				TW.log.warn("we are talking about:"+index);
				//TW.log.warn("can we print:"+row);
				//$.each(row,function(key, value){
				//	TW.log.warn("Key:"+key+"  Value:"+value);
				//})
				buildHtml(row[idFieldName],row[featureFeildName],row[xPosFieldName],row[yPosFieldName], thisWidget.jqElementId);
			}
			document.getElementById(thisWidget.jqElementId).style.visibility="hidden";
			//valueElem.text(updatePropertyInfo.SinglePropertyValue);
			//this.setProperty('FloatingMarkers Property', updatePropertyInfo.SinglePropertyValue);
			moveImageBack(thisWidget.jqElementId, backendObjKeyword);

			//setup IDValue to default
			setupSelectedIDValue(-1);
		}
	};

	function moveImageBack(CurrentID, keyword){
		TW.log.warn("CurrentID:"+ CurrentID+" keyword:"+keyword);

		var referenceObj = document.getElementById(CurrentID);
		var children=referenceObj.parentNode.parentNode.children;
		for(var i=0;i<children.length;i++){
			var child = children[i];
			TW.log.warn("moveImageBack id:"+child.id);
			if(child.id.indexOf(keyword)>-1){
				child.style.zIndex = -1;
				return;
			}
		}
	}

	function removeExistingElement(rootIdentifyClass){
		var existingList = document.getElementsByClassName(rootIdentifyClass);
		TW.log.warn("Start to remove..."+existingList.length+" class:"+ rootIdentifyClass);
		for(var index=existingList.length-1;index>=0;index--){
			var oneElement=existingList[index];
			if(oneElement){
				TW.log.warn("Going to remove:"+oneElement.id);
				oneElement.parentNode.removeChild(oneElement);
			}
		}
		TW.log.warn("done removeExistingElement")
	};

	function cleanClickedClass(clickIdentifyClass){
		var existingList = document.getElementsByClassName(clickIdentifyClass);
		TW.log.warn("Start to remove clicked class..."+existingList.length+" class:"+ clickIdentifyClass);
		for(var index=existingList.length-1;index>=0;index--){
			var oneElement=existingList[index];
			if(oneElement){
				TW.log.warn("Going to remove clicked class from:"+oneElement.id);
				oneElement.classList.remove("clicked");
			}
		}
		TW.log.warn("done remove clicked class from ExistingElement")
	}

	function setupSelectedValue(selectedID,selectedText,selectedXPos,selectedYPos){
		//a IDValue is selected, this will update IDValue as source of binding
		//and trigger event;
		TW.log.warn("selected value:("+selectedID+")("+selectedText+")("+selectedText+")("+selectedYPos+")");
		thisWidget.setProperty("selectedID", selectedID);
		thisWidget.setProperty("selectedText", selectedText);
		thisWidget.setProperty("selectedXPos", selectedXPos);
		thisWidget.setProperty("selectedYPos", selectedYPos);
		
		thisWidget.jqElement.triggerHandler('SelectedChange');
	}

	function buildHtml(IDValue, Feature, XPosition, YPosition, CurrentID){
		//<div id="root_floatingmarkers-11-bounding-box" class="widget-bounding-box nonresponsive" style="top: 10px; left: 10px; width: 50px; height: 50px; z-index: 1510;">
		//<div class="widget-content widget-floatingmarkers circle" id="root_floatingmarkers-11" style="width: 50px; height: 50px;">
		//	<span>image</span>
		//</div>
		//</div>
		//var node = document.createElement("LI");                 // Create a <li> node
		//var textnode = document.createTextNode("Water");         // Create a text node
		//node.appendChild(textnode);                              // Append the text to <li>
		//document.getElementById("myList").appendChild(node);     // Append <li> to <ul> with id="myList"
		//document.getElementById("myP").style.visibility = "hidden";
		TW.log.warn("parameters:("+IDValue+")("+Feature+")("+XPosition+")("+YPosition+")("+CurrentID+")");
		var specialTag = "" + IDValue + "DESHENG";

		var referenceObj = document.getElementById(CurrentID);
		var span = document.createElement("span");
		span.innerHTML = Feature;
		var divContent = document.createElement("div");
		divContent.className = referenceObj.className + " " + clickIdentifyClass;
		divContent.id = referenceObj.id + specialTag;
		divContent.style = referenceObj.style;
		divContent.style.visibility = "visible";
		divContent.setAttribute('selectedID', IDValue);
		divContent.setAttribute('selectedText', Feature);
		divContent.setAttribute('selectedXPos', XPosition);
		divContent.setAttribute('selectedYPos', YPosition);
		divContent.appendChild(span);

		var divRoot = document.createElement("div");
		divRoot.id=referenceObj.parentNode.id+specialTag;
		divRoot.className = referenceObj.parentNode.className + " " + rootIdentifyClass;	//for easy identify when it is needed to delete.
		divRoot.style = referenceObj.parentNode.style;
		divRoot.style.top = "" + Math.round(YPosition) + "px";
		divRoot.style.left = "" + Math.round(XPosition) + "px";
		divRoot.style.width = "50px";
		divRoot.style.height = "50px";
		divRoot.style.zIndex = referenceObj.parentNode.zIndex;
		divRoot.style.visibility = "visible";
		divRoot.appendChild(divContent);
		referenceObj.parentNode.parentNode.appendChild(divRoot);
		divContent.onclick=function(){
			TW.log.warn("Onclick parameters:(id:"+this.getAttribute("id")+"("+this.getAttribute("class+")+")");
			cleanClickedClass(clickIdentifyClass);
			this.classList.add("clicked");
			TW.log.warn("add clicked class to DivContent");
			TW.log.warn("clicked IDValue is:"+this.getAttribute('selectedID'));
			setupSelectedValue(this.getAttribute('selectedID'),this.getAttribute('selectedText'),this.getAttribute('selectedXPos'),this.getAttribute('selectedYPos'));
			TW.log.warn("trigger done");
		};
	};

	this.beforeDestroy = function(){
			try{
				thisWidget.jqElement.unbind();
			}catch(err){
				TW.log.error('Error in beforeDestroy', err);
			}
		}
};