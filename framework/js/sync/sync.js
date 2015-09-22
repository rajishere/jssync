(function($){
	function parseBool(val)
	{
	    if ((typeof val === 'string' && (val.toLowerCase() === 'true' || val.toLowerCase() === 'yes')) || val === 1)
	        return true;
	    else if ((typeof val === 'string' && (val.toLowerCase() === 'false' || val.toLowerCase() === 'no')) || val === 0)
	        return false;

    	return null;
	}

	function guid() {
  		function s4() {
    		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  		}
  		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}

	window.sync = {
		constants:{
			rootLink : 'api/db.php'
		}
	};

	window.sync.isOnline = function(){
// 		return false;
		return window.checknet.conIsActive;
	}

	window.sync.linkUtils = {
		linkForFetchWithObjectName : function(objectName){
			var data = {
				action: "fetch",
				object: objectName
			};
			return window.sync.constants.rootLink + "?data=" + JSON.stringify(data);
		},
		linkForFetchWithObjectNameAndClause : function(objectName, clause){
			var data = {
				action: "fetch",
				object: objectName,
				where: clause
			};
			return window.sync.constants.rootLink + "?data=" + JSON.stringify(data);
		},
		linkForFetchWithObjectNameAndClauseAndIncludeDeleted : function(objectName, clause){
			var data = {
				action: "fetch",
				object: objectName,
				where: clause,
				includeDeleted: 'true'
			};
			return window.sync.constants.rootLink + "?data=" + JSON.stringify(data);
		},
		linkForInsertWithObjectNameAndDataString : function(objectName, dataString){
			var data = {
				action: "insert",
				object: objectName,
				values: dataString
			};
			return window.sync.constants.rootLink + "?data=" + JSON.stringify(data);
		},
		linkForUpdateWithObjectNameAndDataAndClause : function(objectName, dataString, clause){
			var data = {
				action: "update",
				object: objectName,
				values: dataString,
				where: clause
			};
			return window.sync.constants.rootLink + "?data=" + JSON.stringify(data);
		},
		linkForDeleteWithObjectNameAndGuid : function(objectName, guid){
			var data = {
				action: "delete",
				object: objectName,
				guid: guid
			};
			return window.sync.constants.rootLink + "?data=" + JSON.stringify(data);
		}
	};

	window.sync.config = {};
    window.sync.config.tables = {
		users : {
			email : "",
			password: ""
		},
        // include table formats like one below
		test : {
			dataOne: "",
			dateTwo: ""
		},
	};
	window.sync.config.syncPeriod = 60 * 15;

	// localStorage
	window.sync.checkTableName = function (tableName){
		if(tableName == "" || tableName == null || tableName == 'undefined'){
			console.log('improper tableName supplied');
			return false;
		}
		return true;
	}

	// Remote

	window.sync.checkForErrorAndReturn = function (data, successCallback, failureCallback){
		var remoteData = JSON.parse(data);
		if(remoteData && remoteData.error && remoteData.error.code > 0){
			// remote returned error
			failureCallback(JSON.stringify(remoteData.error));
		}
		else{
			successCallback(data);
		}
	}

	function handleRemoteLinkForFetch(remoteLink, successCallback, failureCallback){
		return $.get(remoteLink, function(data){
				window.sync.checkForErrorAndReturn(data, successCallback, failureCallback);
			}).done(function() {
    			// do nothing
  			}).fail(failureCallback).always(function() {
    			// do nothing
  			});
	}

	window.sync.fetchAllDataFromRemote = function (tableName, successCallback, failureCallback){
		var remoteLink = window.sync.linkUtils.linkForFetchWithObjectName(tableName);
		return handleRemoteLinkForFetch(remoteLink, successCallback, failureCallback);
	}

	window.sync.fetchAllDataFromRemoteWithClause = function (tableName, where, successCallback, failureCallback){
		var remoteLink = window.sync.linkUtils.linkForFetchWithObjectNameAndClause(tableName, clause);
		return handleRemoteLinkForFetch(remoteLink, successCallback, failureCallback);
	}

	window.sync.fetchAllDataFromRemoteWithClauseAndIncludeDeleted = function (tableName, where, successCallback, failureCallback){
		var remoteLink = window.sync.linkUtils.linkForFetchWithObjectNameAndClauseAndIncludeDeleted(tableName, where);
		return handleRemoteLinkForFetch(remoteLink, successCallback, failureCallback);
	}

	window.sync.insertRowIntoRemote = function(tableName, dataString, successCallback, failureCallback){
		var remoteLink = window.sync.linkUtils.linkForInsertWithObjectNameAndDataString(tableName, dataString);
		return $.get(remoteLink, function(data){
				window.sync.checkForErrorAndReturn(data, function(insertedObjectData){
						var returnData = JSON.parse(insertedObjectData);
						var insertedObjectString = JSON.stringify(returnData[0]);
						successCallback(insertedObjectString);
					}, failureCallback);
			}).done(function() {
    			// do nothing
  			}).fail(failureCallback).always(function() {
    			// do nothing
  			});
	}

	window.sync.updateRowIntoRemote = function(tableName, dataString, clause, successCallback, failureCallback){
		var remoteLink = window.sync.linkUtils.linkForUpdateWithObjectNameAndDataAndClause(tableName, dataString, clause);
		return $.get(remoteLink, function(data){
				window.sync.checkForErrorAndReturn(data, function(updatedObjectData){
						var returnData = JSON.parse(updatedObjectData);
						var updatedObjectString = JSON.stringify(returnData[0]);
						successCallback(updatedObjectString);
					}, failureCallback);
			}).done(function() {
    			// do nothing
  			}).fail(failureCallback).always(function() {
    			// do nothing
  			});
	}

	window.sync.deleteRowInRemote = function(tableName, guid, successCallback, failureCallback){
		var remoteLink = window.sync.linkUtils.linkForDeleteWithObjectNameAndGuid(tableName, guid);
		return $.get(remoteLink, function(data){
				window.sync.checkForErrorAndReturn(data, function(deleteData){
						var returnData = JSON.parse(deleteData);
						if(returnData.status.code == 1){
							successCallback(deleteData);
						}
						else{
							// something went wrong, error for now
							failureCallback(deleteData);
						}
					}, failureCallback);
			}).done(function() {
    			// do nothing
  			}).fail(failureCallback).always(function() {
    			// do nothing
  			});
	}

	// Local

	window.sync.saveAllTableDataToLocalStore = function(tableName, allData){
		if(!window.sync.checkTableName(tableName)){
			return;
		}

		localStorage.setItem('tables.' + tableName, '');
		localStorage.setItem('tables.' + tableName, allData);
	}

	window.sync.fetchFromLocalStoreWithGuid = function(tableName, guid){
		var allDataString = window.sync.fetchAllDataFromLocalStore(tableName);
		var allData = JSON.parse(allDataString);

		for(var i = 0; i < allData.length; i++){
			var entry = allData[i];
			if(entry.guid == guid){
				return JSON.stringify(entry);
			}
		}
		return;
	};

	window.sync.fetchAllDataFromLocalStore = function(tableName){
		if(!window.sync.checkTableName(tableName)){
			return;
		}

		return localStorage.getItem('tables.' + tableName);
	};

	window.sync.insertToLocalStore = function (tableName, insertData, successCallback, isInsert){
		var effectedObject;
		var allDataString = window.sync.fetchAllDataFromLocalStore(tableName);
		var allData = JSON.parse(allDataString);
		if(!allData){
			allData = [];
		}
		var rowObject = JSON.parse(insertData);
		if(isInsert){
			rowObject.isInsert = isInsert;
			rowObject.externalId = guid();
			effectedObject = rowObject;
			allData.push(rowObject);
			allDataString = JSON.stringify(allData);
		}
		else if(rowObject.isInsert){
			var newData = [];
			for(var i = 0; i < allData.length; i++){
				var entry = allData[i];
				if(entry.externalId == rowObject.externalId){
					delete rowObject.isInsert;
					delete rowObject.externalId;
					effectedObject = rowObject;
					newData.push(rowObject);
				}
				else{
					newData.push(entry);
				}
			}
			allDataString = JSON.stringify(newData);
		}
		else{
			effectedObject = rowObject;
			allData.push(rowObject);
			allDataString = JSON.stringify(allData);
		}
		window.sync.saveAllTableDataToLocalStore(tableName, allDataString);
		successCallback && successCallback(effectedObject);
	}

	function mapPropertiesFromAtoB(a, b){
		for (var property in a) {
			if (a.hasOwnProperty(property)) {
				// do stuff
				b[property+''] = a[property+''];
			}
		}
		return b;
	}

	window.sync.updateToLocalStore = function (tableName, updateDataString, guid, successCallback, isUpdate){
		var effectedObject;
		var allDataString = window.sync.fetchAllDataFromLocalStore(tableName);
		var allData = JSON.parse(allDataString);
		var updateData = JSON.parse(updateDataString);
		var updatedAllData = [];

		for(var i = 0; i < allData.length; i++){
			var entry = allData[i];
			if((guid == null || guid == undefined || guid.length == 0) && entry.externalId == updateData.externalId){
				// local insert
				effectedObject = entry;
				mapPropertiesFromAtoB(updateData, entry);
			}
			else if(entry.guid == guid){
				effectedObject = entry;
				if(isUpdate){
					entry.isUpdate = isUpdate;
					entry.updateData = updateDataString;
				}
				else{
					delete entry.isUpdate;
					delete entry.updateData;
					mapPropertiesFromAtoB(updateData, entry);
				}
			}
			updatedAllData.push(entry);
		}
		
		allDataString = JSON.stringify(updatedAllData);
		window.sync.saveAllTableDataToLocalStore(tableName, allDataString);
		successCallback && successCallback(effectedObject);
	}

	window.sync.deleteFromLocalStore = function (tableName, entryString, successCallback, remove){
		var entryToBeDeleted = JSON.parse(entryString);
		var guid = entryToBeDeleted.guid;
		var allDataString = window.sync.fetchAllDataFromLocalStore(tableName);
		var allData = JSON.parse(allDataString);
		var updatedAllData = [];
		for(var i = 0; i < allData.length; i++){
			var entry = allData[i];
			if((guid == null || guid == undefined || guid.length == 0) && entry.externalId == entryToBeDeleted.externalId){
				// local insert, no need to sync to server, remove
				continue;
			}
			else if(entry.guid == guid){
				if(remove){
					continue;
				}
				else{
					entry.isDeleted = 'true';
				}
			}
			updatedAllData.push(entry);
		}
		allDataString = JSON.stringify(updatedAllData);
		window.sync.saveAllTableDataToLocalStore(tableName, allDataString);
		successCallback && successCallback();
	}

	window.sync.upsertRowFromRemoteToLocal = function(tableName, rowString, successCallback, failureCallback){
		var rowData = JSON.parse(rowString);
		var guid = rowData.guid;
		var entry = window.sync.fetchFromLocalStoreWithGuid(tableName, guid);
		if(entry){
			window.sync.updateToLocalStore(tableName, rowString, guid, successCallback);
		}
		else{
			window.sync.insertToLocalStore(tableName, rowString, successCallback);
		}
	}

	window.sync.insertRow = function(tableName, rowString, successCallback, failureCallback){
		var rowData = JSON.parse(rowString);
		var externalId = rowData.externalId;
		var isInsert = rowData.isInsert;

		if(!window.sync.checkTableName(tableName)){
			return;
		}
			
		function onRemoteInsert(insertedObjectData){
			if(rowData.isInsert){
				var insertedObject = JSON.parse(insertedObjectData);
				insertedObject.isInsert = rowData.isInsert;
				insertedObject.externalId = rowData.externalId;
				insertedObjectData = JSON.stringify(insertedObject);
			}
			window.sync.insertToLocalStore(tableName, insertedObjectData, successCallback);
		}

		function onRemoteInsertError(errorData){
			failureCallback(errorData);
		}

		if(window.sync.isOnline()){
			// Shallow copy
			var insertData = jQuery.extend({}, rowData);
			delete insertData.isInsert;
			delete insertData.externalId;
			window.sync.insertRowIntoRemote(tableName, JSON.stringify(insertData), onRemoteInsert, onRemoteInsertError);
		}
		else{
			window.sync.insertToLocalStore(tableName, rowString, successCallback, true);
		}	
		
	}

	window.sync.updateRow = function(tableName, rowString, guid, successCallback, failureCallback){
		var rowData = JSON.parse(rowString);

		if(!window.sync.checkTableName(tableName)){
			return;
		}
			
		function onRemoteUpdate(updatedObjectData){
			var updatedObject = JSON.parse(updatedObjectData);
			window.sync.updateToLocalStore(tableName, updatedObjectData, updatedObject.guid, successCallback);
		}

		function onRemoteUpdateError(errorData){
			failureCallback(errorData);
		}

		if(window.sync.isOnline()){
			var updateDataString = JSON.stringify(mapPropertiesFromAtoB(rowData.updateData, rowData));
			var where = "guid=\'" + guid + "\'";
			window.sync.updateRowIntoRemote(tableName, updateDataString, where, onRemoteUpdate, onRemoteUpdateError);
		}
		else{
			window.sync.updateToLocalStore(tableName, rowString, guid, successCallback, true);
		}	
		
	}

	window.sync.deleteRow = function(tableName, entryString, successCallback, failureCallback){
		var entry = JSON.parse(entryString);
		var guid = entry.guid;
		if(!window.sync.checkTableName(tableName)){
			return;
		}
		
		function onRemoteDelete(insertedObjectData){
			window.sync.deleteFromLocalStore(tableName, insertedObjectData, successCallback, true);
		}

		function onRemoteDeleteError(errorData){
			// Some error set as isDeleted true for now
			failureCallback(errorData);
		}

		if(window.sync.isOnline()){
			window.sync.deleteRowInRemote(tableName, guid, onRemoteDelete, onRemoteDeleteError);
		}
		else{
			window.sync.deleteFromLocalStore(tableName, entryString, successCallback);
		}	
		
	}
	
	window.sync.isSyncing = false;

	window.sync.clearLastSyncedDatetime = function(){
		delete localStorage.lastSyncedDatetime;
	}

	window.sync.refreshLastSyncedDatetime = function(){
		var now = new Date(); 
		var syncTime = JSON.stringify(Math.floor(now.getTime()/ 1000));
		localStorage.setItem('lastSyncedDatetime',syncTime);
	}

	window.sync.lastSyncedDatetime = function(){
		if(localStorage.getItem('lastSyncedDatetime')){
			return localStorage.getItem('lastSyncedDatetime');
		}
		
		window.sync.refreshLastSyncedDatetime();
		return localStorage.getItem('lastSyncedDatetime');
	}

	window.sync.calculateToBeSynced = function(successCallback, failureCallback){
		var tables = [];
		var stats = {
			inserted:0,
			updated:0,
			deleted:0
		}
		jQuery.each(window.sync.config.tables, function(k, v){
			tables.push(k);
		});
		parseTablesForSyncCalculation(tables, 0, stats, function(){
			if(successCallback){
				successCallback(stats);
			}
		}, function(errorData){
			// sync error
			if(failureCallback){
				failureCallback(errorData);
			}
		});
	}

	window.sync.syncNow = function(successCallback, failureCallback, calculate){
		if(!window.sync.isSyncing){
			window.sync.isSyncing = true;

			if(!window.sync.isOnline()){
				alert('Looks like you are offline, not syncing');
				window.sync.isSyncing = false;
			}
			else{
				var tables = [];
				jQuery.each(window.sync.config.tables, function(k, v){
					tables.push(k);
				});
// 				for (var property in window.sync.config.tables) {
//     				if (window.sync.config.tables.hasOwnProperty(property)) {
//         					// do stuff
//         				tables.push(property);
//     				}
// 				}
				parseTablesForSync(tables, 0, function(){
					window.sync.isSyncing = false;
					// sync success
					if(successCallback){
						successCallback();
					}
					else{
						alert('sync complete');
					}
				}, function(errorData){
					window.sync.isSyncing = false;
					// sync error
					if(failureCallback){
						failureCallback(errorData);
					}
					else{
						alert('error: ' + JSON.stringify(errorData));
					}
				});
			}
		}
		else{
			console.log('sync already in progress, ignoring call');
		}
	}

	function parseTablesForSync(tables, presentIndex, successCallback, failureCallback){
		if(presentIndex >= tables.length){
			successCallback();
			return;
		}
		// Delete all from local to server
		var tableName = tables[presentIndex];
		var tableDataString = window.sync.fetchAllDataFromLocalStore(tableName);
		if(tableDataString){
			var tableData = JSON.parse(tableDataString);			
			checkTableDataForLocalToRemoteChanges(tableName, tableData, 0, function(){
				fetchTableDataForRemoteToLocalChanges(tableName, function(){
					parseTablesForSync(tables, presentIndex+1, successCallback, failureCallback);
				}, failureCallback);
			}, failureCallback);
		}
		else{
			parseTablesForSync(tables, presentIndex+1, successCallback, failureCallback);
		}
	}

	function parseTablesForSyncCalculation(tables, presentIndex, stats, successCallback, failureCallback){
		if(presentIndex >= tables.length){
			successCallback();
			return;
		}
		// Delete all from local to server
		var tableName = tables[presentIndex];
		var tableDataString = window.sync.fetchAllDataFromLocalStore(tableName);
		if(tableDataString){
			var tableData = JSON.parse(tableDataString);			
			calculateTableDataForLocalToRemoteChanges(tableName, tableData, stats, 0, function(){
				parseTablesForSyncCalculation(tables, presentIndex + 1, stats, successCallback, failureCallback);
			}, failureCallback);
		}
		else{
			parseTablesForSyncCalculation(tables, presentIndex + 1, stats, successCallback, failureCallback);
		}
	}

	var fetchTableDataForRemoteToLocalChanges = function(tableName, successCallback, failureCallback){
		var where = "lastModifiedDatetime >= " + window.sync.lastSyncedDatetime();
		window.sync.fetchAllDataFromRemoteWithClauseAndIncludeDeleted(tableName, where, function(tableData){
			var tableData = JSON.parse(tableData);
			checkTableDataForRemoteToLocalChanges(tableName, tableData, 0, successCallback, failureCallback);
		}, failureCallback);
	}

	function checkTableDataForRemoteToLocalChanges(tableName, tableData, presentIndex, successCallback, failureCallback){
		if(presentIndex >= tableData.length){
			successCallback();
			return;
		}
		var entry = tableData[presentIndex];
		if(parseBool(entry.isDeleted)){
			window.sync.deleteFromLocalStore(tableName, JSON.stringify(entry), function(){
				checkTableDataForRemoteToLocalChanges(tableName, tableData, presentIndex+1, successCallback, failureCallback);
			}, true);
		}
		else{
			window.sync.upsertRowFromRemoteToLocal(tableName, JSON.stringify(entry), function(data){
				checkTableDataForRemoteToLocalChanges(tableName, tableData, presentIndex+1, successCallback, failureCallback);
			}, function(errorData){
				checkTableDataForRemoteToLocalChanges(tableName, tableData, presentIndex+1, successCallback, failureCallback);
			});
		}
	}

	function checkTableDataForLocalToRemoteChanges(tableName, tableData, presentIndex, successCallback, failureCallback){
		if(presentIndex >= tableData.length){
			successCallback();
			return;
		}
		var entry = tableData[presentIndex];
		if(parseBool(entry.isDeleted)){
			window.sync.deleteRow(tableName, JSON.stringify(entry), function(){
					checkTableDataForLocalToRemoteChanges(tableName, tableData, presentIndex+1, successCallback, failureCallback);
				}, failureCallback);
		}
		else if(entry.isInsert){
			// do inserts
			window.sync.insertRow(tableName, JSON.stringify(entry), function(insertedObjectString){
				checkTableDataForLocalToRemoteChanges(tableName, tableData, presentIndex+1, successCallback, failureCallback);
			}, function(errorData){
				checkTableDataForLocalToRemoteChanges(tableName, tableData, presentIndex+1, successCallback, failureCallback);
			});
		}
		else if(entry.isUpdate){
			// do updates
			window.sync.updateRow(tableName, entry.updateData, entry.guid, function(updatedObjectString){
				checkTableDataForLocalToRemoteChanges(tableName, tableData, presentIndex+1, successCallback, failureCallback);
			}, function(errorData){
				checkTableDataForLocalToRemoteChanges(tableName, tableData, presentIndex+1, successCallback, failureCallback);
			});
		}
		else{
			checkTableDataForLocalToRemoteChanges(tableName, tableData, presentIndex+1, successCallback, failureCallback);
		}
	}

	function calculateTableDataForLocalToRemoteChanges(tableName, tableData, stats, presentIndex, successCallback, failureCallback){
		if(presentIndex >= tableData.length){
			successCallback();
			return;
		}
		var entry = tableData[presentIndex];
		if(parseBool(entry.isDeleted)){
			stats.deleted += 1
			calculateTableDataForLocalToRemoteChanges(tableName, tableData, stats, presentIndex+1, successCallback, failureCallback);
		}
		else if(entry.isInsert){
			// do inserts
			stats.inserted +=1;
			calculateTableDataForLocalToRemoteChanges(tableName, tableData, stats, presentIndex+1, successCallback, failureCallback);
		}
		else if(entry.isUpdate){
			// do updates
			stats.updated +=1;
			calculateTableDataForLocalToRemoteChanges(tableName, tableData, stats, presentIndex+1, successCallback, failureCallback);
		}
		else{
			calculateTableDataForLocalToRemoteChanges(tableName, tableData, stats, presentIndex+1, successCallback, failureCallback);
		}
	}
	
	$( document ).ready(function() {
		// setup util for internet connectivity
		$.fn.checknet();

		// load all data from server into localStorage or show hands up
		if(typeof(Storage) !== "undefined") {
			// Code for localStorage/sessionStorage.
			if(!localStorage.lastSyncedDatetime){
				window.sync.loadAllData();
			}
			
		} else {
			alert('Application needs latest browser to work');
    		// Sorry! No Web Storage support..
		}
	});

	window.sync.loadAllData = function (successCallback){
		var i = 0;
		jQuery.each(window.sync.config.tables, function(k, v){
			i++;
			window.sync.fetchAllDataFromRemote(k, function(allData){
				window.sync.saveAllTableDataToLocalStore(k, allData);
			}, function(errorData){
				console.log(errorData);
			}).always(function() {
    			i--;
    			if(i == 0){
    				console.log('loaded all data');
    				if(successCallback){
    					successCallback();
    				}
    			}
  			});
		});
	}
})(jQuery);