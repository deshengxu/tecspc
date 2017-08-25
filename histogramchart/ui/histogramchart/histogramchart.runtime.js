TW.Runtime.Widgets.histogramchart= function () {
	var canvasID;
	var windowCanvasName;	//
	var canvasConfig;	//all chart data will go to here.
	var chartObject;	//2d context in canvas for drawing.
	var rawvalue_fieldname;	//field mapping to raw value from input data.
	var timestamp_fieldname;
	var dataArray;	//binding data in raw format
	var nominal;	//binding nominal data or assigned nominal value
	var utl; 	//binding utl data or assigned utl value
	var ltl;	//binding ltl data or assigned ltl value
	var updatedMean=Number.NaN;
	var updatedStd = Number.NaN;
	var updatedCp = Number.NaN;
	var updatedCpk = Number.NaN;
	var updatedTotalCount = Number.NaN;
	var updatedSwtest = Number.NaN;
	var updatedPvalue = Number.NaN;
	var hDatasets,cDatasets,qDatasets;	
	var 		normDataset,		//histogram
				histogramDataset,	//histogram
				meanDataset,		//histogram
				nominalDataset,		//histogram
				uslDataset,			//histogram
				lslDataset,			//histogram
				controlChartDataset,	//control chart plot
				ccMeanDataset,		//control chart
				ccNominalDataset,	//control chart
				ccUslDataset,		//control chart
				ccLslDataset,		//control chart
				qqPlotDataset,		//q-q plot
				qqNormDataset;		//q-q plot
	var			histogramOptions,
				controlChartOptions,
				qqPlotOptions;
	var minDT,maxDT;		//minimal datetime and maximal datetime for control chart data.

	var chartList={
		'histogram':'Histogram',
		'controlchart':'Control Chart',
		'qqplot': 'Q-Q Plot'
	};
	var selectedChart = 'histogram';
	var preSelectedChart=null;

	var resetUpdatedFigures=function(){
		updatedMean=Number.NaN;
		updatedStd = Number.NaN;
		updatedCp = Number.NaN;
		updatedCpk = Number.NaN;
		updatedTotalCount = Number.NaN;
		updatedSwtest = Number.NaN;
		updatedPvalue = Number.NaN;
	};

	var isFiguresUpdated=function(){
		return !(isNaN(updatedTotalCount) || 
			isNaN(updatedMean) || isNaN(updatedStd) || isNaN(updatedCp) || isNaN(updatedCpk));
	};

	var setUpdatedFigures=function(thisTotalCount,thisMean, thisStd, thisCp, thisCpk,thisSwtest,thisPvalue){
		updatedTotalCount = thisTotalCount;
		updatedMean=thisMean;
		updatedStd = thisStd;
		updatedCp = thisCp;
		updatedCpk = thisCpk;
		updatedSwtest = thisSwtest;
		updatedPvalue = thisPvalue;
	};
	//for demo purpose
	var chartColors = {
		red: 'rgb(255, 99, 132)',
		orange: 'rgb(255, 159, 64)',
		yellow: 'rgb(255, 205, 86)',
		green: 'rgb(75, 192, 192)',
		blue: 'rgb(54, 162, 235)',
		purple: 'rgb(153, 102, 255)',
		grey: 'rgb(201, 203, 207)',
		dark: 'rgb(0,0,0)'
	};

	var thisWidget = this,
            chartTitleTextSizeClass;
		thisWidget.processing = false;
        thisWidget.UseRawData = thisWidget.getProperty('UseRawData');
        thisWidget.title = thisWidget.getProperty('Title');
        
        thisWidget.width = thisWidget.getProperty('Width');
        thisWidget.height = thisWidget.getProperty('Height');
        thisWidget.zIndex = thisWidget.getProperty('Z-index');
        
	this.renderHtml = function () {
		// return any HTML you want rendered for your widget
		// If you want it to change depending on properties that the user
		// has set, you can use this.getProperty(propertyName). In
		// this example, we'll just return static HTML
		//return 	'<div class="widget-content widget-histogramchart">' +
		//			'<span class="histogramchart-property">' + this.getProperty('histogramchart Property') + '</span>' +
		//		'</div>';

		//setup default chart name
		selectedChart = thisWidget.getProperty('DefaultChart') || 'histogram';
		// if running as extension, call renderStyles
		//thisWidget.renderStyles();
		rawvalue_fieldname = this.getProperty('Raw_Value');
		timestamp_fieldname = this.getProperty('Timestamp_Field');
		nominal = this.getProperty("Nominal");	//in case it is assigned
		utl = this.getProperty("UTL");	//in case it is assigned.
		ltl = this.getProperty("LTL");	//in case it is assigned.
		
		chartTitleTextSizeClass = 'textsize-normal';
		
		thisWidget.id = +thisWidget.getProperty('Id');
		canvasID = thisWidget.jqElementId + "-canvas";
		windowCanvasName = thisWidget.jqElementId +"_canvas_var";

		// <form name="myForm">
		// 	<input type="radio" name="myRadios"  value="controlchart" >Control Chart</input>
		// 	<input type="radio" name="myRadios"  value="histogram" >Histogram</input>
		// </form>
		var chartRadioHtml='<form name="' + thisWidget.jqElementId+'-form">';
		for(var key in chartList){
			if(chartList.hasOwnProperty(key)){
				chartRadioHtml += '<input type="radio" name="'+
								thisWidget.jqElementId +
								'-radios" value="' + 
								key + '">' + chartList[key] +
								'</input>';
				
			}
		}
		chartRadioHtml += '</form>';

		var html =
			'<div class="widget-histogramchart histogramchart-content" id="' + thisWidget.jqElementId + '" >' +
			'<div class="chart-title ' + chartTitleTextSizeClass + '" id="' + thisWidget.jqElementId + '-title" style=" text-align:' + (thisWidget.titleAlignment || 'center') + ';">' +
				
				'<table class="figuretable" id="'+thisWidget.jqElementId+'-figuretable">' +
					'<tr class="headerrow">' +
					'<td colspan=14>'+
					'<span class="widget-chart-title-text" style="Margin: 0 1em 0 1em;" id="' + thisWidget.jqElementId + '-titletext"' +
					'>'+ 
					Encoder.htmlEncode(thisWidget.title) + '</span>' +
					'</td>' +
					'<td><span>    </span></td>'+
					'</tr>'+
					'<tr class="figurerow">'+
					'<td class="figure-mean-label">Mean:</td>' +
					'<td class="figure-mean figure-value"><span id="'+thisWidget.jqElementId+'-figure-mean-value"></span>' +
					'<td class="figure-std-label">STD:</td>' +
					'<td class="figure-std figure-value"><span id="'+thisWidget.jqElementId+'-figure-std-value"></span>' +
					'<td class="figure-cp-label">Cp:</td>' +
					'<td class="figure-cp figure-value"><span id="'+thisWidget.jqElementId+'-figure-cp-value"></span>' +
					'<td class="figure-cpk-label">Cpk:</td>' +
					'<td class="figure-cpk figure-value"><span id="'+thisWidget.jqElementId+'-figure-cpk-value"></span>' +
					'<td class="figure-total-label">Total:</td>' +
					'<td class="figure-total figure-value"><span id="'+thisWidget.jqElementId+'-figure-total-value"></span>' +
					'<td class="figure-swtest-label">W:</td>' +
					'<td class="figure-swtest figure-value"><span id="'+thisWidget.jqElementId+'-figure-swtest-value"></span>' +
					'<td class="figure-pvalue-label">P:</td>' +
					'<td class="figure-pvalue figure-value"><span id="'+thisWidget.jqElementId+'-figure-pvalue-value"></span>' +
					'<td class="figure-value"><span>    </span></td>'+
					'</tr>' +
					'<tr class="buttonrow">'+
					'<td colspan=14 class="buttoncell">' + chartRadioHtml + '</td>' +
					'<td><span>    </span></td>'+
					'</tr>' +

				'</table>' +
					
			'</div>' +
			'<div>' +
				'<canvas id="' + canvasID +'"></canvas>' +
			'</div>' +
			'</div>';



		//init drawing db structure.
		thisWidget.buildDefaultConfig();

		return html;
	};

	this.initNorm = function(){
		var color = Chart.helpers.color;
		var normDataset = {};
		normDataset['type'] = 'line';
		normDataset['label'] = 'Norm';
		normDataset['borderColor']=chartColors.red;
		//normDataset['backgroundColor'] = color(chartColors.red).alpha(0.2).rgbString();
		normDataset['data'] = [];
		normDataset['fill'] = false;
		normDataset['hitRadius'] = 0.0;
		normDataset['radius'] = 0.0;
		normDataset['borderWidth'] = 1;		//line width

		return normDataset;
	}

	this.initHistogram = function(){
		var color = Chart.helpers.color;
		var histogramDataset = {};
		histogramDataset['type'] = 'line';
		histogramDataset['label'] = 'Histogram';
		histogramDataset['borderColor']=chartColors.blue;
		histogramDataset['backgroundColor'] = color(chartColors.blue).alpha(0.6).rgbString();
		histogramDataset['data'] = [];
		histogramDataset['fill'] = true;
		histogramDataset['hitRadius'] = 0.0;
		histogramDataset['radius'] = 0.0;
		histogramDataset['lineTension'] = 0.0;
		histogramDataset['pointRadius'] = 1.0;
		
		return histogramDataset;
	}

	this.initLine = function(label, lineColor){
		var color = Chart.helpers.color;
		var lDataset = {};
		lDataset['type'] = 'line';
		lDataset['label'] = label;
		lDataset['borderColor']= lineColor;
		lDataset['backgroundColor'] = color(lineColor).alpha(0.6).rgbString();
		lDataset['data'] = [];
		lDataset['fill'] = false;
		lDataset['lineTension'] = 0.0;
		lDataset['radius'] = 0.0;

		return lDataset;
	}

	this.initControlChartDataset = function(){
		var color = Chart.helpers.color;
		var controlChartDataset = {};
		controlChartDataset['type'] = 'line';
		controlChartDataset['label'] = 'Control Chart';
		controlChartDataset['borderColor']=chartColors.blue;
		controlChartDataset['backgroundColor'] = color(chartColors.blue).alpha(0.6).rgbString();
		controlChartDataset['data'] = [];
		controlChartDataset['fill'] = false;
		controlChartDataset['hitRadius'] = 0.0;
		controlChartDataset['radius'] = 0.0;
		controlChartDataset['lineTension'] = 0.0;
		controlChartDataset['pointRadius'] = 1.0;
		controlChartDataset['borderWidth'] = 1.0;	//line width
		
		return controlChartDataset;
	}

	this.initHistogramOptions = function(){
		var options={};
		options['title'] = {	//disable title on chart, instead in html.
			text:'Histogram Chart',
			display: false,
			position: 'bottom'
		};
		options['scales'] = {
					xAxes: [{
						ticks: {
							max: 1.0,
							min: 0.0,
							maxRotation: 45,
							minRotation: 45,
							callback: function(value, index, values){
								return Number(value).toFixed(5);
							}
						},
						id: 'first-x-axis',
                		type: 'linear'
					}],
					yAxes: [{
						ticks: {
							max: 0.4,
							min: 0.0,
							stepSize: 0.05,
							callback: function(value, index, values) {
										return Number(value).toFixed(2);
									}
							},
						id: 'first-y-axis',
                		type: 'linear'
					}]
				};
		options['legend'] = {
			position: 'right',
            display: true,
            labels: {
				fontColor: 'rgb(10, 10, 10)',
				fontSize: 10,
				boxWidth: 30,
				padding: 4
            }
		}

		return options;
	}

	this.initControlChartOptions=function(){
		var options={};
		options['title'] = {	//disable title on chart, instead in html.
			text:'Control Chart',
			display: false,
			position: 'bottom'
		};
		options['scales'] = {
					xAxes: [{
						time: {
							unit: 'day'
                		},
						id: 'first-x-axis',
						type: 'time',
						ticks:{
							autoSkip:true
						}
					}],
					yAxes: [{
						ticks: {
							// max: 1.0,
							// min: 0.0,
							// stepSize: 0.05,
							callback: function(value, index, values) {
										return Number(value).toFixed(5);
									}
							},
						id: 'first-y-axis',
                		type: 'linear'
					}]
				};
		options['legend'] = {
			position: 'right',
            display: true,
            labels: {
				fontColor: 'rgb(10, 10, 10)',
				fontSize: 10,
				boxWidth: 30,
				padding: 4
            }
		}
		return options;
	}

	this.initQQPlotOptions=function(){
		var options={};
		options['title'] = {	//disable title on chart, instead in html.
			text:'Q-Q Plot',
			display: false,
			position: 'bottom'
		};
		options['scales'] = {
					xAxes: [{
						ticks: {
							//stepSize: 0.5,
							callback: function(value, index, values){
								return Number(value).toFixed(1);
							}
						},
						id: 'first-x-axis',
                		type: 'linear'
					}],
					yAxes: [{
						ticks: {
							// max: 0.4,
							// min: 0.0,
							// stepSize: 0.05,
							// callback: function(value, index, values) {
							// 			return Number(value).toFixed(2);
							// 		}
							},
						id: 'first-y-axis',
                		type: 'linear'
					}]
				};
		options['legend'] = {
			position: 'right',
            display: true,
            labels: {
				fontColor: 'rgb(10, 10, 10)',
				fontSize: 10,
				boxWidth: 30,
				padding: 4
            }
		}
		return options;
	}
	
	this.initBubble = function(label, bubbleColor){
		var color = Chart.helpers.color;
		var bubbleDataset = {};
		bubbleDataset['type'] = 'bubble';
		bubbleDataset['label'] = label;
		bubbleDataset['borderColor']= bubbleColor;
		bubbleDataset['backgroundColor'] = color(bubbleColor).alpha(0.6).rgbString();
		bubbleDataset['data'] = [];
		bubbleDataset['fill'] = false;
		//bubbleDataset['lineTension'] = 0.0;
		bubbleDataset['hoverRadius'] = 1.0;

		return bubbleDataset;
	};

	this.selectDatasets=function(){
		// 'histogram':'Histogram',
		// 'controlchart':'Control Chart',
		// 'qqplot': 'Q-Q Plot'
		if(selectedChart==='histogram'){
			return hDatasets;
		}
		if(selectedChart==='controlchart'){
			return cDatasets;
		}
		if(selectedChart==='qqplot'){
			return qDatasets;
		}
	};

	this.selectOptions=function(){
		if(selectedChart==='histogram'){
			return histogramOptions;
		}
		if(selectedChart==='controlchart'){
			return controlChartOptions;
		}
		if(selectedChart==='qqplot'){
			return qqPlotOptions;
		}
	}

	this.buildDefaultConfig = function(){
		var color = Chart.helpers.color;
		//build up default value of config.

		//histogram dataset
		normDataset = thisWidget.initNorm();
		histogramDataset = thisWidget.initHistogram();
		meanDataset = thisWidget.initLine('Mean',chartColors.yellow);
		nominalDataset = thisWidget.initLine('Nominal', chartColors.green);
		uslDataset = thisWidget.initLine('USL', chartColors.orange);
		lslDataset = thisWidget.initLine('LSL', chartColors.purple);
		
		//control chart dataset
		controlChartDataset = thisWidget.initControlChartDataset();
		ccMeanDataset = thisWidget.initLine('Mean', chartColors.yellow);
		ccNominalDataset = thisWidget.initLine('Nominal', chartColors.green);
		ccUslDataset = thisWidget.initLine('USL', chartColors.orange);
		ccLslDataset = thisWidget.initLine('LSL', chartColors.purple);

		//Q-Q Plot chart dataset
		qqPlotDataset = thisWidget.initBubble('Q-Q', chartColors.red);
		qqNormDataset = thisWidget.initLine('Ref', chartColors.green);
		qqNormDataset['borderWidth'] = 1.0;

		histogramOptions = thisWidget.initHistogramOptions();
		controlChartOptions = thisWidget.initControlChartOptions();
		qqPlotOptions = thisWidget.initQQPlotOptions();

		hDatasets = [normDataset,
				histogramDataset,
				meanDataset,
				nominalDataset,
				uslDataset,
				lslDataset
			];
		cDatasets = [controlChartDataset,
				ccMeanDataset,
				ccNominalDataset,
				ccUslDataset,
				ccLslDataset	
			];
		qDatasets = [qqPlotDataset, qqNormDataset];

		var scatterChartData = {
			datasets: thisWidget.selectDatasets()
		};
		
		canvasConfig = {};
		canvasConfig['type']= 'line';
		canvasConfig['data'] = scatterChartData;
		
		canvasConfig['options'] = thisWidget.selectOptions();
		resetUpdatedFigures();
		TW.log.debug("canvasConfig is:"+(canvasConfig));
	};

	var exportCanvasConfig=function(){
		for(var index=0;index<canvasConfig['data']['datasets'].length;index++){
			TW.log.debug("index:"+index+" label:"+canvasConfig['data']['datasets'][index]['label']);
			TW.log.debug("Data:"+JSON.stringify(canvasConfig['data']['datasets'][index]['data']));
		}
		TW.log.debug("Options:"+JSON.stringify(canvasConfig['options']));
	}

	var exportDatasetsOptions=function(datasets,options){
		for(var index=0;index<datasets.length;index++){
			TW.log.debug("index:"+index+" label:"+datasets[index]['label']);
			TW.log.debug("type:"+datasets[index]['type']);
			TW.log.debug("Data:"+JSON.stringify(datasets[index]['data']));
		}
		TW.log.debug("Options:"+JSON.stringify(options));
	}

	this.afterRender = function () {
		// NOTE: this.jqElement is the jquery reference to your html dom element
		// 		 that was returned in renderHtml()

		// get a reference to the value element
		//valueElem = this.jqElement.find('.histogramchart-property');
		// update that DOM element based on the property value that the user set
		// in the mashup builder
		//valueElem.text(this.getProperty('histogramchart Property'));
		TW.log.debug("after Render:find Canvas?:"+document.getElementById(canvasID));
		thisWidget.setupInitChart();	//make the default one to be selected.
		thisWidget.drawChart();
		TW.log.debug("Windows Canvas Var:"+windowCanvasName+"--canvasID:"+canvasID);
		//TW.log.debug("CanvasConfig:"+JSON.stringify(canvasConfig));
	};

	this.setupInitChart=function(){
		var radios=document[thisWidget.jqElementId+"-form"][thisWidget.jqElementId+"-radios"];
		if(radios===undefined || radios === null){
			TW.log.debug("can't find radios object in DOM.");

		}else{
			for(var index=0;index<radios.length;index++){
				if(radios[index].value===selectedChart){
					radios[index].checked=true;
				}
				//radios[index].onclick=radioSelected(radios[index].value);
				radios[index].onclick = function(){
					if(this===preSelectedChart){
						TW.log.warn("en, you selected same thing. bye!");
					}else{
						preSelectedChart=this;
						selectedChart=this.value;
						thisWidget.updateDrawingForSelectedChart();
					}
				};
			}
		}
	};

	this.updateDrawingForSelectedChart=function(){
		TW.log.warn("I'm going to run;"+selectedChart);
		// thisWidget.updateSelectedChartConfig();
		// chartObject.update();
		chartObject = null;	//reset
		thisWidget.drawChart();
		TW.log.warn("it's done with:"+selectedChart);
	};

	thisWidget.updateSelectedChartConfig=function(){
		//update dataset and data based on selected chart.
		canvasConfig['data']['datasets']=thisWidget.selectDatasets();
		canvasConfig['options'] = thisWidget.selectOptions();
		TW.log.debug("updateSelectedChartConfig:going to export canvasconfig")
		exportCanvasConfig();
	}

	this.drawChart=function(){
		var ctx = document.getElementById(canvasID).getContext("2d");
		TW.log.debug("context object in drawChart:"+ctx);

		//this should be optimized in order to save memory.
		if(chartObject===undefined || chartObject === null){
			thisWidget.updateSelectedChartConfig();
			chartObject = new Chart(ctx, canvasConfig);
			TW.log.debug("Chart Object created in drawChart:"+ chartObject);
		}else{
			thisWidget.updateSelectedChartConfig();
			chartObject.update();
			TW.log.debug("Chart Object updated in drawChart:"+ chartObject);
		}
		
		
	}

	this.processDataRows=function(dataRows){
		TW.log.debug("Start to process datarows:"+dataRows.length);
		dataArray = [];
		controlChartData=[];
		for(var index=0;index<dataRows.length;index++){
			dataArray.push(dataRows[index][rawvalue_fieldname]);
			var point={
				x:dataRows[index][timestamp_fieldname],
				y:dataRows[index][rawvalue_fieldname]
			}
			controlChartData.push(point);
		}
		controlChartDataset['data']=controlChartData;
		//TW.log.debug("updated control chart dataset:"+JSON.stringify(controlChartDataset));

		if(dataRows.length>0){
			minDT=dataRows[0][timestamp_fieldname];	//assume first one is the earlest one.
			maxDT=dataRows[dataRows.length-1][timestamp_fieldname];
			// scales: {
            // xAxes: [{
            //     time: {
			controlChartOptions['scales']['xAxes']['time']['max']=maxDT;
			controlChartOptions['scales']['xAxes']['time']['min']=minDT;	
			//TW.log.debug("control chart options updated:"+JSON.stringify(controlChartOptions));
		}
		TW.log.debug("process Datarows done:")
		exportDatasetsOptions(controlChartDataset,controlChartOptions);
	}
	// this is called on your widget anytime bound data changes
	this.updateProperty = function (updatePropertyInfo) {
		// TargetProperty tells you which of your bound properties changed
		if (updatePropertyInfo.TargetProperty === 'Data') {
			thisWidget.processDataRows(updatePropertyInfo.ActualDataRows)
			TW.log.debug("Data is updated with:" + dataArray.length);
		}

		if (updatePropertyInfo.TargetProperty === 'Title'){
			thisWidget.title = updatePropertyInfo.SinglePropertyValue;
			this.setProperty('Title', updatePropertyInfo.SinglePropertyValue);
			//thisWidget.title = thisWidget.getProperty('Title');
			TW.log.debug("Title updated:"+thisWidget.title);
		}
		if (updatePropertyInfo.TargetProperty === 'Nominal') {
			nominal = updatePropertyInfo.SinglePropertyValue;
			this.setProperty('Nominal', nominal);
			TW.log.debug("Nominal updated:"+nominal);
		}

		if(updatePropertyInfo.TargetProperty === 'UTL'){
			utl = updatePropertyInfo.SinglePropertyValue;
			this.setProperty('UTL', utl);
			TW.log.debug("UTL updated:"+utl);
		}

		if(updatePropertyInfo.TargetProperty === 'LTL'){
			ltl = updatePropertyInfo.SinglePropertyValue;
			this.setProperty('LTL', ltl);
			TW.log.debug("LTL updated:"+ltl);
		}
	};

	this.beforeDestroy = function(){
		try{
			thisWidget.jqElement.unbind();
		}catch(err){
			TW.log.error('Error in beforeDestroy', err);
		}
	}

	this.serviceInvoked = function(serviceName){
		TW.log.info("Service Name:", serviceName);
		
		if(serviceName === 'ApplyData'){
			var isError=false;
			if(rawvalue_fieldname===undefined || rawvalue_fieldname===''){
				//thisWidget.buildDefaultConfig();
				TW.log.debug("rawvalue_fieldname is not mapped");
				isError=true;
			}

			if(timestamp_fieldname===undefined || timestamp_fieldname===''){
				//thisWidget.buildDefaultConfig();
				TW.log.debug("timestamp_fieldname is not mapped");
				isError=true;
			}
			
			if(nominal === undefined || utl === undefined || ltl === undefined
				|| dataArray === undefined){
				//thisWidget.buildDefaultConfig();
				TW.log.debug("nomial:("+nominal+"),utl:("+utl+"),ltl:("+ltl+")");
				TW.log.debug("dataRows:("+dataArray+")");
				isError = true;
			}

			if(dataArray.length===0 ){
				//thisWidget.buildDefaultConfig();
				TW.log.debug("dataArray has 0 length:" + dataArray.length);
				isError = true;
			}

			if(isError){
				calculationResult = thisWidget.cleanDefaultResult();
				calculationResult['swtest'] = Number.NaN;
				calculationResult['pvalue'] = Number.NaN;
			}else{
				calculationResult = thisWidget.calculateHistogram();
				if(calculationResult['count']>5000 || calculationResult['count']<3){
					calculationResult['swtest'] = Number.NaN;
					calculationResult['pvalue'] = Number.NaN;
				}else{
					calculationResult['swtest']=ShapiroWilkW(dataArray);
					calculationResult['pvalue'] = pvalue(calculationResult['swtest'],
						calculationResult['count']);
					if(calculationResult['count']<51){
						TW.log.warn("Data="+JSON.stringify(dataArray));
					}
					TW.log.debug("after Shapiro calculation:"+JSON.stringify(calculationResult));
				}
			}
			setUpdatedFigures(calculationResult['count'],
				calculationResult['mean'],
				calculationResult['std'],
				calculationResult['cp'],
				calculationResult['cpk'],
				calculationResult['swtest'],
				calculationResult['pvalue']
			);

			//exportCanvasConfig();
			if(isError){
				thisWidget.cleanDefaultConfig(calculationResult);
			}else{
				TW.log.debug("Start to setup chart, calculation result:"+JSON.stringify(calculationResult));
				thisWidget.setupChart(calculationResult);
			}
			thisWidget.updateSourcingBindingProperties(calculationResult);
			//thisWidget.drawChart();
			//exportCanvasConfig();
			// thisWidget.updateSelectedChartConfig();
			// chartObject.update();
			chartObject = null;
			thisWidget.drawChart();

			//add figures
			thisWidget.drawUpdatedFirgures();
		}
	};

	//update value of binding properties
	this.updateSourcingBindingProperties=function(calculationResult){
		// "mean": mean,	//mean
		// 	"std" : std,	//std
		// 	"cp" : cp,		//Cp
		// 	"cpk" : cpk,	//Cpk
		// 	"usl" : usl,	//USL
		// 	"lsl" : lsl,	//LSL
		// 	"ucl" : ucl,	//UCL
		// 	"lcl" : lcl,	//LCL
		// 	"minvalue": minvalue,
		// 	"maxvalue": maxvalue,
		// 	"boundmax":boundmax,
		// 	"boundmin":boundmin,
		// 	"edgemin":edgemin,
		// 	"edgemax":edgemax
		//	"count":		//TotalCount
		TW.log.debug("updateSourcingBindingProperties started.")
		thisWidget.setProperty('mean',calculationResult['mean']);
		thisWidget.setProperty('std', calculationResult['std']);
		thisWidget.setProperty('Cp',calculationResult['cp']);
		thisWidget.setProperty('Cpk',calculationResult['cpk']);
		thisWidget.setProperty('USL',calculationResult['usl']);
		thisWidget.setProperty('LSL',calculationResult['lsl']);
		thisWidget.setProperty('UCL',calculationResult['ucl']);
		thisWidget.setProperty('LCL',calculationResult['lcl']);
		thisWidget.setProperty('TotalCount',calculationResult['count']);
		thisWidget.setProperty('swtest', calculationResult['swtest']);
		thisWidget.setProperty('pvalue',calculationResult['pvalue']);
		TW.log.debug("updateSourcingBindingProperties ended.")
	};

	this.setupChart = function(calculationResult){
				// normDataset,
				// histogramDataset,
				// meanDataset,
				// nominalDataset,
				// uslDataset,
				// lslDataset	
		var normData = thisWidget.buildNormData(
			//(xmin,xmax,mean,sigma, ymax, steps)
			calculationResult['edgemin'],
			calculationResult['edgemax'],
			calculationResult['mean'],
			calculationResult['std'],
			calculationResult['bartop'],
			300
		);
		
		//draw line for histogram
		var histogramData = thisWidget.buildHistogramData(
			calculationResult['bins'], 
			calculationResult['barpercentage']);

		var meanData = thisWidget.buildVerticalLineData(
			calculationResult['mean'],
			calculationResult['bartop']
		);
		
		var nominalData = thisWidget.buildVerticalLineData(
			nominal,
			calculationResult['bartop']
		);

		var uslData = thisWidget.buildVerticalLineData(
			calculationResult['usl'],
			calculationResult['bartop']
		);

		var lslData = thisWidget.buildVerticalLineData(
			calculationResult['lsl'],
			calculationResult['bartop']
		);
		
		//control chart data has been updated in processdatarows already.
		var ccMeanData = [
			{x:minDT,y:calculationResult['mean']},
			{x:maxDT,y:calculationResult['mean']}
		]
		var ccNominalData = [
			{x:minDT,y:nominal},
			{x:maxDT,y:nominal}
		]

		var ccUslData = [
			{x:minDT,y:calculationResult['usl']},
			{x:maxDT,y:calculationResult['usl']}
		]
		
		var ccLslData = [
			{x:minDT,y:calculationResult['lsl']},
			{x:maxDT,y:calculationResult['lsl']}
		]
		
		var qqPlotData = thisWidget.generateQqPlotData();		//to be updated;
		var qqNormData = this.generateQqNormData(calculationResult);		//to be updated;
		TW.log.warn(" entering updateDefaultConfig");

		thisWidget.updateDefaultConfig(
			normData,
			histogramData,
			meanData,
			nominalData,
			uslData,
			lslData,
			ccMeanData,
			ccNominalData,
			ccUslData,
			ccLslData,
			qqPlotData,
			qqNormData,
			calculationResult
		);
	}

	this.generateQqPlotData=function(){
		//http://www.statisticshowto.com/q-q-plots/
		//assume dataArray has been sorted already.
		var segment = 1.0/(dataArray.length+1);
		var qqPlotData = [];
		for(var index=0;index<dataArray.length;index++){
			var point = {
				x: normalQuantile(segment * (index+1), 0, 1),
				y: dataArray[index],
				r: 2.0
			};
			qqPlotData.push(point);
		}

		return qqPlotData;
	};

	this.generateQqNormData = function(calculationResult){
		var segment = 1.0/(dataArray.length+1);

		var qqNormData=[];
		var zig1=normalQuantile(segment, 0, 1);
		var point1={
			x: zig1,
			y: calculationResult['mean'] + zig1 * calculationResult['std']
		}
		var zig2 = normalQuantile(segment * dataArray.length, 0, 1);
		var point2 = {
			x: zig2,
			y: calculationResult['mean'] + zig2 * calculationResult['std']
		}
		qqNormData.push(point1);
		qqNormData.push(point2);

		return qqNormData;
	}

	this.cleanDefaultResult=function(){
		var calculationResult = {
			'mean': Number.NaN,
			'std' : Number.NaN,
			'cp' : Number.NaN,
			'cpk' : Number.NaN,
			'usl' : Number.NaN,
			'lsl' : Number.NaN,
			'ucl' : Number.NaN,
			'lcl' : Number.NaN,
			'count': 0,
			"minvalue": 0.0,
			"maxvalue": 1.0,
			"boundmax":0.0,
			"boundmin":1.0,
			'edgemin': 0.0,
			'edgemax': 1.0,
			'bartop' : 0.5/1.1
		};
		return calculationResult;
	}

	this.cleanDefaultConfig=function(calculationResult){
		//in case wrong data, for example: 0 dataset.
		//drawing will be cleaned up.
		// thisWidget.setProperty('mean',calculationResult['mean']);
		// thisWidget.setProperty('std', calculationResult['std']);
		// thisWidget.setProperty('Cp',calculationResult['cp']);
		// thisWidget.setProperty('Cpk',calculationResult['cpk']);
		// thisWidget.setProperty('USL',calculationResult['usl']);
		// thisWidget.setProperty('LSL',calculationResult['lsl']);
		// thisWidget.setProperty('UCL',calculationResult['ucl']);
		// thisWidget.setProperty('LCL',calculationResult['lcl']);
		// thisWidget.setProperty('TotalCount',calculationResult['count']);
		

		thisWidget.updateDefaultConfig(
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			calculationResult
		)
	}

	this.updateDefaultConfig=function(
			normData,
			histogramData,
			meanData,
			nominalData,
			uslData,
			lslData,
			ccMeanData,
			ccNominalData,
			ccUslData,
			ccLslData,
			qqPlotData,
			qqNormData,
			calculationResult
	){
		// for(var index=0;index<histogramDataset.length;index++){
		// 	var label = histogramDataset[index]['label'];
		// 	TW.log.debug("processing label:"+label);
		// 	if(label=="Norm"){
		// 		histogramDataset[index]['data'] = normData;
		// 	}

		// 	if(label=="Histogram"){
		// 		histogramDataset[index]['data'] = histogramData;
		// 	}
			
		// 	if(label=="Mean"){
		// 		histogramDataset[index]['data'] = meanData;
		// 	}
		// 	if(label=="Nominal"){
		// 		histogramDataset[index]['data'] = nominalData;
		// 	}
		// 	if(label=="USL"){
		// 		histogramDataset[index]['data'] = uslData;
		// 	}
		// 	if(label=="LSL"){
		// 		histogramDataset[index]['data'] = lslData;
		// 	}
		// }
		normDataset['data']=normData;
		histogramDataset['data']=histogramData;
		meanDataset['data']=meanData;
		nominalDataset['data']=nominalData;
		uslDataset['data']=uslData;
		lslDataset['data']=lslData;
		histogramOptions['scales']['xAxes'][0]['ticks']['min']=calculationResult['edgemin'];
		histogramOptions['scales']['xAxes'][0]['ticks']['max']=calculationResult['edgemax'];
		histogramOptions['scales']['yAxes'][0]['ticks']['max']=roundupPercentage(
			calculationResult['bartop'] * 1.10);
		TW.log.debug("export Histogram data:");
		exportDatasetsOptions(hDatasets,histogramOptions);
		
		//control chart
		// for(var index=0;index<controlChartDataset.length;index++){
		// 	var label = controlChartDataset[index]['label'];
		// 	TW.log.debug("processing label:"+label);
		// 	if(label=="Mean"){
		// 		controlChartDataset[index]['data'] = ccMeanData;
		// 	}
		// 	if(label=="Nominal"){
		// 		controlChartDataset[index]['data'] = ccNominalData;
		// 	}
		// 	if(label=="USL"){
		// 		controlChartDataset[index]['data'] = ccUslData;
		// 	}
		// 	if(label=="LSL"){
		// 		controlChartDataset[index]['data'] = ccLslData;
		// 	}	
		// }
		ccMeanDataset['data']=ccMeanData;
		ccNominalDataset['data']=ccNominalData;
		ccUslDataset['data'] = ccUslData;
		ccLslDataset['data'] = ccLslData;
		controlChartOptions['scales']['yAxes'][0]['ticks']['max']=calculationResult['edgemax'];
		controlChartOptions['scales']['yAxes'][0]['ticks']['min']=calculationResult['edgemin'];
		controlChartOptions['scales']['yAxes'][0]['ticks']['stepSize']=roundStepSize(
			calculationResult['edgemax']- calculationResult['edgemin']
		);

		TW.log.debug("export control chart data:");
		exportDatasetsOptions(cDatasets,controlChartOptions)

		qqPlotDataset['data'] = qqPlotData;
		qqNormDataset['data'] = qqNormData;
		if(qqPlotDataset.length>0){
			qqPlotOptions['scales']['yAxes'][0]['ticks']['min'] = qqPlotData[0][y] - 0.1;
			qqPlotOptions['scales']['yAxes'][0]['ticks']['max'] = qqPlotData[qqPlotData.length-1][y] + 0.1;

			qqPlotOptions['scales']['xAxes'][0]['ticks']['min'] = qqPlotData[0][x] - 0.1;
			qqPlotOptions['scales']['xAxes'][0]['ticks']['max'] = qqPlotData[qqPlotData.length-1][x] + 0.1;
		}
		TW.log.debug("export Q-Q Plot data:");
		exportDatasetsOptions(qDatasets,qqPlotOptions);
	}

	var roundStepSize = function(totalGap){
		var step = totalGap/5;	//5-7 ticks in total
		//if step > 0, then return round one.
		//otherwise, * 10 until it is >0,
		for(var index=0;index<5;index++){
			if(step>1.0){
				return Math.floor(step)/Math.pow(10,index);
			}
			step *= 10;
		}
		return 0.00001;
	}

	var roundupPercentage=function(topValue){
		//round up to next level of percentage to aboiv line is too close
		//0.03 -> 0.05, 0.05->0.05
		var returnValue = (Math.ceil(topValue * 20.0) / 20.0).toFixed(2);
		TW.log.debug("Input topValue:"+topValue+ "  output:"+returnValue);
		return returnValue;
	}
	this.buildNormData = function(xmin,xmax,mean,sigma, ymax, steps){
		var normData = [];
		// CreateInfoTableFromDataShape(infoTableName:STRING("InfoTable"), dataShapeName:STRING):INFOTABLE(MES.U090GeneralValueXYDatashape)
		if(!isFinite(sigma) || Math.abs(sigma)<0.000000001){
			//if sigma is NaN or Infinity (+,-) or too small
			return normData;
		}
		var step = (xmax-xmin)/steps;
		var stepx=0.0;
		var yValue = new Array();
		var tempYMax = 0.0;
		for(var i = 0;i<steps;i++){
			stepx = xmin+ i * step;
			yValue[i] = normpdf(stepx, mean, sigma);
			if(yValue[i]>tempYMax){
				tempYMax = yValue[i];
			}
		}
		for(var i = 0;i<steps;i++){
			normData.push({
				'x': xmin+ i * step,
				'y': yValue[i] * ymax / tempYMax
			});
			if(mean > (xmin + i* step) && mean < (xmin + (i+1) * step)){
				//make sure there is a point on the lien of mean.
				normData.push({
					'x': mean,
					'y': normpdf(mean, mean, sigma) * ymax / tempYMax
				})
			}
		}
		return normData;

	}
	this.buildVerticalLineData=function(singleValue, topValue){
		var verticalLineDataset = [];
		if(!isFinite(singleValue)){
			return verticalLineDataset;
		}
		var point1 = {
			'x': singleValue,
			'y': 0.0
		}
		verticalLineDataset.push(point1);

		var point2 = {
			'x': singleValue,
			'y': topValue * 1.10
		}
		verticalLineDataset.push(point2);
		return verticalLineDataset;
	}
	this.buildHistogramData=function(bins,barpercentage){
		TW.log.debug("bins as input:"+JSON.stringify(bins));
		TW.log.debug("barpercentage as input:"+JSON.stringify(barpercentage));
		
		let histogramDataset=[];

		for(let index = 0;index<barpercentage.length;index++){
			//first point
			if(index==0){
				var point1={
					'x': bins[index],
					'y': 0.0
				}
				histogramDataset.push(point1);
			}
			var point2={
				'x': bins[index],
				'y': barpercentage[index]
			}
			histogramDataset.push(point2);
			var point3={
				'x':bins[index+1],
				'y':barpercentage[index]
			}
			histogramDataset.push(point3);
			var point4={
				'x':bins[index+1],
				'y':0.0
			}
			histogramDataset.push(point4);
		}
		return histogramDataset;
	}
	this.calculateHistogram = function(){
		//calculate histogram all result, including cpk, cp etc.
		//assume datarows has row more than 1.
		//var mostlastupdate = new Date(2000, 1, 1, 0, 0, 0, 0);
		var total = 0.0;
		var mean = 0.0;
		var std = 0.0;
		var usl = 0.0;
		var lsl = 0.0;
		var cp = 0.0;
		var cpk = 0.0;
		var ucl = 0.0;
		var lcl = 0.0;
		var boundmin = 0.0;
		var boundmax = 0.0;
		var minvalue = 0.0;
		var maxvalue = 0.0;
		//using reduce function to get total
		total = dataArray.reduce(function(preValue,elem){
			return preValue + elem;
		}, 0.0);
		TW.log.debug("Total:"+total);

		//using sort to get min and max value of data
		dataArray = dataArray.sort(function(a,b){return a-b});
		minvalue = dataArray[0];
		maxvalue = dataArray[dataArray.length-1];
		TW.log.debug("Min:"+minvalue + "  Max:"+maxvalue);

		//mean 
		mean = total / (dataArray.length);
		TW.log.debug("Mean:"+mean);

		//calculate std deviation
		//Math.pow((elem - mean),2)
		if(dataArray.length===1){
			std=Infinity;
		}else{
			var stdtotal = dataArray.map(elem => Math.pow((elem-mean),2)).reduce(
				function(preValue,elem){
					return preValue + elem;
				}, 0.0
			);
			std = Math.sqrt(stdtotal / (dataArray.length-1));	//ddof = 1
		}
		
		TW.log.debug("STD:"+std);

		usl = +nominal + +utl;
		lsl = +nominal + +ltl;
		TW.log.debug("usl:"+usl+"  lsl:"+lsl);

		if(isFinite(std) && std>0.000000001){
			//none zero
			cp = (usl-lsl)/(std * 6.0);
			cpk = Math.min( (usl-mean)/(3.0 * std), (mean-lsl)/(3.0 * std));
			ucl = mean + 3.0 * std;
			lcl = mean - 3.0 * std;
		}else{
			cp = 0.0;
			cpk = 0.0;
			ucl = Infinity;
			lcl = Infinity;
		}
		// boundmax=Math.max(ucl,usl,maxvalue);
		// boundmin=Math.min(lcl,lsl,minvalue);
		boundmax=Math.max(usl,maxvalue);
		boundmin=Math.min(lsl,minvalue);

		var edgemin=boundmin-(boundmax-boundmin)*0.05;
		var edgemax=boundmax+(boundmax-boundmin)*0.05;	// in order to avoid annoying space at the end
		TW.log.debug("boundmax:"+boundmax+" boundmin:"+boundmin);
		TW.log.debug("cp:"+cp+" cpk:"+cpk+" ucl:"+ucl+" lcl:"+lcl);

		var result = {
			"mean": mean,
			"std" : std,
			"cp" : cp,
			"cpk" : cpk,
			"usl" : usl,
			"lsl" : lsl,
			"ucl" : ucl,
			"lcl" : lcl,
			"minvalue": minvalue,
			"maxvalue": maxvalue,
			"boundmax":boundmax,
			"boundmin":boundmin,
			"edgemin":edgemin,
			"edgemax":edgemax,
			"count": dataArray.length
		}

		//merge two result together.
		result = Object.assign({}, result, thisWidget.calculateBins(boundmin, boundmax));
		TW.log.debug("result of merged result:"+JSON.stringify(result));

		return result;
	}

	this.calculateBins = function(boundmin,boundmax){
		//calculate bins and counts.
		var bars = dataArray.length>25? 8: 4;
		var hit = bars==8? hit8: hit4;	//which hit function will be used.
		TW.log.debug("bars value:"+bars);

		//if measurement > 25, then use 8 bars (9 bins)
		//otherwise, use 4 bars (5 bins)
		var gap = boundmax-boundmin;	//total gaps between min and max
		var step = gap / bars;	//step, width of bars.
		var bins = [];
		for(let index=0;index<bars+1;index++){
			bins[index] = boundmin + index * step;
		}
		TW.log.debug("boundmin:"+boundmin+" boundmax:"+boundmax+" bins:"+JSON.stringify(bins));

		var barcounts=[];
		for(let index=0;index<bars;index++){
			barcounts[index] = 0;	//start from 0.
		}

		for(let index=0;index<dataArray.length;index++){
			barcounts[hit(bins, dataArray[index])] += 1;
		}

		TW.log.debug("barcounts:"+JSON.stringify(barcounts));

		var barpercentage = barcounts.map( elem => elem * 1.0 / dataArray.length);

		TW.log.debug("barpercentage:"+JSON.stringify(barpercentage));

		var bartop = barpercentage.reduce(function(preValue,elem){
			return elem>preValue? elem:preValue;
		}, 0.0);	// search for biggest bar percentage.

		var result={
			"bins": bins,
			"barcounts": barcounts,
			"barpercentage": barpercentage,
			"bartop": bartop
		}
		//TW.log.debug("final result from bins calculation:"+JSON.stringify(result));
		return result;
	}
	

	normpdf = function(x,mean,sigma){
		var u = (x-mean)/Math.abs(sigma)
		return Math.exp(-u*u/2.0)/(Math.sqrt(2*Math.PI)*Math.abs(sigma));
	}

	hit4 = function(bins, myvalue){
		// 0, 1, 2, 3, 4
		if(myvalue>bins[2]){
			if(myvalue > bins[3]){
				return 3;
			}else{
				return 2;
			}
		}else{
			if(myvalue>bins[1]){
				return 1;
			}else{
				return 0;
			}
		}
	}

	hit8 = function(bins,myvalue){
		//0, 1, 2, 3, 4, 5, 6, 7, 8
		if(myvalue>bins[4]){
			if(myvalue>bins[6]){
				if(myvalue>bins[7]){
					return 7;
				}else{
					return 6;
				}
			}else{
				if(myvalue> bins[5]){
					return 5;
				}else{
					return 4;
				}
			}
		}else{
			if(myvalue>bins[2]){
				if(myvalue>bins[3]){
					return 3;
				}else{
					return 2;
				}
			}else{
				if(myvalue>bins[1]){
					return 1;
				}else{
					return 0;
				}
			}
		}
	}

	this.drawUpdatedFirgures = function() {
		TW.log.debug("drawUpdatedFirgures");
		document.getElementById(thisWidget.jqElementId+"-titletext").innerHTML = Encoder.htmlEncode(thisWidget.title);
		document.getElementById(thisWidget.jqElementId+'-figure-total-value').innerHTML=updatedTotalCount;
		document.getElementById(thisWidget.jqElementId+'-figure-mean-value').innerHTML=updatedMean.toFixed(5);
		document.getElementById(thisWidget.jqElementId+'-figure-std-value').innerHTML=updatedStd.toFixed(5);
		document.getElementById(thisWidget.jqElementId+'-figure-cp-value').innerHTML=updatedCp.toFixed(5);
		document.getElementById(thisWidget.jqElementId+'-figure-cpk-value').innerHTML=updatedCpk.toFixed(5);
		document.getElementById(thisWidget.jqElementId+'-figure-swtest-value').innerHTML=updatedSwtest.toFixed(5);
		document.getElementById(thisWidget.jqElementId+'-figure-pvalue-value').innerHTML=updatedPvalue.toFixed(5);
		TW.log.debug("drawUpdatedFirgures Ends");
	}


	//Shapiro-Wilk test functions.
	// The inverse of cdf.
	function normalQuantile(p, mu, sigma)
	{
		var p, q, r, val;
		if (sigma < 0)
			return -1;
		if (sigma == 0)
			return mu;

		q = p - 0.5;

		if (0.075 <= p && p <= 0.925) {
			r = 0.180625 - q * q;
			val = q * (((((((r * 2509.0809287301226727 + 33430.575583588128105) * r + 67265.770927008700853) * r
				+ 45921.953931549871457) * r + 13731.693765509461125) * r + 1971.5909503065514427) * r + 133.14166789178437745) * r
				+ 3.387132872796366608) / (((((((r * 5226.495278852854561 + 28729.085735721942674) * r + 39307.89580009271061) * r
				+ 21213.794301586595867) * r + 5394.1960214247511077) * r + 687.1870074920579083) * r + 42.313330701600911252) * r + 1);
		}
		else { /* closer than 0.075 from {0,1} boundary */
			/* r = min(p, 1-p) < 0.075 */
			if (q > 0)
				r = 1 - p;
			else
				r = p;/* = R_DT_Iv(p) ^=  p */

			r = Math.sqrt(-Math.log(r)); /* r = sqrt(-log(r))  <==>  min(p, 1-p) = exp( - r^2 ) */

			if (r <= 5.) { /* <==> min(p,1-p) >= exp(-25) ~= 1.3888e-11 */
				r += -1.6;
				val = (((((((r * 7.7454501427834140764e-4 + 0.0227238449892691845833) * r + .24178072517745061177) * r
					+ 1.27045825245236838258) * r + 3.64784832476320460504) * r + 5.7694972214606914055) * r
					+ 4.6303378461565452959) * r + 1.42343711074968357734) / (((((((r * 1.05075007164441684324e-9 + 5.475938084995344946e-4) * r
					+ .0151986665636164571966) * r + 0.14810397642748007459) * r + 0.68976733498510000455) * r + 1.6763848301838038494) * r
					+ 2.05319162663775882187) * r + 1);
			}
			else { /* very close to  0 or 1 */
				r += -5.;
				val = (((((((r * 2.01033439929228813265e-7 + 2.71155556874348757815e-5) * r + 0.0012426609473880784386) * r
					+ 0.026532189526576123093) * r + .29656057182850489123) * r + 1.7848265399172913358) * r + 5.4637849111641143699) * r
					+ 6.6579046435011037772) / (((((((r * 2.04426310338993978564e-15 + 1.4215117583164458887e-7)* r
					+ 1.8463183175100546818e-5) * r + 7.868691311456132591e-4) * r + .0148753612908506148525) * r
					+ .13692988092273580531) * r + .59983220655588793769) * r + 1.);
			}

			if (q < 0.0)
				val = -val;
			/* return (q >= 0.)? r : -r ;*/
		}
		return mu + sigma * val;
	}

	/*
	*  Ported from http://svn.r-project.org/R/trunk/src/library/stats/src/swilk.c
	*
	*  R : A Computer Language for Statistical Data Analysis
	*  Copyright (C) 2000-12   The R Core Team.
	*
	*  Based on Applied Statistics algorithms AS181, R94
	*    (C) Royal Statistical Society 1982, 1995
	*
	*  This program is free software; you can redistribute it and/or modify
	*  it under the terms of the GNU General Public License as published by
	*  the Free Software Foundation; either version 2 of the License, or
	*  (at your option) any later version.
	*
	*  This program is distributed in the hope that it will be useful,
	*  but WITHOUT ANY WARRANTY; without even the implied warranty of
	*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	*  GNU General Public License for more details.
	*
	*  You should have received a copy of the GNU General Public License
	*  along with this program; if not, a copy is available at
	*  http://www.r-project.org/Licenses/
	*/

	function sign(x) {
		if (x == 0)
			return 0;
		return x > 0 ? 1 : -1;
	}

	function ShapiroWilkW(x)
	{
		function poly(cc, nord, x)
		{
			/* Algorithm AS 181.2	Appl. Statist.	(1982) Vol. 31, No. 2
			Calculates the algebraic polynomial of order nord-1 with array of coefficients cc.
			Zero order coefficient is cc(1) = cc[0] */
			var p;
			var ret_val;

			ret_val = cc[0];
			if (nord > 1) {
				p = x * cc[nord-1];
				for (j = nord - 2; j > 0; j--)
					p = (p + cc[j]) * x;
				ret_val += p;
			}
			return ret_val;
		}
		x = x.sort(function (a, b) { return a - b; });
		var n = x.length;
		if (n < 3)
			return undefined;
		var nn2 = Math.floor(n / 2);
		var a = new Array(Math.floor(nn2) + 1); /* 1-based */

	/*	ALGORITHM AS R94 APPL. STATIST. (1995) vol.44, no.4, 547-551.

		Calculates the Shapiro-Wilk W test and its significance level
	*/
		var small = 1e-19;

		/* polynomial coefficients */
		var g = [ -2.273, 0.459 ];
		var c1 = [ 0, 0.221157, -0.147981, -2.07119, 4.434685, -2.706056 ];
		var c2 = [ 0, 0.042981, -0.293762, -1.752461, 5.682633, -3.582633 ];
		var c3 = [ 0.544, -0.39978, 0.025054, -6.714e-4 ];
		var c4 = [ 1.3822, -0.77857, 0.062767, -0.0020322 ];
		var c5 = [ -1.5861, -0.31082, -0.083751, 0.0038915 ];
		var c6 = [ -0.4803, -0.082676, 0.0030302 ];

		/* Local variables */
		var i, j, i1;

		var ssassx, summ2, ssumm2, gamma, range;
		var a1, a2, an, m, s, sa, xi, sx, xx, y, w1;
		var fac, asa, an25, ssa, sax, rsn, ssx, xsx;

		var pw = 1;
		an = n;

		if (n == 3)
			a[1] = 0.70710678;/* = sqrt(1/2) */
		else {
			an25 = an + 0.25;
			summ2 = 0.0;
			for (i = 1; i <= nn2; i++) {
				a[i] = normalQuantile((i - 0.375) / an25, 0, 1); // p(X <= x), 
				var r__1 = a[i];
				summ2 += r__1 * r__1;
			}
			summ2 *= 2;
			ssumm2 = Math.sqrt(summ2);
			rsn = 1 / Math.sqrt(an);
			a1 = poly(c1, 6, rsn) - a[1] / ssumm2;

			/* Normalize a[] */
			if (n > 5) {
				i1 = 3;
				a2 = -a[2] / ssumm2 + poly(c2, 6, rsn);
				fac = Math.sqrt((summ2 - 2 * (a[1] * a[1]) - 2 * (a[2] * a[2])) / (1 - 2 * (a1 * a1) - 2 * (a2 * a2)));
				a[2] = a2;
			} else {
				i1 = 2;
				fac = Math.sqrt((summ2 - 2 * (a[1] * a[1])) / ( 1  - 2 * (a1 * a1)));
			}
			a[1] = a1;
			for (i = i1; i <= nn2; i++)
				a[i] /= - fac;
		}

	/*	Check for zero range */

		range = x[n - 1] - x[0];
		if (range < small) {
			console.log('range is too small!')
			return undefined;
		}


	/*	Check for correct sort order on range - scaled X */

		xx = x[0] / range;
		sx = xx;
		sa = -a[1];
		for (i = 1, j = n - 1; i < n; j--) {
			xi = x[i] / range;
			if (xx - xi > small) {
				console.log("xx - xi is too big.", xx - xi);
				return undefined;
			}
			sx += xi;
			i++;
			if (i != j)
				sa += sign(i - j) * a[Math.min(i, j)];
			xx = xi;
		}
		if (n > 5000) {
			console.log("n is too big!")
			return undefined;
		}


	/*	Calculate W statistic as squared correlation
		between data and coefficients */

		sa /= n;
		sx /= n;
		ssa = ssx = sax = 0.;
		for (i = 0, j = n - 1; i < n; i++, j--) {
			if (i != j)
				asa = sign(i - j) * a[1 + Math.min(i, j)] - sa;
			else
				asa = -sa;
			xsx = x[i] / range - sx;
			ssa += asa * asa;
			ssx += xsx * xsx;
			sax += asa * xsx;
		}

	/*	W1 equals (1-W) calculated to avoid excessive rounding error
		for W very near 1 (a potential problem in very large samples) */

		ssassx = Math.sqrt(ssa * ssx);
		w1 = (ssassx - sax) * (ssassx + sax) / (ssa * ssx);
		var w = 1 - w1;

	/*	Calculate significance level for W */

		if (n == 3) {/* exact P value : */
			var pi6 = 1.90985931710274; /* = 6/pi */ 
			var stqr = 1.04719755119660; /* = asin(sqrt(3/4)) */
			pw = pi6 * (Math.asin(Math.sqrt(w)) - stqr);
			if (pw < 0.)
				pw = 0;
			return w;
		}
		y = Math.log(w1);
		xx = Math.log(an);
		if (n <= 11) {
			gamma = poly(g, 2, an);
			if (y >= gamma) {
				pw = 1e-99; /* an "obvious" value, was 'small' which was 1e-19f */
				return w;
			}
			y = -Math.log(gamma - y);
			m = poly(c3, 4, an);
			s = Math.exp(poly(c4, 4, an));
		} else { /* n >= 12 */
			m = poly(c5, 4, xx);
			s = Math.exp(poly(c6, 3, xx));
		}

		return w;
	}

	/* below code is done by Xu Desheng and therefore it is not part of GNU license.*/

	function pvalue(w,n){
		//w, calculated result
		//n, len of data
		//be careful, Javascript Math.log indeed is ln
		function NORMSDIST(x) {
			return Math.pow(Math.E, -1.0 * Math.pow(x,2)/2.0)/Math.sqrt(2.0 * Math.PI);
		}

		function normalcdf(X){   //HASTINGS.  MAX ERROR = .000001
			var T=1/(1+.2316419*Math.abs(X));
			var D=.3989423*Math.exp(-X*X/2);
			var Prob=D*T*(.3193815+T*(-.3565638+T*(1.781478+T*(-1.821256+T*1.330274))));
			if (X>0) {
				Prob=1-Prob
			}
			return Prob
		}

		var mu = 0.0038915 * Math.pow(Math.log(n),3) - 0.083751 * Math.pow(Math.log(n), 2) - 0.31082 * Math.log(n) - 1.5861;
		var sigma = Math.pow(Math.E, 0.0030302 * Math.pow(Math.log(n),2)-0.082676 * Math.log(n) - 0.4803);
		var zig = (Math.log(1-w)-mu)/sigma;
		TW.log.warn("w="+w+" n="+n+" mu="+mu + " sigma="+sigma+" zig="+zig);
		return 1-normalcdf(zig);
	}
};