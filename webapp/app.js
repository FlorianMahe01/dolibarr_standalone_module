
var TProduct = new Array;

$(document).ready(function() {

	if(localStorage.products){
	 	TProduct = JSON.parse(localStorage.products ); 
	}

	refreshproductList();
	
});

function syncronize() {
	
	$.mobile.loading( "show", {
		text: "Synchonisation in progress...",
		textVisible: true,
		theme: "z",
		html: ""
	});
	
	var date_last_sync_product = 0;
	if(localStorage.date_last_sync_product){  date_last_sync_product = localStorage.date_last_sync_product; }
	
	TProduct = _sync_product(TProduct, date_last_sync_product);
	
	var products = JSON.stringify(TProduct);
	
	localStorage.products = products;
	
	refreshproductList();
	
	$.mobile.loading( "hide" );
	
}

function _sync_product(TProduct, date_last_sync_product) {
  
  $.ajax({
  	url : "http://127.0.0.1/dolibarr/3.6/htdocs/custom/standalone/script/interface.php"
  	,data : {
  		get:'product'
  		,json: 1
  		,date_last_sync_product : date_last_sync_product
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
function refreshproductList() {
	
	$('#product-list ul').empty();
	
	$.each(TProduct,function(i, item) {
		$('#product-list ul').append('<li><a href="#product-card" itemid="'+item.rowid+'">'+item.label+'</a></li>');
		
	});
	
	$('#product-list ul').listview("refresh");
	
}
