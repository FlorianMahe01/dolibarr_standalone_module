
var TProduct = new Array;

$(document).ready(function() {

	if(localStorage.products){
	 	TProduct = JSON.parse(localStorage.products ); 
	}

	refreshproductList();
	
	
	if(localStorage.interface_url) {  $('#interface_url').val(localStorage.interface_url); }
	
});
function saveConfig() {
	
	localStorage.interface_url = $('#interface_url').val();	
	alert('Configuration saved !');
	
}
function syncronize() {
	
	$.mobile.loading( "show", {
		text: "Synchonisation in progress...",
		textVisible: true,
		theme: "z",
		html: ""
	});
	
	var date_last_sync_product = 0;
	if(localStorage.date_last_sync_product){  date_last_sync_product = localStorage.date_last_sync_product; }
	
	var date_last_sync_thirdparty = 0;
	if(localStorage.date_last_sync_thirdparty){  date_last_sync_thirdparty = localStorage.date_last_sync_thirdparty; }
	
	TProduct = _sync_product(TProduct, date_last_sync_product);
	var products = JSON.stringify(TProduct);
	localStorage.products = products;
	
	refreshproductList();
	
	TThirdParty = _sync_thirdparty(TThirdParty, date_last_sync_thirdparty);
	var thirdparties = JSON.stringify(TThirdParty);
	localStorage.thirdparties = thirdparties;
	
	refreshthirdpartyList();
	
	$.mobile.loading( "hide" );
	
}

function _sync_product(TProduct, date_last_sync) {
  
  $.ajax({
  	url : 	localStorage.interface_url
  	,data : {
  		get:'product'
  		,json: 1
  		,date_last_sync : date_last_sync
  	}
  	,dataType:'json'
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
	  	
  })
  .fail(function() {
  		
  		alert("I think youre are not connected to internet, am i right ?");
  	
  });
  
  
  return TProduct;
  
}


function _sync_thirdparty(Tab, date_last_sync) {
  
  $.ajax({
  	url : 	localStorage.interface_url
  	,data : {
  		get:'thirdparty'
  		,json: 1
  		,date_last_sync : date_last_sync
  	}
  	,dataType:'json'
  	,async : false
  })
  .done(function(data) {

	  	localStorage.date_last_sync_thirdparty = $.now(); 
	  	
	  	$.each(data, function(i, item) {
	  		var find = false;
	  		for(x in Tab){
	  			
	  			if(Tab[x].rowid == item.rowid) {
	  				Tab[x] = item;
	  				find = true;
	  			}
	  		}
	  		
	  		if(!find) Tab.push(item);
	  	});
	  	
  })
  .fail(function() {
  		
  		alert("I think youre are not connected to internet, am i right ?");
  	
  });
  
  
  return TProduct;
  
}
function refreshthirdpartyList() {
	$('#thirdparty-list ul').empty();
	
	$.each(TProduct,function(i, item) {
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
