


var dolibarr = {};
TProduct = new Array;
TThirdParty = new Array;


$(document).ready(function() {
    dolibarr.indexedDB.db = null;
    dolibarr.indexedDB.open();
  
 	$('#config').page({
		create:function(event,ui) {
			if(localStorage.interface_url) {  $('#interface_url').val(localStorage.interface_url); }
	
		}
	});
	
    $('input[name=camit]').change(function() {
    	alert(this.value);	
    }) ;
      
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
	
	$('#syncronize-page .sync-info').html('');
	$.mobile.changePage('#syncronize-page');
	
	$('#syncronize-page .sync-info').append('Fetching products... ');
	_sync_product();
	$('#syncronize-page .sync-info').append('Done<br />');
	
	$('#syncronize-page .sync-info').append('Fetching thirdparties... ');
	_sync_thirdparty();
	$('#syncronize-page .sync-info').append('Done<br />');
	
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
	  			
	  			if(TProduct[x].id == item.id) {
	  				TProduct[x] = item;
	  				find = true;
	  			
	  			}
	  		}
	  		
	  		if(!find) TProduct.push(item);
	  		
	  		
	  	});
	  	
	  	_synchronize_local_product();
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
		
		dolibarr.indexedDB.addProduct(item);
	}
	
	
}
function _synchronize_local_thirdparty(tx) {
	for(x in TThirdParty) {
		item = TThirdParty[x];
		
		dolibarr.indexedDB.addThirdparty(item);
	}
	
}
function takePicture() {
     navigator.camera.getPicture(function (fileURI) {

	    window.resolveLocalFileSystemURI(fileURI, 
	        function( fileEntry){
	            alert("got image file entry: " + fileEntry.fullPath);
	        },
	        function(){//error
	        }
	    );
	
	}, function (){
	// handle errors
	}, {
	    destinationType: window.Camera.DestinationType.FILE_URI,
	    sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
	    mediaType: window.Camera.MediaType.ALLMEDIA
	});
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
	  			
	  			if(TThirdParty[x].id == item.id) {
	  				TThirdParty[x] = item;
	  				find = true;
	  			}
	  		}
	  		
	  		if(!find) TThirdParty.push(item);
	  	});
	 	  	
	  	_synchronize_local_thirdparty();
		refreshthirdpartyList();
  });
  
  
  
  return TThirdParty;
  
}
function refreshthirdpartyList() {
	$('#thirdparty-list ul').empty();
	$.each(TThirdParty,function(i, item) {
		$('#thirdparty-list ul').append('<li><a href="#thirdparty-card" itemid="'+item.rowid+'">'+item.nom+'</a></li>');
		
	});
	
	if ($('#thirdparty-list ul').hasClass('ui-listview')) {
		    $('#thirdparty-list ul').listview('refresh');
	} else {
	    $('#thirdparty-list ul').listview();
	}
	
}
function refreshproductList() {
	
	$('#product-list ul').empty();
	$.each(TProduct,function(i, item) {
		
		$('#product-list ul').append('<li><a href="javascript:dolibarr.indexedDB.getItem(\'product\', '+item.id+', showProduct)">'+item.label+'</a></li>');
		
	});
	
	if ($('#product-list ul').hasClass('ui-listview')) {
		    $('#product-list ul').listview('refresh');
	} else {
	    $('#product-list ul').listview();
	}
	
	
}

function setItemInHTML($container, item) {
	
	for(x in item) {
		
		value = item[x];
		
		$container.find('[rel='+x+']').html(value);
		
	}
	
}
function showProduct(item) {
	
	setItemInHTML($('#product-card'), item);
	
	$.mobile.changePage('#product-card');
}
