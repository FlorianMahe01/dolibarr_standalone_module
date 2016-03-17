$(document).ready(function() {

});
			
function _checkOnline() 
{
	var online = navigator.onLine;
    if(online) $('.is-online').removeClass('offline').addClass('online').attr('title','You are online');
	else $('.is-online').removeClass('online').addClass('offline').attr('title','Offline !');
}

function load_tpl()
{
	var TTpl = [
		['tpl/nav.html', 'body']
		,['tpl/config.html', '#container']
		,['tpl/home.html', '#container']
		,['tpl/product.html', '#container']
		,['tpl/thirdparty.html', '#container']
		,['tpl/proposal.html', '#container']
	];
	
	tpl_append(TTpl);
}

function tpl_append(TTpl) 
{
	if (TTpl.length > 0)
	{
		$.get(TTpl[0][0], function (data) 
		{
			$(TTpl[0][1]).prepend(data);
			applyAllTrans();
			TTpl.splice(0, 1);
			tpl_append(TTpl);
		});	
	}
	else
	{
		init();
	}
}

function init()
{
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
    
    setInterval(function() {
    	_checkOnline();
    }, 10000); // 10s
	
	// store the currently selected tab in the hash value
	$("#menu-standalone a").on("shown.bs.tab", function(e) {
		var id = $(e.target).attr("href").substr(1);
		console.log(id);
		window.location.hash = id;
	});
	
	// on load of the page: switch to the currently selected tab
	var hash = window.location.hash;
	$('#menu-standalone a[href="' + hash + '"]').click();
	
	
	// Fermeture automatique du menu burger /!\ ne pas déplacer cette définition audessus du hash.click
	$('#menu-standalone .dropdown-menu > li > a').on('click', function(){
	    $('.navbar-toggle').click();
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

function syncronize() 
{
	$('#syncronize-page .sync-info').html('');
		
	var TObjToSync = [
		{type:'product', container:'#syncronize-page .sync-info', msg_start:'Fetching products...', msg_end:'Done'}
		,{type:'thirdparty', container:'#syncronize-page .sync-info', msg_start:'Fetching thirdparties...', msg_end:'Done'}
		,{type:'proposal', container:'#syncronize-page .sync-info', msg_start:'Fetching proposals...', msg_end:'Done'}
	];
	
	$.ajax({
	    url: localStorage.interface_url
	    ,dataType: 'jsonp'
	    ,timeout: 150 // delay obligatoire pour traiter le retour
	    ,data: {
	    	get: 'check'
	    	,jsonp: 1
	    }
	    ,success: function (res) {
	    	if (res == 'ok') sync(TObjToSync);
	    	else alert('What else ?');
	    }
	    ,error: function (res) {
		    alert("I think youre are not connected to internet, am i right ? Or maybe you have wrong interface URL.");   
	    }
	});
}


function sync(TObjToSync)
{
	if (TObjToSync.length > 0)
	{
		switch (TObjToSync[0].type) {
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
		
		$(TObjToSync[0].container).append('<blockquote><span class="text-info">'+TObjToSync[0].msg_start+'</span></blockquote>'); // show info : start fetching
		
		$.ajax({
			url: localStorage.interface_url
			//url: "http://localhost/dolibarr/develop/htdocs/custom/standalone/script/interface.php"
			,dataType:'jsonp'
			//,dataType:'json'
			,data: {
				get:TObjToSync[0].type
				,jsonp: 1
				,date_last_sync: date_last_sync
			}
			,async : false
			,success: function(data) {
				_update_date_sync(TObjToSync[0].type, $.now());
			  	doliDb.updateAllItem(TObjToSync[0].type, data);
			  	
			  	$(TObjToSync[0].container+' blockquote:last-child').append('<small class="text-info">'+TObjToSync[0].msg_end+'</small>'); // show info : done
			  	
			  	TObjToSync.splice(0, 1);
			  	sync(TObjToSync); // next sync
			}
			,error: function(xhr, ajaxOptions, thrownError) {
				$(TObjToSync[0].container).append('<blockquote><span class="text-error" style="color:red">Error sync with "'+TObjToSync[0].type+'"</span></blockquote>'); // error : stop loop and show error
			}
		});
	}
	else
	{
		$('#syncronize-page .sync-info').append('<blockquote><p class="text-success">Sync terminated, everything is good !</p></blockquote>');
	}
	
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

function showList(type, callback)
{
	if (typeof callback != 'undefined')
	{
		doliDb.getAllItem(type, callback);
	}
	else
	{
		console.log('Callback non défini');
		alert('Attention l\'affichage de cette liste n\'est pas encore implémenté');
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

function refreshThirdpartyList(TItem)
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

function showItem(type, id, callback)
{
	if (typeof callback != 'undefined')
	{
		doliDb.getItem(type, id, callback);
	}
	else
	{
		console.log('Callback non défini');
		alert('Attention l\'affichage de cet item n\'est pas encore implémenté');
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