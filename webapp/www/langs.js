	var langs={};
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
