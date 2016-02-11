


var dolibarr = {};
TProduct = new Array;
TThirdParty = new Array;


$(document).ready(function() {
    dolibarr.indexedDB.db = null;
    dolibarr.indexedDB.open();
  
 	if(localStorage.interface_url) {  
 		$('#interface_url').val(localStorage.interface_url); 
	 	if(localStorage.dolibarr_login) {  $('#dolibarr_login').val(localStorage.dolibarr_login); }
	 	if(localStorage.dolibarr_password) {  $('#dolibarr_password').val(localStorage.dolibarr_password); }
 	}
 	else {
 		$('#navigation a[href="#config"]').tab('show');
 	}
	
    $('input[name=camit]').change(function() {
    	alert(this.value);	
    }) ;
      
});

function tpl_append(url,container) {
		$.get(url, function (data ) {
			$(container).prepend(data);
			applyAllTrans();
		});

}

function saveConfig() {
	
	localStorage.interface_url = $('#interface_url').val();	
	localStorage.dolibarr_login = $('#dolibarr_login').val();	
	localStorage.dolibarr_password = $('#dolibarr_password').val();	
	
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
	$('#navigation a[href="#syncronize-page"]').tab('show');
	
	$('#syncronize-page .sync-info').append('Fetching products... ');
	_sync_product();
	$('#syncronize-page .sync-info').append('Done<br />');
	
	$('#syncronize-page .sync-info').append('Fetching thirdparties... ');
	_sync_thirdparty();
	$('#syncronize-page .sync-info').append('Done<br />');
	
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
		$('#thirdparty-list ul').append('<li class="list-group-item"><a href="javascript:dolibarr.indexedDB.getItem(\'thirdparty\', '+item.id+', showThirdparty)">'+item.nom+'</a></li>');
		if(i>20) return false;
	});

}
function refreshproductList() {
	
	$('#product-list ul').empty();
	$.each(TProduct,function(i, item) {
		$('#product-list ul').append('<li class="list-group-item"><a href="javascript:dolibarr.indexedDB.getItem(\'product\', '+item.id+', showProduct)">'+item.label+'</a></li>');
		if(i>20) return false;
	});
	
}

function setItemInHTML($container, item) {
	
	for(x in item) {
		value = item[x];
		$container.find('[rel='+x+']').html(value);
	}
	
}
function showProduct(item) {
	showItem(item, 'product-card');
	$('a[href="#product-list"]').tab('show');
}
function showThirdparty(item) {
	showItem(item, 'thirdparty-card');
	$('a[href="#thirdparty-list"]').tab('show');
}

function showItem(item, page) {
	setItemInHTML($('#'+page), item);
}
