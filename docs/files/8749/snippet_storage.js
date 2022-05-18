var SnippetStorage = (function () {
	
	var STORAGE_KEY = "snippets";
	
	function readAndUpdateOrRemove(key) {
		if (!key) {
			log.info('Key not provided');
			return null;
		}
		
		var item = localStorage.getItem(STORAGE_KEY);
		if (!item) {
			log.info('No item found from the local storage for ' + STORAGE_KEY);
			return null;
		}
		
		var snippetItem = JSON.parse(item);
		if (!snippetItem) {
			log.info('Snippets not parsed.');
			return null;
		}
		log.info('Snippet items:', snippetItem);
		
		var snippet = snippetItem[key];
		if (!snippet) {
			log.info('Snippets not found for key ' + key);
			return null;
		}
		
		if (!snippet.hasOwnProperty('available_until')) {
			log.info('Snippet item does not have property available_until', snippet);
			remove(key);
			return null;
		}

		if (Date.now() > snippet.available_until) {
			log.info('Snippet item expired', snippet);
			remove(key);
			return null;
		}
		
		createOrUpdate(key, snippet);
		return snippet;
	}
	
	function createOrUpdate(key, value) {
		if (!key || !value) {
			log.info("Invalid key: " + key + " or invalid value: " + value);
			return;
		}
		
		var snippetItem = {};
		var item = localStorage.getItem(STORAGE_KEY);
		if (item) {
			snippetItem = JSON.parse(item);
		}
		
		value.available_until = Date.now() + 10 * 60 * 1000; // 10 mins
		snippetItem[key] = value;
		
		log.info("Updated snippets: ", snippetItem);
		
		localStorage.setItem(STORAGE_KEY, JSON.stringify(snippetItem));
	}
	
	function remove(key) {
		var item = localStorage.getItem(STORAGE_KEY);
		if (!item) {
			return;
		}
		
		var snippetItem = JSON.parse(item);
		if (!snippetItem) {
			return;
		}
		
		if(snippetItem.hasOwnProperty(key)) {
			delete snippetItem[key];			
			localStorage.setItem(STORAGE_KEY, JSON.stringify(snippetItem));
			log.info("Snippets removed for key: " + key);
		}
	}
	
	function getKey(src, extId) {
		if (!src || !extId) {
			return null;
		}
		
		var key = (src + '-' + extId).toLowerCase();
		log.info("Key constructed: " + key);
		return key;
	}
	
	function getKeyByUrl(abstractUrl) {
		log.info('abstractUrl: ' + abstractUrl);
		if (!abstractUrl) {
			log.info("Empty abstractUrl: " + abstractUrl);
			return null;
		}
		
		abstractUrl = abstractUrl.replace(/\;.+/, "");
		log.info('abstractUrl updated: ' + abstractUrl);
		
		var matched = abstractUrl.match(/(abstract|patents|scanned|guidelines|theses)\/(.+)\/(.+)/m);
		if (!matched) {
			log.info("Key cannot be generated for URL: " + abstractUrl);
			return null;
		}
		
		return getKey(matched[2], matched[3]);
	}
	
	/*
	 * Read snippets by a given abstract URL
	 * 
	 * Every time a record is read, if it is expired, it will be removed; 
	 * otherwise, its timestamp will be renewed, and will be valid for another ten minutes.
	 *  
	 * Parameters:
	 * 		abstractUrl: /abstract/MED/28494221
	 */
	function readByUrl(abstractUrl) {
		var key = getKeyByUrl(abstractUrl);
		log.info('Key: ' + key);
		
		if (!key) {
			return null;
		}
		
		return readAndUpdateOrRemove(key);
	}
	
	/*
	 * Update snippets by a given abstract URL.
	 * 
	 * Every time a record is updated/inserted, its timestamp will be updated accordingly.
	 * Every record will only be valid for ten minutes.
	 * 
	 * Parameters:
	 * 		abstractUrl: /abstract/MED/28494221
	 */
	function upsertByUrl(abstractUrl, value) {
		var key = getKeyByUrl(abstractUrl);
		if (!key || !value) {
			log.info("Invalid key: " + key + " or invalid value: " + value);
			return;
		}
		
		createOrUpdate(key, value);
	}
	
	function removeIt(src, extId) {
		var key = getKey(src, extId);
		if (!key) {
			return;
		}
		
		remove(key);
	}

	return {
		readByUrl: readByUrl,
		upsertByUrl: upsertByUrl
	}
})();