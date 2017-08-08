TW.IDE.Widgets.floatmarker = function () {

	this.widgetIconUrl = function() {
		return  "'../Common/extensions/FloatMarker/ui/floatmarker/default_widget_icon.ide.png'";
	};

	this.widgetProperties = function () {
		return {
			'name': 'FloatMarker',
			'description': 'a widget can be floated through data driven.',
			'category': ['Common'],
			'properties': {
				'DisplayText': {
					'baseType': 'STRING',
					'defaultValue': 'D',
					'isBindingTarget': true,
					'isBindingSource': true
				},
				'myTop': {
                    'baseType' : 'INTEGER',
					'defaultValue' : 0,
					'isBindingTarget': true,
					'isBindingSource': true,
					'isVisible': true,
					'description':'top of position.',
					'isEditable': true,
                },
                'myLeft': {
                    'baseType' : 'INTEGER',
					'defaultValue' : 0,
					'isBindingTarget': true,
					'isBindingSource': true,
					'description':'left of position.',
					'isVisible': true,
					'isEditable': true,
				},
				'IDValue': {
                    'baseType' : 'INTEGER',
					'defaultValue' : 0,
					'isBindingTarget': true,
					'isBindingSource': true,
					'description':'Internal ID Value.',
					'isVisible': true,
					'isEditable': true,
                },
                'width': {
                    'baseType' : 'NUMBER',
					'defaultValue' : 50,
					'description':'lwidth of widget.',
					'isVisible': true,
					'isEditable': true,
                },
                'height': {
                    'baseType' : 'NUMBER',
					'defaultValue' : 50,
					'description':'height of widget.',
					'isVisible': true,
					'isEditable': true,
                }
			}
		}
	};

	this.afterSetProperty = function (name, value) {
		var thisWidget = this;
		var refreshHtml = false;
		switch (name) {
			case 'Style':
			case 'FloatMarker Property':
				thisWidget.jqElement.find('.floatmarker-property').text(value);
			case 'DisplayText':
			case 'myTop':
			case 'myLeft':
			case 'Alignment':
				refreshHtml = true;
				break;
			default:
				break;
		}
		return refreshHtml;
	};

	this.renderHtml = function () {
		// return any HTML you want rendered for your widget
		// If you want it to change depending on properties that the user
		// has set, you can use this.getProperty(propertyName).
		var displayText = this.getProperty("DisplayText")
		
		return 	'<div class="widget-content circle widget-floatmarker">' +
					'<span class="DisplayText">' + displayText + '</span>' +
				'</div>';
	};

	this.widgetServices = function(){
		return {
			'ApplyPosition': { 'warnIfNotBound':true}
		};
	}

	this.widgetEvents = function () {
        return {
        	'Clicked': {}
        };
	};

	this.afterRender = function () {
		// NOTE: this.jqElement is the jquery reference to your html dom element
		// 		 that was returned in renderHtml()

		// get a reference to the value element
		//valueElem = this.jqElement.find('.floatmarker-property');
		// update that DOM element based on the property value that the user set
		// in the mashup builder
		//valueElem.text(this.getProperty('FloatMarker Property'));
		valueElem = this.jqElement.find(".DisplayText");
		valueElem.text(this.getProperty("DisplayText"));
		this.setProperty("myTop", this.getProperty("Top"));
		this.setProperty("myLeft", this.getProperty("Left"))
		TW.log.info("afterRender DisplayText:",this.getProperty('DisplayText'))
		TW.log.info("afterRender myTop:",this.getProperty('myTop'))
		TW.log.info("afterRender myLeft:",this.getProperty('myLeft'))
	};

};