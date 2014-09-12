
var TProduct = new Array;
var TThirdParty = new Array;
var db = null;


$(document).ready(function() {
     
    db = window.openDatabase("Dolibarr", "1.0", "Dolibarr Standalone Data", 10000000);
    
    db.transaction(loadLocalData, errorCB);

 	$('#product-list').page({
		create:function(event,ui) {
			
		}
	});
	$('#thirdparty-list').page({
		create:function(event,ui) {
			refreshthirdpartyList();
		}
	});

	$('#config').page({
		create:function(event,ui) {
			if(localStorage.interface_url) {  $('#interface_url').val(localStorage.interface_url); }
	
		}
	});
	
        
});

function errorCB(tx, err) {
	alert("SQL Error : "+err.code);
}

function loadLocalData(tx) {
	
	//tx.executeSql('DROP TABLE IF EXISTS llx_product');
    tx.executeSql('CREATE TABLE IF NOT EXISTS llx_product (rowid, localid,ref, label, description)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS llx_societe (rowid, localid, nom)');

    tx.executeSql('SELECT rowid, label FROM llx_product', [], loadLocalDataProduct, errorCB);
    tx.executeSql('SELECT rowid, nom FROM llx_societe', [], loadLocalDataThirdparty, errorCB);
	
}
function loadLocalDataThirdparty(tx, results) {

   var len = results.rows.length;
   for (var i=0; i<len; i++){
        TThirdParty.push(results.rows.item(i));
    }
   
   refreshthirdpartyList();
   
}

function loadLocalDataProduct(tx, results) {

   var len = results.rows.length;
   for (var i=0; i<len; i++){
        TProduct.push(results.rows.item(i));
    }
   
   refreshproductList();
   
}


function saveConfig() {
	
	localStorage.interface_url = $('#interface_url').val();	
	
	$.ajax({
			url:localStorage.interface_url
			
			,data : {
  				get:'check'
  				,jsonp: 1
  			}
  	,dataType:'jsonp'
  	,async : true
	}).done(function() { alert('Configuration saved !'); }).fail(function() { alert('Configuration saved... But i think it\'s wrong.'); });
	
	
}

function syncronize() {
	
	$.mobile.loading( "show", {
		text: "Synchonisation in progress...",
		textVisible: true,
		theme: "z",
		html: ""
	});
	
	_sync_product();
	
	_sync_thirdparty();
	
	$.mobile.loading( "hide" );
	
}

function _sync_product() {
  var date_last_sync_product = 0;
  if(localStorage.date_last_sync_product){  date_last_sync_product = localStorage.date_last_sync_product; }
	
  $.ajax({
  	url : 	localStorage.interface_url
  	,data : {
  		get:'product'
  		,jsonp: 1
  		,date_last_sync : date_last_sync_product
  	}
  	,dataType:'jsonp'
  	,async : false
  })
  .done(function(data) {

	  	localStorage.date_last_sync_product = $.now(); 
	  	
	  	$.each(data, function(i, item) {
	  		
	  		var find = false;
	  		for(x in TProduct){
	  			
	  			if(TProduct[x].rowid == item.rowid) {
	  				TProduct[x] = item;
	  				find = true;
	  			
	  			}
	  		}
	  		
	  		if(!find) TProduct.push(item);
	  		
	  		
	  	});
	  	
	  	db.transaction(_synchronize_local_product, errorCB);
		refreshproductList();
  })
  .fail(function() {
  		
  		alert("I think youre are not connected to internet, am i right ?");
  	
  });
  
  
  return TProduct;
  
}
function _synchronize_local_product(tx) {
	for(x in TProduct) {
		item = TProduct[x];
		
		tx.executeSql('DELETE FROM llx_product WHERE rowid = '+item.rowid);	
		
		tx.executeSql('INSERT INTO llx_product (rowid, label) VALUES ('+item.rowid+', "'+item.label+'")');	
	}
	
	
}
function _synchronize_local_thirdparty(tx) {
	for(x in TThirdParty) {
		item = TThirdParty[x];
		
		tx.executeSql('DELETE FROM llx_societe WHERE rowid = '+item.rowid);	
		
		tx.executeSql('INSERT INTO llx_societe (rowid, nom) VALUES ('+item.rowid+', "'+item.nom+'")');	
	}
	
	
}

function _sync_thirdparty() {
  var date_last_sync_thirdparty = 0;
  if(localStorage.date_last_sync_thirdparty){  date_last_sync_thirdparty = localStorage.date_last_sync_thirdparty; }

  $.ajax({
  	url : 	localStorage.interface_url
  	,data : {
  		get:'thirdparty'
  		,jsonp: 1
  		,date_last_sync : date_last_sync_thirdparty
  	}
  	,dataType:'jsonp'
  	,async : false
  }).done(function(data) {

	  	localStorage.date_last_sync_thirdparty = $.now(); 
	  	
	  	$.each(data, function(i, item) {
	  		var find = false;
	  		for(x in TThirdParty){
	  			
	  			if(TThirdParty[x].rowid == item.rowid) {
	  				TThirdParty[x] = item;
	  				find = true;
	  			}
	  		}
	  		
	  		if(!find) TThirdParty.push(item);
	  	});
	 	  	
	  	db.transaction(_synchronize_local_thirdparty, errorCB);
		refreshthirdpartyList();
  })
  
  
  
  return TThirdParty;
  
}
function refreshthirdpartyList() {
	$('#thirdparty-list ul').empty();
	$.each(TThirdParty,function(i, item) {
		$('#thirdparty-list ul').append('<li><a href="#thirdparty-card" itemid="'+item.rowid+'">'+item.nom+'</a></li>');
		
	});
	
	$('#thirdparty-list ul').listview("refresh");
	
	
}
function refreshproductList() {
	
	$('#product-list ul').empty();
	$.each(TProduct,function(i, item) {
		
		$('#product-list ul').append('<li><a href="#product-card" itemid="'+item.rowid+'">'+item.label+'</a></li>');
		
	});
	
	$('#product-list ul').listview("refresh");
	
}
