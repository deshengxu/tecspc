TW.Runtime.Widgets.histogramchart= function () {
	var canvasID;
	var windowCanvasName;
	var canvasConfig;

	//for demo purpose
	window.chartColors = {
		red: 'rgb(255, 99, 132)',
		orange: 'rgb(255, 159, 64)',
		yellow: 'rgb(255, 205, 86)',
		green: 'rgb(75, 192, 192)',
		blue: 'rgb(54, 162, 235)',
		purple: 'rgb(153, 102, 255)',
		grey: 'rgb(201, 203, 207)'
	};

	var thisWidget = this,
            liveData,
            widgetProperties,
            widgetContainer,
            widgetContainerId,
            chartContainer,
            chartContainerId,
            chart,
            emptyChart,
            purge,
            chartData,
            chartStyles = {},
            returnData = [],
            dataLabels = [],
            dataRows,
            dataRowsNum,
            valueUnderMouse = {},
            clickedRowId,
            selectedRowIndices,
            chartTitleTextSizeClass,
            chartTitleStyle,
            stackable = true,
            isResponsive = false,
            isInHiddenTab = false,
            isInHiddenBrowserTab,
            barLabels,
			resizeHandler;
		thisWidget.processing = false;
        thisWidget.UseRawData = thisWidget.getProperty('UseRawData');
        thisWidget.title = thisWidget.getProperty('ChartTitle');
        thisWidget.titleAlignment = thisWidget.getProperty("ChartTitleAlignment");
        thisWidget.xAxisLabel = thisWidget.getProperty('X-AxisLabel');
        thisWidget.yAxisLabel = thisWidget.getProperty('Y-AxisLabel');
        thisWidget.xAxisField = thisWidget.getProperty('X-AxisField');
        thisWidget.showAxisLabels = thisWidget.getProperty('ShowAxisLabels');
        thisWidget.showXAxisLabels = Boolean(thisWidget.getProperty('ShowX-AxisLabels'));
        thisWidget.showYAxisLabels = Boolean(thisWidget.getProperty('ShowY-AxisLabels'));
        // don't set these to object props they are dynamic!
        thisWidget.showLegend = thisWidget.getProperty('ShowLegend');
        thisWidget.labelAngle = thisWidget.getProperty('LabelAngle')*-1;
        thisWidget.xAxisIntervals = thisWidget.getProperty('X-AxisIntervals');
        thisWidget.xAxisMinMaxVisible = Boolean(thisWidget.getProperty('ShowX-AxisMinMax'));
        thisWidget.yAxisMinimum = thisWidget.getProperty('Y-AxisMinimum')*1;
        thisWidget.yAxisMaximum = thisWidget.getProperty('Y-AxisMaximum')*1;
        thisWidget.autoScale = Boolean(thisWidget.getProperty('AutoScale'));
        thisWidget.enableHover = Boolean(thisWidget.getProperty('EnableHover'));
        thisWidget.showValues = Boolean(thisWidget.getProperty('ShowValues'));
        thisWidget.yAxisIntervals = thisWidget.getProperty('Y-AxisIntervals');
        thisWidget.precision = Math.max(thisWidget.getProperty('ShowValuesFormat'),0);
		thisWidget.yAxisMinMaxVisible = thisWidget.getProperty('ShowY-AxisMinMax');
		thisWidget.xAxisMinimum = thisWidget.getProperty('X-AxisMinimum')*1;
        thisWidget.xAxisMaximum = thisWidget.getProperty('X-AxisMaximum')*1;
        thisWidget.margins = thisWidget.getProperty('Margins');
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

		chartTitleStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ChartTitleStyle', 'DefaultChartStyle'));

		chartTitleTextSizeClass = 'textsize-normal';
		if (this.getProperty('ChartTitleStyle') !== undefined) {
			chartTitleTextSizeClass = TW.getTextSizeClassName(chartTitleStyle.textSize);
		}

		thisWidget.id = +thisWidget.getProperty('Id');
		canvasID = thisWidget.jqElementId + "-canvas";
		windowCanvasName = thisWidget.jqElementId +"_canvas_var";
		var html =
			'<div class="widget-histogramchart histogramchart-content" id="' + thisWidget.jqElementId + '" >' +
			'<div class="chart-title ' + chartTitleTextSizeClass + '" id="' + thisWidget.jqElementId + '-title" style=" text-align:' + (thisWidget.titleAlignment || 'center') + ';">' +
				'<span class="widget-chart-title-text" style="Margin: 0 1em 0 1em;">'+ Encoder.htmlEncode(thisWidget.title) + '</span>' +
			'</div>' +
			'<div>' +
				'<canvas id="' + canvasID +'"></canvas>' +
			'</div>' +
			'</div>';

		// if running as extension, call renderStyles
		//thisWidget.renderStyles();

		return html;
	};

	this.buildDefaultConfig = function(){
		//build up default value of config.
		var scatterChartData = {
            datasets: [{
                label: "Distribution",
                borderColor: window.chartColors.red,
                backgroundColor: color(window.chartColors.red).alpha(0.2).rgbString(),
                data: [{
                    x: 1.0,
                    y: 0.0,
                }, {
                    x: 1.5,
                    y: 0.3,
                }, {
                    x: 2.0,
                    y: 1.3,
                }, {
                    x: 3.3,
                    y: 4.0,
                }, {
                    x: 5.0,
                    y: 8.0,
                }, {
                    x: 6.5,
                    y: 4.1,
                }, {
                    x: 7.0,
                    y: 2.9,
                }, {
                    x: 8.0,
                    y: 0.5,
                }],
                fill: false,
                hitRadius: 0,
                radius: 0
            }, {
                label: "Histogram",
                borderColor: window.chartColors.blue,
                backgroundColor: color(window.chartColors.blue).alpha(0.6).rgbString(),
                data: [{
                    x: 1.5,
                    y: 0.0,
                }, {
                    x: 2.5,
                    y: 0.0,
                }, {
                    x: 2.5,
                    y: 5.0,
                }, {
                    x: 3.5,
                    y: 5.0,
                }, {
                    x: 3.5,
                    y: 2.2,
                }, {
                    x: 4.5,
                    y: 2.2,
                }, {
                    x: 4.5,
                    y: 0.0,
                }, {
                    x: 4.5,
                    y: 3.0,
                }, {
                    x: 5.5,
                    y: 3.0,
                }, {
                    x: 5.5,
                    y: 0.0,
                }, {
                    x: 5.5,
                    y: 3.9,
                }, {
                    x: 6.5,
                    y: 3.9,
                }, {
                    x: 6.5,
                    y: 0.0,
                }, {
                    x: 6.5,
                    y: 2.2,
                }, {
                    x: 7.5,
                    y: 2.2,
                }, {
                    x: 7.5,
                    y: 0.0,
                }],
                fill: true,
                lineTension: 0,
                pointRadius: 0
            },
            {
                label: "Mean",
                borderColor: window.chartColors.yellow,
                backgroundColor: color(window.chartColors.red).alpha(0.2).rgbString(),
                data: [{
                    x: 5.0,
                    y: 0.0,
                }, {
                    x: 5.0,
                    y: 9.0,
                }],
                fill: false,
                radius: 0,
                lineTension: 0
            },
            {
                label: "Nominal",
                borderColor: window.chartColors.green,
                backgroundColor: color(window.chartColors.red).alpha(0.2).rgbString(),
                data: [{
                    x: 4.4,
                    y: 0.0,
                }, {
                    x: 4.4,
                    y: 9.0,
                }],
                fill: false,
                radius: 0,
                lineTension: 0
            },
            {
                label: "USL",
                borderColor: window.chartColors.red,
                backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
                data: [{
                    x: 7.8,
                    y: 0.0,
                }, {
                    x: 7.8,
                    y: 9.0,
                }],
                fill: false,
                radius: 0,
                lineTension: 0
            },
            {
                label: "LSL",
                borderColor: window.chartColors.red,
                backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
                data: [{
                    x: 0.4,
                    y: 0.0,
                }, {
                    x: 0.4,
                    y: 9.0,
                }],
                fill: false,
                radius: 0,
                lineTension: 0
            }
        ]
		};
	
		var config = {
			data: scatterChartData,
			options: {
                title:{
                    text: "Histogram Chart"
                },
				scales: {
					xAxes: [{
						ticks: {
							max: 10.0,
							min: 0.0,
							stepSize: 2.0
						}
					}]
				},
			}
		};

		canvasConfig = config;
	};

	this.renderStyles = function () {

            var formatResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ChartBodyStyle', 'DefaultChartBodyStyle'));
            chartTitleStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ChartTitleStyle', 'DefaultChartTitleStyle'));
            var chartAxisStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ChartAxisStyle', 'DefaultChartAxisStyle'));
            var chartTitleStyleBG = TW.getStyleCssGradientFromStyle(chartTitleStyle);
            var chartTitleStyleText = TW.getStyleCssTextualNoBackgroundFromStyle(chartTitleStyle);
            var chartBackground = TW.getStyleCssGradientFromStyle(formatResult);
            var chartBorder = TW.getStyleCssBorderFromStyle(formatResult);
            var chartAxisStyleText = TW.getStyleCssTextualNoBackgroundFromStyle(chartAxisStyle);
            
            var styleBlock = '';

            var chartCssInfo = TW.getStyleCssTextualNoBackgroundFromStyle(formatResult);
            var chartLineInfo = TW.getStyleCssBorderFromStyle(chartAxisStyle);
            //var chartFocusBorder = TW.getStyleCssBorderFromStyle(chartFocusStyle);

            // for d3 style assignments
            // chartStyles.text = chartCssInfo.split(';')[0].split(':')[1];
            // chartStyles.gridStyle = chartLineInfo.split(';')[1].split(':')[1];
            // chartStyles.axisFontWeight = chartAxisStyleText.split(';')[0].split(':')[1];

            //regular widget styles
            if (thisWidget.getProperty('ChartBodyStyle', 'DefaultChartBodyStyle') === 'DefaultChartBodyStyle'
                && thisWidget.getProperty('ChartTitleStyle', 'DefaultChartTitleStyle') === 'DefaultChartTitleStyle'
                && thisWidget.getProperty('FocusStyle', 'DefaultButtonFocusStyle') === 'DefaultButtonFocusStyle') {
                if (!addedDefaultChartStyles) {
                    addedDefaultChartStyles = true;
                    // add chart title default style
                    var defaultStyles = '.chart-title {' + chartTitleStyleBG + ' ' + chartTitleStyleText + ' }' +
                    //  ' .widget-barChart.focus {' + chartFocusBorder + '}' +
                        ' .widget-barChart {' + chartBackground + '}';
                    $.rule(defaultStyles).appendTo(TW.Runtime.globalWidgetStyleEl);
                }
            } else {
                // add custom chart title style
                styleBlock += '#' + thisWidget.jqElementId + ' .chart-title { ' + chartTitleStyleBG + ' ' + chartTitleStyleText + ' } ' +
                    '#' + thisWidget.jqElementId + '.widget-chart-title-text { ' + chartTitleStyle + ' }' +
                    //    '#' + thisWidget.jqElementId + '.focus .widget-timeSeriesChartV2 {' + chartFocusBorder + '}' +
                    '#' + thisWidget.jqElementId + '.widget-timeSeriesChartV2 {' + chartBackground + chartBorder + '}';
            }

            return styleBlock;

    };

	this.afterRender = function () {
		// NOTE: this.jqElement is the jquery reference to your html dom element
		// 		 that was returned in renderHtml()

		// get a reference to the value element
		//valueElem = this.jqElement.find('.histogramchart-property');
		// update that DOM element based on the property value that the user set
		// in the mashup builder
		//valueElem.text(this.getProperty('histogramchart Property'));
		TW.log.warn("after Render.");
		var ctx = document.getElementById(canvasID).getContext("2d");
        window[windowCanvasName] = new Chart(ctx, canvasConfig);
		TW.log.warn("Windows Canvas Var:"+windowCanvasName+"--canvasID:"+canvasID);
		TW.log.warn("CanvasConfig:"+JSON.stringify(canvasConfig));
	};

	// this is called on your widget anytime bound data changes
	this.updateProperty = function (updatePropertyInfo) {
		// TargetProperty tells you which of your bound properties changed
		if (updatePropertyInfo.TargetProperty === 'Data') {
			TW.log.warn("Data is updated.");
		}
	};
};