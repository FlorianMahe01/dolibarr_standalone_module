dolibarr.indexedDB = {};

dolibarr.indexedDB.open = function() {
	
  var version = 6;
  var request = indexedDB.open("dolibarr", version);

  request.onsuccess = function(e) {
  	dolibarr.indexedDB.db = e.target.result;
   	dolibarr.indexedDB.getAllProduct();
   	dolibarr.indexedDB.getAllThirdparty();
  };
 
  request.onupgradeneeded = function (evt) { 
  		var db = evt.currentTarget.result;
  		if(db.objectStoreNames.contains("product")) {
	      	db.deleteObjectStore("product");
	    }
  	                  
  		if(db.objectStoreNames.contains("product")) {
	      	db.deleteObjectStore("societe");
	    }
  	                  
        var objectStore = db.createObjectStore("product", 
                                     { keyPath: "rowid", autoIncrement: true });
 
        objectStore.createIndex("rowid", "rowid", { unique: true });
        
        var objectStore = db.createObjectStore("societe", 
                                     { keyPath: "rowid", autoIncrement: true });
 
        objectStore.createIndex("rowid", "rowid", { unique: true });
        
   };

  request.onerror = dolibarr.indexedDB.onerror;
 
};


dolibarr.indexedDB.addProduct = function(item) {
  var db = dolibarr.indexedDB.db;
  var trans = db.transaction(["product"], "readwrite");
  var store = trans.objectStore("product");
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
  var request = store.put(item);

  trans.oncomplete = function(e) {
   
  };

  request.onerror = function(e) {
    console.log(e.value);
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


