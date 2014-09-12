
var TProduct = new Array;
var TThirdParty = new Array;

$(document).ready(function() {
	if(localStorage.products){
	 	TProduct = JSON.parse( LZString.decompress( localStorage.products ) ); 
	}

	if(localStorage.thirdparties){
	 	TThirdParty = JSON.parse( LZString.decompress( localStorage.thirdparties ) ); 
	}

	$('#product-list').page({
		create:function(event,ui) {
			refreshproductList();
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
	  	
	  	
	  	var products = JSON.stringify(TProduct);
		localStorage.products = LZString.compress(products);


		refreshproductList();
  })
  .fail(function() {
  		
  		alert("I think youre are not connected to internet, am i right ?");
  	
  });
  
  
  return TProduct;
  
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
	  	
	  	var thirdparties = JSON.stringify(TThirdParty);
		localStorage.thirdparties = LZString.compress(thirdparties);
	
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
