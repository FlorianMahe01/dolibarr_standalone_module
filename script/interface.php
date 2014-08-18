<?php
	
	DEFINE('INC_FROM_CRON_SCRIPT', true);
	
	require('../config.php');
	
	dol_include_once("/contact/class/contact.class.php");
	dol_include_once("/product/class/product.class.php");

	$get = GETPOST('get');
	$put = GETPOST('put');


	switch ($get) {
		case 'thirdparty':
			
			$id = GETPOST('id','int');
			
			if($id) {
				__out(_getThirdparty($id));
			}
			else{
				__out(_getListThirdparty());	
			}
			
			break;
		
		
	}	

	switch ($put) {

			
		case 'propal':
			__out('ok');
			
			break;
	}
	
		
function _getThirdparty($id) {
global $db;	
	
	$s=new Societe($db);
	
	$s->fetch($id);
	
	return $s;
	
}	
	
function _getListThirdparty() {
global $db;	
	
	$ATMdb = new TPDOdb;
	
	$Tab = $ATMdb->ExecuteAsArray("SELECT rowid, nom FROM ".MAIN_DB_PREFIX." WHERE status = 1 ORDER BY nom");	
		
	return $Tab;
}