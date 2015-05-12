function calculo_dhont(resultados, votos_validos, diputados, umbral, lista_partidos){
	var resultados_diputados = [];
	var minimo_votos = votos_validos * (umbral / 100);
	$.each(resultados,function(){
		if($(this)[0].votos < minimo_votos){
			$(this)[0].en_reparto = false;
		} else {
			$(this)[0].en_reparto = true;
		}
	});
	var cocientes = [];
	$.each(resultados,function(){
		if($(this)[0].en_reparto) {
			cocientes = getCocientes($(this)[0], diputados, cocientes);
		}
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
	resultados_diputados = getListaResultados(cocientes, lista_partidos, umbral, votos_validos);
	return resultados_diputados;
}
function getCocientes(resultados, diputados, cocientes){
	for(i = 1; i <= diputados; i++){
		cocientes.push({"cociente" : resultados.votos/i, "votos": resultados.votos, "partido": resultados.partido});
	}
	return cocientes;
}
function getListaResultados(cocientes, lista_partidos, umbral, votos_validos){
	var precio_escano = cocientes[cocientes.length -1].cociente;
	var partido_cero = cocientes[cocientes.length -1].partido;
	$.each(cocientes,function(){
		var partido = $(this)[0].partido;
		var votos = $(this)[0].votos;
		$.each(lista_partidos, function(){			
			$(this)[0].votos = getVotosPartido($(this)[0].id);
			if($(this)[0].id == partido){
				$(this)[0].y += 1;
			}
			if($(this)[0].id == partido_cero){
				$(this)[0].faltan = 0;
			} else if($(this)[0].votos < (votos_validos * umbral / 100)) {
				$(this)[0].faltan = Math.ceil((votos_validos * umbral / 100) - $(this)[0].votos);
				$(this)[0].y = 0;
			} else {
				$(this)[0].faltan = Math.ceil((($(this)[0].y+1) * precio_escano) - $(this)[0].votos);
			}
			$(this)[0].porcentaje = $(this)[0].votos / votos_validos * 100;
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
	return lista_partidos;
}
function getListaPartidosConVotos(db){
	var rows = db.execute("SELECT idPartido, sum(numero_votos) as votos FROM Resultado GROUP BY idPartido");
	var resultado_partidos = [];
	while (rows.isValidRow()) {
		resultado_partidos.push({"partido": rows.fieldByName('idPartido'), "votos": parseInt(rows.fieldByName('votos'))});
		rows.next();
	}
	return resultado_partidos;
}
function getVotosValidos(db){
	var rows = db.execute("SELECT idPartido, sum(numero_votos) as votos FROM Resultado GROUP BY idPartido");
	var votos_validos = 0;
	while (rows.isValidRow()) {
		votos_validos += parseInt(rows.fieldByName('votos'));
		rows.next();
	}
	var rows = db.execute("SELECT sum(blancos) as votos_blancos FROM Mesa");
	while (rows.isValidRow()) {
		votos_validos += parseInt(rows.fieldByName('votos_blancos'));
		rows.next();
	}
	return votos_validos;
}
function createListaPartidos(db){
	var lista_partidos = [];
	var rows = db.execute("SELECT * from Partido");
	while (rows.isValidRow()) {
		lista_partidos.push({"id": rows.fieldByName('id'), "name": rows.fieldByName('siglas'), "color": rows.fieldByName('color'), "y": 0, "votos": 0});
		rows.next();
	}
	return lista_partidos;
}
function getVotosPartido(partidoid){
	var db = Ti.Database.openFile(Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory(), 'recuento_votos.db'));
	var rows = db.execute("SELECT sum(numero_votos) as votos FROM Resultado WHERE idPartido = "+partidoid+" GROUP BY idPartido");
	while (rows.isValidRow()) {
		return parseInt(rows.fieldByName('votos'));
	}
}