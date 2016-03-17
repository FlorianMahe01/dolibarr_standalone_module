/* Pseudo class DB */
var DoliDb = function() {

	DoliDb.prototype.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	DoliDb.prototype.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	DoliDb.prototype.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
	
	DoliDb.prototype.request = {};
	DoliDb.prototype.db = {};
	DoliDb.prototype.dbName = 'dolibarr';
	
	DoliDb.prototype.open = function() {
		
		if (!this.indexedDB) {
		    window.alert("Votre navigateur ne supporte pas une version stable d'IndexedDB. Quelques fonctionnalités ne seront pas disponibles.");
		    return;
		}
		
		var version = 13;
		this.request = this.indexedDB.open(this.dbName, version); // Attention la version ne peut pas être inférieur à la dernière version
		
		this.request.onupgradeneeded = function (event) { // cette fonction doit normalement mettre à jour le schéma BDD sans qu'on soit obligé de modifier le numéro de version 
			DoliDb.prototype.db = event.currentTarget.result;
			   
			try { DoliDb.prototype.db.deleteObjectStore("product"); }
			catch(e) { console.log(e); }
			
			try { DoliDb.prototype.db.deleteObjectStore("thirdparty"); }
			catch(e) { console.log(e); }
			
			try { DoliDb.prototype.db.deleteObjectStore("proposal"); }
			catch(e) { console.log(e); }
			
			var objectStore = DoliDb.prototype.db.createObjectStore("product", { keyPath: "id", autoIncrement: true });
			objectStore.createIndex("id", "id", { unique: true });
			objectStore.createIndex("label", "label", { unique: false });
			
			var objectStore = DoliDb.prototype.db.createObjectStore("thirdparty", { keyPath: "id", autoIncrement: true });
			objectStore.createIndex("id", "id", { unique: true });
			objectStore.createIndex("name", "keyname", { unique: false });
			
			var objectStore = DoliDb.prototype.db.createObjectStore("proposal", { keyPath: "id", autoIncrement: true });
			objectStore.createIndex("id", "id", { unique: true });
			objectStore.createIndex("ref", "ref", { unique: true });
		};
		
		this.request.onsuccess = function(event) {
			DoliDb.prototype.db = event.target.result;
			console.log("open db success");
		};
		
	    this.request.onerror = function() { 
	    	console.log("open db error"); 
	    };
	    this.request.onblocked = function() { 
	    	console.log("open db blocked"); 
	    };
	    
	};
	
	DoliDb.prototype.getAllItem = function(type, callback) {
		console.log('getAllItem : '+type);
		
		var TItem = new Array;
		
		var transaction = this.db.transaction([type], "readonly");
		var objectStore = transaction.objectStore(type);
		
		// Get everything in the store;
		var keyRange = this.IDBKeyRange.lowerBound(0);
		var cursorRequest = objectStore.openCursor(keyRange);
		
		cursorRequest.onsuccess = function(event) {
			var result = event.target.result;
			if(result) 
			{
				TItem.push(result.value);
				result.continue();
			}
			else
			{
				if (typeof callback !== 'undefined') callback(TItem);
				return false; // de toute manière c'est de l'asynchrone, donc ça sert à rien de return TItem
				//refreshthirdpartyList(TThirdParty);
			}
		};
		
		cursorRequest.oncomplete = function() {};
		  
		cursorRequest.onerror = DoliDb.prototype.db.onerror;
	};
	
	
	DoliDb.prototype.getItem = function (storename, id, callback) {
		var transaction =  this.db.transaction(storename, "readonly");
		var objectStore = transaction.objectStore(storename);
		  
		var request = objectStore.get(id.toString()); 
		request.onsuccess = function() 
		{
			var item = request.result;
			if (item !== 'undefined') 
			{
				if (typeof callback != 'undefined') callback(item);
				else return item;
				
			} else {
				alert('Item not found');
			}
		};
	};
	
	
	DoliDb.prototype.updateAllItem = function(storename, data) {
		
		var transaction = this.db.transaction(storename, "readwrite");
		var objectStore = transaction.objectStore(storename);
		
		// Get everything in the store;
		var keyRange = this.IDBKeyRange.lowerBound(0);
		var cursorRequest = objectStore.openCursor(keyRange);
		
		cursorRequest.onsuccess = function(event) {
			var result = event.target.result;
			
			if(result)
			{
				objectStore.delete(result.key);
				result.continue();
			}
			else
			{
				for (var i in data)
				{
					data[i] = DoliDb.prototype.prepareItem(storename, data[i]);
					objectStore.put(data[i]);
				}
			}
		};
		
		cursorRequest.oncomplete = function() {};
		cursorRequest.onerror = DoliDb.prototype.indexedDB.onerror;
		
	};
	
	DoliDb.prototype.prepareItem = function(storename, item) {
		switch (storename) {
			case 'product':
				break;
			case 'thirdparty':
				item.keyname = item.name.toLowerCase();
				break;
			case 'proposal':
				break;
		}
		
		return item;
	};
	
	DoliDb.prototype.close = function() {
		this.db.close();
	};
	
	DoliDb.prototype.dropDatabase = function() {
		this.close();
		var req = DoliDb.prototype.indexedDB.deleteDatabase(this.dbName);
		req.onsuccess = function () {
		    console.log("Deleted database successfully");
		    DoliDb.prototype.open();
		};
		req.onerror = function () {
		    console.log("Couldn't delete database");
		};
		req.onblocked = function () {
		    console.log("Couldn't delete database due to the operation being blocked");
		};
		
		
	};

};


/*

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

dolibarr.indexedDB.count = function(storename) {
	var db = dolibarr.indexedDB.db;
	  
	var transaction = db.transaction([storename], "readonly");
	var objectStore = transaction.objectStore(storename);
	var cursor = objectStore.openCursor();  
    var count = objectStore.count();
    
    return count;
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
*/