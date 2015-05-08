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
}
function getDatabase(){
	return Ti.Database.openFile(Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory(), 'recuento_votos.db'));
}
function getMesaData(db, distrito, seccion, mesa){
	var rows = db.execute("SELECT * FROM Mesa WHERE idDistrito = '"+distrito+"' and idSeccion = '"+seccion+"' and idMesa = '"+mesa+"'");
	var datosMesa;
	while (rows.isValidRow()) {
		if(rows.fieldByName('emitidos') == 0){
			return null;
		} else {
			datosMesa = {
				"blancos" : rows.fieldByName('blancos'),
				"nulos"	  : rows.fieldByName('nulos'),
				"emitidos": rows.fieldByName('emitidos'),
			};
			var votosPartidos = db.execute("SELECT * FROM Resultado WHERE idDistrito = '"+distrito+"' and idSeccion = '"+seccion+"' and idMesa = '"+mesa+"'");
			while (votosPartidos.isValidRow()){
				datosMesa["p"+votosPartidos.fieldByName('idPartido')] = votosPartidos.fieldByName('numero_votos');
				votosPartidos.next();
			}
			return datosMesa;
		}
		rows.next();
	}
}
function loadFormulario(db, data){		
	var rows = db.execute("SELECT * FROM Partido");
	while (rows.isValidRow()) {
		var valuePartido;
		if(data != null){
			valuePartido = data["p"+rows.fieldByName('id')];
		} else {
			valuePartido = 0;
		}
		$("#formulario").append('<div class="row"><div class="col-xs-6"><label for="'+rows.fieldByName('id')+'">'+rows.fieldByName('siglas')+'</label></div><div class="col-xs-6"><input type="number" min="0" value="'+valuePartido+'" name="'+rows.fieldByName('id')+'"/><div></div>');
	    rows.next();    
	}
	var valueBlancos;
	var valueNulos;
	var valueEmitidos;
	if(data != null){
		valueBlancos = data["blancos"];
		valueNulos = data["nulos"];
		valueEmitidos = data["emitidos"];
	} else {
		valueBlancos = 0;
		valueNulos = 0;
		valueEmitidos = 0;
	}
	$("#formulario").append('<div class="row"><div class="col-xs-6"><label for="blancos">Blancos</label></div><div class="col-xs-6"><input type="number" min="0" value="'+valueBlancos+'" name="blancos"/><div></div>');
	$("#formulario").append('<div class="row"><div class="col-xs-6"><label for="nulos">Nulos</label></div><div class="col-xs-6"><input type="number" min="0" value="'+valueNulos+'" name="nulos"/><div></div>');
	$("#formulario").append('<div class="row"><div class="col-xs-6"><label for="emitidos">Emitidos</label></div><div class="col-xs-6"><input type="number" min="0" value="'+valueEmitidos+'" name="emitidos"/><div></div>');
	$("#formulario").append('<br><center><input type="submit" value="Guardar"/></center>');
}
function enviarFormulario(){
	var distrito = getUrlParameter('distrito');
	var seccion = getUrlParameter('seccion');
	var mesa = getUrlParameter('mesa');
	var emitidos = $( "input[name='emitidos']" ).val();
	if(emitidos == 0){
		alert("Para guardar la mesa los votos emitidos tienen que ser mayores que 0");
		return false;
	}
	var suma = 0;
	$(':input[type="number"]').each(function(){
		if($(this).attr('name') != 'emitidos'){
			suma += parseInt($(this).val());
		}
	});
	if(suma != emitidos){
		alert("La suma de los votos no cuadra");
		return false;
	} else {
		saveData($(':input[type="number"]'), distrito, seccion, mesa);
		return false;
	}
	return false;
}
function saveEmitidos(votos, distrito, seccion, mesa, db) {
	db.execute("UPDATE Mesa SET emitidos = '"+votos+"' WHERE idDistrito='"+distrito+"' AND idSeccion='"+seccion+"' AND idMesa = '"+mesa+"'");
}
function saveBlancos(votos, distrito, seccion, mesa, db) {
	db.execute("UPDATE Mesa SET blancos = '"+votos+"' WHERE idDistrito='"+distrito+"' AND idSeccion='"+seccion+"' AND idMesa = '"+mesa+"'");
}
function saveNulos(votos, distrito, seccion, mesa, db) {
	db.execute("UPDATE Mesa SET nulos = '"+votos+"' WHERE idDistrito='"+distrito+"' AND idSeccion='"+seccion+"' AND idMesa = '"+mesa+"'");
}
function saveVotosPartido(partido, votos, distrito, seccion, mesa, db) {
	db.execute("INSERT INTO Resultado VALUES('"+distrito+"', '"+seccion+"', '"+mesa+"', '"+partido+"', '"+votos+"')");
}
function removePreData(distrito, seccion, mesa, db){
	db.execute("DELETE FROM Resultado WHERE idDistrito='"+distrito+"' AND idSeccion='"+seccion+"' AND idMesa = '"+mesa+"'");
}
function saveData(input, distrito, seccion, mesa){
	var db = getDatabase();
	removePreData(distrito, seccion, mesa, db);
	input.each(function(){
		if($(this).attr('name') == 'emitidos'){
			saveEmitidos($(this).val(), distrito, seccion, mesa, db);
		} else if($(this).attr('name') == 'blancos'){
			saveBlancos($(this).val(), distrito, seccion, mesa, db);
		} else if($(this).attr('name') == 'nulos'){
			saveNulos($(this).val(), distrito, seccion, mesa, db);
		} else {
			saveVotosPartido($(this).attr('name'), $(this).val(), distrito, seccion, mesa, db);
		}
	});
	alert("Guardado "+distrito+"-"+seccion+"-"+mesa);
	location.href = "elegirmesa.html";
}
$(document).ready(function(){
	var db = getDatabase();
	var distrito = getUrlParameter('distrito');
	var seccion = getUrlParameter('seccion');
	var mesa = getUrlParameter('mesa');
	$("#titulo").append("Mesa "+distrito+"-"+seccion+"-"+mesa);
	$("header").load("header.html");
	var mesaData = getMesaData(db,distrito,seccion,mesa);
	loadFormulario(db, mesaData);
});