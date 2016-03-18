$(document).ready(function() {

});
			
function _checkOnline() 
{
	var online = navigator.onLine;
    if(online) 
    { 
    	$('.is-online').removeClass('offline').addClass('online').attr('title','You are online');
    	$('a[href="#synchronize-page"]').removeClass('disabled'); 
	}
	else
	{
		$('.is-online').removeClass('online').addClass('offline').attr('title','Offline !');
		$('a[href="#synchronize-page"]').addClass('disabled'); 
		
	}
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
    });
    
    window.setInterval(function() {
    	_checkOnline();
    }, 10000); // 10s
	
	// store the currently selected tab in the hash value
	$("#menu-standalone a, .navbar-header a, .configuration a").on("shown.bs.tab", function(e) {
		var hash = $(e.target).attr("href").substr(1);
		console.log('hash = '+hash);
		window.location.hash = hash;
		if ($(e.target).attr("id") == 'home_link') // Si on click sur le lien "Accueil" en haut à gauche, les liens dans le menu reste actifs
		{
			$('#menu-standalone > ul li.active').removeClass('active');
		}
	});
	
	// on load of the page: switch to the currently selected tab
	var hash = window.location.hash;
	if (hash != '#synchronize-page' && $('a[href="' + hash + '"]:not(.last_item, .create_item):first-child').length > 0) $('a[href="' + hash + '"]:first-child').click();
	else {
		window.location.hash = '#home';
		$('a[href="#home"]:first-child').click();
	}
	
	
	// Fermeture automatique du menu burger /!\ ne pas déplacer cette définition audessus du hash.click
	$('#menu-standalone .dropdown-menu > li > a').on('click', function(){
		if ($('.navbar-toggle').css('display') != 'none') $('.navbar-toggle').click();
	});

}

function showMessage(title, message, type, callback)
{
	var TType = {
		'default': BootstrapDialog.TYPE_DEFAULT 
		,'info': BootstrapDialog.TYPE_INFO
		,'primary': BootstrapDialog.TYPE_PRIMARY 
		,'success': BootstrapDialog.TYPE_SUCCESS 
		,'warning': BootstrapDialog.TYPE_WARNING 
		,'danger': BootstrapDialog.TYPE_DANGER
	};
	
	var options = {
		title: title
        ,message: message
		,type: TType[type]
	};
	
	if (typeof callback == 'undefined') BootstrapDialog.show(options);
	else {
		options.callback = callback;
		options.btnCancelClass = 'btn-default pull-left';
		options.btnOKClass = 'btn-danger';
		BootstrapDialog.confirm(options);
	}
}

function clearDatabase() 
{
	showMessage('Clear database', 'Are you sure to want clear database?', 'danger', confirmClearDatabase);
}

function confirmClearDatabase(response)
{
	if (response === true) doliDb.dropDatabase();
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
			,login:localStorage.dolibarr_login
			,passwd:localStorage.dolibarr_password
			,entity:1
		}
	  	,dataType:'jsonp'
	  	,timeout: 1250 // Le test côté PHP pour vérifier que le login/mdp/entity correspond bien à un utilisateur prend 1sec, pour entrer la fonction d'erreur je suis obligé de définir un timeout (cas où l'url de l'interface est fausse)
	  	,success: function(res) {
	  		//trait(res);
	  		console.log(res);
			if (res == 'ok') showMessage('Confirmation', 'Configuration saved and connection is right !', 'success');
			else showMessage('Connection error', 'Configuration saved... But can\'t connect to Dolibarr', 'warning');
	  	}
	  	,error: function() {
	  		showMessage('Warning', 'Configuration saved... But i think it\'s wrong.', 'warning');
	  	}
	});
}
function trait(res)
{
	if (res == 'ok') showMessage('Confirmation', 'Configuration saved and connection is right !', 'success');
			else showMessage('Connection error', 'Configuration saved... But can\'t connect to Dolibarr', 'warning');
}

function synchronize() 
{
	$('#synchronize-page .sync-info').html('');
		
	var TObjToSync = [
		{type:'product', container:'#synchronize-page .sync-info', msg_start:'Fetching products...', msg_end:'Done'}
		,{type:'thirdparty', container:'#synchronize-page .sync-info', msg_start:'Fetching thirdparties...', msg_end:'Done'}
		,{type:'proposal', container:'#synchronize-page .sync-info', msg_start:'Fetching proposals...', msg_end:'Done'}
	];
	
	$.ajax({
	    url: localStorage.interface_url
	    ,dataType: 'jsonp'
	    ,timeout: 1250 // Le test côté PHP pour vérifier que le login/mdp/entity correspond bien à un utilisateur prend 1sec, pour entrer la fonction d'erreur je suis obligé de définir un timeout (cas où l'url de l'interface est fausse)
	    ,data: {
	    	get:'check'
	    	,jsonp: 1
			,login:localStorage.dolibarr_login
			,passwd:localStorage.dolibarr_password
			,entity:1
	    }
	    ,success: function (res) {
	    	if (res == 'ok') sync(TObjToSync);
	    	else showMessage('Connection error', 'Something is wrong, can\'t connect to Dolibarr', 'warning');
	    }
	    ,error: function (res) {
		    showMessage('Error', 'I think youre are not connected to internet, am i right ? Or maybe you have wrong interface URL.', 'warning');
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
			,dataType:'jsonp'
			,data: {
				get:TObjToSync[0].type
				,jsonp: 1
				,date_last_sync: date_last_sync
			}
			,success: function(data) {
				_update_date_sync(TObjToSync[0].type, $.now());
			  	doliDb.updateAllItem(TObjToSync[0].type, data);
			  	
			  	$(TObjToSync[0].container+' blockquote:last-child').append('<small class="text-info">'+TObjToSync[0].msg_end+'</small>'); // show info : done
			  	
			  	TObjToSync.splice(0, 1);
			  	sync(TObjToSync); // next sync
			}
			,error: function(xhr, ajaxOptions, thrownError) {
				// TODO téchniquement on tombera jamais dans le error car pas de timeout défini, sauf qu'on peux pas le définir sinon on risque d'interrompre la récupération des données
				showMessage('Synchronization error', 'Sorry, we meet an error pending synchronization', 'danger');
				$(TObjToSync[0].container).append('<blockquote><span class="text-error" style="color:red">Error sync with "'+TObjToSync[0].type+'"</span></blockquote>');
			}
		});
	}
	else
	{
		$('#synchronize-page .sync-info').append('<blockquote><p class="text-success">Sync terminated, everything is good !</p></blockquote>');
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
	        	showMessage('Information', 'Got image file entry:' + fileEntry.fullPath, 'info');
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
		showMessage('Information', 'The list display is not implemented yet', 'info');
		console.log('Callback non défini');
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
	
	addEventListenerOnItemLink();
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
	
	addEventListenerOnItemLink();
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
	
	addEventListenerOnItemLink();
}

function refreshOrderList(TItem)
{
	// ...
}

function addEventListenerOnItemLink()
{
	$("li.list-group-item a").on("shown.bs.tab", function(e) {
		var hash = $(e.target).attr("href").substr(1);
		console.log('hash = '+hash);
		window.location.hash = hash;
		$('#menu-standalone > ul li.active').removeClass('active');
	});
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
		showMessage('Information', 'The item display is not implemented yet', 'info');
	}
}

function showProduct(item) 
{
	setItemInHTML($('#product-card'), item);
}

function showThirdparty(item) 
{
	setItemInHTML($('#thirdparty-card'), item);
	$('a#last-thirdparty').html(item.name).closest('li').removeClass('hidden');
}

function showProposal(item)
{
	setItemInHTML($('#proposal-card'), item);
}

function setItemInHTML($container, item) 
{
	for(var x in item) 
	{
		//console.log(x);
		value = item[x];
		$container.find('[rel='+x+']').html(value);
	}
}