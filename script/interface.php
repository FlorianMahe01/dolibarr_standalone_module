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
		
		case 'product':
			$id = GETPOST('id','int');
			
			if($id) __out(_getItem($get, $id));
			else __out(_getListItem($get, ' WHERE tosell = 1'));
			
			break;
			
		case 'thirdparty':
		case 'proposal':
			$id = GETPOST('id','int');
			
			if($id) __out(_getItem($get, $id));
			else __out(_getListItem($get));
			
			break;
			
	}	

	switch ($put) {

			
		case 'proposal':
			__out('ok');
			
			break;
	}
	

function _getItem($type, $id)
{
	global $db;
	if ($type == 'product') $className = 'Product';
	elseif ($type == 'thirdparty') $className = 'Societe';
	elseif ($type == 'proposal') $className = 'Propal';
	else exit($type.' => non géré');
	
	$o=new $className($db);
	$o->fetch($id);
	
	return $o;
}

function _getListItem($type, $filter='')
{
	global $conf;
	
	if ($type == 'product') $table = 'product';
	elseif ($type == 'thirdparty') $table = 'societe';
	elseif ($type == 'proposal') $table = 'propal';
	else exit($type.' => non géré');
	
	$PDOdb = new TPDOdb;
	$limit = empty($conf->global->STANDALONE_SYNC_LIMIT_LAST_ELEMENT) ? 100 : $conf->global->STANDALONE_SYNC_LIMIT_LAST_ELEMENT;
	
	$sql = 'SELECT rowid  FROM '.MAIN_DB_PREFIX.$table;
	if (!empty($filter)) $sql .= $filter;
	$sql.= ' ORDER BY tms DESC LIMIT '.$limit;
	
	$Tab = $PDOdb->ExecuteAsArray($sql);
	
	$TResult = array();
	foreach ($Tab as $row) 
	{
		$TResult[$row->rowid] = _getItem($type, $row->rowid);
	}
	
	return $TResult;
}
