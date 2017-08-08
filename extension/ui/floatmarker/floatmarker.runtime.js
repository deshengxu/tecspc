TW.Runtime.Widgets.floatmarker= function () {
	var valueElem;
	this.renderHtml = function () {
		// return any HTML you want rendered for your widget
		// If you want it to change depending on properties that the user
		// has set, you can use this.getProperty(propertyName). In
		// this example, we'll just return static HTML
		var displayText = this.getProperty("DisplayText");
		var myTop = this.getProperty("Top");
		var myLeft = this.getProperty("Left");
		TW.log.info("renderHtml DisplayText:",this.getProperty('DisplayText'))
		TW.log.info("renderHtml Top:",this.getProperty('Top'))
		TW.log.info("renderHtml Left:",this.getProperty('Left'))

		return 	'<div class="widget-content circle widget-floatmarker">' +
					'<span class="DisplayText">' + displayText + '</span>' +
				'</div>';
	};

	this.afterRender = function () {
		// NOTE: this.jqElement is the jquery reference to your html dom element
		// 		 that was returned in renderHtml()

		// get a reference to the value element
		valueElem = this.jqElement.find('.DisplayText');
		// update that DOM element based on the property value that the user set
		// in the mashup builder
		valueElem.text(this.getProperty('DisplayText'));
		TW.log.info("afterRender DisplayText:",this.getProperty('DisplayText'))
		TW.log.info("afterRender Top:",this.getProperty('Top'))
		TW.log.info("afterRender Left:",this.getProperty('Left'))

		var widgetElement=this;

		this.jqElement.on("click", function(e, data){
			TW.log.info("on:","click");
			widgetElement.jqElement.triggerHandler('Clicked');
		});

		// events
		this.jqElement.on('focus', function () {
			TW.log.info("Enter focus");
			widgetElement.addClass('focus');
		});

		this.jqElement.on('blur', function (e) {
			TW.log.info("Enter Blur");
			widgetElement.removeClass('focus');
		});
	};

	this.serviceInvoked = function(serviceName){
		TW.log.info("Service Name:", serviceName);
		if(serviceName === 'ApplyPosition'){
			var curTop = this.getProperty("myTop");
			var curLeft = this.getProperty("myLeft");
			var topText = curTop + "px";
			var leftText = curLeft + "px";

			TW.log.info("ApplyPosition myTop:",curTop);
			TW.log.info("ApplyPosition myLeft:", curLeft);
			TW.log.info("this.jqElementId", this.jqElementId);

			var parent = this.jqElement.parent();
			var originalStyle = document.getElementById(parent.attr('id')).style;
			var originalCss = document.getElementById(parent.attr('id')).style.cssText;
			//TW.log.info("original style:", originalStyle);
			TW.log.info("original css:", originalCss);

			//parent.css('top',topText);
			//parent.css('left', leftText);
			//var cssText = "top: 200px; left: 75px; width: 50px; height: 50px; z-index: 1510;";
			var newCssText = "top: "+topText+"; left: "+leftText+"; width: 50px; height: 50px; z-index: 1510;"
			if(this.getProperty("Visible")===false){
				newCssText += " display: none;";
			}
			TW.log.info("Visibility:", this.getProperty("Visible"));
			TW.log.info("new CSS:",newCssText);

			document.getElementById(parent.attr('id')).style.cssText = newCssText;

			var updatedStyle = document.getElementById(parent.attr('id')).style;
			//TW.log.info("updated style:", updatedStyle);
			TW.log.info("updatec css:", updatedStyle.cssText);

			//TW.log.info("parent object", parent);
			TW.log.info("Parent id:", parent.attr('id'));
			
			//TW.log.info("ApplyPosition Top before:",parent.position().top);
			//TW.log.info("ApplyPosition Left before:", parent.position().left);
			valueElem = this.jqElement.find('.DisplayText');
			// update that DOM element based on the property value that the user set
			// in the mashup builder
			
			valueElem.text(this.getProperty('DisplayText'));
			TW.log.info("afterRender DisplayText:",this.getProperty('DisplayText'))
			
		}
	}

	// this is called on your widget anytime bound data changes
	this.updateProperty = function (updatePropertyInfo) {
		// TargetProperty tells you which of your bound properties changed
		if (updatePropertyInfo.TargetProperty === 'DisplayText') {
			valueElem.text(updatePropertyInfo.SinglePropertyValue);
			TW.log.info("updateProperty DisplayText:",updatePropertyInfo.SinglePropertyValue)
			this.setProperty('DisplayText', updatePropertyInfo.SinglePropertyValue);
		}
		if (updatePropertyInfo.TargetProperty === 'myTop') {
			//valueElem.text(updatePropertyInfo.SinglePropertyValue);
			TW.log.info("updateProperty myTop:",updatePropertyInfo.SinglePropertyValue)
			if(isNormalInteger(updatePropertyInfo.SinglePropertyValue)){
				this.setProperty('myTop', updatePropertyInfo.SinglePropertyValue);
			}else{
				TW.log.info("updateProperty myTop:","Is not integer")
			}
			

		}
		if (updatePropertyInfo.TargetProperty === 'myLeft') {
			//valueElem.text(updatePropertyInfo.SinglePropertyValue);
			TW.log.info("updateProperty myLeft:",updatePropertyInfo.SinglePropertyValue)
			if(isNormalInteger(updatePropertyInfo.SinglePropertyValue)){
				this.setProperty('myLeft', updatePropertyInfo.SinglePropertyValue);
			}else{
				TW.log.info("updateProperty myLeft:","Is not integer")
			}
		}
		if (updatePropertyInfo.TargetProperty === 'IDValue') {
			//valueElem.text(updatePropertyInfo.SinglePropertyValue);
			TW.log.info("updateProperty IDValue:",updatePropertyInfo.SinglePropertyValue)
			if(isNormalInteger(updatePropertyInfo.SinglePropertyValue)){
				this.setProperty('IDValue', updatePropertyInfo.SinglePropertyValue);
			}else{
				TW.log.info("updateProperty IDValue:","Is not integer")
			}
		}
		this.beforeDestroy = function(){
			try{
				thisWidget.jqElement.unbind();
			}catch(err){
				TW.log.error('Error in beforeDestroy', err);
			}
		}
		function isNormalInteger(str) {
			var n = Math.floor(Number(str));
			return String(n) === str && n >= 0;
		}
	};
};