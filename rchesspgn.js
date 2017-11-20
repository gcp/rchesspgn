var numboards = 0;

function pgnify(obj) {
	$(obj).find('.usertext-body').each(function(){
		var text = this.innerHTML;
		
		var start = text.indexOf('[pgn]');
		var end = text.indexOf('[/pgn]');
		
		var lasttag;

    //todo: find out why only the last board works if multiple pgn tags.
		while (start > -1 && end > -1){
			var id = 'rchess'+numboards++;
			var pgnstr = text.substring(start+5, end);
			pgnstr = pgnstr.replace(/\[pgn\]|\[\/pgn\]/, '');
			pgnstr = pgnstr.replace(/\//g, "\/");

			if (pgnstr.length > 10){
				pgnstr = pgnstr.replace(/<ol>\s<li>/g, '1.');
				var li = pgnstr.search(/<\/li>[\s\S]*<li>/);

				while(li && li!= -1){
					var fragment = pgnstr.substring(0, li);
					var lastdot = fragment.lastIndexOf('.');
					var ffragment = fragment.substring(lastdot-15, lastdot);
					var tempfrag = '';
					var num = NaN;

					while (isNaN(num)){
						var spacecheck = ffragment.length-1;
            while (/\S/.test(ffragment.charAt(spacecheck))) {
							spacecheck--;
						}
						num = parseInt(ffragment.substr(spacecheck))+1;

						tempfrag = fragment.substr(0, lastdot-3);
						lastdot = tempfrag.lastIndexOf('.');
						ffragment = tempfrag.substring(lastdot-15, lastdot);
					}
					pgnstr = pgnstr.replace(/<\/li>[\s\S]<li>/, ' '+num+'.');

					li = pgnstr.search(/<\/li>[\s\S]<li>/);
				}

				this.innerHTML = this.innerHTML.replace(
					///\[pgn\][\s\S]*\[\/pgn\]/gim, 
					/\[pgn\][\s\S]*?\[\/pgn\]/im, 
					"<div><div><b><span id='"+id+"-whitePlayer'></span><span id='"+id+"-whiteElo'></span><span id='"+id+"-dash'></span><span id='"+id+"-blackPlayer'></span><span id='"+id+"-blackElo'></span></b></div><div id='"+id+"-container'></div>" +"<div id='"+id+"-moves' class='rchess-moves'></div></div><div style='clear:both; padding-bottom:5px'></div>"
				);

				pgnstr = pgnstr.replace(/<\/?[^>]+(>|$)/g, "");
				pgnstr = $.trim(pgnstr);

				var viewer = new PgnViewer({
					'boardName': id,
					'pgnString': pgnstr,
					'pieceSet' : 'merida',
					'pieceSize': 35,
					'loadImmediately': true,
					'moveAnimationLength': 0.3,
					'newlineForEachMainMove': true,
					'movesFormat': 'main_on_own_line',
					'autoScrollMoves': true,
					//'showCoordinates': true,
				}, function(){
					$('.ct-back, .ct-forward, .ct-start, .ct-end, .ct-play, .ct-stop').css('display', 'inline');
					$($('#'+id+'-moves').children()[0]).remove();
				});

				if ($('#'+id+'-whitePlayer')[0].innerHTML.length){
					$('#'+id+'-dash')[0].innerHTML = ' - ';

          ////todo:find out why this sometimes doesn't add brackets. See coloradosherrif test 01/06/13. I think that's part of the pgnviewer code. Might want to just use a space instead.
					//ratings.
					if ($('#'+id+'-whiteElo').html().length > 0){
						$('#'+id+'-whiteElo').html(' ('+$('#'+id+'-whiteElo').html()+')');
					}
					else {
						$('#'+id+'-whiteElo').html('');
					}
					if ($('#'+id+'-blackElo').html().length > 0){
						$('#'+id+'-blackElo').html(' ('+$('#'+id+'-blackElo').html()+')');
					}
					else {
						$('#'+id+'-blackElo').html('');
					}
				}
				else{
					$('#'+id+'-blackElo').html('');
					$('#'+id+'-whiteElo').html('');
				}

				if ($('#chesstempolink').length == 0){
					$('body').append(
						$("<small id='chesstempolink'>PGN viewer from: <a href='http://www.chesstempo.com'>chesstempo</a></small>")
					);
				}
			}
			else {
				this.innerHTML = this.innerHTML.replace( /\[pgn\][\s\S]*?\[\/pgn\]/im, "[ pgn]"+pgnstr+"[ /pgn] (sans spaces)");
			}

			text = this.innerHTML;
			start = text.indexOf('[pgn]');
			end = text.indexOf('[/pgn]');
		}
	});
}

/*Load CSS and JS for chesstempo pgn viewer, process all nodes, then watch for future nodes*/
//$('head').append($('<link>').attr('rel', 'stylesheet').attr('type', 'text/css').attr('href', 'http://chesstempo.com/css/board-min.css'));
pgnify(document);
$(document).bind('DOMNodeInserted', function(e){
	if (!e) e = window.event;
	pgnify(e.target);
});
