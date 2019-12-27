var boardcounter = 0;

function recoverPgnString(pgnstr) {
	pgnstr = pgnstr.replace(/\[pgn\]|\[\/pgn\]/, '');
	pgnstr = pgnstr.replace(/\//g, "\/");

	if (pgnstr.length > 10) {
		// Filter all junk markup reddit might have added to the
		// move text.
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
	} else {
		// Game is too short to usefully display.
		pgnstr = ""
	}

	return pgnstr;
}

function stripCountryCode(lang) {
	return lang.replace(/[-_][a-z][a-z].*$/, '');
}

function injectBoard(element, config, pgnstr) {
	let myboardid = "board" + boardcounter;
	boardcounter++;

	let boarddiv = "<div id=\"" + myboardid + "\"";
	boarddiv += " width=\"100%\"></div>";

	// Inject the board div exactly where the [pgn] tags were.
	// As we need to inject in the middle of a textual node,
	// we prefer innerHTML over DOM manipulation. The text we
	// inject is fully controlled by us (constructed above).
	element.innerHTML = element.innerHTML.replace(
		/\[pgn\][\s\S]*?\[\/pgn\]/im,
		boarddiv
	);

	// Calculate the configuation for PgnViewerJS
	let width = config.boardsize + "px";
	let movesWidth = "calc(100% - "
		+ (parseInt(config.boardsize) + 65) + "px)";
	let movesHeight = (parseInt(config.boardsize) + 100) + "px";

	// Find if we have a matching locale
	let pgnLocale = "en";
	let haveLocales = ["cs", "da", "de", "dev", "en", "es", "et",
		"fi", "fr", "hu", "is", "it", "nb", "nl", "pl", "pt", "ro", "sv"];
	let gettingAcceptLanguages = browser.i18n.getAcceptLanguages();
	gettingAcceptLanguages.then(function (locales) {
		for (const locale of locales) {
			let baseLocale = stripCountryCode(locale);
			if (haveLocales.includes(baseLocale)) {
				pgnLocale = baseLocale;
				break;
			}
		}
		let pgnViewConfig = {
			pgn: pgnstr,
			pieceStyle: config.piecetheme,
			theme: config.boardtheme,
			layout: 'left',
			showNotation: true,
			locale: pgnLocale,
			showFen: true,
			coordsInner: false,
			headers: true,
			movesHeight: movesHeight,
			width: width,
			movesWidth: movesWidth
		};
		pgnView(myboardid, pgnViewConfig);
	});
}

function pgnify(obj, config) {
	if (!("querySelectorAll" in obj)) {
		return;
	}
	var elements = obj.querySelectorAll('.usertext-body, .Post, .Comment');
	Array.prototype.forEach.call(elements, function (element, _i) {
		let text = element.innerHTML;

		let start = text.indexOf('[pgn]');
		let end = text.indexOf('[/pgn]');

		while (start > -1 && end > -1) {
			let pgnjunk = text.substring(start + 5, end);
			let pgnstr = recoverPgnString(pgnjunk);

			if (pgnstr) {
				injectBoard(element, config, pgnstr);
			}

			// Skip over processed text.
			text = text.substring(end + 5);
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
	let observer = new MutationObserver(function (mutations) {
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

let getting = browser.storage.local.get({
	piecetheme: "wikipedia",
	boardtheme: "blue",
	boardsize: 300
});
getting.then(onGot, null);