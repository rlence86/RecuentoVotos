function printChart(values){
    $('#grafica_superior').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false
        },
        title: {
            text: 'Reparto<br>de escaños',
            align: 'center',
            verticalAlign: 'middle',
            y: 50,
            x: -100
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: true,
                    distance: -50,
                    style: {
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0px 1px 2px black'
                    }
                },
                startAngle: -90,
                endAngle: 90,
                showInLegend: true,
                center: ['50%', '75%'],
            },
            series: {
                states: {
                    hover: {
                        enabled: false
                    }
                }
            }
        },
        tooltip: {
                formatter: function() {
                    return false;
                }
        },
        legend: {
            enabled: true,
            layout: 'vertical',
            align: 'right',
            width: 200,
            verticalAlign: 'middle',
            useHTML: true,
            labelFormatter: function() {
                return '<div class="row" style="width: 200px"><span class="col-xs-6">' + this.name + '</span><span class="col-xs-6">' + this.y + '</span></div>';
            }
        },
        series: [{
            type: 'pie',
            name: 'Escaños',
            innerSize: '50%',
            data: [
                {name: 'PP',
                y: 10,
                color: '#CCCCCC' },
                {name: 'PSOE',
                y: 3,
                color: '#FFFFFF'},
                {name: 'PPL',
                y: 6,
                color: '#B54FCC' }

            ]
        }]
    });
}