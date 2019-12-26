var boardcounter = 0;

function pgnify(obj) {
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

				styleclass = "merida ";
				styleclass += "zeit ";
				styleclass += "left";

				newstr = "<div id=\"board" + boardcounter + "\"";
				newstr +=  "class=\"" + styleclass + "\"></div>";
				element.innerHTML = element.innerHTML.replace(
					/\[pgn\][\s\S]*?\[\/pgn\]/im,
					newstr
				);

				config = {
					pgn: pgnstr,
					layout: 'left',
					showNotation: true,
					locale: 'en',
					showFen: true,
					coordsInner: false,
					headers: true,
					movesHeight: '400px'
				};
				pgnView('board' + boardcounter, config);
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

pgnify(document);

document.addEventListener('DOMNodeInserted', function (e) {
	if (!e) e = window.event;
	pgnify(e.target);
});
