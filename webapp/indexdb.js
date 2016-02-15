dolibarr.indexedDB = {};

dolibarr.indexedDB.open = function() {
	
  var version = 10;
  var request = indexedDB.open("dolibarr", version);

  request.onsuccess = function(e) {
  	dolibarr.indexedDB.db = e.target.result;
   	dolibarr.indexedDB.getAllProduct();
   	dolibarr.indexedDB.getAllThirdparty();
  };
 
  request.onupgradeneeded = function (evt) { 
  		var db = evt.currentTarget.result;
  		        
  		try {
  			db.deleteObjectStore("product");	
  		}
  		catch(e) {
  			
  		}
  	    
  		try {
	  	    db.deleteObjectStore("thirdparty");
  		}
  		catch(e) {
  			
  		}
  	    
  	    	        
        var objectStore = db.createObjectStore("product", 
                                     { keyPath: "id", autoIncrement: true });
 
        objectStore.createIndex("id", "id", { unique: true });
        objectStore.createIndex("label", "label", { unique: false });
        
        var objectStore = db.createObjectStore("thirdparty", 
                                     { keyPath: "id", autoIncrement: true });
 
        objectStore.createIndex("id", "id", { unique: true });
        objectStore.createIndex("name", "keyname", { unique: false });
        
   };

  request.onerror = dolibarr.indexedDB.onerror;
 
};


dolibarr.indexedDB.addProduct = function(item) {
	dolibarr.indexedDB.addItem('product',item,function(item) {
		TProduct.push(item);
		refreshproductList();
	});
};
dolibarr.indexedDB.addThirdparty = function(item) {
	item.keyname = item.name.toLowerCase();

	dolibarr.indexedDB.addItem('thirdparty',item,function(item) {
		TThirdParty.push(item);
		refreshthirdpartyList();
	});

};

dolibarr.indexedDB.getAll= function(storename, TArray, callback) {
  var trans = dolibarr.indexedDB.db.transaction(storename, IDBTransaction.READ_ONLY);
  var store = trans.objectStore(storename);
   
  TArray.splice(0,TArray.length);
  // Get everything in the store;
  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);

  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(result) {
    	
		TArray.push(result.value);
		result.continue();
    	
    }
    else{
    	
    	callback();
    }
      
	
  };

  cursorRequest.oncomplete = function() {
  	
  	
  };

  cursorRequest.onerror = dolibarr.indexedDB.onerror;
};

dolibarr.indexedDB.getNewId =function(storename) {
	return storename+'-'+Math.floor((1 + Math.random()) * 0x100000000)
               .toString(16)
               .substring(1)
               +'-'+Math.floor((1 + Math.random()) * 0x100000000)
               .toString(16)
               .substring(1);
};

dolibarr.indexedDB.addItem = function(storename,item, callbackfct) {
  var trans = dolibarr.indexedDB.db.transaction(storename, "readwrite");
  var store = trans.objectStore([storename]);
  store.delete(item.id);
  var request = store.put(item);

  trans.oncomplete = function(e) {
   	callbackfct(item);
  };

  request.onerror = function(e) {
    console.log(e.value);
  };
};

dolibarr.indexedDB.deleteItem = function (storename, id, callbackfct) {
	var trans = dolibarr.indexedDB.db.transaction(storename, "readwrite");
	var store = trans.objectStore([storename]);
	store.delete(id);
	
	trans.onsuccess = function(e) {
	   	if(callbackfct) callbackfct();
	};
	
	
};

dolibarr.indexedDB.getItemOnKey = function(storename, value, key, callbackfct) {
	  var db = dolibarr.indexedDB.db;
	  var trans = db.transaction(storename, "readwrite");
	  var store = trans.objectStore(storename);
	
	  var index = store.index(key);
	  //var boundKeyRange = IDBKeyRange.bound("A","Z",true,true);
	  //var boundKeyRange = IDBKeyRange.bound(value.toLowerCase(),value.toUpperCase()+"ZZZZZZZZZZZZZZZ",false, false);
	  value = value.toLowerCase();
	  var boundKeyRange = IDBKeyRange.bound(value,value+"zzzzzzzzzzz");

	  index.openCursor(boundKeyRange).onsuccess = function(event) {
	  		console.log(event.target.result);
	  	
	  	  var cursor = event.target.result;
		  if (cursor) {
		    callbackfct(cursor.value);
		  
		    // Do something with the matches.
		    cursor.continue();
		  }
	  	
		  
	  }; 
	 
};

dolibarr.indexedDB.getItem = function (storename, id, callbackfct) {
	  var db = dolibarr.indexedDB.db;
	  var trans = db.transaction(storename, "readwrite");
	  var store = trans.objectStore(storename);
	 
	  var request = store.get(id.toString()); 
	  request.onsuccess = function() {
		  var matching = request.result;
		  if (matching !== undefined) {
		    callbackfct(matching);
		  } else {
		    alert('Item not found');
		  }
	 };
};

dolibarr.indexedDB.getAllProduct = function() {
  
  var db = dolibarr.indexedDB.db;
  var trans = db.transaction(["product"], "readwrite");
  var store = trans.objectStore("product");

  // Get everything in the store;
  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);

  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(result) {
		TProduct.push(result.value);
		
	    //renderTodo(result.value);
	    result.continue();
    	
    }
    else{
    	
    	refreshproductList();
    }
      
	
  };

  cursorRequest.oncomplete = function() {
  	
  	
  };

  cursorRequest.onerror = dolibarr.indexedDB.onerror;
};


dolibarr.indexedDB.getAllThirdparty = function() {
  
  var db = dolibarr.indexedDB.db;
  var trans = db.transaction(["thirdparty"], "readwrite");
  var store = trans.objectStore("thirdparty");

  // Get everything in the store;
  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);

  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(result) {
		TThirdParty.push(result.value);
		result.continue();
    	
    }
    else{
    	
    	refreshthirdpartyList();
    }
      
	
  };

  cursorRequest.oncomplete = function() {
  	
  	
  };

  cursorRequest.onerror = dolibarr.indexedDB.onerror;
};

dolibarr.indexedDB.clear=function() {
		var db = dolibarr.indexedDB.db;
		db.close();
		
		var req = indexedDB.deleteDatabase("dolibarr");
		req.onsuccess = function () {
		    console.log("Deleted database successfully");
		};
		req.onerror = function () {
		    console.log("Couldn't delete database");
		};
		req.onblocked = function () {
		    console.log("Couldn't delete database due to the operation being blocked");
		};
	
};
