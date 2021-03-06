function loadtable(tablebody){
	var db = Ti.Database.openFile(Ti.Filesystem.getFile(
                              Ti.Filesystem.getApplicationDataDirectory(), 'recuento_votos.db'));
	var rows = db.execute("SELECT * FROM Mesa");
	while (rows.isValidRow()) {
		var estado = "Sin datos";
		var link = '<a href="rellenarmesa.html?distrito='+rows.fieldByName('idDistrito')+'&seccion='+rows.fieldByName('idSeccion')+'&mesa='+rows.fieldByName('idMesa')+'">Rellenar</a>';
		var style = '';
        if(rows.fieldByName('emitidos')>0){
			estado = "OK";
			link = '<a href="rellenarmesa.html?distrito='+rows.fieldByName('idDistrito')+'&seccion='+rows.fieldByName('idSeccion')+'&mesa='+rows.fieldByName('idMesa')+'">Modificar</a>';
		    style = 'style:"background:green;"';
        }
	    tablebody.append('<tr '+style+'><td>'+rows.fieldByName('idDistrito')+'</td><td>'+rows.fieldByName('idSeccion')+'</td><td>'+rows.fieldByName('idMesa')+'</td><td>'+estado+'</td><td>'+rows.fieldByName('censo')+'</td><td>'+link+'</td></tr>');
	    rows.next();    
	}
}
$(document).ready(function(){
	$("header").load("header.html");
	// define pager options
    var pagerOptions = {
        // target the pager markup - see the HTML block below
        container: $(".pager"),
        // output string - default is '{page}/{totalPages}'; possible variables: {page}, {totalPages}, {startRow}, {endRow} and {totalRows}
        output: '{startRow} - {endRow} / {filteredRows} ({totalRows})',
        // if true, the table will remain the same height no matter how many records are displayed. The space is made up by an empty
        // table row set to a height to compensate; default is false
        fixedHeight: true,
        // remove rows from the table to speed up the sort of large tables.
        // setting this to false, only hides the non-visible rows; needed if you plan to add/remove rows with the pager enabled.
        removeRows: false,
        // go to page selector - select dropdown that sets the current page
        cssGoto: '.gotoPage'
    };
    loadtable($("#tablebody"));
    // Initialize tablesorter
    // ***********************
    $("table")
            .tablesorter({
        theme: 'blue',
        headerTemplate: '{content} {icon}', // new in v2.7. Needed to add the bootstrap icon!
        widthFixed: true,
        widgets: ['zebra', 'filter']
    })

            // initialize the pager plugin
            // ****************************
            .tablesorterPager(pagerOptions);
});