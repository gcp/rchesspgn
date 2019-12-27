var boardcounter = 0;

function pgnify(obj, config) {
	var elements = obj.querySelectorAll('.usertext-body, .Post, .Comment');
	Array.prototype.forEach.call(elements, function (element, _i) {
		let text = element.innerHTML;

		let start = text.indexOf('[pgn]');
		let end = text.indexOf('[/pgn]');

		// todo: find out why only the last board works if multiple pgn tags.
		while (start > -1 && end > -1) {
			var pgnstr = text.substring(start + 5, end);
			pgnstr = pgnstr.replace(/\[pgn\]|\[\/pgn\]/, '');
			pgnstr = pgnstr.replace(/\//g, "\/");

			if (pgnstr.length > 10) {
				pgnstr = pgnstr.replace(/<ol>\s<li>/g, '1.');
				let li = pgnstr.search(/<\/li>[\s\S]*<li>/);

				while (li && li != -1) {
					let fragment = pgnstr.substring(0, li);
					let lastdot = fragment.lastIndexOf('.');
					let ffragment = fragment.substring(lastdot - 15, lastdot);
					let tempfrag = '';
					let num = NaN;

					while (isNaN(num)) {
						let spacecheck = ffragment.length - 1;
						while (/\S/.test(ffragment.charAt(spacecheck))) {
							spacecheck--;
						}
						num = parseInt(ffragment.substr(spacecheck)) + 1;

						tempfrag = fragment.substr(0, lastdot - 3);
						lastdot = tempfrag.lastIndexOf('.');
						ffragment = tempfrag.substring(lastdot - 15, lastdot);
					}
					pgnstr = pgnstr.replace(/<\/li>[\s\S]<li>/, ' ' + num + '.');

					li = pgnstr.search(/<\/li>[\s\S]<li>/);
				}

				pgnstr = pgnstr.replace(/<\/?[^>]+(>|$)/g, "");
				pgnstr = pgnstr.trim();

				newstr = "<div id=\"board" + boardcounter + "\"";
				newstr += " width=\"100%\"></div>";
				element.innerHTML = element.innerHTML.replace(
					/\[pgn\][\s\S]*?\[\/pgn\]/im,
					newstr
				);

				let width = config.boardsize + "px";
				let movesWidth = "calc(100% - "
					+ (parseInt(config.boardsize) + 65) + "px)";
				let movesHeight = (parseInt(config.boardsize) + 100) + "px";

				pgnViewConfig = {
					pgn: pgnstr,
					pieceStyle: config.piecetheme,
					theme: config.boardtheme,
					layout: 'left',
					showNotation: true,
					locale: 'en',
					showFen: true,
					coordsInner: false,
					headers: true,
					movesHeight: movesHeight,
					width: width,
					movesWidth: movesWidth
				};
				pgnView('board' + boardcounter, pgnViewConfig);
				boardcounter++;
			} else {
				element.innerHTML = element.innerHTML.replace(/\[pgn\][\s\S]*?\[\/pgn\]/im, "[ pgn]" + pgnstr + "[ /pgn] (sans spaces)");
			}

			text = element.innerHTML;
			start = text.indexOf('[pgn]');
			end = text.indexOf('[/pgn]');
		}
	});
}

function onGot(item) {
	let config = {
		piecetheme: item.piecetheme,
		boardtheme: item.boardtheme,
		boardsize: item.boardsize
	};
	pgnify(document, config);

	// Watch for anything added dynamically so we can add
	// the board there as well.
	var observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			let nodes = Array.prototype.slice.call(mutation.addedNodes);
			nodes.forEach(function (node) {
				pgnify(node, config);
			});
		});
	});
	observer.observe(document, {
		childList: true,
		subtree: true,
		attributes: false,
		characterData: false,
	});
}

let getting = browser.storage.sync.get({
	piecetheme: "wikipedia",
	boardtheme: "blue",
	boardsize: 300
});
getting.then(onGot, null);