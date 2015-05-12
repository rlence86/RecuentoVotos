	$(document).ready(function(){
		$("header").load("header.html");
		var db = getDatabase();
		var chartdata = getChartData(db);
		printBarChart(chartdata);
	});
	function getUrlParameter(sParam){
	    var sPageURL = window.location.search.substring(1);
	    var sURLVariables = sPageURL.split('&');
	    for (var i = 0; i < sURLVariables.length; i++) 
	    {
	        var sParameterName = sURLVariables[i].split('=');
	        if (sParameterName[0] == sParam) 
	        {
	            return sParameterName[1];
	        }
	    }
	    return false;
	}
	function getDatabase(){
		return Ti.Database.openFile(Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory(), 'recuento_votos.db'));
	}
	function getChartData(db){
		var distrito = getUrlParameter('distrito');
		var textodistrito = distrito;
		if(!textodistrito){
			textodistrito = "TODOS";
		}
		var seccion = getUrlParameter('seccion');
		var textoseccion = seccion;
		if(!textoseccion){
			textoseccion = "TODAS";
		}
		var mesa = getUrlParameter('mesa');
		var textomesa = mesa;
		if(!textomesa){
			textomesa = "TODAS";
		}
		var texto = "Distrito: "+textodistrito+" seccion: "+textoseccion+" mesa: "+textomesa;
		$("#titulo").html("<p>"+texto+"</p>");
		var chartData = calcData(db, distrito, seccion, mesa);
		return chartData;
	}
	function calcData(db, distrito, seccion, mesa){
		var lista_partidos = [];
		var rows = db.execute("SELECT * from Partido");
		while (rows.isValidRow()) {
			lista_partidos.push({"id": rows.fieldByName('id'), "name": rows.fieldByName('siglas'), "color": rows.fieldByName('color'), "y": 0});
			rows.next();
		}
		var query = "SELECT idPartido, sum(numero_votos) as votos FROM Resultado";
		query = completeQuery(query, distrito, seccion, mesa);		
		query +=  " GROUP BY idPartido";
		var rows = db.execute(query);
		while (rows.isValidRow()) {
			$.each(lista_partidos, function(){
				if($(this)[0].id == rows.fieldByName('idPartido')){
					$(this)[0].y = parseInt(rows.fieldByName('votos'));
				}
			});
			rows.next();
		}
		var query_blancos = "SELECT sum(blancos) as votos_blancos, sum(nulos) as votos_nulos, sum(emitidos) as votos_emitidos, sum(censo) as suma_censo FROM Mesa";
		query_blancos = completeQuery(query_blancos, distrito, seccion, mesa);
		var rows = db.execute(query_blancos);
		var abstencion = parseInt(rows.fieldByName('suma_censo')) - parseInt(rows.fieldByName('votos_emitidos'));
		while (rows.isValidRow()) {
			lista_partidos.push({"id": 0, "name": "Blancos", "color": "#FFFFFF", "y": parseInt(rows.fieldByName('votos_blancos'))});
			lista_partidos.push({"id": 0, "name": "Nulos", "color": "#CCCCCC", "y": parseInt(rows.fieldByName('votos_nulos'))});
			lista_partidos.push({"id": 0, "name": "Abstención", "color": "#e75f5d", "y": abstencion});
			rows.next();
		}
		return lista_partidos;
	}
	function completeQuery(query, distrito, seccion, mesa){
		var wherePuesto = false;
		if(distrito){
			query += " WHERE idDistrito = '"+distrito+"'";
			wherePuesto = true;
		}
		if(seccion){
			if(!wherePuesto) {
				query += " WHERE idSeccion = '"+seccion+"'";
				wherePuesto = true;
			} else {
				query += " AND idSeccion = '"+seccion+"'";
			}
		}
		if(mesa){
			if(!wherePuesto){
				query += " WHERE idMesa = '"+mesa+"'";
				wherePuesto = true;
			} else {
				query += " AND idMesa = '"+mesa+"'";
			}			
		}
		return query;
	}