TW.Runtime.Widgets.histogramchart= function () {
	var canvasID;
	var windowCanvasName;	//
	var canvasConfig;	//all chart data will go to here.
	var chartObject;	//2d context in canvas for drawing.
	var rawvalue_fieldname;	//field mapping to raw value from input data.
	var dataArray;	//binding data in raw format
	var nominal;	//binding nominal data or assigned nominal value
	var utl; 	//binding utl data or assigned utl value
	var ltl;	//binding ltl data or assigned ltl value
	var updatedMean=Number.NaN;
	var updatedStd = Number.NaN;
	var updatedCp = Number.NaN;
	var updatedCpk = Number.NaN;
	var updatedTotalCount = Number.NaN;

	var resetUpdatedFigures=function(){
		updatedMean=Number.NaN;
		updatedStd = Number.NaN;
		updatedCp = Number.NaN;
		updatedCpk = Number.NaN;
		updatedTotalCount = Number.NaN;
	};

	var isFiguresUpdated=function(){
		return !(isNaN(updatedTotalCount) || 
			isNaN(updatedMean) || isNaN(updatedStd) || isNaN(updatedCp) || isNaN(updatedCpk));
	}

	var setUpdatedFigures=function(thisTotalCount,thisMean, thisStd, thisCp, thisCpk){
		updatedTotalCount = thisTotalCount;
		updatedMean=thisMean;
		updatedStd = thisStd;
		updatedCp = thisCp;
		updatedCpk = thisCpk;
	}
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

		chartTitleTextSizeClass = 'textsize-normal';
		
		thisWidget.id = +thisWidget.getProperty('Id');
		canvasID = thisWidget.jqElementId + "-canvas";
		windowCanvasName = thisWidget.jqElementId +"_canvas_var";
		var html =
			'<div class="widget-histogramchart histogramchart-content" id="' + thisWidget.jqElementId + '" >' +
			'<div class="chart-title ' + chartTitleTextSizeClass + '" id="' + thisWidget.jqElementId + '-title" style=" text-align:' + (thisWidget.titleAlignment || 'center') + ';">' +
				
				'<table class="figuretable" id="'+thisWidget.jqElementId+'-figuretable">' +
					'<tr class="headerrow">' +
					'<td colspan=10>'+
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
					'<td class="figure-value"><span>    </span></td>'+
					'</tr>' +
				'</table>' +
					
			'</div>' +
			'<div>' +
				'<canvas id="' + canvasID +'"></canvas>' +
			'</div>' +
			'</div>';

		// if running as extension, call renderStyles
		//thisWidget.renderStyles();
		rawvalue_fieldname = this.getProperty('Raw_Value');
		nominal = this.getProperty("Nominal");	//in case it is assigned
		utl = this.getProperty("UTL");	//in case it is assigned.
		ltl = this.getProperty("LTL");	//in case it is assigned.

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

	this.initVerticalLine = function(label, lineColor){
		var color = Chart.helpers.color;
		var vlDataset = {};
		vlDataset['type'] = 'line';
		vlDataset['label'] = label;
		vlDataset['borderColor']= lineColor;
		vlDataset['backgroundColor'] = color(lineColor).alpha(0.6).rgbString();
		vlDataset['data'] = [];
		vlDataset['fill'] = false;
		vlDataset['lineTension'] = 0.0;
		vlDataset['radius'] = 0.0;

		return vlDataset;
	}
	this.buildDefaultConfig = function(){
		var color = Chart.helpers.color;
		//build up default value of config.
		var normDataset = thisWidget.initNorm();
		normDataset['data']= [];
		var histogramDataset = thisWidget.initHistogram();
		histogramDataset['data'] = [];
		var meanDataset = thisWidget.initVerticalLine('Mean',chartColors.yellow);
		meanDataset['data'] = [];
		var nominalDataset = thisWidget.initVerticalLine('Nominal', chartColors.green);
		nominalDataset['data'] = [];
		var uslDataset = thisWidget.initVerticalLine('USL', chartColors.orange);
		uslDataset['data'] = [];
		
		var lslDataset = thisWidget.initVerticalLine('LSL', chartColors.purple);
		lslDataset['data'] = [];
				
		var scatterChartData = {
			datasets: [normDataset,
				histogramDataset,
				meanDataset,
				nominalDataset,
				uslDataset,
				lslDataset
        	]
		};
		
		canvasConfig = {};
		canvasConfig['type']= 'line';
		canvasConfig['data'] = scatterChartData;
		
		var options = {};
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
							minRotation: 45
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

		canvasConfig['options'] = options;
		resetUpdatedFigures();
		TW.log.debug("canvasConfig is:"+(canvasConfig));
	};

	exportCanvasConfig=function(){
		for(var index=0;index<canvasConfig['data']['datasets'].length;index++){
			TW.log.debug("index:"+index+" label:"+canvasConfig['data']['datasets'][index]['label']);
			TW.log.debug("Data:"+JSON.stringify(canvasConfig['data']['datasets'][index]['data']));
		}
		TW.log.debug("Options:"+JSON.stringify(canvasConfig['options']));
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

		thisWidget.drawChart();
		TW.log.debug("Windows Canvas Var:"+windowCanvasName+"--canvasID:"+canvasID);
		//TW.log.debug("CanvasConfig:"+JSON.stringify(canvasConfig));
	};

	this.drawChart=function(){
		var ctx = document.getElementById(canvasID).getContext("2d");
		TW.log.debug("context object in drawChart:"+ctx);

		//this should be optimized in order to save memory.
		if(chartObject===undefined || chartObject === null){
			chartObject = new Chart(ctx, canvasConfig);
			TW.log.debug("Chart Object created in drawChart:"+ chartObject);
		}else{
			chartObject.update();
			TW.log.debug("Chart Object updated in drawChart:"+ chartObject);
		}
		
		
	}
	// this is called on your widget anytime bound data changes
	this.updateProperty = function (updatePropertyInfo) {
		// TargetProperty tells you which of your bound properties changed
		if (updatePropertyInfo.TargetProperty === 'Data') {
			var dataRows = updatePropertyInfo.ActualDataRows;
			dataArray = [];
			for(var index=0;index<dataRows.length;index++){
				dataArray.push(dataRows[index][rawvalue_fieldname]);
			}
			TW.log.debug("Data is updated:" + dataArray.length);
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
			}else{
				calculationResult = thisWidget.calculateHistogram();
			}
			setUpdatedFigures(calculationResult['count'],
				calculationResult['mean'],
				calculationResult['std'],
				calculationResult['cp'],
				calculationResult['cp']);

			//exportCanvasConfig();
			if(isError){
				thisWidget.cleanDefaultConfig(calculationResult);
			}else{
				thisWidget.setupChart(calculationResult);
			}
			thisWidget.updateSourcingBindingProperties(calculationResult);
			//thisWidget.drawChart();
			//exportCanvasConfig();
			chartObject.update();

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

		thisWidget.updateDefaultConfig(
			normData,
			histogramData,
			meanData,
			nominalData,
			uslData,
			lslData,
			calculationResult
		);
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
			calculationResult
	){
		for(var index=0;index<canvasConfig['data']['datasets'].length;index++){
			var label = canvasConfig['data']['datasets'][index]['label'];
			TW.log.debug("processing label:"+label);
			if(label=="Norm"){
				canvasConfig['data']['datasets'][index]['data'] = normData;
			}

			if(label=="Histogram"){
				canvasConfig['data']['datasets'][index]['data'] = histogramData;
			}
			
			if(label=="Mean"){
				canvasConfig['data']['datasets'][index]['data'] = meanData;
			}
			if(label=="Nominal"){
				canvasConfig['data']['datasets'][index]['data'] = nominalData;
			}
			if(label=="USL"){
				canvasConfig['data']['datasets'][index]['data'] = uslData;
			}
			if(label=="LSL"){
				canvasConfig['data']['datasets'][index]['data'] = lslData;
			}
			
		}
		canvasConfig['options']['scales']['xAxes'][0]['ticks']['min']=calculationResult['edgemin'];
		canvasConfig['options']['scales']['xAxes'][0]['ticks']['max']=calculationResult['edgemax'];
		canvasConfig['options']['scales']['yAxes'][0]['ticks']['max']=roundupPercentage(
			calculationResult['bartop'] * 1.10);
		
	}

	roundupPercentage=function(topValue){
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
		TW.log.debug("bars:"+bars+" hit:"+hit);

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
		TW.log.debug("final result from bins calculation:"+JSON.stringify(result));
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
		TW.log.debug("drawUpdatedFirgures Ends");
	}
};