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
		case 'products':
			doliDb.getAllItem('product', refreshProductList);
			break;
			
		case 'thirdparties':
			doliDb.getAllItem('thirdparty', refreshThirpartyList);
			break;
		
		case 'proposals':
			doliDb.getAllItem('proposal', refreshProposalList);
			break;
		
		default:
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
		//url: "http://localhost/dolibarr/develop/htdocs/custom/standalone/script/interface.php"
		,data: {
			get:type
			,jsonp: 1
			,date_last_sync: date_last_sync
		}
		,dataType:'jsonp'
		//,dataType:'json'
		,async : false
	})
	.done(function(data) {
		_update_date_sync(type, $.now());
	  	doliDb.updateAllItem(type, data);
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
	var x = 0;
	$('#thirdparty-list ul').empty();
	for (var i in TItem)
	{
		var $li = $('<li class="list-group-item"><a data-toggle="tab" href="#thirdparty-card" onclick="javascript:showItem(\'thirdparty\', '+TItem[i].id+', showThirdparty)">'+TItem[i].name+'</a></li>');
		if(TItem[i].client == 1) $li.append('<span class="badge client">C</span>');
		if(TItem[i].fournisseur == 1) $li.append('<span class="badge fournisseur">F</span>');
		$('#thirdparty-list ul').append($li);
	
		if (x > 20) return;
		else x++;
	}
}

function refreshProposalList(TItem)
{
	var x = 0;
	$('#proposal-list ul').empty();
	for (var i in TItem)
	{
		var $li = $('<li class="list-group-item"><a data-toggle="tab" href="#proposal-card" onclick="javascript:showItem(\'proposal\', '+TItem[i].id+', showProposal)">'+TItem[i].ref+'</a></li>');
		$('#proposal-list ul').append($li);
		
		if (x > 20) return;
		else x++;
	}
}

function refreshProductList(TItem) 
{
	var x = 0;
	$('#product-list ul').empty();
	for (var i in TItem)
	{
		var $li = $('<li class="list-group-item"><a data-toggle="tab" href="#product-card" onclick="javascript:showItem(\'product\', '+TItem[i].id+', showProduct)">'+TItem[i].label+'</a></li>');
		$('#product-list ul').append($li);
		
		if (x > 20) return;
		else x++;
	}
}

function showItem(type, id, callback)
{
	if (typeof callback != 'undefined')
	{
		doliDb.getItem(type, id, callback);
	}
	else
	{
		console.log('Callback non défini');
		alert('Attention l\'affichage de de cet item n\'est pas encore implémenté');
	}
}

function showProduct(item) 
{
	setItemInHTML($('#product-card'), item);
}

function showThirdparty(item) 
{
	setItemInHTML($('#thirdparty-card'), item);
	$('a#last-thirdparty').html(item.name).tab('show').closest('li').removeClass('hidden');
}

function showProposal(item)
{
	setItemInHTML($('#proposal-card'), item);
}

function setItemInHTML($container, item) 
{
	for(var x in item) 
	{
		value = item[x];
		console.log(x);
		$container.find('[rel='+x+']').html(value);
	}
}