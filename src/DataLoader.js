// Loading data from published google WORKSHEET with given id. NOT Spreadsheet id -> worksheet!

var FakeDataLoader = (function(){
	var load = function(id,cb){
		var data = [
			{source:'Hans',target:'Roklub',active:1,role:'Medlem'},
			{source:'Per',target:'Roklub',active:1,role:'Diretør'},
			{source:'Poul',target:'Roklub',active:0,role:'Medlem'},
			{source:'Hans',target:'Brugsforening',active:0,role:'Ansat'},
			{source:'Per',target:'Skytteforening',active:1,role:'Medlem'},
			{source:'Frans',target:'Skytteforening',active:1,role:'Medlem'},
			{source:'Frans',target:'Brugsforening',active:1,role:'Bestyrer'},

		];

		cb(data);
	}
	return {load:load};
})();
var DataLoader = (function() {
	var load = function(id, cb) {
		return $.ajax('https://spreadsheets.google.com/feeds/list/' + id + '/od6/public/basic?alt=json', {
			type: 'GET'
		}).done(function(data) {
			var entries = data.feed.entry.map(function(entry) {
				var navn = entry.title.$t;
				var content = entry.content.$t;
				var org = content.split(',')[0].split(':')[1].trim();
				var active = 1;
				if (content.split(',')[1]) {
					var activebit = content.split(',')[1].split(':')[1];
					if (activebit) {
						active = parseInt(activebit.trim());
					}
				}
				var role="";
				if (content.split(',')[2]) {
					role = content.split(',')[2].split(':')[1];
					if (role) {
						role = role.trim();
					}
				}

				var orgtype = "";
				if (content.split(',')[3]) {
				    orgtype = content.split(',')[3].split(':')[1];
				    if (orgtype) {
				        orgtype = orgtype.trim();
				    }
				}


				return {
					source: navn,
					target: org,
					active: active,
					role: role,
                    orgtype:orgtype
				}
			});

			cb(entries);
		});
	};

	return {
		load: load
	};

})();
