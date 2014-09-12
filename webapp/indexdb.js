dolibarr.indexedDB = {};

dolibarr.indexedDB.open = function() {
	
  var version = 7;
  var request = indexedDB.open("dolibarr", version);

  request.onsuccess = function(e) {
  	dolibarr.indexedDB.db = e.target.result;
   	dolibarr.indexedDB.getAllProduct();
   	dolibarr.indexedDB.getAllThirdparty();
  };
 
  request.onupgradeneeded = function (evt) { 
  		var db = evt.currentTarget.result;
  		        
        var objectStore = db.createObjectStore("product", 
                                     { keyPath: "id", autoIncrement: true });
 
        objectStore.createIndex("id", "id", { unique: true });
        
        var objectStore = db.createObjectStore("societe", 
                                     { keyPath: "id", autoIncrement: true });
 
        objectStore.createIndex("id", "id", { unique: true });
        
   };

  request.onerror = dolibarr.indexedDB.onerror;
 
};


dolibarr.indexedDB.addProduct = function(item) {
  var db = dolibarr.indexedDB.db;
  var trans = db.transaction(["product"], "readwrite");
  var store = trans.objectStore("product");
  store.delete(item.id);
  var request = store.put(item);

  trans.oncomplete = function(e) {
   
  };

  request.onerror = function(e) {
    console.log(e.value);
  };
};
dolibarr.indexedDB.addThirdparty = function(item) {
  var db = dolibarr.indexedDB.db;
  var trans = db.transaction(["societe"], "readwrite");
  var store = trans.objectStore("societe");
  
  store.delete(item.id);
  
  var request = store.put(item);

  trans.oncomplete = function(e) {
   
  };

  request.onerror = function(e) {
    console.log(e.value);
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
  var trans = db.transaction(["societe"], "readwrite");
  var store = trans.objectStore("societe");

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
