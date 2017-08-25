TW.IDE.Widgets.histogramchart = function () {

	this.widgetIconUrl = function() {
		return  "'../Common/extensions/histogramchart/ui/histogramchart/images/histogramChart.ide.png'";
	};

	this.widgetProperties = function () {
		return {
			'name': 'histogramchart',
			'description': 'a chart to display histogram data and include indicator for nominal, mean, usl, lsl etc. it may or may not include: cp, cpk, std value.',
			'category': ['Data','Chart'],
			'supportsLabel': false,
	        'supportsAutoResize': true,
            'borderWidth': 1,
            'defaultBindingTargetProperty': 'Data',
			'properties': {
				'Title': {
                    'description': 'Title for chart',
					'defaultValue': 'Histogram Chart',
					'isBindingTarget': true,
                    'baseType': 'STRING',
                    'isVisible': true
                },
				'UseRawData': {
                    'description': 'Use raw data to calculate histogram data',
                    'defaultValue': true,
                    'baseType': 'BOOLEAN',
                    'isVisible': true
                },
				'Data': {
                    'description': 'Data source, either raw data or histogram data',
                    'isBindingTarget': true,
                    'isEditable': false,
                    'baseType': 'INFOTABLE',
                    'warnIfNotBoundAsTarget': true
				},
				'Histogram_X_Value': {
                    'description': 'Field that identifies histogram x value.',
                    'baseType': 'FIELDNAME',
                    'sourcePropertyName': 'Data',
                    'isBindingTarget': false,
                    'isVisible': false
				},
				'Histogram_Y_Value': {
                    'description': 'Field that identifies histogram y value.',
                    'baseType': 'FIELDNAME',
                    'sourcePropertyName': 'Data',
                    'isBindingTarget': false,
                    'isVisible': false
				},
				'Raw_Value': {
                    'description': 'Field that identifies raw value to histogram.',
                    'baseType': 'FIELDNAME',
                    'sourcePropertyName': 'Data',
                    'isBindingTarget': false,
                    'isVisible': true
				},
				'Timestamp_Field': {
                    'description': 'Field that identifies timestamp value for control chart.',
                    'baseType': 'FIELDNAME',
                    'sourcePropertyName': 'Data',
                    'isBindingTarget': false,
                    'isVisible': true
				},
				'Nominal':{
                    'description': 'Nominal Value',
                    'defaultValue':0.0,
					'baseType':'NUMBER',
					'isBindingTarget': true,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': true
				},
				'UTL':{
                    'description': 'Upper Tolerance Limit',
                    'defaultValue':0.0,
					'baseType':'NUMBER',
					'isBindingTarget': true,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': true
                },
                'LTL':{
                    'description': 'Low Tolerance Limit',
                    'defaultValue':0.0,
					'baseType':'NUMBER',
					'isBindingTarget': true,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': true
				},
				'USL':{
                    'description': 'Upper Specification Limit',
                    'defaultValue':0.0,
					'baseType':'NUMBER',
					'isBindingTarget': false,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': false
                },
                'LSL':{
                    'description': 'Low Specification Limit',
                    'defaultValue':0.0,
					'baseType':'NUMBER',
					'isBindingTarget': false,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': false
				},
				'UCL':{
                    'description': 'Upper Control Limit',
                    'defaultValue':0.0,
					'baseType':'NUMBER',
					'isBindingTarget': false,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': false
                },
                'LCL':{
                    'description': 'Low Control Limit',
                    'defaultValue':0.0,
					'baseType':'NUMBER',
					'isBindingTarget': false,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': false
				},
				'mean':{
                    'description': 'Mean of raw value',
                    'defaultValue':0.0,
					'baseType':'NUMBER',
					'isBindingTarget': false,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': false
                },
                'std':{
                    'description': 'Standard Deviation of raw value',
                    'defaultValue':0.0,
					'baseType':'NUMBER',
					'isBindingTarget': false,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': false
				},
				'Cp':{
                    'description': 'Calculated Cp Value',
                    'defaultValue':0.0,
					'baseType':'NUMBER',
					'isBindingTarget': false,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': false
                },
                'Cpk':{
                    'description': 'Calculated Cpk Value',
                    'defaultValue':0.0,
					'baseType':'NUMBER',
					'isBindingTarget': false,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': false
				},
                'swtest':{
                    'description': 'Shapiro-Wilk test result',
                    'defaultValue':0.0,
					'baseType':'NUMBER',
					'isBindingTarget': false,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': false
				},
                'pvalue':{
                    'description': 'P-Value',
                    'defaultValue':0.0,
					'baseType':'NUMBER',
					'isBindingTarget': false,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': false
				},
                'TotalCount':{
                    'description': 'Total count of measurement',
                    'defaultValue':0.0,
					'baseType':'INTEGER',
					'isBindingTarget': false,
					'isBindingSource': true,
					'isVisible': true,
					'warnIfNotBoundAsTarget': false
				},
				'DefaultChart': {
                    'baseType': 'STRING',
                    'defaultValue': 'histogram',
                    'selectOptions': [
                        { value: 'histogram', text: 'Histogram' },
                        { value: 'controlchart', text: 'Control Chart' },
                        { value: 'qqplot', text: 'Q-Q Plot' }
                    ]
				},
				'Width': {
                    'defaultValue': 640
                },
                'Height': {
                    'defaultValue': 240
                },
                'Z-index': {
                    'baseType': 'NUMBER',
                    'defaultValue': 10
                }
			}
		}
	};

	this.afterSetProperty = function (name, value) {
		var allWidgetProps = this.allWidgetProperties();

        if (name === 'Width' ||
            name === 'Height' ||
            name==='ChartTitle' ||
            name==='Alignment') {
            return true;
        }

        if (name === 'ShowAxisLabels'){
            allWidgetProps['properties']['X-AxisLabel']['isVisible'] = this.getProperty('ShowAxisLabels');
            allWidgetProps['properties']['Y-AxisLabel']['isVisible'] = this.getProperty('ShowAxisLabels');
            this.updatedProperties();
            return true;
        }

        if (name === 'UseRawData') {

            if( this.getProperty('UseRawData') === true){
                allWidgetProps['properties']['USL']['isBindingTarget'] = false;
                allWidgetProps['properties']['LSL']['isBindingTarget'] = false;
                allWidgetProps['properties']['mean']['isBindingTarget'] = false;
                allWidgetProps['properties']['std']['isBindingTarget'] = false;
                allWidgetProps['properties']['UCL']['isBindingTarget'] = false;
                allWidgetProps['properties']['LCL']['isBindingTarget'] = false;
                allWidgetProps['properties']['Cp']['isBindingTarget'] = false;
                allWidgetProps['properties']['Cpk']['isBindingTarget'] = false;
                allWidgetProps['properties']['Raw_Value']['isVisible'] = true;
                allWidgetProps['properties']['Histogram_X_Value']['isVisible'] = false;
                allWidgetProps['properties']['Histogram_Y_Value']['isVisible'] = false;
                allWidgetProps['properties']['NormData']['isVisible'] = false;
                allWidgetProps['properties']['Norm_X_Value']['isVisible'] = false;
                allWidgetProps['properties']['Norm_Y_Value']['isVisible'] = false;
				allWidgetProps['properties']['X-AxisMinimum']['isBindingTarget'] = false;
				allWidgetProps['properties']['X-AxisMaximum']['isBindingTarget'] = false;
				allWidgetProps['properties']['Y-AxisMinimum']['isBindingTarget'] = false;
				allWidgetProps['properties']['Y-AxisMaximum']['isBindingTarget'] = false;
				
            }else{
                allWidgetProps['properties']['USL']['isBindingTarget'] = true;
                allWidgetProps['properties']['LSL']['isBindingTarget'] = true;
                allWidgetProps['properties']['mean']['isBindingTarget'] = true;
                allWidgetProps['properties']['std']['isBindingTarget'] = true;
                allWidgetProps['properties']['UCL']['isBindingTarget'] = true;
                allWidgetProps['properties']['LCL']['isBindingTarget'] = true;
                allWidgetProps['properties']['Cp']['isBindingTarget'] = true;
				allWidgetProps['properties']['Cpk']['isBindingTarget'] = true;
				allWidgetProps['properties']['Raw_Value']['isVisible'] = false;
                allWidgetProps['properties']['Histogram_X_Value']['isVisible'] = true;
                allWidgetProps['properties']['Histogram_Y_Value']['isVisible'] = true;
                allWidgetProps['properties']['NormData']['isVisible'] = true;
                allWidgetProps['properties']['Norm_X_Value']['isVisible'] = true;
                allWidgetProps['properties']['Norm_Y_Value']['isVisible'] = true;
                allWidgetProps['properties']['X-AxisMinimum']['isBindingTarget'] = true;
				allWidgetProps['properties']['X-AxisMaximum']['isBindingTarget'] = true;
				allWidgetProps['properties']['Y-AxisMinimum']['isBindingTarget'] = true;
				allWidgetProps['properties']['Y-AxisMaximum']['isBindingTarget'] = true;
            }

            this.updatedProperties();

            return true;
        }

        if (name === 'ShowValues') {

            if( this.getProperty('ShowValues') === true){
                allWidgetProps['properties']['ShowX-AxisLabels']['isVisible'] = false;
                allWidgetProps['properties']['EnableHover']['isVisible'] = false;
                this.setProperty('ShowX-AxisLabels',false);
                this.setProperty('EnableHover',false);
            }else{
                allWidgetProps['properties']['ShowX-AxisLabels']['isVisible'] = true;
                allWidgetProps['properties']['EnableHover']['isVisible'] = true;
            }

            this.updatedProperties();
            return true;
        }

        return false;
	};

	this.widgetEvents = function () {
        return {
        	'ValueChanged': {}
        };
    };

	this.widgetServices = function(){
		return {
			'ApplyData': { 'warnIfNotBound':true}
		};
	}

    this.renderHtml = function () {
        var html = '';
        html += '<div class="widget-content widget-histogramchart">'
             +  '<table height="100%" width="100%"><tr><td valign="middle" align="center">'
             +  '<span>Histogram Chart</span>'
			 +  '</td></tr></table></div>';
		//'<div class="widget-content widget-canvasGauge"><table height="100%" width="100%"><tr><td valign="middle" align="center"><span>Just Gauge</span></td></tr></table></div>';
        return html;
    };


	this.afterRender = function () {
		// NOTE: this.jqElement is the jquery reference to your html dom element
		// 		 that was returned in renderHtml()

		// get a reference to the value element
		//valueElem = this.jqElement.find('.histogramchart-property');
		// update that DOM element based on the property value that the user set
		// in the mashup builder
		//valueElem.text(this.getProperty('histogramchart Property'));
	};

	this.validate = function () {
        var result = [];

        if (!this.isPropertyBoundAsTarget('Data')) {
        	result.push({ severity: 'warning', message: 'You must assign at least data source to Data field' });
		}
		
		if (!this.getProperty('UseRawData') && !this.isPropertyBoundAsTarget('NormData')) {
        	result.push({ severity: 'warning', message: 'Norm Data source needs to be assigned if not using raw data' });
		}
		//more validation is required.

        return result;
    };
};