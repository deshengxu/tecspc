TW.IDE.Widgets.floatingmarkers = function () {

	this.widgetIconUrl = function() {
		return  "'../Common/extensions/floatingmarkers/ui/floatingmarkers/images/default_widget_icon.ide.png'";
	};

	this.widgetProperties = function () {
		return {
			'name': 'FloatingMarkers',
			'description': 'FloatingMarkers is a widget which can generate multiple markers overa an image.',
			'category': ['Data', 'Charts'],
			'supportsLabel': false,
			'supportsAutoResize': true,
			'properties': {
				'Data': {
                    'description': 'Data source',
                    'isBindingTarget': true,
                    'isEditable': false,
                    'baseType': 'INFOTABLE',
                    'warnIfNotBoundAsTarget': true
				},
				'IDField': {
                    'description': 'Field that identifies value behind marker',
                    'baseType': 'FIELDNAME',
                    'sourcePropertyName': 'Data',
                    'isBindingTarget': false,
                    'isVisible': true
                },
                'TextField': {
                    'description': 'Field that identifies value to display on marker',
                    'baseType': 'FIELDNAME',
                    'sourcePropertyName': 'Data',
                    'isBindingTarget': false,
                    'isVisible': true
				},
				'XposField': {
                    'description': 'Field that identifies xPosition of marker',
                    'baseType': 'FIELDNAME',
                    'sourcePropertyName': 'Data',
                    'isBindingTarget': false,
                    'isVisible': true
				},
				'YposField': {
                    'description': 'Field that identifies value behind marker',
                    'baseType': 'FIELDNAME',
                    'sourcePropertyName': 'Data',
                    'isBindingTarget': false,
                    'isVisible': true
				},
				'ImageElementName': {
                    'description': 'Image Element Name for position reference',
                    'defaultValue': 'image',
                    'baseType': 'STRING',
                    'isLocalizable': false,
                    'isVisible': true
				},
				'PositionByImageRef':{
                    'description': 'Position and sizing by reference image',
                    'baseType': 'BOOLEAN',
                    'defaultValue': true
				},
				'widgetwidth': {
                    'isBindingTarget': true,
                    'isVisible': true,
                    'description': 'width of markers container',
                    'baseType': 'NUMBER',
                    'defaultValue': 640
                },
                'widgetheight': {
                    'isBindingTarget': true,
                    'isVisible': true,
                    'description': 'height of markers container',
                    'baseType': 'NUMBER',
                    'defaultValue': 480
				},
				'Width': {
                    'defaultValue': 50
                },
                'Height': {
                    'defaultValue': 50
                },
                'Z-index': {
                    'baseType': 'NUMBER',
                    'defaultValue': 10
                }
			}
		}
	};

	this.widgetEvents = function () {
        return {
        	'Clicked': {}
        };
	};
	
	this.widgetServices = function(){
		return {
			'ApplyPosition': { 'warnIfNotBound':true}
		};
	}

	this.afterSetProperty = function (name, value) {
		var thisWidget = this;
		var refreshHtml = false;

		if(name==='Width' || name==='Height'){
			return true;
		}
		return refreshHtml;
	};

	this.afterAddBindingSource = function (bindingInfo) {
        if (bindingInfo.targetProperty == "Data") {
            TW.log.warn("Data binded");
        }
    };

	this.renderHtml = function () {
		// return any HTML you want rendered for your widget
		// If you want it to change depending on properties that the user
		// has set, you can use this.getProperty(propertyName).
		return 	'<div class="widget-content widget-floatingmarkers">' +
					'<div class="circle">'+
					'<span class="floatingmarkers-property">' + 'F/M' + '</span>' +
					'</div>'+
				'</div>';
	};

	this.afterRender = function () {
		// NOTE: this.jqElement is the jquery reference to your html dom element
		// 		 that was returned in renderHtml()

		// get a reference to the value element
		valueElem = this.jqElement.find('.IDField');
		// update that DOM element based on the property value that the user set
		// in the mashup builder
		//valueElem.text(this.getProperty('FloatingMarkers Property'));
		TW.log.warn("valueElem:"+valueElem);
	};

};