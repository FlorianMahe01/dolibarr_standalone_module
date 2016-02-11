<?php
	
	DEFINE('INC_FROM_CRON_SCRIPT', true);
	
	require('../config.php');
	
	dol_include_once("/contact/class/contact.class.php");
	dol_include_once("/product/class/product.class.php");

// TODO check login / pass
// TODO sync event, propal, order, invoice in order to allow view and edit

	$get = GETPOST('get');
	$put = GETPOST('put');


	switch ($get) {
		case 'check':
			__out('ok');
			
			break;
		
		case 'thirdparty':
			
			$id = GETPOST('id','int');
			
			if($id) {
				__out(_getThirdparty($id));
			}
			else{
				__out(_getListThirdparty());	
			}
			
			break;
		
		case 'product':
			$id = GETPOST('id','int');
			
			if($id) {
				__out(_getProduct($id));
			}
			else{
				__out(_getListProduct());	
			}
			
			break;
	}	

	switch ($put) {

			
		case 'propal':
			__out('ok');
			
			break;
	}
	
	
function _getListProduct() {
global $conf;
	$PDOdb = new TPDOdb;
	
	$limit = empty($conf->global->STANDALONE_SYNC_LIMIT_LAST_ELEMENT) ? 100 : $conf->global->STANDALONE_SYNC_LIMIT_LAST_ELEMENT;
	
	$Tab = $PDOdb->ExecuteAsArray("SELECT rowid  FROM ".MAIN_DB_PREFIX."product 
	WHERE tosell = 1 
	ORDER BY tms DESC
	LIMIT ".$limit);	
	
	$TResult = array();
	foreach ($Tab as $row) {
		
		$TResult[] = _getProduct($row->rowid);
		
	}
		
	return $TResult;
	
}	
function _getProduct($id) {
global $db;	
	
	$o=new Product($db);
	
	$o->fetch($id);
	
	return $o;
	
}			
function _getThirdparty($id) {
global $db;	
	
	$o=new Societe($db);
	
	$o->fetch($id);
	
	return $o;
	
}	
	
function _getListThirdparty() {

	$limit = empty($conf->global->STANDALONE_SYNC_LIMIT_LAST_ELEMENT) ? 100 : $conf->global->STANDALONE_SYNC_LIMIT_LAST_ELEMENT;
	
	$PDOdb = new TPDOdb;
	$Tab = $PDOdb->ExecuteAsArray("SELECT rowid FROM ".MAIN_DB_PREFIX."societe WHERE status = 1 ORDER BY tms LIMIT ".$limit);	
	
	$TResult = array();
	foreach ($Tab as $row) {
		
		$TResult[] = _getThirdparty($row->rowid);
		
	}
		
	return $TResult;
}
