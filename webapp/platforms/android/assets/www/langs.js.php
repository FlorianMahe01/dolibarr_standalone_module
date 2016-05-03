<?php
	define('INC_FROM_CRON_SCRIPT', true);

	require '../config.php';
	$TTrans = $langs->tab_translate;
?>
	var langs={};
<?php

	foreach($TTrans as $k=>$v) {
		echo 'langs["'.addslashes($k).'"]="'.addslashes( $langs->trans($v) ).'";'."\n";
	}

?>
$(document).ready(function() {
	
	applyAllTrans();
});

function applyAllTrans() {
	$('langs[trans]').each(function(i,item){
		key = $(item).attr('trans');
		$(item).html(langsTrans(key));
		$(item).removeAttr('trans');
	});
}

function langsTrans(key) {
	
	if(langs[ key ]) label = langs[ key ];
	else label = key;
	
	return label;
	
}
