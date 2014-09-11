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

	$ATMdb = new TPDOdb;
	
	$ATMdb->Execute("SET NAMES utf8");
	$Tab = $ATMdb->ExecuteAsArray("SELECT rowid, label  FROM ".MAIN_DB_PREFIX."product WHERE tosell = 1 ORDER BY label ");	
	return $Tab;
	
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

	
	$ATMdb = new TPDOdb;
	$ATMdb->Execute("SET NAMES utf8");
	$Tab = $ATMdb->ExecuteAsArray("SELECT rowid, nom FROM ".MAIN_DB_PREFIX."societe WHERE status = 1 ORDER BY nom LIMIT 100");	
		
	return $Tab;
}
