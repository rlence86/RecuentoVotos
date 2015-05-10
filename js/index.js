function installationOk(){
	var dbfile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory(), 'recuento_votos.db');
	return dbfile.exists();
}
function showResults(){
	var db = Ti.Database.openFile(Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory(), 'recuento_votos.db'));
	var rows = db.execute("SELECT idPartido, sum(numero_votos) as votos FROM Resultado GROUP BY idPartido");
	var votos_validos = 0;
	var resultado_partidos = [];
	while (rows.isValidRow()) {
		votos_validos += parseInt(rows.fieldByName('votos'));
		resultado_partidos.push({"partido": rows.fieldByName('idPartido'), "votos": parseInt(rows.fieldByName('votos'))});
		rows.next();
	}
	var rows = db.execute("SELECT sum(blancos) as votos_blancos FROM Mesa");
	while (rows.isValidRow()) {
		votos_validos += parseInt(rows.fieldByName('votos_blancos'));
		rows.next();
	}
	var rows = db.execute("SELECT * FROM Mesa where emitidos > 0");
	var mesas_escrutadas = rows.rowCount();
	var rows = db.execute("SELECT * FROM Mesa");
	var mesas_totales = rows.rowCount();
	var relacion_escrutadas = mesas_escrutadas / mesas_totales * 100;
	if(mesas_escrutadas == 0){
		$("#recuento").html("<center><h2>Escrutinio no comenzado</h2></center>");
	} else {
		$("#recuento").html("<center><h2>Escrutado al "+relacion_escrutadas.toFixed(2)+"% de las mesas</h2></center>");
	}

	var lista_partidos = [];
	var rows = db.execute("SELECT * from Partido");
	while (rows.isValidRow()) {
		lista_partidos.push({"id": rows.fieldByName('id'), "name": rows.fieldByName('siglas'), "color": rows.fieldByName('color'), "y": 0, "votos": 0});
		rows.next();
	}
	var resultados_electorales = calculo_dhont(resultado_partidos, votos_validos, 25, 5, lista_partidos);
	printChart(resultados_electorales);
}
function calculo_dhont(resultados, votos_validos, diputados, umbral, lista_partidos){
	var resultados_diputados = [];
	var minimo_votos = votos_validos * (umbral / 100);
	$.each(resultados,function(){
		if($(this)[0].votos < minimo_votos){
			$(this)[0].votos = 0;
		}
	});
	resultados.sort(function(a,b) { return parseFloat(b.votos) - parseFloat(a.votos) } );
	var indice_corte = 0
	$.each(resultados, function(){
		if($(this)[0].votos == 0){
			resultados = resultados.slice(0, indice_corte);
			return false;
		}
		indice_corte++;
	});
	var cocientes = [];
	$.each(resultados,function(){
		cocientes = getCocientes($(this)[0], diputados, cocientes);
	});
	cocientes.sort(function(a, b) {
	  if(a.cociente > b.cociente){
	  	return -1;
	  } else if (a.cociente < b.cociente){
	  	return 1;
	  } else if (a.cociente == b.cociente){
	  	if(a.votos > b.votos){
	  		return -1;
	  	} else if(a.votos < b.votos){
	  		return 1;
	  	} else {
	  		return -1;
	  	}
	  }
	});
	cocientes = cocientes.slice(0, diputados);
	resultados_diputados = getListaResultados(cocientes, lista_partidos);
	return resultados_diputados;
}
function getCocientes(resultados, diputados, cocientes){
	for(i = 1; i <= diputados; i++){
		cocientes.push({"cociente" : resultados.votos/i, "votos": resultados.votos, "partido": resultados.partido});
	}
	return cocientes;
}
function getListaResultados(cocientes, lista_partidos){
	$.each(cocientes,function(){
		var partido = $(this)[0].partido;
		var votos = $(this)[0].votos;
		$.each(lista_partidos, function(){
			if($(this)[0].id == partido){
				$(this)[0].y += 1;
				$(this)[0].votos = parseInt(votos);
			}
		});
	});
	lista_partidos.sort(function(a,b){
		if(a.y > b.y){
			return -1;
		} else if(a.y < b.y){
			return 1;
		} else if(a.votos > b.votos){
			return -1;
		} else {
			return 1;
		}
	});
	var indice_corte = 0;
	$.each(lista_partidos, function(){
		if($(this)[0].y == 0){
			lista_partidos = lista_partidos.slice(0, indice_corte);
			return false;
		}
		indice_corte++;
	});
	return lista_partidos;
}
$(document).ready(function(){
	$("header").load("header.html");
	if(installationOk()){
		$("#boton_setup").hide(false);
		showResults();
	} else {
		$("#grafica_superior").hide(false);
		$("#boton_add_resultado").hide(false);
		$("#boton_informes").hide(false);
	}
});