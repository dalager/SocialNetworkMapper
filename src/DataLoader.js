// Loading data from published google WORKSHEET with given id. NOT Spreadsheet id -> worksheet!

var FakeDataLoader = (function() {
	var load = function(id, cb) {
		var data = [{
				source: 'Hans',
				target: 'Roklub',
				active: "1",
				role: 'Medlem'
			}, {
				source: 'Per',
				target: 'Roklub',
				active: "1",
				role: 'Diretør'
			}, {
				source: 'Poul',
				target: 'Roklub',
				active: 0,
				role: 'Medlem'
			}, {
				source: 'Hans',
				target: 'Brugsforening',
				active: 0,
				role: 'Ansat'
			}, {
				source: 'Per',
				target: 'Skytteforening',
				active: "1",
				role: 'Medlem'
			}, {
				source: 'Frans',
				target: 'Skytteforening',
				active: "1",
				role: 'Medlem'
			}, {
				source: 'Frans',
				target: 'Brugsforening',
				active: "1",
				role: 'Bestyrer'
			},

		];

		cb(data);
	}
	return {
		load: load
	};
})();

var DataLoader = (function() {
	var load = function(id, cb) {
		Tabletop.init({
			key: id,
			callback: function(data, tabletop) {
				cb(data);
			},
			simpleSheet: true
		});
	};

	return {
		load: load
	};
})();