$(document).ready(function() {
	
 	if(localStorage.interface_url) 
 	{  
 		$('#interface_url').val(localStorage.interface_url); 
	 	if(localStorage.dolibarr_login) { $('#dolibarr_login').val(localStorage.dolibarr_login); }
	 	if(localStorage.dolibarr_password) { $('#dolibarr_password').val(localStorage.dolibarr_password); }
 	}
 	else 
 	{
 		$('#navigation a[href="#config"]').tab('show');
 	}
	
    $('input[name=camit]').change(function() {
    	alert(this.value);	
    }) ;
     
   // $("#home [rel=thirdparties] span.bubble").html(dolibarr.indexedDB.count('thirdparty'));
      
    _checkOnline();
      
});

function _checkOnline() 
{
	var online = navigator.onLine;
    if(online) $('#is-online').removeClass('offline').addClass('online').attr('title','You are online');
	else $('#is-online').removeClass('online').addClass('offline').attr('title','Offline !');
}

function tpl_append(url,container) 
{
	$.get(url, function (data) {
		$(container).prepend(data);
		applyAllTrans();
	});
}


function switchOnglet(onglet)
{
	switch (onglet) {
		case 'thirdparties':
			doliDb.getAllItem('thirdparty', refreshThirpartyList);
			break;
		
		default:
		case 'proposals':
			$('a[href="#propal-list"]').tab('show');
			break;
	}
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

function syncronize() 
{
	$('#syncronize-page .sync-info').html('');
	$('#navigation a[href="#syncronize-page"]').tab('show');
	
	$('#syncronize-page .sync-info').append('Fetching products... ');
	_sync('product');
	$('#syncronize-page .sync-info').append('Done<br />');
	
	$('#syncronize-page .sync-info').append('Fetching thirdparties... ');
	_sync('thirdparty');
	$('#syncronize-page .sync-info').append('Done<br />');
	
	$('#syncronize-page .sync-info').append('Fetching proposals... ');
	_sync('proposal');
	$('#syncronize-page .sync-info').append('Done<br />');
}

function _sync(type)
{
	switch (type) {
		case 'product':
			var date_last_sync = localStorage.date_last_sync_product || 0;
			break;
		case 'thirdparty':
			var date_last_sync = localStorage.date_last_sync_thirdparty || 0;
			break;
		case 'proposal':
			var date_last_sync = localStorage.date_last_sync_proposal || 0;
			break;
	}
	
	$.ajax({
		url: localStorage.interface_url
		,data: {
			get:type
			,jsonp: 1
			,date_last_sync: date_last_sync
		}
		,dataType:'jsonp'
		,async : false
	})
	.done(function(data) {
		_update_date_sync(type, $.now());
	  	// TODO faire un update db doliDb.updateAllItem(type, callback);
	})
	.fail(function() {
  		alert("I think youre are not connected to internet, am i right ?");
	});
}

function _update_date_sync(type, date)
{
	switch (type) {
		case 'product':
			localStorage.date_last_sync_product = date;
			break;
		case 'thirdparty':
			localStorage.date_last_sync_thirdparty = date;
			break;
		case 'proposal':
			localStorage.date_last_sync_proposal = date;
			break;
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

function refreshThirpartyList(TItem)
{
	$('#thirdparty-list ul').empty();
	for (var i in TItem)
	{
		var $li = $('<li class="list-group-item"><a href="javascript:showThirdparty('+TItem[i].id+')">'+TItem[i].name+'</a></li>');
		if(TItem[i].client == 1) $li.append('<span class="badge client">C</span>');
		if(TItem[i].fournisseur == 1) $li.append('<span class="badge fournisseur">F</span>');
	
		$('#thirdparty-list ul').append($li);
	
		if(i>20) return false;
	}
}

function refreshproductList() {
	var DoliDb = new DoliDb();
	DoliDb.open();
	
	var TProduct = DoliDb.getAllItem('product');
	
	$('#product-list ul').empty();
	$.each(TProduct,function(i, item) {
		$('#product-list ul').append('<li class="list-group-item"><a href="javascript:showProduct('+item.id+')">'+item.label+'</a></li>');
		if(i>20) return false;
	});
	
}

function setItemInHTML($container, item) {
	
	for(var x in item) {
		value = item[x];
		console.log(x);
		$container.find('[rel='+x+']').html(value);
	}
	
}
function showProduct() {
	var DoliDb = new DoliDb();
	DoliDb.open();
	
	var item = DoliDb.getItem('product', id);
	
	showItem(item, 'product-card');
	$('a[href="#product-list"]').tab('show');
}
function showThirdparty(id) {
	var DoliDb = new DoliDb();
	DoliDb.open();
	
	var item = DoliDb.getItem('thirdparty', id);
	
	showItem(item, 'thirdparty-card');
	console.log(item);
	var $a = $('a#last-thirdparty');
	$a.html(item.name);
	$a.tab('show');
	$a.closest('li').removeClass('hidden');
}

function showItem(item, page) {
	setItemInHTML($('#'+page), item);
}