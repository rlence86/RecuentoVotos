function installationOk(){
	var dbfile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory(), 'recuento_votos.db');
	return dbfile.exists();
}
function getRelacionMesasEscrutadas(db){
	var rows = db.execute("SELECT * FROM Mesa where emitidos > 0");
	var mesas_escrutadas = rows.rowCount();
	var rows = db.execute("SELECT * FROM Mesa");
	var mesas_totales = rows.rowCount();
	return mesas_escrutadas / mesas_totales * 100;
}
function showResults(){
	var db = Ti.Database.openFile(Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory(), 'recuento_votos.db'));
	var resultado_partidos = getListaPartidosConVotos(db);
	var votos_validos = getVotosValidos(db);
	var relacion_escrutadas = getRelacionMesasEscrutadas(db);
	if(relacion_escrutadas == 0){
		$("#recuento").html("<center><h2>Escrutinio no comenzado</h2></center>");
	} else {
		$("#recuento").html("<center><h2>Escrutado al "+relacion_escrutadas.toFixed(2)+"% de las mesas</h2></center>");
	}
	var lista_partidos = createListaPartidos(db);
	var resultados_electorales = calculo_dhont(resultado_partidos, votos_validos, 25, 5, lista_partidos);	
	resultados_electorales = cortarCeros(resultados_electorales);
	printChart(resultados_electorales);
}
function cortarCeros(lista_partidos){
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