/* Copyright 2007-2010 Richard Jones
This work is licensed under the Creative Commons Attribution-Noncommercial-No Derivative Works License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/2.5/au/
*/
Gettext=function(_1){
this.domain="messages";
this.locale_data=undefined;
var _2=["domain","locale_data"];
if(this.isValidObject(_1)){
for(var i in _1){
for(var j=0;j<_2.length;j++){
if(i==_2[j]){
if(this.isValidObject(_1[i])){
this[i]=_1[i];
}
}
}
}
}
this.try_load_lang();
return this;
};
Gettext.context_glue="\x04";
Gettext._locale_data={};
Gettext.prototype.try_load_lang=function(){
if(typeof (this.locale_data)!="undefined"){
var _5=this.locale_data;
this.locale_data=undefined;
this.parse_locale_data(_5);
if(typeof (Gettext._locale_data[this.domain])=="undefined"){
throw new Error("Error: Gettext 'locale_data' does not contain the domain '"+this.domain+"'");
}
}
var _6=this.get_lang_refs();
if(typeof (_6)=="object"&&_6.length>0){
for(var i=0;i<_6.length;i++){
var _8=_6[i];
if(_8.type=="application/json"){
if(!this.try_load_lang_json(_8.href)){
throw new Error("Error: Gettext 'try_load_lang_json' failed. Unable to exec xmlhttprequest for link ["+_8.href+"]");
}
}else{
if(_8.type=="application/x-po"){
if(!this.try_load_lang_po(_8.href)){
throw new Error("Error: Gettext 'try_load_lang_po' failed. Unable to exec xmlhttprequest for link ["+_8.href+"]");
}
}else{
throw new Error("TODO: link type ["+_8.type+"] found, and support is planned, but not implemented at this time.");
}
}
}
}
};
Gettext.prototype.parse_locale_data=function(_9){
if(typeof (Gettext._locale_data)=="undefined"){
Gettext._locale_data={};
}
for(var _a in _9){
if((!_9.hasOwnProperty(_a))||(!this.isValidObject(_9[_a]))){
continue;
}
var _b=false;
for(var _c in _9[_a]){
_b=true;
break;
}
if(!_b){
continue;
}
var _d=_9[_a];
if(_a==""){
_a="messages";
}
if(!this.isValidObject(Gettext._locale_data[_a])){
Gettext._locale_data[_a]={};
}
if(!this.isValidObject(Gettext._locale_data[_a].head)){
Gettext._locale_data[_a].head={};
}
if(!this.isValidObject(Gettext._locale_data[_a].msgs)){
Gettext._locale_data[_a].msgs={};
}
for(var _e in _d){
if(_e==""){
var _f=_d[_e];
for(var _10 in _f){
var h=_10.toLowerCase();
Gettext._locale_data[_a].head[h]=_f[_10];
}
}else{
Gettext._locale_data[_a].msgs[_e]=_d[_e];
}
}
}
for(var _a in Gettext._locale_data){
if(this.isValidObject(Gettext._locale_data[_a].head["plural-forms"])&&typeof (Gettext._locale_data[_a].head.plural_func)=="undefined"){
var _12=Gettext._locale_data[_a].head["plural-forms"];
var _13=new RegExp("^(\\s*nplurals\\s*=\\s*[0-9]+\\s*;\\s*plural\\s*=\\s*(?:\\s|[-\\?\\|&=!<>+*/%:;a-zA-Z0-9_()])+)","m");
if(_13.test(_12)){
var pf=Gettext._locale_data[_a].head["plural-forms"];
if(!/;\s*$/.test(pf)){
pf=pf.concat(";");
}
var _15="var plural; var nplurals; "+pf+" return { \"nplural\" : nplurals, \"plural\" : (plural === true ? 1 : plural ? plural : 0) };";
Gettext._locale_data[_a].head.plural_func=new Function("n",_15);
}else{
throw new Error("Syntax error in language file. Plural-Forms header is invalid ["+_12+"]");
}
}else{
if(typeof (Gettext._locale_data[_a].head.plural_func)=="undefined"){
Gettext._locale_data[_a].head.plural_func=function(n){
var p=(n!=1)?1:0;
return {"nplural":2,"plural":p};
};
}
}
}
return;
};
Gettext.prototype.try_load_lang_po=function(uri){
var _19=this.sjax(uri);
if(!_19){
return;
}
var _1a=this.uri_basename(uri);
var _1b=this.parse_po(_19);
var rv={};
if(_1b){
if(!_1b[""]){
_1b[""]={};
}
if(!_1b[""]["domain"]){
_1b[""]["domain"]=_1a;
}
_1a=_1b[""]["domain"];
rv[_1a]=_1b;
this.parse_locale_data(rv);
}
return 1;
};
Gettext.prototype.uri_basename=function(uri){
var rv;
if(rv=uri.match(/^(.*\/)?(.*)/)){
var _1f;
if(_1f=rv[2].match(/^(.*)\..+$/)){
return _1f[1];
}else{
return rv[2];
}
}else{
return "";
}
};
Gettext.prototype.parse_po=function(_20){
var rv={};
var _22={};
var _23="";
var _24=[];
var _25=_20.split("\n");
for(var i=0;i<_25.length;i++){
_25[i]=_25[i].replace(/(\n|\r)+$/,"");
var _27;
if(/^$/.test(_25[i])){
if(typeof (_22["msgid"])!="undefined"){
var _28=(typeof (_22["msgctxt"])!="undefined"&&_22["msgctxt"].length)?_22["msgctxt"]+Gettext.context_glue+_22["msgid"]:_22["msgid"];
var _29=(typeof (_22["msgid_plural"])!="undefined"&&_22["msgid_plural"].length)?_22["msgid_plural"]:null;
var _2a=[];
for(var str in _22){
var _27;
if(_27=str.match(/^msgstr_(\d+)/)){
_2a[parseInt(_27[1])]=_22[str];
}
}
_2a.unshift(_29);
if(_2a.length>1){
rv[_28]=_2a;
}
_22={};
_23="";
}
}else{
if(/^#/.test(_25[i])){
continue;
}else{
if(_27=_25[i].match(/^msgctxt\s+(.*)/)){
_23="msgctxt";
_22[_23]=this.parse_po_dequote(_27[1]);
}else{
if(_27=_25[i].match(/^msgid\s+(.*)/)){
_23="msgid";
_22[_23]=this.parse_po_dequote(_27[1]);
}else{
if(_27=_25[i].match(/^msgid_plural\s+(.*)/)){
_23="msgid_plural";
_22[_23]=this.parse_po_dequote(_27[1]);
}else{
if(_27=_25[i].match(/^msgstr\s+(.*)/)){
_23="msgstr_0";
_22[_23]=this.parse_po_dequote(_27[1]);
}else{
if(_27=_25[i].match(/^msgstr\[0\]\s+(.*)/)){
_23="msgstr_0";
_22[_23]=this.parse_po_dequote(_27[1]);
}else{
if(_27=_25[i].match(/^msgstr\[(\d+)\]\s+(.*)/)){
_23="msgstr_"+_27[1];
_22[_23]=this.parse_po_dequote(_27[2]);
}else{
if(/^"/.test(_25[i])){
_22[_23]+=this.parse_po_dequote(_25[i]);
}else{
_24.push("Strange line ["+i+"] : "+_25[i]);
}
}
}
}
}
}
}
}
}
}
if(typeof (_22["msgid"])!="undefined"){
var _28=(typeof (_22["msgctxt"])!="undefined"&&_22["msgctxt"].length)?_22["msgctxt"]+Gettext.context_glue+_22["msgid"]:_22["msgid"];
var _29=(typeof (_22["msgid_plural"])!="undefined"&&_22["msgid_plural"].length)?_22["msgid_plural"]:null;
var _2a=[];
for(var str in _22){
var _27;
if(_27=str.match(/^msgstr_(\d+)/)){
_2a[parseInt(_27[1])]=_22[str];
}
}
_2a.unshift(_29);
if(_2a.length>1){
rv[_28]=_2a;
}
_22={};
_23="";
}
if(rv[""]&&rv[""][1]){
var cur={};
var _2d=rv[""][1].split(/\\n/);
for(var i=0;i<_2d.length;i++){
if(!_2d.length){
continue;
}
var pos=_2d[i].indexOf(":",0);
if(pos!=-1){
var key=_2d[i].substring(0,pos);
var val=_2d[i].substring(pos+1);
var _31=key.toLowerCase();
if(cur[_31]&&cur[_31].length){
_24.push("SKIPPING DUPLICATE HEADER LINE: "+_2d[i]);
}else{
if(/#-#-#-#-#/.test(_31)){
_24.push("SKIPPING ERROR MARKER IN HEADER: "+_2d[i]);
}else{
val=val.replace(/^\s+/,"");
cur[_31]=val;
}
}
}else{
_24.push("PROBLEM LINE IN HEADER: "+_2d[i]);
cur[_2d[i]]="";
}
}
rv[""]=cur;
}else{
rv[""]={};
}
return rv;
};
Gettext.prototype.parse_po_dequote=function(str){
var _33;
if(_33=str.match(/^"(.*)"/)){
str=_33[1];
}
str=str.replace(/\\"/,"");
return str;
};
Gettext.prototype.try_load_lang_json=function(uri){
var _35=this.sjax(uri);
if(!_35){
return;
}
var rv=this.JSON(_35);
this.parse_locale_data(rv);
return 1;
};
Gettext.prototype.get_lang_refs=function(){
var _37=new Array();
var _38=document.getElementsByTagName("link");
for(var i=0;i<_38.length;i++){
if(_38[i].rel=="gettext"&&_38[i].href){
if(typeof (_38[i].type)=="undefined"||_38[i].type==""){
if(/\.json$/i.test(_38[i].href)){
_38[i].type="application/json";
}else{
if(/\.js$/i.test(_38[i].href)){
_38[i].type="application/json";
}else{
if(/\.po$/i.test(_38[i].href)){
_38[i].type="application/x-po";
}else{
if(/\.mo$/i.test(_38[i].href)){
_38[i].type="application/x-mo";
}else{
throw new Error("LINK tag with rel=gettext found, but the type and extension are unrecognized.");
}
}
}
}
}
_38[i].type=_38[i].type.toLowerCase();
if(_38[i].type=="application/json"){
_38[i].type="application/json";
}else{
if(_38[i].type=="text/javascript"){
_38[i].type="application/json";
}else{
if(_38[i].type=="application/x-po"){
_38[i].type="application/x-po";
}else{
if(_38[i].type=="application/x-mo"){
_38[i].type="application/x-mo";
}else{
throw new Error("LINK tag with rel=gettext found, but the type attribute ["+_38[i].type+"] is unrecognized.");
}
}
}
}
_37.push(_38[i]);
}
}
return _37;
};
Gettext.prototype.textdomain=function(_3a){
if(_3a&&_3a.length){
this.domain=_3a;
}
return this.domain;
};
Gettext.prototype.gettext=function(_3b){
var _3c;
var _3d;
var n;
var _3f;
return this.dcnpgettext(null,_3c,_3b,_3d,n,_3f);
};
Gettext.prototype.dgettext=function(_40,_41){
var _42;
var _43;
var n;
var _45;
return this.dcnpgettext(_40,_42,_41,_43,n,_45);
};
Gettext.prototype.dcgettext=function(_46,_47,_48){
var _49;
var _4a;
var n;
return this.dcnpgettext(_46,_49,_47,_4a,n,_48);
};
Gettext.prototype.ngettext=function(_4c,_4d,n){
var _4f;
var _50;
return this.dcnpgettext(null,_4f,_4c,_4d,n,_50);
};
Gettext.prototype.dngettext=function(_51,_52,_53,n){
var _55;
var _56;
return this.dcnpgettext(_51,_55,_52,_53,n,_56);
};
Gettext.prototype.dcngettext=function(_57,_58,_59,n,_5b){
var _5c;
return this.dcnpgettext(_57,_5c,_58,_59,n,_5b,_5b);
};
Gettext.prototype.pgettext=function(_5d,_5e){
var _5f;
var n;
var _61;
return this.dcnpgettext(null,_5d,_5e,_5f,n,_61);
};
Gettext.prototype.dpgettext=function(_62,_63,_64){
var _65;
var n;
var _67;
return this.dcnpgettext(_62,_63,_64,_65,n,_67);
};
Gettext.prototype.dcpgettext=function(_68,_69,_6a,_6b){
var _6c;
var n;
return this.dcnpgettext(_68,_69,_6a,_6c,n,_6b);
};
Gettext.prototype.npgettext=function(_6e,_6f,_70,n){
var _72;
return this.dcnpgettext(null,_6e,_6f,_70,n,_72);
};
Gettext.prototype.dnpgettext=function(_73,_74,_75,_76,n){
var _78;
return this.dcnpgettext(_73,_74,_75,_76,n,_78);
};
Gettext.prototype.dcnpgettext=function(_79,_7a,_7b,_7c,n,_7e){
if(!this.isValidObject(_7b)){
return "";
}
var _7f=this.isValidObject(_7c);
var _80=this.isValidObject(_7a)?_7a+Gettext.context_glue+_7b:_7b;
var _81=this.isValidObject(_79)?_79:this.isValidObject(this.domain)?this.domain:"messages";
var _82="LC_MESSAGES";
var _7e=5;
var _83=new Array();
if(typeof (Gettext._locale_data)!="undefined"&&this.isValidObject(Gettext._locale_data[_81])){
_83.push(Gettext._locale_data[_81]);
}else{
if(typeof (Gettext._locale_data)!="undefined"){
for(var dom in Gettext._locale_data){
_83.push(Gettext._locale_data[dom]);
}
}
}
var _85=[];
var _86=false;
var _87;
if(_83.length){
for(var i=0;i<_83.length;i++){
var _89=_83[i];
if(this.isValidObject(_89.msgs[_80])){
for(var j=0;j<_89.msgs[_80].length;j++){
_85[j]=_89.msgs[_80][j];
}
_85.shift();
_87=_89;
_86=true;
if(_85.length>0&&_85[0].length!=0){
break;
}
}
}
}
if(_85.length==0||_85[0].length==0){
_85=[_7b,_7c];
}
var _8b=_85[0];
if(_7f){
var p;
if(_86&&this.isValidObject(_87.head.plural_func)){
var rv=_87.head.plural_func(n);
if(!rv.plural){
rv.plural=0;
}
if(!rv.nplural){
rv.nplural=0;
}
if(rv.nplural<=rv.plural){
rv.plural=0;
}
p=rv.plural;
}else{
p=(n!=1)?1:0;
}
if(this.isValidObject(_85[p])){
_8b=_85[p];
}
}
return _8b;
};
Gettext.strargs=function(str,_8f){
if(null==_8f||"undefined"==typeof (_8f)){
_8f=[];
}else{
if(_8f.constructor!=Array){
_8f=[_8f];
}
}
var _90="";
while(true){
var i=str.indexOf("%");
var _92;
if(i==-1){
_90+=str;
break;
}
_90+=str.substr(0,i);
if(str.substr(i,2)=="%%"){
_90+="%";
str=str.substr((i+2));
}else{
if(_92=str.substr(i).match(/^%(\d+)/)){
var _93=parseInt(_92[1]);
var _94=_92[1].length;
if(_93>0&&_8f[_93-1]!=null&&typeof (_8f[_93-1])!="undefined"){
_90+=_8f[_93-1];
}
str=str.substr((i+1+_94));
}else{
_90+="%";
str=str.substr((i+1));
}
}
}
return _90;
};
Gettext.prototype.strargs=function(str,_96){
return Gettext.strargs(str,_96);
};
Gettext.prototype.isArray=function(_97){
return this.isValidObject(_97)&&_97.constructor==Array;
};
Gettext.prototype.isValidObject=function(_98){
if(null==_98){
return false;
}else{
if("undefined"==typeof (_98)){
return false;
}else{
return true;
}
}
};
Gettext.prototype.sjax=function(uri){
var _9a;
if(window.XMLHttpRequest){
_9a=new XMLHttpRequest();
}else{
if(navigator.userAgent.toLowerCase().indexOf("msie 5")!=-1){
_9a=new ActiveXObject("Microsoft.XMLHTTP");
}else{
_9a=new ActiveXObject("Msxml2.XMLHTTP");
}
}
if(!_9a){
throw new Error("Your browser doesn't do Ajax. Unable to support external language files.");
}
_9a.open("GET",uri,false);
try{
_9a.send(null);
}
catch(e){
return;
}
var _9b=_9a.status;
if(_9b==200||_9b==0){
return _9a.responseText;
}else{
var _9c=_9a.statusText+" (Error "+_9a.status+")";
if(_9a.responseText.length){
_9c+="\n"+_9a.responseText;
}
alert(_9c);
return;
}
};
Gettext.prototype.JSON=function(_9d){
return eval("("+_9d+")");
};

CTSound=function(_1){
this.sounds=[];
this.soundPath=_1.soundPath;
var _2=!!((myAudioTag=document.createElement("audio")).canPlayType);
var _3=null;
if(typeof Audio!="undefined"){
_3=new Audio("");
}
this.haveAudio=_3&&!!(_3.canPlayType);
if(this.haveAudio){
this.canPlayOgg=(("no"!=_3.canPlayType("audio/ogg"))&&(""!=_3.canPlayType("audio/ogg")));
this.canPlayMp3=(("no"!=_3.canPlayType("audio/mpeg"))&&(""!=_3.canPlayType("audio/mpeg")));
this.canPlayWav=(("no"!=_3.canPlayType("audio/wav"))&&(""!=_3.canPlayType("audio/wav")));
}
};
CTSound.prototype.createSound=function(_4,_5){
if(!this.haveAudio){
return;
}
var _6=null;
var _7="";
if(this.canPlayMp3){
_7=this.soundPath+"/"+_4+".mp3";
}else{
if(this.canPlayOgg){
_7=this.soundPath+"/"+_4+".ogg";
}else{
if(this.canPlayWav){
_7=this.soundPath+"/"+_4+".wav";
}
}
}
if(_7){
_6=new Audio(_7);
}
if(_6){
_6.id=_5+"-"+_4;
this.sounds[_4]=_6;
if(_5){
this.sounds[_5]=_6;
}
}
};
CTSound.prototype.playSound=function(_8){
var _9=this.sounds[_8];
if(_9){
_9.play();
}
};

function getLocale(){
if(navigator){
if(navigator.language){
return navigator.language;
}else{
if(navigator.browserLanguage){
return navigator.browserLanguage;
}else{
if(navigator.systemLanguage){
return navigator.systemLanguage;
}else{
if(navigator.userLanguage){
return navigator.userLanguage;
}
}
}
}
}
}
var gt=null;
function init_gettext(){
if(typeof json_locale_data!=="undefined"){
var _1={"domain":"js-messages","locale_data":json_locale_data};
gt=new Gettext(_1);
}
}
init_gettext();
function _js(_2){
if(gt){
return gt.gettext(_2);
}else{
return _2;
}
}
function __js(_3,a){
var _3=_js(_3);
for(var i=0;i<a.length;i++){
var re=new RegExp("{"+a[i][0]+"}","g");
_3=_3.replace(re,a[i][1]);
}
return _3;
}
function _jn(_7,_8,_9){
var _a;
if(gt){
_a=gt.ngettext(_7,_8,_9);
}else{
if(_9==0||_9>1){
_a=_8;
}else{
_a=_7;
}
}
return _a;
}
function __jn(_b,_c,_d,a){
var _f=_jn(_b,_c,_d);
return __gt_expand(_f,a);
return _f;
}
function __gt_expand(msg,a){
for(var i=0;i<a.length;i++){
var re=new RegExp("{"+a[i][0]+"}","g");
msg=msg.replace(re,a[i][1]);
}
return msg;
}

PgnViewer=function(_1,_2){
var _3=new BoardConfig();
if(_1){
_3.applyConfig(_1);
}
if(!window._pvObject){
window._pvObject=new Array();
}
window._pvObject[_3.boardName]=this;
_1=_3;
_1.pgnMode=true;
_1.scrollVariations=true;
this.chessapp=new ChessApp(_1);
this.finishedCallback=_2;
if(_1.loadImmediately){
this.chessapp.init(null,null,null,this,true);
this.board=this.chessapp.board;
}else{
YAHOO.util.Event.onDOMReady(this.setup,this,true);
}
};
PgnViewer.prototype.setup=function(){
this.chessapp.init(null,null,null,this,true);
this.board=this.chessapp.board;
};
PgnViewer.prototype.updatePieceCallback=function(_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,_e,_f){
var _10=new Object();
var _11=_e;
var _12=false;
var _13=Board.getVarMove(_11,_7,_6,_5,_4);
if(_11.fromColumn==_5.column&&_11.fromRow==_5.row&&_11.toRow==_7&&_11.toColumn==_6&&(_4==""||(_4==_11.promotion))){
_12=true;
}else{
if(_13){
_11=_13;
_12=true;
}
}
_10.move=_11;
_10.allowMove=_12;
_10.dontMakeOpponentMove=false;
return _10;
};
PgnViewer.prototype.setupFromPgn=function(pgn,_15){
this.chessapp.pgn.setupFromPGN(pgn,_15);
};
PgnViewer.prototype.setupFromFen=function(fen,_17,_18,_19){
this.chessapp.pgn.board.setupFromFen(fen,_17,_18,_19);
};
PGNGame=function(_1a,_1b,_1c,_1d,_1e,_1f,_20,_21,_22,_23,_24,_25){
this.movesseq=_1a;
this.startFen=_1b;
this.blackPlayer=_1c;
this.whitePlayer=_1d;
this.pgn_result=_1e;
this.event=_1f;
this.site=_20;
this.date=_21;
this.round=_22;
this.start_movenum=_23;
this.whitePlayerElo=_24;
this.blackPlayerElo=_25;
};
PGN=function(_26){
this.board=_26;
this.pgnGames=new Array();
this.lastShownGame=0;
};
PGN.prototype.pollPGNFromURL=function(url,_28,_29){
var _2a=this;
this.getPGNFromURL(url,_28);
if(this.foundResult){
_29=this.board.pollPGNMillisecondsPostResult;
this.foundResultPolls++;
}
if(this.foundResultPolls>=this.board.numberPollsAfterResult){
this.finishedPolling=true;
return;
}
this.pollTime=_29;
this.lastPoll=new Date().getTime();
setTimeout(function(){
_2a.pollPGNFromURL(url,_28,_29);
},_29);
};
PGN.prototype.getPGNFromURL=function(url,_2c){
var _2d=(new Date()).getTime()+"-"+parseInt(Math.random()*99999);
YAHOO.util.Connect.asyncRequest("GET",url+"?rs="+_2d,{success:function(o){
var _2f="";
var _30="";
var _31="";
var re=eval("/\\n[^[]/");
if(o.responseText.indexOf("\r")>=0){
eval("/\\r[^[]/");
}
var ind=o.responseText.search(re);
if(ind>=0){
_31=o.responseText.substring(ind);
}
re=eval("/\\[Result /");
ind=o.responseText.search(re);
if(ind>=0){
var _34=o.responseText.indexOf("\n",ind);
if(_34<0){
_34=o.responseText.indexOf("\r",ind);
}
if(_34>=0){
_2f=o.responseText.substring(ind,_34);
}
}
re=eval("/\\[Site /");
ind=o.responseText.search(re);
if(ind>=0){
var _34=o.responseText.indexOf("]",ind);
if(_34>=0){
_30=o.responseText.substring(ind+6,_34-1);
}
}
if(_30){
if(this.board.fideClock){
var _35=YAHOO.util.Dom.get(this.board.boardName+"-whitePlayerClock");
var _36=YAHOO.util.Dom.get(this.board.boardName+"-blackPlayerClock");
var ss=_30.split("-");
var _38=ss[0];
var _39="0";
if(_38.charAt(0)=="\""){
_38=_38.substr(1);
}
if(ss.length>1){
_39=ss[1];
}
if(_35){
_35.innerHTML=_38;
}
if(_36){
_36.innerHTML=_39;
}
}else{
var _3a=YAHOO.util.Dom.get(this.board.boardName+"-site");
if(_3a){
_3a.innerHTML=_30;
}
}
}
if(this.currentMoveText==_31&&this.currentResultTag==_2f){
return;
}
this.currentMoveText=_31;
this.currentResultTag=_2f;
this.setupFromPGN(o.responseText,_2c);
},failure:function(o){
if(!this.board.hidePGNErrors){
alert("pgn load failed:"+o.statusText+" for file:"+url);
}
},scope:this},"rs2="+_2d);
};
PGN.prototype.getMoveFromPGNMove=function(_3c,_3d,_3e){
var _3f=false;
var _40=false;
var _41=false;
var _42;
var _43=null;
var _44=false;
var _45=null;
if(_3c.charAt(_3c.length-1)=="#"){
_40=true;
_3f=true;
_3c=_3c.substr(0,_3c.length-1);
}else{
if(_3c.charAt(_3c.length-1)=="+"){
_40=true;
if(_3c.length>1&&_3c.charAt(_3c.length-2)=="+"){
_3f=true;
_3c=_3c.substr(0,_3c.length-2);
}else{
_3c=_3c.substr(0,_3c.length-1);
}
}
}
if(_3c=="O-O-O"){
if(_3d=="w"){
return this.board.createMoveFromString("e1c1");
}else{
return this.board.createMoveFromString("e8c8");
}
}else{
if(_3c=="O-O"){
if(_3d=="w"){
return this.board.createMoveFromString("e1g1");
}else{
return this.board.createMoveFromString("e8g8");
}
}
}
var _46=_3c.indexOf("=");
if(_46>=0){
var _47;
_43=_3c.substr(_46+1,1);
_47=_43.charAt(0);
_42=this.board.pieceCharToPieceNum(_47);
_41=true;
_3c=_3c.substr(0,_46);
}
var _48=_3c.charAt(_3c.length-1);
if(_48=="Q"||_48=="R"||_48=="N"||_48=="B"){
_43=_48+"";
_42=this.board.pieceCharToPieceNum(_43);
_41=true;
_3c=_3c.substr(0,_3c.length-1);
}
var _49=_3c.substr(_3c.length-2,2);
var _4a=_49.charCodeAt(0)-"a".charCodeAt(0);
var _4b=_49.charCodeAt(1)-"1".charCodeAt(0);
if(_4a>7||_4a<0||_4b>7||_4b<0){
this.lastMoveFromError=__js("Error processing to Square:{TO_SQUARE} on move:{MOVE}",[["TO_SQUARE",_49],["MOVE",_3c]]);
return null;
}
if(_3c.length>2){
if(_3c.charAt(_3c.length-3)=="x"){
_44=true;
_45=_3c.substr(0,_3c.length-3);
}else{
_45=_3c.substr(0,_3c.length-2);
}
}
var _4c=new Array();
var _4d=0;
var _4e=null;
var _4f=(_3d=="w")?ChessPiece.WHITE:ChessPiece.BLACK;
switch(_3c.charAt(0)){
case "K":
case "k":
_4e=ChessPiece.KING;
break;
case "Q":
case "q":
_4e=ChessPiece.QUEEN;
break;
case "R":
case "r":
_4e=ChessPiece.ROOK;
break;
case "B":
_4e=ChessPiece.BISHOP;
break;
case "N":
case "n":
_4e=ChessPiece.KNIGHT;
break;
case "P":
case "p":
_4e=ChessPiece.PAWN;
break;
default:
_4e=ChessPiece.PAWN;
}
var _50=null;
var _51=null;
if(_45){
var _52=_45.toLowerCase().charAt(0);
if(_52==_45.charAt(0)&&_52>="a"&&_52<="h"){
_51=_52;
if(_45.length==2){
_50=_45.charAt(1);
}
}else{
if(_45.length>1){
if(_45.length==2){
var c=_45.charAt(1);
if(c>="1"&&c<="8"){
_50=c;
}else{
_51=c;
}
}else{
if(_45.length==3){
_51=_45.charAt(1);
_50=_45.charAt(2);
if(_51>="1"&&_51<="9"){
var tmp=_51;
_51=_50;
_50=tmp;
}
}else{
this.lastMoveFromError=__js("Error: unhandled fromChars:{FROM_CHARS}",[["FROM_CHARS",_45]]);
return null;
}
}
}
}
}
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var bp=this.board.boardPieces[i][j];
if(bp!=null&&bp.colour==_4f&&bp.piece==_4e){
if(this.board.canMove(bp,_4a,_4b,_3e,true)){
var _58=String.fromCharCode("a".charCodeAt(0)+i).charAt(0);
var _59=String.fromCharCode("1".charCodeAt(0)+j).charAt(0);
if((_51==null||_51==_58)&&(_50==null||_50==_59)){
_4c[_4d++]=bp;
}else{
}
}
}
}
}
if(_4d==0){
this.lastMoveFromError=__js("no candidate pieces for:{MOVE}",[["MOVE",_3c]]);
return null;
}
if(_4d>1){
this.lastMoveFromError=__js("Ambiguous:{MOVE} with fromChars:{FROM_CHARS} disambigRow:{DISAMBIG_ROW} disambigCol:{DISAMBIG_COL}",[["MOVE",_3c],["FROM_CHARS",_45],["DISAMBIG_ROW",_50],["DISAMBIG_COL",_51]]);
return null;
}
var _5a=_4c[0];
var _5b="";
_5b+=String.fromCharCode("a".charCodeAt(0)+_5a.column);
_5b+=String.fromCharCode("1".charCodeAt(0)+_5a.row);
if(_44){
_5b+="x";
}
_5b+=_49;
if(_43){
_5b+=_43;
}
var _5c=this.board.createMoveFromString(_5b);
return _5c;
};
PGN.prototype.parseTag=function(_5d,pgn,_5f){
if(pgn.substr(_5f,_5d.length+3)=="["+_5d+" \""){
var _60=pgn.indexOf("\"",_5f+_5d.length+3);
if(_60>=0){
return pgn.substring(_5f+_5d.length+3,_60);
}
}
return null;
};
PGN.prototype.parsePGN=function(pgn,_62,_63){
if(ctime){
console.time("parsePGN");
}
pgn=pgn.replace(/&nbsp;/g," ");
pgn=pgn.replace(/^\s+|\s+$/g,"");
var _64=0;
this.pgn=pgn;
var _65=new Array();
var _66=1;
var _67=0;
this.pgnGames=new Array();
this.finishedParseCallback=_62;
this.startParseTime=new Date().getTime();
var ret=this.parsePGN_cont(_65,_66,_67,_64,_63);
var _69=new Object();
if(!ret){
_69.parsedOk=true;
_69.pgnGames=this.pgnGames;
}else{
_69.parsedOk=false;
_69.errorString=ret;
_69.pgnGames=null;
}
if(ctime){
console.timeEnd("parsePGN");
}
return _69;
};
PGN.prototype.parsePGN_cont=function(_6a,_6b,_6c,_6d,_6e){
var pgn=this.pgn;
var _70=this.board.boardName+"-progress";
var _71=YAHOO.util.Dom.get(_70);
while(_6d<pgn.length){
var _72="";
var _73="";
var _74="";
var _75="";
var _76="";
var _77="";
var _78="";
var _79="?";
var _7a="?";
var _7b="w";
var _7c=0;
var _7d=0;
var _7e=new Array();
var _7f=0;
var _80="";
var _81=null;
var _82=null;
var _83=new Array();
var _84=new Array();
var _85=new Array();
var _86=new Array();
var _87=new Array();
this.board.pieceMoveDisabled=true;
if(this.board.initialFen){
this.board.startFen=this.board.initialFen;
}else{
this.board.startFen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
}
var i=0;
for(i=_6d;i<pgn.length;i++){
var tag=this.parseTag("FEN",pgn,i);
if(tag&&tag!="?"){
this.board.startFen=tag;
}else{
tag=this.parseTag("White",pgn,i);
if(tag&&tag!="?"){
_78=tag;
}else{
tag=this.parseTag("Black",pgn,i);
if(tag&&tag!="?"){
_73=tag;
}else{
tag=this.parseTag("Result",pgn,i);
if(tag&&tag!="?"){
_72=tag;
}else{
tag=this.parseTag("Event",pgn,i);
if(tag&&tag!="?"){
_74=tag;
}else{
tag=this.parseTag("Site",pgn,i);
if(tag&&tag!="?"){
_75=tag;
}else{
tag=this.parseTag("Date",pgn,i);
if(tag&&tag!="?"){
_76=tag;
}else{
tag=this.parseTag("Round",pgn,i);
if(tag&&tag!="?"){
_77=tag;
}else{
tag=this.parseTag("WhiteElo",pgn,i);
if(tag&&tag!="?"){
_79=tag;
}else{
tag=this.parseTag("BlackElo",pgn,i);
if(tag&&tag!="?"){
_7a=tag;
}
}
}
}
}
}
}
}
}
}
if(pgn.charAt(i)=="["){
var j=pgn.indexOf;
for(j=i+1;j<pgn.length&&pgn.charAt(j)!="]";j++){
}
if(j==pgn.length){
var err=_js("PgnViewer: Error parsing PGN. Found unclosed [");
if(this.finishedParseCallback){
this.finishedParseCallback(_6e,err);
}
return err;
}
i=j-1;
continue;
}
if(pgn.charAt(i)=="{"){
var _8c=pgn.indexOf("}",i+1);
if(_8c>=0){
var _8d=pgn.substring(i+1,_8c);
i=_8c;
_80+="{ "+_8d+" } ";
}else{
var err=_js("PgnViewer: Error parsing PGN. Found unclosed {");
if(this.finishedParseCallback){
this.finishedParseCallback(_6e,err);
}
return err;
}
continue;
}
if(pgn.substr(i,1)=="."){
var j=i-1;
while(j>=0&&pgn.charAt(j)>="0"&&pgn.charAt(j)<="9"){
j--;
}
j++;
if(pgn.charAt(j)>="0"&&pgn.charAt(j)<="9"){
_6b=parseInt(pgn.substring(j,i));
}
break;
}
}
if(pgn.substr(i,1)!="."){
}
this.board.prev_move=null;
this.board.setupFromFen(this.board.startFen,false,false,true,true);
_81=this.board.prev_move;
var _8e=i;
var _8f=null;
for(i=i;i<pgn.length;i++){
var _90=-1;
if(pgn.substr(i,3)=="1-0"||pgn.substr(i,3)=="0-1"){
_90=3;
}else{
if(pgn.substr(i,7)=="1/2-1/2"){
_90=7;
}else{
if(pgn.substr(i,1)=="*"){
_90=1;
}
}
}
if(_90>0){
_8f=pgn.substr(i,_90);
_6d=i+_90;
break;
}
if(pgn.charAt(i)=="["){
_6d=i;
break;
}
if(pgn.charAt(i)==" "||pgn.charAt(i)=="\t"||pgn.charAt(i)=="\n"||pgn.charAt(i)=="\r"){
_8e=i+1;
continue;
}
if(pgn.charAt(i)>="0"&&pgn.charAt(i)<="9"){
continue;
}
if(pgn.charAt(i)=="."){
var _91=pgn.substring(_8e,i).replace(/^\s+|\s+$/g,"");
_8e=i;
while(i+1<pgn.length&&pgn.charAt(i+1)=="."){
i++;
}
if(_8e!=i){
_7b="b";
}else{
_7b="w";
}
_8e=i+1;
}else{
if(pgn.charAt(i)=="{"){
var _8c=pgn.indexOf("}",i+1);
if(_8c>=0){
var _8d=pgn.substring(i+1,_8c);
i=_8c;
_80+="{ "+_8d+" } ";
}
_8e=i+1;
}else{
if(pgn.charAt(i)=="("){
_83[_7c]=this.board.boardPieces;
_84[_7c]=_7b;
_86[_7c]=_81;
_87[_7c]=_82;
this.board.boardPieces=_85[_7c];
this.board.boardPieces=this.board.copyBoardPieces(false);
_81=_82;
_7c++;
_8e=i+1;
_80+="( ";
}else{
if(pgn.charAt(i)==")"){
boardPool.putObject(_83[_7c]);
_7c--;
this.board.boardPieces=_83[_7c];
_7b=_84[_7c];
_81=_86[_7c];
_82=_87[_7c];
_8e=i+1;
_80+=") ";
}else{
if(pgn.charAt(i)=="$"){
var j;
for(j=i+1;j<pgn.length&&pgn.charAt(j)>="0"&&pgn.charAt(j)<="9";j++){
}
j--;
if(j>i){
var _92=parseInt(pgn.substr(i+1,j+1));
if(_92<=9){
switch(_92){
case 1:
_80=_80.substr(0,_80.length-1)+"! ";
break;
case 2:
_80=_80.substr(0,_80.length-1)+"? ";
break;
case 3:
_80=_80.substr(0,_80.length-1)+"!! ";
break;
case 4:
_80=_80.substr(0,_80.length-1)+"?? ";
break;
case 5:
_80=_80.substr(0,_80.length-1)+"!? ";
break;
case 6:
_80=_80.substr(0,_80.length-1)+"?! ";
break;
case 7:
case 8:
case 9:
case 0:
default:
}
}else{
_80+=pgn.substring(i,j+1)+" ";
}
i=j;
}
continue;
}else{
var _93=-1;
for(var j=i+1;j<pgn.length;j++){
if(pgn.charAt(j)==")"||pgn.charAt(j)=="("||pgn.charAt(j)=="{"||pgn.charAt(j)=="}"||pgn.charAt(j)==" "||pgn.charAt(j)=="\t"||pgn.charAt(j)=="\n"||pgn.charAt(j)=="\r"){
_93=j;
break;
}
}
if(_93==-1){
_93=pgn.length;
}
var _94=_8e;
var _95=pgn.substring(_8e,_93).replace(/^\s+|\s+$/g,"");
_8e=_93;
i=_8e-1;
if(_95.length>=4&&_95.substring(0,4)=="e.p."){
continue;
}
if(_95.length==0){
var err=__js("PgnViewer: Error: got empty move endMoveInd:{ENDMOVE_INDEX} upto:{UPTO} from:{FROM}",[["ENDMOVE_INDEX",_93],["UPTO",_94],["FROM",pgn.substr(_94)]]);
if(this.finishedParseCallback){
this.finishedParseCallback(_6e,err);
}
return err;
}
var _96=_95.length-1;
while(_96>=0){
if(_95.charAt(_96)=="?"){
_96--;
}else{
if(_95.charAt(_96)=="!"){
_96--;
}else{
break;
}
}
}
var _97=_95.substring(0,_96+1);
var _98=this.getMoveFromPGNMove(_97,_7b,_81);
if(_98==null){
_80+="unknown ";
var err=__js("PgnViewer: Error parsing:{MOVE}, {ERROR_REASON}",[["MOVE",_95],["ERROR_REASON",this.lastMoveFromError]]);
if(this.finishedParseCallback){
this.finishedParseCallback(_6e,err);
}
return err;
}
_82=_81;
_81=_98;
var _99=this.board.boardPieces[_98.fromColumn][_98.fromRow];
boardPool.putObject(_85[_7c]);
_85[_7c]=this.board.copyBoardPieces(false);
if(_99){
this.board.makeMove(_98,_99,false,0.5,false,false);
}
_7d=_7c;
_7f++;
_7b=this.board.flipToMove(_7b);
_80+=_98.moveString+"|"+_95+" ";
}
}
}
}
}
}
if(_6d<i){
_6d=i;
}
var _9a=pgn.indexOf("{",_6d);
var _9b=pgn.indexOf("[",_6d);
if(_9a>=0){
if(_9b==-1||_9a<_9b){
var _9c=pgn.indexOf("}",_9a+1);
if(_9c>=0){
var _8d=pgn.substring(_9a+1,_9c);
_6d=_9c+1;
_80+="{ "+_8d+" } ";
}else{
var err=_js("PgnViewer: Error: Unclosed {");
if(this.finishedParseCallback){
this.finishedParseCallback(_6e,err);
}
return err;
}
}
}
_80=_80.replace(/^\s+|\s+$/g,"");
this.board.pieceMoveDisabled=false;
if(_8f!=null){
if(_72.length==0||_72=="?"){
_72=_8f;
}
}
if(this.board.ignoreMultipleGames){
if(_8f&&_72&&_72=="*"&&_8f!="*"&&_8f!="?"&&_8f!=""){
_72=_8f;
}
}
this.pgnGames[_6c++]=new PGNGame(_80,this.board.startFen,_73,_78,_72,_74,_75,_76,_77,_6b,_79,_7a);
if(_71){
_71.innerHTML="Loaded "+_6c+" games";
}
if(this.board.ignoreMultipleGames){
break;
}
if(this.finishedParseCallback&&new Date().getTime()-this.startParseTime>500){
this.startParseTime=new Date().getTime();
setTimeout("window._pvObject[\""+this.board.boardName+"\"].chessapp.pgn.parsePGN_cont(\""+_6a+"\",\""+_6b+"\",\""+_6c+"\",\""+_6d+"\","+_6e+");",0);
return;
}
}
if(this.finishedParseCallback){
this.finishedParseCallback(_6e);
}
return false;
};
PGN.prototype.setupFromPGN=function(pgn,_9e){
this.parsePGN(pgn,this.setupFromPGNCallback,_9e);
};
PGN.prototype.setupFromPGNCallback=function(_9f,err){
var _a1=this.board.boardName+"-progress";
var _a2=YAHOO.util.Dom.get(_a1);
if(err){
if(!this.board.hidePGNErrors){
var _a3=YAHOO.util.Dom.get(this.board.boardName+"-pgnError");
if(_a3){
_a3.innerHTML=err;
}else{
alert(err);
}
}
return false;
}
if(this.pgnGames.length==0){
if(!this.board.hidePGNErrors){
alert("PgnViewer: Error: Unable to find any pgn games in:"+pgn);
}
return false;
}
if(this.pgnGames.length==1||this.board.ignoreMultipleGames){
var _a4=0;
if(_9f){
_a4=-1;
}
this.showGame(0,_a4);
}else{
var _a5=this.board.boardName+"-container";
var _a6=YAHOO.util.Dom.get(_a5);
var _a7=YAHOO.util.Dom.get(this.board.boardName+"-problemSelector");
var _a8=document.createElement("div");
var _a9="<form id=\""+this.board.boardName+"-problemSelectorForm\" action=\"\" method=\"\">";
var _aa="<select id=\""+this.board.boardName+"-problemSelector\" name=\""+this.board.boardName+"-problemSelector\" style=\"width: "+this.board.pieceSize*8+"px;\">";
var _ab="";
for(i=0;i<this.pgnGames.length;i++){
var _ac=this.pgnGames[i];
var _ad=this.board.boardName+"-game-"+i;
var _ae=(i+1)+". "+_ac.whitePlayer+" vs "+_ac.blackPlayer;
if(_ac.pgn_result.length>0&&_ac.pgn_result!="?"&&this.board.showResult==1){
_ae+=" "+_ac.pgn_result;
}
if(_ac.event.length>0&&_ac.event!="?"&&this.board.showEvent==1){
_ae+=" "+_ac.event;
}
if(_ac.round.length>0&&_ac.round!="?"&&this.board.showRound==1){
_ae+=" Rnd:"+_ac.round;
}
if(_ac.site.length>0&&_ac.site!="?"&&this.board.showSite==1){
_ae+=" "+_ac.site;
}
if(_ac.date.length>0&&_ac.date!="?"&&this.board.showDate==1){
_ae+=" "+_ac.date;
}
var sel="";
if(i==this.lastShownGame){
sel="selected=\"\"";
}
_ab+="<option "+sel+" id=\""+_ad+"\" value=\""+i+"\">"+_ae+"</option>";
}
if(_a7){
if(this.board.selectorBody!=_ab){
_a7.innerHTML=_ab;
this.board.selectorBody=_ab;
}
}else{
_a9+=_aa+_ab+"</select></form>";
_a8.innerHTML=_a9;
_a6.insertBefore(_a8,_a6.firstChild);
this.board.selectorBody=_ab;
}
var _a7=YAHOO.util.Dom.get(this.board.boardName+"-problemSelector");
YAHOO.util.Event.addListener(_a7,"change",this.selectGame,this,true);
var _a4=0;
var _b0=0;
if(_9f){
_a4=-1;
_b0=this.lastShownGame;
}
this.showGame(_b0,_a4);
}
if(_a2){
YAHOO.util.Dom.setStyle(_a2,"visibility","hidden");
}
if(window._pvObject[this.board.boardName].finishedCallback){
window._pvObject[this.board.boardName].finishedCallback();
}
return;
};
PGN.prototype.selectGame=function(e){
var _b2=YAHOO.util.Event.getTarget(e).selectedIndex;
var _b3=0;
if(this.board.gotoEndOnRefresh){
_b3=-1;
}
this.showGame(_b2,_b3);
var _b4=this.board.boardName+"-piecestaken";
var _b5=YAHOO.util.Dom.get(_b4);
if(_b5){
_b5.innerHTML="";
}
this.board.resetMoveListScrollPosition();
};
PGN.prototype.showGame=function(_b6,_b7){
_b7=(typeof _b7=="undefined")?0:_b7;
var _b8=this.lastShownGame;
this.lastShownGame=_b6;
var _b9=this.board.moveArray;
var _ba=this.board.currentMove;
var _bb=false;
if(_ba&&_ba.atEnd){
_bb=true;
}
var _bc=this.pgnGames[_b6];
var _bd=_bc.pgn_result;
if(_bd&&(_bd=="1/2-1/2"||_bd=="0-1"||_bd=="1-0")){
this.foundResult=true;
}else{
this.foundResult=false;
this.foundResultPolls=0;
}
this.board.startFen=_bc.startFen;
this.board.setupFromFen(_bc.startFen,false,false,false);
this.board.setMoveSequence(_bc.movesseq,"NA",_bc.start_movenum,_bc.pgn_result);
var _be=true;
var _bf=-1;
if(_b6==_b8&&_bb){
_bf=this.board.moveArray.length-1;
}
if(!Move.moveArraysEqual(_b9,this.board.moveArray)){
_be=false;
}else{
var _c0=Move.findMoveInNewArray(_b9,this.board.moveArray,_ba);
if(_c0&&_c0.prev){
_bf=_c0.prev.index;
}
}
this.board.displayPendingMoveList();
if(this.board.moveArray.length>0){
this.board.setCurrentMove(this.board.moveArray[0]);
}
if(_be){
if(_bf>0&&_bf<this.board.moveArray.length){
if(clog){
console.log("going to currMoveIndex:"+_bf);
}
this.board.gotoMoveIndex(_bf,false,true);
}else{
}
}else{
if(_b7==-1){
var _c1=this.board.moveArray.length-1;
if(_c1>=0){
this.board.gotoMoveIndex(_c1,false,true);
}
}else{
if(_b7!=0){
this.board.gotoMoveIndex(_b7);
}
}
if(_b7!=-1&&this.board.autoplayFirst){
this.board.forwardMove();
}
}
this.board.displayMode=true;
var _c2=this.board.boardName;
var _c3=YAHOO.util.Dom.get(_c2+"-whitePlayer");
if(_c3){
_c3.innerHTML=_bc.whitePlayer;
}
var _c4=YAHOO.util.Dom.get(_c2+"-blackPlayer");
if(_c4){
_c4.innerHTML=_bc.blackPlayer;
}
var _c5=YAHOO.util.Dom.get(_c2+"-event");
if(_c5){
_c5.innerHTML=_bc.event;
}
var _c6=YAHOO.util.Dom.get(_c2+"-site");
if(_c6){
_c6.innerHTML=_bc.site;
}
var _c7=YAHOO.util.Dom.get(_c2+"-date");
if(_c7){
_c7.innerHTML=_bc.date;
}
var _c8=YAHOO.util.Dom.get(_c2+"-round");
if(_c8){
_c8.innerHTML=_bc.round;
}
var _c9=YAHOO.util.Dom.get(_c2+"-whiteElo");
if(_c9){
_c9.innerHTML=_bc.whitePlayerElo;
}
var _ca=YAHOO.util.Dom.get(_c2+"-blackElo");
if(_ca){
_ca.innerHTML=_bc.blackPlayerElo;
}
var _cb=YAHOO.util.Dom.get(_c2+"-result");
if(_cb){
_cb.innerHTML=_bc.pgn_result;
}
if(clog){
if(this.board.currentMove){
console.log("after show game currentMove:"+this.board.currentMove.output());
}else{
console.log("after show game currentMove is null");
}
}
};

var SITE_VERSION=1;
var clog=false;
var ctime=false;
var cprof=false;
var move_obj_id_counter=0;
var activeBoard=null;
var boardSounds=new CTSound({soundPath:"/sounds"});
YAHOO.util.Event.onDOMReady(function(){
boardSounds.createSound("takesounds/78263__SuGu14__Metall01","takePiece1");
boardSounds.createSound("movesounds/77971__SuGu14__Fusta_0_05","movePiece3");
boardSounds.createSound("movesounds/10537__batchku__Hit_knuckle_15_004","movePiece7");
boardSounds.createSound("analysis/76426__spazzo_1493__Finished","finished");
});
function isMouseOver(_1,e){
var el=YAHOO.util.Dom.get(_1);
if(!el){
return false;
}
var _4=YAHOO.util.Dom.getRegion(el);
if(!_4){
return false;
}
var _5=_4.top;
var _6=_4.left;
var _7=_4.bottom;
var _8=_4.right;
var _9=YAHOO.util.Event.getXY(e);
var mX=_9[0];
var mY=_9[1];
var _c=(mX>_6&&mX<_8&&mY>_5&&mY<_7);
}
function trimStr(_d){
if(!_d){
return "";
}
var _d=_d.replace(/^\s\s*/,"");
var ws=/\s/;
var i=_d.length;
while(ws.test(_d.charAt(--i))){
}
return _d.slice(0,i+1);
}
BoardConfig=function(){
this.boardName="board";
this.puzzle=false;
this.showToMoveIndicators=false;
this.scrollVariations=false;
this.pgnString=null;
this.pgnDiv=null;
this.pgnFile=null;
this.scrollOffsetCorrection=0;
this.handleCommentClicks=false;
this.pollPGNMilliseconds=0;
this.pollPGNMillisecondsPostResult=30000;
this.numberPollsAfterResult=5;
this.gotoEndOnRefresh=false;
this.allowPreMoveSelection=false;
this.pieceSet="merida";
this.pieceSize=46;
this.isEndgame=false;
this.tr=false;
this.ie6FixCoordsOffsetSize=4;
this.allIeFixCoordsOffsetSize=0;
this.addVersion=true;
this.ignoreMultipleGames=false;
this.ml=9999;
this.r=false;
this.g=false;
this.g2=false;
this.canPasteFen=false;
this.makeActive=false;
this.showSolutionButton=false;
this.avoidMouseoverActive=false;
this.autoScrollMoves=false;
this.moveAnimationLength=0.5;
this.showBracketsOnVariation=true;
this.hideBracketsOnTopLevelVariation=false;
this.variationStartString=" ( ";
this.variationEndString=" ) ";
this.ignoreCommentRegex=null;
this.newlineForEachMainMove=true;
this.useDivClearForNewline=false;
this.showNPS=false;
this.squareColorClass="";
this.analysisWindowName="analysis_window";
this.pieceTakenSize=this.pieceSize;
this.pauseBetweenMoves=800;
this.pgnMode=false;
this.hidePGNErrors=false;
this.previewMode=false;
this.movesFormat="default";
this.boardImagePath="http://chesstempo.com";
this.showCoordinates=false;
this.highlightFromTo=false;
this.highlightValidSquares=false;
this.fideClock=false;
this.disableFlipper=false;
this.showResult=1;
this.showEvent=1;
this.showRound=1;
this.showSite=1;
this.showDate=1;
this.ignoreFlipping=false;
this.reverseFlip=false;
this.autoplayFirst=false;
this.dontOutputNavButtons=false;
this.dontCheckLeavingPage=false;
this.clickAndClick=false;
this.clickAndClickDisabled=false;
this.whiteMoveSoundName="movePiece3";
this.blackMoveSoundName="movePiece7";
this.whiteTakeSoundName="takePiece1";
this.blackTakeSoundName="takePiece1";
this.finishedSoundName="finished";
this.soundEnabled=false;
this.gamedb=false;
};
BoardConfig.prototype.applyConfig=function(_10){
for(var _11 in _10){
this[_11]=_10[_11];
}
};
ChessApp=function(_12){
this.displayMode=false;
this.config=_12;
this.board=null;
};
ChessApp.prototype.setDisplayMode=function(_13){
this.displayMode=_13;
};
ChessApp.prototype.setProblemNumber=function(_14,_15){
this.problemNumber=_14;
this.attId=_15;
};
ChessApp.prototype.init=function(e,_17,_18,us,_1a){
ChessPiece.init();
this.board=new Board(this.config.boardName);
if(_1a){
this.board.addUpdatePieceListener(us);
}
this.board.moveArray=new Array();
if(!this.hideOnInit){
YAHOO.util.Dom.setStyle(this.config.boardName+"-container","display","block");
YAHOO.util.Dom.setStyle("toPlaySpan","display","inline");
}
this.tactics=(this.displayMode||this.config.pgnMode||this.config.previewMode||this.config.fenBoard)?null:new TacticsUI(this.board);
this.problem=(this.config.pgnMode||this.config.previewMode||this.config.fenBoard)?null:new ProblemUI(this.board,this.tactics);
this.board.tactics=this.tactics;
this.board.problem=this.problem;
this.board.puzzle=this.config.puzzle;
if(this.problem){
this.problem.autoPlayOpponent=1;
}
this.pgn=(this.config.pgnMode)?new PGN(this.board):null;
var _1b=MovesDisplay.DEFAULT_DISPLAY_TYPE;
if(this.config.movesFormat=="main_on_own_line"){
_1b=MovesDisplay.MAIN_ON_OWN_LINE;
}
this.movesDisplay=new MovesDisplay(this.board,_1b);
this.movesDisplay.variationOnOwnLine=this.config.variationOnOwnLine;
this.board.movesDisplay=this.movesDisplay;
this.board.boardImagePath=this.config.boardImagePath;
this.board.showNPS=this.config.showNPS;
this.board.showSolutionButton=this.config.showSolutionButton;
this.board.analysisWindowName=this.config.analysisWindowName;
this.board.squareColorClass=this.config.squareColorClass;
this.board.tr=this.config.tr;
this.board.scrollToBoardTop=this.config.scrollToBoardTop;
this.board.ml=this.config.ml;
this.board.r=this.config.r;
this.board.g=this.config.g;
this.board.g2=this.config.g2;
this.board.canPasteFen=this.config.canPasteFen;
this.board.addVersion=this.config.addVersion;
this.board.ignoreMultipleGames=this.config.ignoreMultipleGames;
this.board.ie6FixCoordsOffsetSize=this.config.ie6FixCoordsOffsetSize;
this.board.allIeFixCoordsOffsetSize=this.config.allIeFixCoordsOffsetSize;
this.board.allowingFreeMovement=this.config.allowingFreeMovement;
this.board.autoScrollMoves=this.config.autoScrollMoves;
this.board.moveAnimationLength=this.config.moveAnimationLength;
this.board.showBracketsOnVariation=this.config.showBracketsOnVariation;
this.board.hideBracketsOnTopLevelVariation=this.config.hideBracketsOnTopLevelVariation;
this.board.variationStartString=this.config.variationStartString;
this.board.variationEndString=this.config.variationEndString;
this.board.ignoreCommentRegex=this.config.ignoreCommentRegex;
this.board.newlineForEachMainMove=this.config.newlineForEachMainMove;
this.board.useDivClearForNewline=this.config.useDivClearForNewline;
this.board.pieceSize=this.config.pieceSize;
this.board.showToMoveIndicators=this.config.showToMoveIndicators;
this.board.handleCommentClicks=this.config.handleCommentClicks;
this.board.scrollOffsetCorrection=this.config.scrollOffsetCorrection;
this.board.pollPGNMilliseconds=this.config.pollPGNMilliseconds;
this.board.pollPGNMillisecondsPostResult=this.config.pollPGNMillisecondsPostResult;
this.board.numberPollsAfterResult=this.config.numberPollsAfterResult;
this.board.gotoEndOnRefresh=this.config.gotoEndOnRefresh;
this.board.allowPreMoveSelection=this.config.allowPreMoveSelection;
this.board.pieceTakenSize=this.config.pieceTakenSize;
this.board.pieceSet=this.config.pieceSet;
this.board.pauseBetweenMoves=this.config.pauseBetweenMoves;
this.board.showCoordinates=this.config.showCoordinates;
this.board.highlightFromTo=this.config.highlightFromTo;
this.board.highlightValidSquares=this.config.highlightValidSquares;
this.board.fideClock=this.config.fideClock;
this.board.disableFlipper=this.config.disableFlipper;
this.board.showDate=this.config.showDate;
this.board.showEvent=this.config.showEvent;
this.board.showGame=this.config.showGame;
this.board.showResult=this.config.showResult;
this.board.showRound=this.config.showRound;
this.board.showSite=this.config.showSite;
this.board.ignoreFlipping=this.config.ignoreFlipping;
this.board.reverseFlip=this.config.reverseFlip;
this.board.autoplayFirst=this.config.autoplayFirst;
this.board.scrollVariations=this.config.scrollVariations;
this.board.dontOutputNavButtons=this.config.dontOutputNavButtons;
this.board.clickAndClick=this.config.clickAndClick;
this.board.clickAndClickDisabled=this.config.clickAndClickDisabled;
this.board.avoidMouseoverActive=this.config.avoidMouseoverActive;
this.board.dontCheckLeavingPage=this.config.dontCheckLeavingPage;
this.board.whiteMoveSoundName=this.config.whiteMoveSoundName;
this.board.whiteTakeSoundName=this.config.whiteTakeSoundName;
this.board.blackMoveSoundName=this.config.blackMoveSoundName;
this.board.blackTakeSoundName=this.config.blackTakeSoundName;
this.board.soundEnabled=this.config.soundEnabled;
this.board.hidePGNErrors=this.config.hidePGNErrors;
this.board.gamedb=this.config.gamedb;
if(this.config.makeActive){
activeBoard=this.board;
}
if(this.problem){
this.problem.isEndgame=this.config.isEndgame;
}
if(!this.board.puzzle&&typeof loginManager!="undefined"){
if(this.tactics){
loginManager.setLoginCallback(this.tactics.loginCallback,this.tactics);
loginManager.setLogoutCallback(this.tactics.logoutCallback,this.tactics);
}
if(this.problem){
loginManager.setSessionCallback(this.problem.sessionCallback,this.problem);
}
}
YAHOO.util.DragDropMgr.clickTimeThresh=50;
YAHOO.util.DragDropMgr.clickPixelThresh=1;
this.board.createBoardUI();
if(!this.board.puzzle){
if(this.problem){
this.problem.createProblemUI();
}
if(this.tactics){
this.tactics.initProblemCompleteOverlay();
}
if(this.problem){
this.problem.initLoadingOverlay();
}
if(this.config.pgnMode){
if(this.config.pgnFile){
if(this.config.pollPGNMilliseconds){
this.pgn.foundResult=false;
this.pgn.foundResultPolls=0;
var _1c=this;
function timeToNextPollDisplay(){
var _1d=YAHOO.util.Dom.get(_1c.config.boardName+"-nextUpdate");
if(_1d){
if(_1c.pgn.finishedPolling||_1c.pgn.foundResult){
var _1e="00";
var _1f="00";
_1d.innerHTML="<span id=\"minutes\">"+_1e+"</span>:<span id=\"seconds\">"+_1f+"</span>";
}else{
var _20=new Date().getTime();
var _21=(_1c.pgn.lastPoll+_1c.pgn.pollTime-_20)/1000;
if(_21<0){
_21=0;
}
var _22=_21;
var _23=parseInt(_22/60);
var _24=parseInt(_22%60);
if(_23<10){
_1e="0"+_23;
}else{
_1e=_23;
}
if(_24<10){
_1f="0"+_24;
}else{
_1f=_24;
}
_1d.innerHTML="<span id=\"minutes\">"+_1e+"</span>:<span id=\"seconds\">"+_1f+"</span>";
setTimeout(timeToNextPollDisplay,1000);
}
}
}
this.pgn.pollTime=this.config.pollPGNMilliseconds;
this.pgn.pollPGNFromURL(this.config.pgnFile,this.config.gotoEndOnRefresh,this.config.pollPGNMilliseconds);
setTimeout(timeToNextPollDisplay,1000);
}else{
this.pgn.getPGNFromURL(this.config.pgnFile,this.config.gotoEndOnRefresh);
}
}else{
if(this.config.pgnString){
this.pgn.setupFromPGN(this.config.pgnString);
}else{
if(this.config.pgnDiv){
var _25=YAHOO.util.Dom.get(this.config.pgnDiv);
if(_25){
this.pgn.setupFromPGN(_25.innerHTML);
}
}
}
}
}else{
if(!this.board.dontCheckLeavingPage&&this.tactics){
YAHOO.util.Event.addListener(window,"beforeunload",this.tactics.checkLeavingPage,this.tactics,true);
YAHOO.util.Event.addListener(window,"unload",this.tactics.leavingPage,this.tactics,true);
this.tactics.updateSessionDisplay(0,0);
if(typeof showingStart!="undefined"&&showingStart){
var _1c=this;
var _26="";
if(loggedIn){
if(this.config.isEndgame){
_26=_js("Endgame Problem Set")+": <span id=\"startProblemSetStr\">"+_js(startEndgameSetName)+"</span>";
}else{
_26=_js("Tactics Problem Set")+": <span id=\"startProblemSetStr\">"+_js(startTacticsSetName)+"</span>";
}
}
this.board.preloadPieces();
var _27=new YAHOO.widget.SimpleDialog("starttacticdialog1",{width:"300px",fixedcenter:true,modal:false,visible:true,draggable:true,close:false,text:"<div style=\"color:black\">"+_26+"</div><br/>"+"<div style=\"color:black\">"+_js("Click start to begin solving problems")+"</div>",icon:YAHOO.widget.SimpleDialog.ICON_INFO,constraintoviewport:true,buttons:[{text:_js("Start"),handler:function(){
if(_1c.board.imagesLoaded){
this.hide();
_1c.problem.getProblem();
}else{
alert(_js("Still trying to load piece images.\n If you keep receiving this message you may need to reload the page.\n If you continue to get this message, you can disable it by going into your preferences and turning 'show problem start dialog' (available under the other tab) off."));
}
},isDefault:true}]});
var _28=YAHOO.util.Dom.get("ctb-"+this.board.boardName);
_27.render(document.body);
}else{
this.problem.getProblem();
}
}else{
if(this.problem){
if(this.problemNumber!=""){
YAHOO.util.Dom.setStyle("boardandmoves","display","block");
this.problem.getProblem(this.problemNumber,this.attId);
}
}
}
}
}
this.board.setupEventHandlers();
if(this.problem){
this.problem.setupEventHandlers();
}
if(this.tactics){
this.tactics.setupEventHandlers();
}
if(this.board.scrollToBoardTop){
var xy=YAHOO.util.Dom.getXY(this.board.boardName+"-boardBorder");
window.scrollTo(xy[0],xy[1]);
}
if(this.config.flipListener){
this.board.addFlipListener(this.config.flipListener);
}
};
function clearClone(o){
if(o==null){
return;
}
for(prop in o){
if(typeof (o[prop])=="object"&&o[prop]!=null&&o[prop].alreadyCloned){
o[prop].alreadyCloned=false;
clearClone(o[prop]);
}
}
}
function cloneWork(o){
if(o==null){
return null;
}
var _2c=new Object();
for(prop in o){
if(typeof (o[prop])=="object"){
_2c[prop]=o[prop];
}else{
_2c[prop]=o[prop];
}
}
return _2c;
}
function clone(o){
return cloneWork(o);
}
get_image_str=function(_2e,_2f,_30,_31,_32){
var _33=".vers"+SITE_VERSION;
if(!_32){
_33="";
}
if(check_bad_msie()){
return _2f+"/images/"+_30+"/"+_2e+_31+_33+".png";
}else{
return _2f+"/images/"+_30+"/"+_2e+_31+_33+".png";
}
};
check_bad_msie=function(){
var _34=(window.ActiveXObject&&(typeof document.body.style.maxHeight=="undefined"));
return _34;
};
fix_ie_png=function(img){
if(!check_bad_msie()){
return;
}
var _36=(img.id)?"id='"+img.id+"' ":"";
var _37=(img.className)?"class='"+img.className+"' ":"";
var _38=(img.title)?"title='"+img.title+"' ":"title='"+img.alt+"' ";
var _39="display:inline-block;"+img.style.cssText;
if(img.align=="left"){
_39="float:left;"+_39;
}
if(img.align=="right"){
_39="float:right;"+_39;
}
if(img.parentElement.href){
_39="cursor:hand;"+_39;
}
var _3a="<span "+_36+_37+_38+" style=\""+"width:"+img.width+"px; height:"+img.height+"px;"+_39+";"+"filter:progid:DXImageTransform.Microsoft.AlphaImageLoader"+"(src='"+img.src+"', sizingMethod='image');\"></span>";
img.outerHTML=_3a;
};
Move=function(_3b,_3c,_3d,_3e,_3f,_40,_41){
this.fromColumn=_3b;
this.fromRow=_3c;
this.toColumn=_3d;
this.toRow=_3e;
this.take=_3f;
this.promotion=_40;
this.moveString=_41;
this.prev=null;
this.next=null;
this.numVars=0;
this.prevMoveEnpassant=false;
this.ravLevel=0;
this.atEnd=false;
this.obj_id=move_obj_id_counter++;
this.beforeComment="";
this.afterComment="";
};
Move.prototype.freeMove=function(){
if(this.taken){
this.taken=null;
}
if(this.vars&&this.vars.length>0){
var i=0;
for(var i=0;i<this.vars.length;i++){
this.vars[i].freeMove();
}
}
};
Move.prototype.clone=function(_43){
var _44=this.take;
if(_43&&_44){
_44=_44.makeLightWeight();
}
var _45=new Move(this.fromColumn,this.fromRow,this.toColumn,this.toRow,_44,this.promotion,this.moveString);
_45.moveNum=this.moveNum;
_45.atEnd=this.atEnd;
_45.beforeComment=this.beforeComment;
_45.afterComment=this.afterComment;
_45.prevMoveEnpassant=this.prevMoveEnpassant;
_45.index=this.index;
if(this.vars){
_45.vars=[];
var cnt=0;
for(var i=0;i<this.vars.length;i++){
_45.vars[i]=this.vars[i].clone(_43);
cnt++;
}
_45.numVars=cnt;
}
return _45;
};
Move.columnToChar=function(col){
var a=String.fromCharCode("a".charCodeAt(0)+col);
return a;
};
Move.prototype.output=function(){
return Move.columnToChar(this.fromColumn)+""+(this.fromRow+1)+":"+Move.columnToChar(this.toColumn)+""+(this.toRow+1)+" prom:"+this.promotion+" objid:"+this.obj_id+" dummy:"+this.dummy+" endNode:"+this.endNode+" index:"+this.index+" moveNum:"+this.moveNum+" atEnd:"+this.atEnd+" beforeCom:"+this.beforeComment+" afterCom:"+this.afterComment;
};
Move.prototype.equals=function(m){
return (m&&(this.fromColumn==m.fromColumn&&this.fromRow==m.fromRow&&this.promotion==m.promotion&&this.toColumn==m.toColumn&&this.toRow==m.toRow));
};
Move.moveArraysEqual=function(a1,a2){
if(a1==a2){
return true;
}
if(a1==null||a2==null){
return false;
}
if(a1.length!=a2.length){
return false;
}
for(var i=0;i<a1.length;i++){
if(!a1[i].equals(a2[i])){
return false;
}
if(!Move.moveArraysEqual(a1[i].vars,a2[i].vars)){
return false;
}
}
return true;
};
Move.findMoveInNewArray=function(a1,a2,_50){
if(a1==a2){
return _50;
}
if(a1==null||a2==null){
return null;
}
if(a1.length!=a2.length){
return null;
}
for(var i=0;i<a1.length;i++){
if(!a1[i].equals(a2[i])){
return null;
}
if(!Move.moveArraysEqual(a1[i].vars,a2[i].vars)){
return null;
}
if(a1[i]==_50){
return a2[i];
}
}
return null;
};
Move.prototype.toMoveString=function(){
var _52="";
if(this.promotion){
_52=this.promotion;
}
return Move.columnToChar(this.fromColumn)+""+(this.fromRow+1)+Move.columnToChar(this.toColumn)+""+(this.toRow+1)+_52;
};
function getTagValue(_53,_54){
var _55=_53.getElementsByTagName(_54);
if(_55==null){
YAHOO.log("got null node for tag:"+_54);
return null;
}
if(_55.length==0){
YAHOO.log("got empty array node for tag:"+_54);
return null;
}
if(_55[0].firstChild==null){
YAHOO.log("firstChild is null for tag:"+_54);
return null;
}
if(_55[0].firstChild.nodeValue==null){
YAHOO.log("firstChild.nodeValue is null for tag:"+_54);
return null;
}
if(typeof (_55[0].textContent)!="undefined"){
return _55[0].textContent;
}
return _55[0].firstChild.nodeValue;
}
var ua=navigator.userAgent.toLowerCase();
var isOpera=(ua.indexOf("opera")>-1);
var isIphone=(navigator.userAgent.match(/iPhone/i))||(navigator.userAgent.match(/iPod/i));
var isIpad=(navigator.userAgent.match(/iPad/i));
var isSafari=(ua.indexOf("safari")>-1);
var isGecko=(!isOpera&&!isSafari&&ua.indexOf("gecko")>-1);
var isIE=(!isOpera&&ua.indexOf("msie")>-1);
function unescapeHtml(s){
var n=document.createElement("div");
n.innerHTML=s;
if(n.innerText){
return n.innerText;
}else{
return n.textContent;
}
}
ChessPiece=function(div,_59,_5a,_5b){
var id=div.id;
this.board=_5b;
this.icon=get_image_str(ChessPiece.pieceIconNames[_59][_5a],this.board.boardImagePath,this.board.pieceSet,this.board.pieceSize,this.board.addVersion);
this.colour=_59;
this.piece=_5a;
this.id=id;
this.div=div;
var _5d=_5b.getPieceDragDiv();
var _5e=false;
var _5f="";
if(_5d==null){
_5d=document.createElement("div");
_5d.id="pieceDragDiv";
_5e=true;
YAHOO.util.Dom.setStyle(_5d,"visibility","hidden");
YAHOO.util.Dom.setStyle(_5d,"border","0px");
YAHOO.util.Dom.setStyle(_5d,"position","absolute");
}
this.pieceDragEl=_5d;
this.pieceDragElId="pieceDragDiv";
if(_5e){
var _60=this.board.getDocBody();
if(_60){
_60.appendChild(_5d);
}
}
if(YAHOO.util.Event.isIE||isOpera){
var _61=this.div;
_61.innerHTML="<img src=\""+this.icon+"\"/>";
var img=_61.firstChild;
fix_ie_png(img);
}else{
YAHOO.util.Dom.setStyle([this.div],"backgroundImage","url("+this.icon+")");
}
YAHOO.util.Dom.setStyle([this.div],"height",this.board.pieceSize+"px");
YAHOO.util.Dom.setStyle([this.div],"width",this.board.pieceSize+"px");
if(isIphone||isIpad){
if(!this.board.clickAndClick){
initIphone(this.div);
}
}
YAHOO.util.Dom.setStyle([this.div],"position","relative");
if(!this.board.clickAndClick){
this.init(id,"ct-"+this.board.boardName+"-boardandpieces",{dragElId:this.pieceDragElId,resizeFrame:true,centerFrame:false,isTarget:false});
this.initFrame();
}
};
ChessPiece.prototype=new YAHOO.util.DDProxy();
ChessPiece.PAWN=0;
ChessPiece.BISHOP=1;
ChessPiece.KNIGHT=2;
ChessPiece.ROOK=3;
ChessPiece.KING=4;
ChessPiece.QUEEN=5;
ChessPiece.WHITE=0;
ChessPiece.BLACK=1;
ChessPiece.init=function(){
ChessPiece.pieceIconNames=new Array(2);
ChessPiece.pieceIconNames[0]=new Array(6);
ChessPiece.pieceIconNames[1]=new Array(6);
ChessPiece.pieceIconNames[ChessPiece.WHITE][ChessPiece.PAWN]="whitepawn";
ChessPiece.pieceIconNames[ChessPiece.WHITE][ChessPiece.BISHOP]="whitebishop";
ChessPiece.pieceIconNames[ChessPiece.WHITE][ChessPiece.KNIGHT]="whiteknight";
ChessPiece.pieceIconNames[ChessPiece.WHITE][ChessPiece.ROOK]="whiterook";
ChessPiece.pieceIconNames[ChessPiece.WHITE][ChessPiece.KING]="whiteking";
ChessPiece.pieceIconNames[ChessPiece.WHITE][ChessPiece.QUEEN]="whitequeen";
ChessPiece.pieceIconNames[ChessPiece.BLACK][ChessPiece.PAWN]="blackpawn";
ChessPiece.pieceIconNames[ChessPiece.BLACK][ChessPiece.BISHOP]="blackbishop";
ChessPiece.pieceIconNames[ChessPiece.BLACK][ChessPiece.KNIGHT]="blackknight";
ChessPiece.pieceIconNames[ChessPiece.BLACK][ChessPiece.ROOK]="blackrook";
ChessPiece.pieceIconNames[ChessPiece.BLACK][ChessPiece.KING]="blackking";
ChessPiece.pieceIconNames[ChessPiece.BLACK][ChessPiece.QUEEN]="blackqueen";
};
ChessPiece.materialValue=function(_63){
switch(_63){
case ChessPiece.PAWN:
return 1;
break;
case ChessPiece.BISHOP:
return 3;
break;
case ChessPiece.KNIGHT:
return 3;
break;
case ChessPiece.ROOK:
return 5;
break;
case ChessPiece.KING:
return 0;
break;
case ChessPiece.QUEEN:
return 9;
break;
}
return 0;
};
ChessPiece.prototype.free=function(){
if(!this.board.clickAndClick){
this.unreg();
}
};
ChessPiece.prototype.clickValidator=function(e){
if(this.board.dragDisabled){
return false;
}
if(!this.board.allowPreMoveSelection&&(this.board.toMove!=this.colour)){
return false;
}
if(this.board.restrictedColourMovement!=-1&&this.colour!=this.board.restrictedColourMovement){
return;
}
if(false&&this.board.clickAndClick){
return false;
}
var _65=YAHOO.util.Event.getTarget(e);
var _66=(this.isValidHandleChild(_65)&&(this.id==this.handleElId||this.DDM.handleWasClicked(_65,this.id)));
this.board.selectDestSquare(e);
if(true||!_66){
YAHOO.util.Event.preventDefault(e);
}
return _66;
};
ChessPiece.prototype.onDragOut=function(e,id){
this.insideBoard=false;
};
ChessPiece.prototype.onDragEnter=function(e,id){
this.insideBoard=true;
};
ChessPiece.prototype.endDrag=function(e){
if(this.board.lastOverSquare){
YAHOO.util.Dom.removeClass(this.board.lastOverSquare,"ct-over-valid-square");
YAHOO.util.Dom.removeClass(this.board.lastOverSquare,"ct-over-invalid-square");
}
this.board.lastOverSquare=null;
if(!this.insideBoard){
this.board.board_xy=null;
this.setPosition(this.column,this.row,false,null,this.board.moveAnimationLength);
}
if(!this.hideAfterDragEnd){
YAHOO.util.Dom.setStyle(this.getEl(),"visibility","visible");
}else{
this.hideAfterDragEnd=false;
}
};
ChessPiece.prototype.startDrag=function(x,y){
this.insideBoard=true;
var _6e=null;
if(this.board.currentMove){
if(this.board.currentMove.prev){
_6e=this.board.currentMove.prev;
}else{
_6e=this.board.prev_move;
}
}else{
_6e=this.board.prev_move;
}
if(this.board.highlightValidSquares){
this.candidates=null;
this.candidates=new Array(8);
for(var i=0;i<8;i++){
this.candidates[i]=new Array(8);
for(var j=0;j<8;j++){
this.candidates[i][j]=false;
}
}
}
this.pieceDragEl.innerHTML="<img src=\""+this.icon+"\"/>";
var img=this.pieceDragEl.firstChild;
fix_ie_png(img);
YAHOO.util.Dom.setStyle(this.pieceDragEl,"zIndex",1000);
YAHOO.util.Dom.setStyle(this.pieceDragEl,"height",this.board.pieceSize+"px");
YAHOO.util.Dom.setStyle(this.pieceDragEl,"width",this.board.pieceSize+"px");
YAHOO.util.Dom.setStyle(this.getEl(),"visibility","hidden");
if(this.board.highlightValidSquares){
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var _72=7-i;
var _73=j;
if(this.board.isFlipped){
_72=7-_72;
_73=7-_73;
}
if((_72==this.row&&_73==this.column)||this.board.canMove(this.makeLightWeight(),_73,_72,_6e,true)){
this.candidates[j][i]=true;
}
}
}
}
};
ChessPiece.prototype.onDragOver=function(e,id){
var x=YAHOO.util.Event.getPageX(e);
var y=YAHOO.util.Event.getPageY(e);
var _78=YAHOO.util.Dom.getX("ctb-"+this.board.boardName);
var _79=YAHOO.util.Dom.getY("ctb-"+this.board.boardName);
var c=parseInt((x-_78)/this.board.pieceSize);
var r=parseInt((y-_79)/this.board.pieceSize);
var _7c=this.board.boardName+"-s"+c+""+(7-r);
var _7d=YAHOO.util.Dom.get(_7c);
if(this.board.highlightValidSquares){
if(this.board.lastOverSquare){
if(this.board.lastOverSquare!=_7d){
YAHOO.util.Dom.removeClass(this.board.lastOverSquare,"ct-over-valid-square");
YAHOO.util.Dom.removeClass(this.board.lastOverSquare,"ct-over-invalid-square");
this.board.lastOverSquare=null;
if(this.candidates&&c<8&&c>=0&&r<8&&r>=0&&this.candidates[c][r]){
YAHOO.util.Dom.addClass(_7d,"ct-over-valid-square");
}else{
YAHOO.util.Dom.addClass(_7d,"ct-over-invalid-square");
}
}
}
this.board.lastOverSquare=_7d;
}
};
ChessPiece.prototype.onDragDrop=function(e,id){
if(this.board.blockFowardBack||this.board.deferredBlockForwardBack){
return false;
}
if(this.board.allowPreMoveSelection&&this.board.toMove!=this.colour){
return false;
}
if(this.board.lastOverSquare){
YAHOO.util.Dom.removeClass(this.board.lastOverSquare,"ct-over-valid-square");
YAHOO.util.Dom.removeClass(this.board.lastOverSquare,"ct-over-invalid-square");
}
var x=YAHOO.util.Event.getPageX(e);
var y=YAHOO.util.Event.getPageY(e);
var _82=YAHOO.util.Dom.getX("ctb-"+this.board.boardName);
var _83=YAHOO.util.Dom.getY("ctb-"+this.board.boardName);
var c=parseInt((x-_82)/this.board.pieceSize);
var r=parseInt((y-_83)/this.board.pieceSize);
if(this.board.isFlipped){
r=7-r;
c=7-c;
}
if(this.board.allowPreMoveSelection&&(this.board.boardPieces[this.column][this.row]!=this)){
this.setVisible(false);
this.hideAfterDragEnd=true;
return false;
}
var _86=false;
if(!this.board.currentMove||this.board.currentMove.atEnd){
_86=true;
}
this.board.updatePiece(this,c,7-r,false,false,true);
if(!_86&&this.board.currentMove&&!this.board.allowingFreeMovement&&this.board.currentMove.atEnd){
this.board.toggleToMove();
this.board.updateToPlay();
}
};
ChessPiece.prototype.makeLightWeight=function(){
var cp=this.board.createPiece(this.colour,this.piece,true);
cp.column=this.column;
cp.row=this.row;
cp.enPassant=this.enPassant;
cp.castled=this.castled;
return cp;
};
ChessPiece.prototype.removeFromParent=function(){
var _88=this.div;
if(_88.parentNode){
_88.parentNode.removeChild(_88);
}
};
ChessPiece.prototype.setVisible=function(_89){
var _8a;
var _8b;
if(_89){
_8b="block";
_8a="visible";
}else{
_8b="none";
_8a="hidden";
}
YAHOO.util.Dom.setStyle(this.id,"visibility",_8a);
};
ChessPiece.prototype.moveResponse=function(o){
};
ChessPiece.prototype.getIcon=function(){
return this.icon;
};
ChessPiece.prototype.makeHeavyWeight=function(){
return this.copyPiece();
};
ChessPiece.prototype.copyPiece=function(){
var cp=new ChessPiece(this.div,this.colour,this.piece,this.board);
cp.column=this.column;
cp.row=this.row;
cp.enPassant=this.enPassant;
cp.castled=this.castled;
return cp;
};
ChessPiece.prototype.changePieceKeepImage=function(_8e){
var _8f=(_8e+"").toLowerCase().charAt(0);
switch(_8f){
case "k":
this.piece=ChessPiece.KING;
break;
case "q":
this.piece=ChessPiece.QUEEN;
break;
case "r":
this.piece=ChessPiece.ROOK;
break;
case "b":
this.piece=ChessPiece.BISHOP;
break;
case "n":
this.piece=ChessPiece.KNIGHT;
break;
case "p":
this.piece=ChessPiece.PAWN;
break;
default:
}
};
ChessPiece.prototype.changePiece=function(_90){
this.changePieceKeepImage(_90);
this.icon=get_image_str(ChessPiece.pieceIconNames[this.colour][this.piece],this.board.boardImagePath,this.board.pieceSet,this.board.pieceSize,this.board.addVersion);
if(YAHOO.util.Event.isIE||isOpera){
var _91=this.div;
_91.innerHTML="<img src=\""+this.icon+"\"/>";
var img=_91.firstChild;
if(!isOpera){
fix_ie_png(img);
}
}else{
YAHOO.util.Dom.setStyle(this.div,"backgroundImage","url("+this.icon+")");
YAHOO.util.Dom.setStyle(this.div,"background-repeat","no-repeat");
}
};
ChessPiece.prototype.getNewXYPosition=function(_93,row){
var _95=this.board.getBoardDiv();
var _96=this.board.getXY();
var _97=_96[0];
var _98=_96[1];
var _99=[0,0];
if(this.board.isFlipped){
_99[0]=_97+((7-_93)*this.board.pieceSize);
_99[1]=_98+((row)*this.board.pieceSize);
}else{
_99[0]=_97+((_93)*this.board.pieceSize);
_99[1]=_98+((7-row)*this.board.pieceSize);
}
return _99;
};
ChessPiece.prototype.setPosition=function(_9a,row,_9c,_9d,_9e,_9f,_a0){
this.column=_9a;
this.row=row;
if(this.board.pieceMoveDisabled){
return;
}
var _a1=this.div;
var _a2=null;
if(this.board.isFlipped){
_a2=this.board.boardName+"-s"+(7-this.column)+""+(7-this.row);
}else{
_a2=this.board.boardName+"-s"+(this.column)+""+(this.row);
}
var _a3=this.board.getBoardDivFromId(_a2);
var _a4=null;
if(!_9f){
_a4=(this.colour==ChessPiece.WHITE)?this.board.whiteMoveSoundName:this.board.blackMoveSoundName;
}else{
_a4=(this.colour==ChessPiece.WHITE)?this.board.whiteTakeSoundName:this.board.blackTakeSoundName;
}
if(!_9c){
if(!this.board.settingUpPosition){
var _a5=this.getNewXYPosition(_9a,row);
YAHOO.util.Dom.setXY(_a1,_a5,false);
}else{
if(_a1.parentNode){
_a1.parentNode.removeChild(_a1);
}
_a3.appendChild(_a1);
}
this.setVisible(true);
if(_a0&&this.board.soundEnabled){
boardSounds.playSound(_a4);
}
if(_9d){
_9d();
}
}else{
var _a5=this.getNewXYPosition(_9a,row);
if(this.board.oldAnim&&this.board.oldAnim.isAnimated()){
this.board.oldAnim.stop();
YAHOO.util.Dom.setXY(this.board.oldAnimPieceDiv,this.board.old_new_xy,false);
}
var _a6=new YAHOO.util.Motion(_a1,{points:{to:_a5}});
this.board.oldAnim=_a6;
this.board.oldAnimPieceDiv=_a1;
this.board.old_new_xy=_a5;
_a6.duration=_9e;
var _a7=this;
_a6.onComplete.subscribe(function(){
if(_a7.board.soundEnabled){
boardSounds.playSound(_a4);
}
});
if(_9d){
_a6.onComplete.subscribe(_9d);
}
_a6.animate();
}
};
ChessPiece.prototype.getFenLetter=function(){
var _a8=ChessPiece.pieceTypeToChar(this.piece)+"";
if(this.colour!=ChessPiece.WHITE){
_a8=_a8.toLowerCase();
}
return _a8;
};
ChessPiece.pieceTypeToChar=function(_a9){
switch(_a9){
case ChessPiece.KING:
return "K";
case ChessPiece.QUEEN:
return "Q";
case ChessPiece.ROOK:
return "R";
case ChessPiece.BISHOP:
return "B";
case ChessPiece.KNIGHT:
return "N";
case ChessPiece.PAWN:
return "P";
}
return "?";
};
LightweightChessPiece=function(div,_ab,_ac,_ad){
this.board=_ad;
this.colour=_ab;
this.piece=_ac;
this.div=div;
};
LightweightChessPiece.prototype.getFenLetter=ChessPiece.prototype.getFenLetter;
LightweightChessPiece.prototype.makeLightWeight=function(){
return this.copyPiece();
};
LightweightChessPiece.prototype.makeHeavyWeight=function(){
var cp=this.board.createPiece(this.colour,this.piece,false);
cp.column=this.column;
cp.row=this.row;
cp.enPassant=this.enPassant;
cp.castled=this.castled;
return cp;
};
LightweightChessPiece.prototype.setVisible=function(_af){
};
LightweightChessPiece.prototype.free=function(){
};
LightweightChessPiece.prototype.setPosition=function(_b0,row,_b2,_b3,_b4){
this.column=_b0;
this.row=row;
};
LightweightChessPiece.prototype.copyPiece=function(){
var cp=new LightweightChessPiece(this.id,this.colour,this.piece,this.board);
cp.column=this.column;
cp.row=this.row;
return cp;
};
LightweightChessPiece.prototype.changePiece=function(_b6){
this.changePieceKeepImage(_b6);
};
LightweightChessPiece.prototype.changePieceKeepImage=function(_b7){
var _b8=(_b7+"").toLowerCase().charAt(0);
switch(_b8){
case "k":
this.piece=ChessPiece.KING;
break;
case "q":
this.piece=ChessPiece.QUEEN;
break;
case "r":
this.piece=ChessPiece.ROOK;
break;
case "b":
this.piece=ChessPiece.BISHOP;
break;
case "n":
this.piece=ChessPiece.KNIGHT;
break;
case "p":
this.piece=ChessPiece.PAWN;
break;
default:
}
};
MovesDisplay=function(_b9,_ba){
this.board=_b9;
this.displayType=_ba;
};
MovesDisplay.DEFAULT_DISPLAY_TYPE=0;
MovesDisplay.MAIN_ON_OWN_LINE=1;
Board=function(_bb){
this.boardName=_bb;
if(_bb){
this.initTarget("ctb-"+_bb,"ct-"+this.boardName+"-boardandpieces");
this.boardPieces=Board.createBoardArray();
}
this.imagesLoaded=false;
this.disableNavigation=false;
this.currentMove=null;
this.outputWithoutDisplay=false;
this.moveIndex=-1;
this.dontUpdatePositionReachedTable=false;
this.restrictedColourMovement=-1;
this.settingUpPosition=false;
this.pendingLevelZeroCommentaryClose=false;
this.isUserFlipped=false;
this.registeredFlipListeners=[];
this.registeredSpaceListeners=[];
this.registeredForwardAtEndListeners=[];
this.registeredPasteFenClickedListeners=[];
this.registeredGotoMoveIndexListeners=[];
this.registeredBackMovePreCurrentListeners=[];
this.registeredForwardMovePostUpdateListeners=[];
this.registeredUpdateListeners=[];
this.registeredUpdatePieceFinishedListeners=[];
this.registeredUpdateEndOfMovesListeners=[];
this.registeredUpdateHaveAltListeners=[];
this.registeredUpdateWrongMoveListeners=[];
this.registeredUpdateAllowMoveListeners=[];
this.registeredMakeMoveListeners=[];
this.moveNumber=1;
this.halfMoveNumber=0;
};
Board.prototype=new YAHOO.util.DDTarget();
Board.invertToMove=function(_bc){
if(_bc==ChessPiece.WHITE){
return ChessPiece.BLACK;
}else{
return ChessPiece.WHITE;
}
};
Board.boardStyleToClassName=function(_bd){
var _be="";
switch(_bd){
case 0:
_be="-lightgrey";
break;
case 1:
_be="-grey";
break;
case 2:
_be="-brown";
break;
case 3:
_be="-green";
break;
case 4:
_be="-woodlight";
break;
case 5:
_be="-wooddark";
break;
case 6:
_be="-metal";
break;
case 7:
_be="-marblebrown";
break;
case 8:
_be="-stucco";
break;
case 9:
_be="-goldsilver";
break;
case 10:
_be="-sandsnow";
break;
case 11:
_be="-crackedstone";
break;
case 12:
_be="-granite";
break;
case 13:
_be="-marblegreen";
break;
case 14:
_be="-greenwhite";
break;
default:
}
return _be;
};
Board.createBoardArray=function(){
var _bf=boardPool.getObject();
if(_bf==null){
_bf=new Array(8);
for(var i=0;i<8;i++){
_bf[i]=new Array(8);
}
}
return _bf;
};
Board.prototype.preloadPieces=function(){
var _c1=[];
for(var i=0;i<ChessPiece.QUEEN;i++){
for(var j=0;j<2;j++){
var _c4=get_image_str(ChessPiece.pieceIconNames[j][i],this.boardImagePath,this.pieceSet,this.pieceSize,true);
_c1.push(_c4);
}
}
var _c5=this;
function checkImages(){
var _c6=true;
for(var i=0;i<_c1.length;i++){
var img=document.createElement("img");
img.src=_c1[i];
if(!img.complete||(typeof img.naturalWidth!="undefined"&&img.naturalWidth==0)){
_c6=false;
}
}
if(!_c6){
setTimeout(checkImages,1000);
}else{
_c5.imagesLoaded=true;
}
}
checkImages();
};
Board.prototype.selectDestSquare=function(e){
if(this.clickAndClickDisabled){
return true;
}
var _ca=(new Date()).getTime();
var _cb=false;
if(_ca-this.lastDestClick<100){
_cb=true;
}
this.lastDestClick=_ca;
var x=YAHOO.util.Event.getPageX(e);
var y=YAHOO.util.Event.getPageY(e);
var _ce=YAHOO.util.Dom.getX("ctb-"+this.boardName);
var _cf=YAHOO.util.Dom.getY("ctb-"+this.boardName);
var c=parseInt((x-_ce)/this.pieceSize);
var r=parseInt((y-_cf)/this.pieceSize);
var _d2=this.boardName+"-s"+c+""+(7-r);
var _d3=YAHOO.util.Dom.get(_d2);
if(_d3==this.oldSelectedSquare){
if(!_cb){
YAHOO.util.Dom.removeClass(_d3,"ct-source-square");
this.oldSelectedSquare=null;
this.oldSelectedPiece=null;
if(this.oldDestSquare){
YAHOO.util.Dom.removeClass(this.oldDestSquare,"ct-dest-square");
this.oldDestSquare=null;
}
}
return true;
}
if(this.isFlipped){
c=7-c;
r=7-r;
}
r=7-r;
var _d4=this.boardPieces[c][r];
if(_d4&&(_d4.colour==this.toMove||this.allowPreMoveSelection)&&(this.restrictedColourMovement==-1||(_d4.colour==this.restrictedColourMovement))){
if(this.oldSelectedSquare){
YAHOO.util.Dom.removeClass(this.oldSelectedSquare,"ct-source-square");
}
if(this.oldDestSquare){
YAHOO.util.Dom.removeClass(this.oldDestSquare,"ct-dest-square");
this.oldDestSquare=null;
}
YAHOO.util.Dom.addClass(_d3,"ct-source-square");
this.oldSelectedSquare=_d3;
this.oldSelectedPiece=_d4;
}else{
if(this.oldSelectedSquare){
if(this.oldSelectedPiece&&this.oldSelectedPiece.colour!=this.toMove){
return false;
}
var _d5=null;
if(this.currentMove){
if(this.currentMove.prev){
_d5=this.currentMove.prev;
}else{
_d5=this.prev_move;
}
}else{
_d5=this.prev_move;
}
if(this.canMove(this.oldSelectedPiece.makeLightWeight(),c,r,_d5,true)){
this.lastDestSquare=_d3;
this.lastDestRow=r;
this.lastDestColumn=c;
YAHOO.util.Dom.removeClass(this.oldSelectedSquare,"ct-source-square");
var _d6=false;
if(!this.currentMove||this.currentMove.atEnd){
_d6=true;
}
this.updatePiece(this.oldSelectedPiece,c,r,false,false,true);
this.oldSelectedPiece=null;
this.oldSelectedSquare=null;
if(!_d6&&this.currentMove&&!this.allowingFreeMovement&&this.currentMove.atEnd){
this.toggleToMove();
this.updateToPlay();
}
}else{
}
}else{
return true;
}
}
};
Board.prototype.selectSourcePiece=function(_d7){
if(this.lastSourceSquare){
YAHOO.util.Dom.removeClass(_d8,"ct-source-square");
}
var r=_d7.row;
var c=_d7.column;
if(this.isFlipped){
r=7-r;
c=7-c;
}
var _db=this.boardName+"-s"+c+""+r;
var _d8=YAHOO.util.Dom.get(_db);
YAHOO.util.Dom.addClass(_d8,"ct-source-square");
this.lastSourceSquare=_d8;
this.lastSourcePiece=_d7;
this.lastSourceRow=_d7.row;
this.lastSourceColumn=_d7.column;
};
Board.prototype.toggleToMove=function(){
if(this.toMove==ChessPiece.WHITE){
this.toMove=ChessPiece.BLACK;
}else{
this.toMove=ChessPiece.WHITE;
}
};
Board.prototype.setupPieceDivs=function(){
var _dc=this.getBoardDiv();
if(this.pieces){
for(var i=0;i<32;i++){
if(this.pieces[i]){
this.pieces[i].setVisible(false);
this.pieces[i].free();
this.pieces[i]=null;
}
}
}
if(this.availPieceDivs){
for(var i=0;i<32;i++){
if(this.availPieceDivs[i]){
if(this.availPieceDivs[i].parentNode){
this.availPieceDivs[i].parentNode.removeChild(this.availPieceDivs[i]);
}
}
}
}
this.availids=null;
this.availIds=new Array(32);
this.availPieceDivs=null;
this.availPieceDivs=new Array(32);
this.pieces=null;
this.pieces=new Array(32);
this.uptoId=0;
this.uptoPiece=0;
};
Board.prototype.getXY=function(){
if(true||!this.board_xy){
this.board_xy=YAHOO.util.Dom.getXY("ctb-"+this.boardName);
}
return this.board_xy;
};
Board.prototype.updateFromTo=function(_de,_df,_e0,_e1,_e2,_e3){
YAHOO.util.Dom.removeClass(this.lastFromSquare,"ct-from-square");
YAHOO.util.Dom.removeClass(this.lastToSquare,"ct-to-square");
if(_e0==null){
return;
}
this.lastFromSquare=_de;
this.lastToSquare=_df;
this.lastFromRow=_e0;
this.lastFromColumn=_e1;
this.lastToRow=_e2;
this.lastToColumn=_e3;
if(this.highlightFromTo){
YAHOO.util.Dom.addClass(_de,"ct-from-square");
YAHOO.util.Dom.addClass(_df,"ct-to-square");
}
};
Board.prototype.makeMove=function(_e4,_e5,_e6,_e7,_e8,_e9,_ea,_eb,_ec){
var _ed;
var _ee;
if(!this.isFlipped){
_ed=YAHOO.util.Dom.get(this.boardName+"-s"+_e4.fromColumn+""+_e4.fromRow);
_ee=YAHOO.util.Dom.get(this.boardName+"-s"+_e4.toColumn+""+_e4.toRow);
}else{
_ed=YAHOO.util.Dom.get(this.boardName+"-s"+(7-_e4.fromColumn)+""+(7-_e4.fromRow));
_ee=YAHOO.util.Dom.get(this.boardName+"-s"+(7-_e4.toColumn)+""+(7-_e4.toRow));
}
if(this.oldSelectedSquare){
if(!this.allowPreMoveSelection||(this.oldSelectedPiece&&_e5&&(this.oldSelectedPiece.colour==_e5.colour))){
YAHOO.util.Dom.removeClass(this.oldSelectedSquare,"ct-source-square");
this.oldSelectedSquare=null;
this.oldSelectedPiece=null;
}
}
if(_e9){
this.updateFromTo(_ed,_ee,_e4.fromRow,_e4.fromColumn,_e4.toRow,_e4.toColumn);
}
var _ef=this.boardPieces[_e4.toColumn][_e4.toRow];
if(_ef!=null){
_ef.enPassant=false;
_ef.castled=false;
}
if(_e5.piece==ChessPiece.PAWN&&_e4.toColumn!=_e4.fromColumn&&this.boardPieces[_e4.toColumn][_e4.toRow]==null){
_ef=this.boardPieces[_e4.toColumn][_e4.fromRow];
this.boardPieces[_e4.toColumn][_e4.fromRow]=null;
if(_ef!=null){
_ef.enPassant=true;
}
}
var _f0=null;
if(_e5.piece==ChessPiece.KING&&Math.abs(_e4.toColumn-_e4.fromColumn)>1){
var _f1;
var _f2;
if(_e4.toColumn>_e4.fromColumn){
_f0=this.boardPieces[7][_e4.fromRow];
_f1=_e4.fromRow;
_f2=5;
this.boardPieces[7][_e4.toRow]=null;
}else{
_f0=this.boardPieces[0][_e4.fromRow];
_f1=_e4.fromRow;
_f2=3;
this.boardPieces[0][_e4.toRow]=null;
}
if(!_f0){
alert("No castle piece");
}else{
_f0.setPosition(_f2,_f1,_e6,null,_e7,null,_ec);
this.boardPieces[_f0.column][_f0.row]=_f0;
_f0.castled=true;
}
}
_e4.taken=_ef;
if(_ef&&_e8){
this.processTaken(_ef,true);
}
this.moveNumber++;
_e4.preHalfMoveNumber=this.halfMoveNumber;
this.halfMoveNumber++;
if(_ef||_e5.piece==ChessPiece.PAWN){
this.halfMoveNumber=0;
}
this.board_xy=null;
if(_e4.promotion!=null){
_e5.changePieceKeepImage(_e4.promotion);
}
_e5.setPosition(_e4.toColumn,_e4.toRow,_e6,function(){
var tp=_ef;
if(tp){
tp.setVisible(false);
}
if(_e4.promotion!=null){
_e5.changePiece(_e4.promotion);
}
if(_ea){
_ea.call(_eb);
}
},_e7,_ef,_ec);
if(!_e6){
if(_e4.promotion!=null){
_e5.changePiece(_e4.promotion);
}
}
this.boardPieces[_e4.fromColumn][_e4.fromRow]=null;
this.boardPieces[_e4.toColumn][_e4.toRow]=_e5;
if(_f0!=null){
_e4.taken=_f0;
}
_e4.preCastleQueenSide=new Array(2);
_e4.preCastleKingSide=new Array(2);
_e4.preCastleQueenSide[0]=this.canCastleQueenSide[0];
_e4.preCastleQueenSide[1]=this.canCastleQueenSide[1];
_e4.preCastleKingSide[0]=this.canCastleKingSide[0];
_e4.preCastleKingSide[1]=this.canCastleKingSide[1];
if(_e5.piece==ChessPiece.ROOK){
if(((_e5.colour==ChessPiece.WHITE)&&_e4.fromRow==0)||((_e5.colour==ChessPiece.BLACK)&&_e4.fromRow==7)){
if(_e4.fromColumn==0){
this.canCastleQueenSide[_e5.colour]=false;
}else{
if(_e4.fromColumn==7){
this.canCastleKingSide[_e5.colour]=false;
}
}
}
}else{
if(_e5.piece==ChessPiece.KING){
this.canCastleQueenSide[_e5.colour]=false;
this.canCastleKingSide[_e5.colour]=false;
}else{
if(_ef&&(_ef.piece==ChessPiece.ROOK)){
if(_e4.toColumn==0){
if(((_ef.colour==ChessPiece.WHITE)&&_e4.toRow==0)||((_ef.colour==ChessPiece.BLACK)&&_e4.toRow==7)){
this.canCastleQueenSide[_ef.colour]=false;
}
}else{
if(_e4.toColumn==7){
if(((_ef.colour==ChessPiece.WHITE)&&_e4.toRow==0)||((_ef.colour==ChessPiece.BLACK)&&_e4.toRow==7)){
this.canCastleKingSide[_ef.colour]=false;
}
}
}
}
}
}
this.updatePositionReached(_e5.colour);
for(var i=0;i<this.registeredMakeMoveListeners.length;i++){
var _f5=this.registeredMakeMoveListeners[i].makeMoveCallback(_e4);
}
};
Board.prototype.isThreeFoldRep=function(_f6){
var _f7=this.toMove;
if(_f6){
if(_f7==ChessPiece.WHITE){
_f7=ChessPiece.BLACK;
}else{
_f7=ChessPiece.WHITE;
}
}
var _f8=this.boardToUniqueFen(_f7);
return (this.positionsSeen[_f8]>=3);
};
Board.prototype.updatePositionReached=function(_f9){
if(this.dontUpdatePositionReachedTable){
return;
}
var _fa=this.boardToUniqueFen(_f9);
if(!this.positionsSeen){
this.positionsSeen=[];
}
if(this.positionsSeen[_fa]){
this.positionsSeen[_fa]++;
}else{
this.positionsSeen[_fa]=1;
}
};
Board.prototype.promptPromotion=function(_fb,col,row,_fe,_ff){
_fb.prePromotionColumn=_fb.column;
_fb.prePromotionRow=_fb.row;
_fb.setPosition(col,row,false,null,this.moveAnimationLength);
var _100=this;
var _101=new YAHOO.widget.Dialog("promotionDialogId",{width:"300px",fixedcenter:true,visible:true,modal:true,close:false,constraintoviewport:true,buttons:[{text:_js("Queen"),handler:function(){
_101.hide();
_100.updatePiece(_fb,col,row,_fe,_ff,false,"q");
},isDefault:true},{text:_js("Rook"),handler:function(){
_101.hide();
_100.updatePiece(_fb,col,row,_fe,_ff,false,"r");
},isDefault:false},{text:_js("Bishop"),handler:function(){
_101.hide();
_100.updatePiece(_fb,col,row,_fe,_ff,false,"b");
},isDefault:false},{text:_js("Knight"),handler:function(){
_101.hide();
_100.updatePiece(_fb,col,row,_fe,_ff,false,"n");
},isDefault:false}]});
_101.setHeader(_js("Select Promotion Piece"));
_101.setBody("<div></div>");
_101.render(document.body);
};
Board.moveToLocale=function(_102){
if(!_102||_102==""){
return _102;
}
var _103="";
for(var i=0;i<_102.length;i++){
var _105=_102.charAt(i);
switch(_105){
case "K":
_105=_js("K");
break;
case "Q":
_105=_js("Q");
break;
case "R":
_105=_js("R");
break;
case "N":
_105=_js("N");
break;
case "B":
_105=_js("B");
break;
case "P":
_105=_js("P");
break;
case "a":
_105=_js("a");
break;
case "b":
_105=_js("b");
break;
case "c":
_105=_js("c");
break;
case "d":
_105=_js("d");
break;
case "e":
_105=_js("e");
break;
case "f":
_105=_js("f");
break;
case "g":
_105=_js("g");
break;
case "h":
_105=_js("h");
break;
case "x":
_105=_js("x");
break;
case "#":
_105=_js("#");
break;
}
_103+=_105;
}
return _103;
};
Board.prototype.updatePiece=function(_106,col,row,_109,_10a,_10b,_10c,_10d){
if(_10c){
this.board_xy=null;
if(_106.prePromotionRow){
_106.row=_106.prePromotionRow;
_106.column=_106.prePromotionColumn;
}
}
if(_10c==null&&_106.column==col&&_106.row==row){
this.board_xy=null;
_106.setPosition(_106.column,_106.row,false,null,this.moveAnimationLength);
if(clog){
console.log("moved piece back to its orig position");
}
return;
}
var _10e=null;
if(this.currentMove){
if(this.currentMove.prev){
_10e=this.currentMove.prev;
}else{
_10e=this.prev_move;
}
}else{
_10e=this.prev_move;
}
if(clog){
if(this.currentMove){
console.log("updatepiece currentMove:"+this.currentMove.output());
}else{
console.log("updatepiece currentmove null");
}
}
if(!_109&&!this.canMove(_106.makeLightWeight(),col,row,_10e,true)){
this.board_xy=null;
_106.setPosition(_106.column,_106.row,false,null,0.5);
if(clog){
console.log("move not legal , move back to orig:"+this.toMove);
if(_10e){
console.log("prevMove was:"+_10e.output());
}else{
console.log("prevMove was null");
}
}
return;
}
var _10f="";
if(_10b&&_106.piece==ChessPiece.PAWN&&(row==7||row==0)){
this.promptPromotion(_106,col,row,_109,_10a);
return;
}else{
if(_10c!=null){
_10f=_10c;
}
}
var _110=true;
var _111="";
_111+=Move.columnToChar(_106.column);
_111+=String.fromCharCode("1".charCodeAt(0)+_106.row);
_111+=Move.columnToChar(col);
_111+=String.fromCharCode("1".charCodeAt(0)+(row));
if(_10f){
_111+=_10f;
}
var _112=this.createMoveFromString(_111);
var move=this.currentMove;
if(move){
_112.moveNum=move.moveNum;
}
var res=null;
for(var i=0;i<this.registeredUpdateListeners.length;i++){
_116=this.registeredUpdateListeners[i].updatePieceCallback(_10f,_106,col,row,_109,_10a,_10b,_10c,_10d,_10e,this.currentMove,_112);
if(!_116){
return false;
}
if(!_116.ignoreRetVal){
res=_116;
}
}
if(!res){
if(clog){
console.log("Got no update piece callbak");
}
return false;
}
if(res.allowMove){
if(this.oldSelectedSquare){
YAHOO.util.Dom.removeClass(this.oldSelectedSquare,"ct-source-square");
}
var move=res.move;
for(var i=0;i<this.registeredUpdateAllowMoveListeners.length;i++){
var res2=this.registeredUpdateAllowMoveListeners[i].updateAllowMoveCallback(_10f,_106,col,row,_109,_10a,_10b,_10c,_10d,move);
}
this.makeMove(move,_106,_10a,this.moveAnimationLength,true,true,null,null,true);
var _118=!res.dontMakeOpponentMove&&!_109&&(this.currentMove&&this.currentMove.next&&!this.currentMove.next.atEnd);
if(clog){
if(move.next){
console.log("setting current move in updatepiece to:"+move.next.output());
}else{
console.log("in updatepiece, current move being set to null");
}
}
this.setCurrentMove(move.next,false,_118);
if(this.currentMove.atEnd){
for(var i=0;i<this.registeredUpdateEndOfMovesListeners.length;i++){
var res=this.registeredUpdateEndOfMovesListeners[i].updateEndOfMovesCallback(_10f,_106,col,row,_109,_10a,_10b,_10c,_10d);
}
}
if(_118){
opponentMove=this.currentMove;
if(this.currentMove&&this.currentMove.next.atEnd){
this.toggleToMove();
}
this.updatePiece(this.boardPieces[opponentMove.fromColumn][opponentMove.fromRow],opponentMove.toColumn,opponentMove.toRow,true,true,false);
}
}else{
var move=res.move;
var _119=_106.column;
var _11a=_106.row;
this.board_xy=null;
_106.setPosition(_106.column,_106.row,false,null,this.moveAnimationLength);
for(var i=0;i<this.registeredUpdateWrongMoveListeners.length;i++){
var res=this.registeredUpdateWrongMoveListeners[i].updateWrongMoveCallback(_10f,_106,col,row,_109,_10a,_10b,_10c,_10d,move);
}
}
for(var i=0;i<this.registeredUpdatePieceFinishedListeners.length;i++){
var _116=this.registeredUpdatePieceFinishedListeners[i].updatePieceFinishedCallback(_10f,_106,col,row,_109,_10a,_10b,_10c,_10d,_10e,this.currentMove,_112);
}
};
Board.prototype.addGotoMoveIndexListener=function(_11b){
this.registeredGotoMoveIndexListeners.push(_11b);
};
Board.prototype.addPasteFenClickedListener=function(_11c){
this.registeredPasteFenClickedListeners.push(_11c);
};
Board.prototype.addBackMovePreCurrentListener=function(_11d){
this.registeredBackMovePreCurrentListeners.push(_11d);
};
Board.prototype.addForwardMovePostUpdateListener=function(_11e){
this.registeredForwardMovePostUpdateListeners.push(_11e);
};
Board.prototype.addForwardAtEndListener=function(_11f){
this.registeredForwardAtEndListeners.push(_11f);
};
Board.prototype.addUpdatePieceListener=function(_120){
this.registeredUpdateListeners.push(_120);
};
Board.prototype.addUpdatePieceFinishedListener=function(_121){
this.registeredUpdatePieceFinishedListeners.push(_121);
};
Board.prototype.addUpdatePieceEndOfMovesListener=function(_122){
this.registeredUpdateEndOfMovesListeners.push(_122);
};
Board.prototype.addUpdatePieceHaveAltListener=function(_123){
this.registeredUpdateHaveAltListeners.push(_123);
};
Board.prototype.addUpdatePieceAllowMoveListener=function(_124){
this.registeredUpdateAllowMoveListeners.push(_124);
};
Board.prototype.addMakeMoveListener=function(_125){
this.registeredMakeMoveListeners.push(_125);
};
Board.prototype.addUpdatePieceWrongMoveListener=function(_126){
this.registeredUpdateWrongMoveListeners.push(_126);
};
Board.prototype.scoreToShortString=function(_127){
if(_127=="draw"){
return "D";
}
if(_127>=0){
return "M"+_127;
}else{
return "L"+(-1*_127);
}
};
Board.prototype.scoreToLongString=function(_128){
if(_128=="draw"){
return _js("Draw");
}
if(_128==0){
return _js("Mate");
}else{
if(_128>0){
return __js("Mate in {NUMBER_MOVES}",[["NUMBER_MOVES",_128]]);
}else{
return __js("Lose in {NUMBER_MOVES}",[["NUMBER_MOVES",(-1*_128)]]);
}
}
};
Board.prototype.egMoveToScoreString=function(_129){
var _12a=_129.score;
var _12b=_129.optimal_score;
var s=this.scoreToShortString(_12a);
var opt=this.scoreToShortString(_12b);
var _12e=this.scoreToLongString(_12a);
var _12f=this.scoreToLongString(_12b);
if(_12a==_12b){
return ["",_12e];
}else{
var _130="ct-subopt-move-score";
if(_12a=="draw"||_12a<0){
_130="ct-bad-move-score";
}
return ["<span class=\""+_130+"\">"+s+"("+opt+")</span>",_12e+"("+_12f+")"];
}
};
Board.prototype.makeShortAlgabraic=function(_131,_132,_133,_134,_135){
if(clog){
console.log("fromCol:"+_131+" fromRow:"+_132+" toCol:"+_133+" toRow:"+_134);
}
var _136=this.boardPieces[_131][_132];
var _137=_136.piece;
var _138=ChessPiece.pieceTypeToChar(_137);
var move="";
if(_137==ChessPiece.PAWN){
if(_131==_133){
move=Move.columnToChar(_131)+""+(_134+1);
}else{
move=Move.columnToChar(_131)+"x"+Move.columnToChar(_133)+""+(_134+1);
if(!this.boardPieces[_133][_134]){
move+=" e.p.";
}
}
}else{
if(_137==ChessPiece.KING){
var _13a=Math.abs(_131-_133);
if(_13a==1||_13a==0){
move=_138;
if(this.boardPieces[_133][_134]){
move+="x";
}
move+=Move.columnToChar(_133)+""+(_134+1);
}else{
if(_133==6){
move="O-O";
}else{
move="O-O-O";
}
}
}else{
var _13b=[];
for(var row=0;row<8;row++){
for(var col=0;col<8;col++){
var cp=this.boardPieces[col][row];
if(cp&&cp.colour==_136.colour&&cp.piece==_137&&!(_136.column==cp.column&&_136.row==cp.row)){
var prev=null;
if(this.currentMove){
prev=this.currentMove.prev;
}
if(this.canMove(cp.makeLightWeight(),_133,_134,prev,true)){
_13b.push(cp);
}
}
}
}
move=_138;
if(_13b.length>0){
var _140=false;
var _141=false;
for(var i=0;i<_13b.length;i++){
if(_13b[i].row==_132){
_141=true;
}
if(_13b[i].column==_131){
_140=true;
}
}
if(_141||!(_141||_140)){
move+=Move.columnToChar(_131);
}
if(_140){
move+=""+(_132+1);
}
}
if(this.boardPieces[_133][_134]){
move+="x";
}
move+=Move.columnToChar(_133)+""+(_134+1);
}
}
var _143="";
var _144="";
if(_135){
var _145=this.cloneBoard();
var _146=ChessPiece.WHITE;
if(_145.boardPieces[_135.fromColumn][_135.fromRow].colour==ChessPiece.WHITE){
_146=ChessPiece.BLACK;
}
_145.makeMove(_135,_145.boardPieces[_135.fromColumn][_135.fromRow],false,_145.moveAnimationLength,false,false);
if(!_145.isKingSafe(_146,_135)){
_143="+";
if(_145.isKingMated(_146,_135)){
_143="#";
}
}
if(_135.promotion){
_144="="+((_135.promotion+"").toUpperCase());
}
}
move+=_144+_143;
return move;
};
Board.getVarMove=function(move,row,col,_14a,_14b){
if(move.vars&&move.vars.length>0){
var i=0;
for(var i=0;i<move.vars.length;i++){
var _14d=move.vars[i];
if(_14d.fromColumn==_14a.column&&_14d.fromRow==_14a.row&&_14d.toRow==row&&_14d.toColumn==col&&(_14b==""||(_14b==_14d.promotion))){
return _14d;
}
}
}
};
Board.prototype.createMoveFromString=function(_14e){
var _14f=0;
var take=false;
var _151=null;
var _152=_14e.charCodeAt(_14f++);
var _153=_14e.charCodeAt(_14f++);
var _154=_14e.split("|");
var pgn=null;
if(_154.length>1){
pgn=_154[1];
_14e=_154[0];
}else{
_14e=_154[0];
}
if(_14e.charAt(_14f)=="x"){
_14f++;
take=true;
}
var _156=_14e.charCodeAt(_14f++);
var _157=_14e.charCodeAt(_14f++);
if(_14f<_14e.length){
_151=_14e.charAt(_14f);
}
var move=new Move(_152-("a".charCodeAt(0)),_153-("1".charCodeAt(0)),_156-("a".charCodeAt(0)),_157-("1".charCodeAt(0)),take,_151,_14e);
move.pgn=pgn;
return move;
};
Board.prototype.getBackButton=function(){
if(!this.backButton){
this.backButton=YAHOO.util.Dom.get(this.boardName+"-back");
}
return this.backButton;
};
Board.prototype.getForwardButton=function(){
if(!this.forwardButton){
this.forwardButton=YAHOO.util.Dom.get(this.boardName+"-forward");
}
return this.forwardButton;
};
Board.prototype.getEndButton=function(){
if(!this.endButton){
this.endButton=YAHOO.util.Dom.get(this.boardName+"-end");
}
return this.endButton;
};
Board.prototype.getStartButton=function(){
if(!this.startButton){
this.startButton=YAHOO.util.Dom.get(this.boardName+"-start");
}
return this.startButton;
};
Board.prototype.setForwardBack=function(){
var back=this.getBackButton();
var _15a=this.getForwardButton();
var end=this.getEndButton();
var _15c=this.getStartButton();
if(!this.currentMove){
if(back){
back.src=this.boardImagePath+"/images/resultset_previous_disabled"+this.getVersString()+".gif";
}
if(_15c){
_15c.src=this.boardImagePath+"/images/disabled_resultset_first"+this.getVersString()+".gif";
}
if(_15a){
_15a.src=this.boardImagePath+"/images/resultset_next_disabled"+this.getVersString()+".gif";
}
if(end){
end.src=this.boardImagePath+"/images/disabled_resultset_last"+this.getVersString()+".gif";
}
return;
}
if(this.currentMove.prev==null){
if(back){
back.src=this.boardImagePath+"/images/resultset_previous_disabled"+this.getVersString()+".gif";
}
if(_15c){
_15c.src=this.boardImagePath+"/images/disabled_resultset_first"+this.getVersString()+".gif";
}
}else{
if(back){
back.src=this.boardImagePath+"/images/resultset_previous"+this.getVersString()+".gif";
}
if(_15c){
_15c.src=this.boardImagePath+"/images/resultset_first"+this.getVersString()+".gif";
}
}
if(this.currentMove.atEnd){
if(_15a){
_15a.src=this.boardImagePath+"/images/resultset_next_disabled"+this.getVersString()+".gif";
}
if(end){
end.src=this.boardImagePath+"/images/disabled_resultset_last"+this.getVersString()+".gif";
}
}else{
if(_15a){
_15a.src=this.boardImagePath+"/images/resultset_next"+this.getVersString()+".gif";
}
if(end){
end.src=this.boardImagePath+"/images/resultset_last"+this.getVersString()+".gif";
}
}
};
Board.prototype.convertPiecesFromLightWeight=function(_15d){
var _15e=this.settingUpPosition;
this.settingUpPosition=true;
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
if(this.boardPieces[i][j]!=null){
var _161=this.boardPieces[i][j];
var p=_161.makeHeavyWeight();
this.boardPieces[i][j]=p;
p.setPosition(p.column,p.row,false,null,this.moveAnimationLength);
p.setVisible(true);
}
}
}
var move=this.moveArray[_15d];
while(move!=null){
if(move.taken){
move.taken=move.taken.makeHeavyWeight();
}
move=move.prev;
}
this.settingUpPosition=_15e;
};
MovesDisplay.prototype.setToMove=function(_164){
this.toMove=_164;
};
MovesDisplay.prototype.clickComment=function(e){
var t=e.currentTarget?e.currentTarget:e.targetElement?e.targetElement:false;
if(!t){
t=YAHOO.util.Event.getTarget(e);
}
if(!t.id){
t=t.parentNode;
}
var _167=t.id.substr((this.board.boardName+"-mcX").length);
var _168=true;
if(t.id.indexOf("-mca")>=0){
_168=false;
}
var move=this.board.moveArray[_167];
var _16a="";
if(_168){
_16a=move.beforeComment;
}else{
_16a=move.afterComment;
}
mySimpleDialog=new YAHOO.widget.SimpleDialog(this.boardName+"-editCommentDialog",{width:"20em",fixedcenter:true,modal:true,visible:false,draggable:false});
mySimpleDialog.setHeader("Edit Comment");
mySimpleDialog.setBody("<textarea id=\""+this.board.boardName+"-editComment\">"+_16a+"</textarea>");
mySimpleDialog.cfg.setProperty("icon",YAHOO.widget.SimpleDialog.ICON_INFO);
var me=this;
var _16c=function(){
if(_168){
move.beforeComment=null;
}else{
move.afterComment=null;
}
t.innerHTML="";
this.hide();
};
var _16d=function(){
var _16e=YAHOO.util.Dom.get(me.board.boardName+"-editComment");
var txt=trimStr(_16e.value);
if(_168){
move.beforeComment=txt;
}else{
move.afterComment=txt;
}
if(_168){
t.innerHTML=me.outputComment(txt,0)+" ";
}else{
t.innerHTML=" "+me.outputComment(txt,0);
}
this.hide();
};
var _170=function(){
this.hide();
};
var _171=[{text:"Delete",handler:_16c},{text:"Save",handler:_16d},{text:"Cancel",handler:_170,isDefault:true}];
mySimpleDialog.cfg.queueProperty("buttons",_171);
mySimpleDialog.render(document.body);
mySimpleDialog.show();
};
MovesDisplay.prototype.gotoMove=function(e){
if(this.board.disableNavigation){
return;
}
if(this.board.tactics&&this.board.tactics.problemActive){
return;
}
if(this.board.blockFowardBack||this.board.deferredBlockForwardBack){
return;
}
activeBoard=this.board;
var t=e.currentTarget?e.currentTarget:e.targetElement?e.targetElement:false;
if(!t){
t=YAHOO.util.Event.getTarget(e);
}
if(!t.id){
t=t.parentNode;
}
var _174=t.id.substr((this.board.boardName+"-m").length);
if(clog){
console.log("got goto move index:"+_174);
}
this.board.gotoMoveIndex(_174,false,false,false,false);
if(this.board.problem){
if(this.board.currentMove.bestMoves){
this.board.problem.showBestMoves(this.board.currentMove,this.board.currentMove.bestMoves,this.board.currentMove.correctMove,this.board.currentMove.wrongMove);
}else{
this.board.problem.clearBestMoves();
}
}
};
MovesDisplay.prototype.getMovesDisplay=function(){
if(!this.cachedMovesDisplay&&!this.allreadyCachedMovesDisplay){
var name=this.board.boardName+"-moves";
if(this.moveListName){
name=this.moveListName;
}
this.cachedMovesDisplay=YAHOO.util.Dom.get(name);
this.allreadyCachedMovesDisplay=true;
}
return this.cachedMovesDisplay;
};
MovesDisplay.prototype.outputVariationStart=function(_176,_177,_178,_179){
var _17a="";
if(_177>this.board.ml){
return _17a;
}
if(this.board.ml==1&&_179>1){
return _17a;
}
var _17b=this.getMovesDisplay();
if(_17b||this.board.outputWithoutDisplay){
if(_176==0&&this.displayType==MovesDisplay.MAIN_ON_OWN_LINE){
if(this.firstNonMove){
if(this.board.useDivClearForNewline){
_17a+="<div style=\"clear:both;\"></div>";
}
_17a+="<div class=\"ct-mainline-commentary\"/>";
this.pendingLevelZeroCommentaryClose=true;
}
}
if(this.variationOnOwnLine){
if(this.board.useDivClearForNewline){
_17a+="<div style=\"clear:both;\"></div>";
}else{
_17a+="<br/>";
}
}
if(this.board.showBracketsOnVariation&&(!this.board.hideBracketsOnTopLevelVariation||_176>0)){
_17a+="<span>"+this.board.variationStartString+"</span>";
}
}
this.firstNonMove=false;
return _17a;
};
MovesDisplay.prototype.outputVariationEnd=function(_17c,_17d,_17e,_17f){
var _180=this.getMovesDisplay();
var _181="";
if(this.board.ml==1&&_17d>0&&this.board.outputFirstVar){
return _181;
}
this.board.outputFirstVar=true;
if(_180||this.board.outputWithoutDisplay){
if(this.board.showBracketsOnVariation&&(!this.board.hideBracketsOnTopLevelVariation||_17c>1)){
_181+="<span>"+this.board.variationEndString+"</span>";
}
}
if(_17c==1&&this.displayType==MovesDisplay.MAIN_ON_OWN_LINE){
}
this.firstNonMove=false;
return _181;
};
MovesDisplay.prototype.outputComment=function(_182,_183,_184,_185){
if(this.board.ignoreCommentRegex){
var _186=new RegExp(this.board.ignoreCommentRegex);
if(_186.test(_182)){
return "";
}
}
var _187="";
if(this.board.ml==1){
return _187;
}
var _188=this.getMovesDisplay();
if(_188||this.board.outputWithoutDisplay){
if(_183==0&&this.displayType==MovesDisplay.MAIN_ON_OWN_LINE){
if(this.firstNonMove){
_187+="<br/>";
}
_187+="<div class=\"ct-mainline-commentary\">";
this.pendingLevelZeroCommentaryClose=true;
}
var _189="ct-board-move-comment";
if(_184){
_189="ct-board-move-alt-comment";
}
if(this.board.handleCommentClicks){
_189+=" ct-board-clickable-comment";
}
_187+="<span class=\""+_189+"\"> "+_182+" </span>";
if(_183==0&&this.displayType==MovesDisplay.MAIN_ON_OWN_LINE){
}
}
if(!_185){
this.firstNonMove=false;
}
return _187;
};
MovesDisplay.prototype.outputNag=function(_18a){
var _18b="";
var _18c=this.getMovesDisplay();
if(_18c||this.board.outputWithoutDisplay){
var _18d=null;
switch(_18a){
case 11:
_18d="=";
break;
case 14:
_18d="+=";
break;
case 15:
_18d="=+";
break;
case 16:
_18d="+/-";
break;
case 17:
_18d="-/+";
break;
case 18:
_18d="+-";
break;
case 19:
_18d="-+";
break;
case 20:
_18d="+--";
break;
case 21:
_18d="--+";
break;
default:
}
if(_18d){
_18b+="<span> "+_18d+" </span>";
}
}
return _18b;
};
MovesDisplay.prototype.outputResult=function(_18e){
return "<span class=\"ct-result\">"+_18e+"</span>";
};
MovesDisplay.prototype.outputMove=function(_18f,_190,_191,_192,_193,_194,_195,move,_197,_198,_199,_19a,_19b,_19c,_19d){
var clog=false;
if(clog){
console.log("outputMove:"+_192+" hideScore:"+_197+" this.board:"+this.board);
}
var _19f="";
var _1a0=this.getMovesDisplay();
if(this.board.tr&&_190>0&&(_194>1||_195>3)&&!_193){
return _19f;
}
if(clog){
console.log("ravLevel:"+_190+" ravCount:"+_194+" topCount:"+_195+" output:"+_192);
}
if(this.board.ml==1&&_194>0&&this.board.outputFirstVar){
return _19f;
}
if(clog){
console.log("movesDisplay:"+_1a0);
}
if(_1a0||this.board.outputWithoutDisplay){
var _1a1=""+Math.round(_191/2)+". ";
var _1a2=false;
if(_191%2!=1){
if(clog){
console.log("firstRav:"+_193+" firstNonMove:"+this.firstNonMove);
}
if(_193||!this.firstNonMove){
_1a1=Math.round(_191/2)+"... ";
_1a2=true;
}else{
_1a1="";
}
}
if(clog){
console.log("moveNum:"+_191+" moveNumOut:"+_1a1);
}
if(this.displayType==MovesDisplay.MAIN_ON_OWN_LINE&&_190==0&&(!this.firstNonMove||_191%2==1)){
if(this.pendingLevelZeroCommentaryClose){
this.pendingLevelZeroCommentaryClose=false;
_19f+="</div>";
}
if(this.board.newlineForEachMainMove){
if(this.board.useDivClearForNewline){
_19f+="<div style=\"clear:both;\"></div>";
}else{
_19f+="<br/>";
}
}
}
var _1a3="";
var _1a4="";
if(move&&move.eg_move){
var res=this.board.egMoveToScoreString(move.eg_move);
_1a3=res[0];
_1a4=res[1];
}
var _1a6="";
if(_197){
_1a6="initially_hidden";
}
if(_1a3!=""){
_1a3=" "+_1a3;
}
var _1a7="title";
if(_197){
_1a7="alt";
}
var _1a8="";
if(_198){
_1a8=" rel=\""+_192+"\" ";
_192="___";
}
var _1a9="";
if(_1a2&&_190==0){
_1a9="<span class=\"ct-board-move-dottedempty\">&nbsp;</span>";
}
var _1aa="";
if(_1a1){
_1aa="<span class=\"ct-board-move-movenum\">"+_1a1+"</span>";
}
var _1ab="";
if(_18f==0){
if(_199){
_1ab=" ct-best-move ";
}else{
if(_19b){
_1ab=" ct-bad-move ";
}else{
if(_19a){
_1ab=" ct-good-move ";
}else{
if(_19c){
_1ab=" ct-current-move ";
}else{
_1ab=" ct-first-move ";
}
}
}
}
}
if(_19d){
_1ab=" ct-current-move ";
}
_19f+="<span "+_1a8+_1a7+"=\""+_1a4+"\" id=\""+this.board.boardName+"-m"+_18f+"\" class=\""+((_190==0)?"ct-board-move-mainline":"ct-board-move-variation")+_1ab+"\">"+_1aa+_1a9+"<span class=\"ct-board-move-movetext\">"+_192+"</span><span id=\""+this.board.boardName+"-msc"+_18f+"\" class=\""+_1a6+"\">"+_1a3+"</span></span>";
}
this.firstNonMove=true;
return _19f;
};
Board.prototype.setMoveSeqLalg=function(_1ac,_1ad,_1ae,_1af,_1b0,_1b1,_1b2,_1b3,_1b4,_1b5,_1b6,_1b7){
var _1b8=new Array();
if(_1ac&&_1ac.length>0){
_1b8=_1ac.replace(/\s+$/g,"").split(" ");
}
this.setupFromLalgArray(_1b8,_1af,_1ae,_1ad,_1b0,_1b1,_1b2,_1b3,_1b4,_1b5,_1b6,_1b7);
};
Board.prototype.setupFromLalgArray=function(_1b9,_1ba,_1bb,_1bc,_1bd,_1be,_1bf,_1c0,_1c1,_1c2,_1c3,_1c4){
var clog=false;
if(clog){
console.log("top of setupFromLalgArray");
}
this.outputFirstVar=false;
if(this.movesDisplay){
this.movesDisplay.pendingLevelZeroCommentaryClose=false;
var md=this.movesDisplay.getMovesDisplay();
if(md){
if(!_1be){
YAHOO.util.Event.purgeElement(md,true);
}
md.innerHTML="";
}
}
if(!_1bc){
_1bc=new Array();
}
var _1c7=this.cloneBoard();
this.movesDisplay.firstNonMove=false;
var _1c8=null;
var _1c9=null;
if(!_1bd){
_1c8=new Array();
_1c9=new Array();
}
if(!_1c2&&this.prev_move){
if(clog){
console.log("this.prev_move:"+this.prev_move.output());
}
if(_1c7.boardPieces[this.prev_move.fromColumn][this.prev_move.fromRow]){
_1c7.makeMove(this.prev_move,_1c7.boardPieces[this.prev_move.fromColumn][this.prev_move.fromRow],false,_1c7.moveAnimationLength,false,false);
}
}
var _1ca=null;
if(!_1bd){
_1ca=_1c7.cloneBoard();
}
var _1cb=null;
var _1cc=0;
var _1cd="";
var _1ce=false;
var _1cf=false;
var _1d0=0;
var _1d1=false;
var _1d2=new Array();
var _1d3=new Array();
_1d3[0]=0;
var _1d4=new Array();
var _1d5=new Array();
var _1d6=_1bb*2-1;
var _1d7=_1bb*2-1;
var _1d8=new Array();
var _1d9=ChessPiece.WHITE;
var _1da=0;
var eval="";
var _1dc="";
var _1dd="";
var time="";
var _1df=-1;
var _1e0=0;
for(var i=0;i<_1b9.length;i++){
var _1e2=0;
if(clog){
console.log("movesArr["+i+"]:"+_1b9[i]);
}
if(_1b9[i]=="ALT"){
_1cf=true;
continue;
}
if(_1b9[i].indexOf("EVAL")==0){
eval=_1b9[i].split(":")[1];
if(parseInt(eval)>=175&&_1d0>0&&_1d3[_1d0]>1){
_1cf=true;
}
continue;
}
if(_1b9[i].indexOf("DEPTH")==0){
_1dc=_1b9[i].split(":")[1];
continue;
}
if(_1b9[i].indexOf("NODES")==0){
_1dd=_1b9[i].split(":")[1];
continue;
}
if(_1b9[i].indexOf("TIME")==0){
time=_1b9[i].split(":")[1];
var e=eval;
if(eval.indexOf("mate")!=0){
e=(parseFloat(eval)/100).toFixed(2);
if(e>0){
e="+"+e;
}
}else{
e=e.replace(/_/," ");
var _1e4=e.split(" ");
_1e2=parseInt(_1e4[1]);
e=_js("mate")+" "+_1e4[1];
if(_1d3[_1d0]==1){
_1df=_1e2;
}
}
_1e0=_1e2;
if(_1e2<0){
_1cf=false;
}else{
if(_1e2>0&&_1e2<8&&_1d0>0&&_1d3[_1d0]>1){
_1cf=true;
}
}
var _1e5="";
if(_1cf){
_1e5=_js("ALT")+" ";
}
var t=parseInt(time);
var nps=" "+__js("nps:{NODES_PER_SECOND}",[["NODES_PER_SECOND",Math.round(parseInt(_1dd)/(parseInt(time)/1000))]]);
if(!this.showNPS){
nps="";
}
if(!(_1d0>0&&_1d3[_1d0]>this.ml)){
_1b9[i]=_1e5+e+" ("+__js("depth:{DEPTH}",[["DEPTH",_1dc]])+nps+")";
}else{
_1b9[i]="";
}
}
if(_1b9[i]=="}"){
_1ce=false;
if(this.movesDisplay){
_1cd=_1cd.replace(/\s+$/g,"");
_1d8.push(this.movesDisplay.outputComment(_1cd,_1d0,_1cf));
}
continue;
}else{
if(_1ce){
_1cd+=_1b9[i]+" ";
continue;
}else{
if(_1b9[i]=="{"){
_1cd="";
_1ce=true;
continue;
}else{
if(_1b9[i]=="("){
if(!_1d3[_1d0+1]){
_1d3[_1d0+1]=0;
}
_1d3[_1d0+1]++;
if(this.movesDisplay){
_1d8.push(this.movesDisplay.outputVariationStart(_1d0,_1d3[_1d0+1],_1d6,_1d2[0]));
}
_1d2[_1d0]=_1d6;
_1d4[_1d0]=_1cb;
_1d5[_1d0]=_1d9;
_1c8[_1d0]=_1c7;
_1c9[_1d0]=_1ca;
_1c7=_1ca.cloneBoard();
_1d0++;
_1d6--;
_1d1=true;
continue;
}else{
if(_1b9[i]==")"){
if(this.movesDisplay){
_1d8.push(this.movesDisplay.outputVariationEnd(_1d0,_1d3[_1d0],_1d6,_1d2[0]));
}
var _1e8=new Move();
_1e8.atEnd=true;
_1cb.next=_1e8;
_1e8.prev=_1cb;
_1d0--;
_1d6=_1d2[_1d0];
_1cb=_1d4[_1d0];
_1d9=_1d5[_1d0];
_1c7=_1c8[_1d0];
_1ca=_1c9[_1d0];
_1cf=false;
continue;
}else{
if(_1b9[i].charAt(0)=="$"){
if(this.movesDisplay){
_1d8.push(this.movesDisplay.outputNag(parseInt(_1b9[i].substring(1))));
}
continue;
}
}
}
}
}
}
var move=this.createMoveFromString(_1b9[i]);
var _1ea=false;
if(_1d6==_1d7&&this.boardPieces[move.fromColumn][move.fromRow].colour==ChessPiece.BLACK){
_1d6++;
_1ea=true;
_1d9=ChessPiece.BLACK;
}
move.index=_1cc;
var _1eb=(move.pgn)?move.pgn:move.moveString;
if(move.pgn){
_1eb=move.pgn;
}else{
_1eb=_1c7.makeShortAlgabraic(move.fromColumn,move.fromRow,move.toColumn,move.toRow,move);
move.SAN=_1eb;
}
_1eb=Board.moveToLocale(_1eb);
if(this.movesDisplay){
this.movesDisplay.setToMove(_1d9);
var _1ec=false;
if(_1c3&&_1c4&&!_1c4.atEnd){
var _1ed=_1c4.toMoveString();
_1c4=_1c4.next;
if(_1ed==_1b9[i]){
_1ec=true;
}else{
_1c3=false;
}
}
_1d8.push(this.movesDisplay.outputMove(_1cc,_1d0,_1d6,_1eb+" ",_1d1,_1d3[_1d0],_1d2[0],null,false,false,_1bf,_1c0,_1c1,_1c3,_1ec));
}
_1d9=(_1d9==ChessPiece.BLACK)?ChessPiece.WHITE:ChessPiece.BLACK;
move.moveNum=_1d6;
_1d6++;
if(_1d0>0){
if(_1d1){
var _1ee=_1cb;
if(_1ee==null){
alert("Got no previous move for variation:"+movesArra[i]);
}
if(_1ee.numVars==0){
_1ee.vars=new Array();
}
move.isAlt=_1cf;
move.mateInMoves=_1e0;
_1ee.vars[_1ee.numVars++]=move;
move.prev=_1ee.prev;
_1d1=false;
}else{
move.prev=_1cb;
if(_1cb!=null){
_1cb.next=move;
}
}
}else{
move.prev=_1cb;
if(_1cb!=null){
_1cb.next=move;
}
}
_1d3[_1d0+1]=0;
if(_1d0==0){
_1da=_1cc;
}
_1bc[_1cc++]=move;
_1c7.moveArray[_1cc-1]=move;
_1cb=move;
if(!_1bd){
_1ca=_1c7.cloneBoard();
}
_1c7.makeMove(move,_1c7.boardPieces[move.fromColumn][move.fromRow],false,_1c7.moveAnimationLength,false,false);
}
if(this.movesDisplay&&!this.disableMoveOutput){
var _1ef=this.movesDisplay.getMovesDisplay();
_1d8.push(this.movesDisplay.outputResult(_1ba));
this.pendingMovesOutput=_1d8.join("");
this.pendingMovesOutputCount=_1cc;
}
this.lastMoveIndex=_1da;
if(_1cb!=null){
var _1e8=new Move();
_1e8.atEnd=true;
_1cb.next=_1e8;
_1e8.prev=_1cb;
}
this.lastCount=_1cc;
};
Board.prototype.getMaterialCount=function(){
var _1f0=0;
var _1f1=0;
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var _1f4=this.boardPieces[i][j];
if(_1f4){
if(_1f4.colour==ChessPiece.WHITE){
_1f0+=ChessPiece.materialValue(_1f4.piece);
}else{
_1f1+=ChessPiece.materialValue(_1f4.piece);
}
}
}
}
return [_1f0,_1f1];
};
Board.prototype.getMaterialBalance=function(){
var cnt=this.getMaterialCount();
return cnt[0]-cnt[1];
};
Board.prototype.getMaterialBalances=function(){
var _1f6=this.cloneBoard();
var mv=this.moveArray[0];
_1f6.gotoMoveIndex(-1,true,true,true,true);
var _1f8=[];
while(mv&&!mv.atEnd){
_1f6.makeMove(mv,_1f6.boardPieces[mv.fromColumn][mv.fromRow],false,this.moveAnimationLength,false,false);
_1f8.push(_1f6.getMaterialBalance());
mv=mv.next;
_1f6.toggleToMove();
}
return _1f8;
};
Board.prototype.lalgToMoveList=function(_1f9,_1fa,_1fb,_1fc,_1fd,_1fe){
if(ctime){
console.time("lalgToMoveList");
}
if(clog){
console.log("startMoveNum:"+_1fb);
}
if(!_1fc){
_1fc=new Array();
}
var _1ff=this.cloneBoard();
var _200=null;
var _201=null;
if(!_1fe){
_200=new Array();
_201=new Array();
}
if(!_1fd&&this.prev_move){
_1ff.makeMove(this.prev_move,_1ff.boardPieces[this.prev_move.fromColumn][this.prev_move.fromRow],false,_1ff.moveAnimationLength,false,false);
}
var _202=null;
if(!_1fe){
_202=_1ff.cloneBoard();
}
var nags=[];
var _204=null;
var _205=0;
var _206="";
var _207=false;
var _208=0;
var _209=false;
var _20a=new Array();
var _20b=new Array();
_20b[0]=0;
var _20c=new Array();
var _20d=new Array();
var _20e=_1fb*2-1;
var _20f=new Array();
var _210=ChessPiece.WHITE;
var _211=0;
var _212=true;
for(var i=0;i<_1f9.length;i++){
if(_1f9[i]=="}"){
_207=false;
_206=_206.replace(/\s+$/g,"");
continue;
}else{
if(_207){
_206+=_1f9[i]+" ";
continue;
}else{
if(_1f9[i]=="{"){
if(_206){
if(_204){
_204.afterComment=trimStr(_206);
}
}
_206="";
_207=true;
continue;
}else{
if(_1f9[i]=="("){
if(clog){
console.log("var start comment:"+_206);
}
if(_204){
_204.afterComment=trimStr(_206);
_206="";
}
if(clog){
if(_204){
console.log("old:"+_204.output());
}else{
console.log("no old move");
}
}
if(!_20b[_208+1]){
_20b[_208+1]=0;
}
_20b[_208+1]++;
_20a[_208]=_20e;
_20c[_208]=_204;
_20d[_208]=_210;
_200[_208]=_1ff;
_201[_208]=_202;
_1ff=_202.cloneBoard();
_208++;
_20e--;
_209=true;
continue;
}else{
if(_1f9[i]==")"){
if(_204){
if(clog){
console.log("var end comment:"+_206);
console.log("var end comment:"+_204.output());
}
_204.afterComment=trimStr(_206);
_206="";
}
var _214=new Move();
_214.atEnd=true;
_204.next=_214;
_214.prev=_204;
_208--;
_20e=_20a[_208];
_204=_20c[_208];
_210=_20d[_208];
_1ff=_200[_208];
_202=_201[_208];
continue;
}else{
if(_1f9[i].charAt(0)=="$"){
nags.push(parseInt(_1f9[i].substring(1)));
continue;
}
}
}
}
}
}
var move=this.createMoveFromString(_1f9[i]);
move.nags=nags;
move.beforeComment=trimStr(_206);
_206=null;
nags=[];
if(_212){
if(this.boardPieces[move.fromColumn][move.fromRow].colour==ChessPiece.BLACK){
_20e++;
_210=ChessPiece.BLACK;
if(clog){
console.log("first move black new movenum:"+_20e);
}
}
_212=false;
}
move.index=_205;
var _216=(move.pgn)?move.pgn:move.moveString;
if(move.pgn){
_216=move.pgn;
move.SAN=move.pgn;
}else{
_216=_1ff.makeShortAlgabraic(move.fromColumn,move.fromRow,move.toColumn,move.toRow,move);
move.SAN=_216;
}
_210=(_210==ChessPiece.BLACK)?ChessPiece.WHITE:ChessPiece.BLACK;
move.moveNum=_20e;
_20e++;
if(_208>0){
if(_209){
var _217=_204;
if(_217==null){
alert("Got no previous move for variation:"+movesArra[i]);
}
if(_217.numVars==0){
_217.vars=new Array();
}
_217.vars[_217.numVars++]=move;
move.prev=_217.prev;
_209=false;
}else{
move.prev=_204;
if(_204!=null){
_204.next=move;
}
}
}else{
move.prev=_204;
if(_204!=null){
_204.next=move;
}
}
_20b[_208+1]=0;
if(_208==0){
_211=_205;
}
_1fc[_205++]=move;
_1ff.moveArray[_205-1]=move;
_204=move;
if(!_1fe){
_202=_1ff.cloneBoard();
}
_1ff.makeMove(move,_1ff.boardPieces[move.fromColumn][move.fromRow],false,_1ff.moveAnimationLength,false,false);
}
if(_204!=null){
var _214=new Move();
_214.atEnd=true;
_204.next=_214;
_214.prev=_204;
if(_206){
_204.afterComment=trimStr(_206);
}
}
if(ctime){
console.timeEnd("lalgToMoveList");
}
return _1fc;
};
Board.prototype.reset=function(fen,_219){
if(this.lastFromSquare){
YAHOO.util.Dom.removeClass(this.lastFromSquare,"ct-from-square");
}
if(this.lastToSquare){
YAHOO.util.Dom.removeClass(this.lastToSquare,"ct-to-square");
}
this.clearMoveList();
if(fen){
this.startFen=fen;
this.setupFromFen(fen,false,this.isFlipped,false,_219,true);
}else{
this.startFen=Board.INITIAL_FEN;
this.setupFromFen(Board.INITIAL_FEN,false,this.isFlipped,false,false,true);
}
this.setForwardBack();
};
Board.prototype.clearMoveList=function(_21a){
this.movesDisplay.firstNonMove=false;
var _21b=this.movesDisplay.getMovesDisplay();
if(_21b){
YAHOO.util.Event.purgeElement(_21b,true);
_21b.innerHTML="";
}
this.currentMove=null;
this.moveIndex=-1;
this.moveArray=new Array();
if(_21a){
_21a.prev=null;
this.startMoveNum=_21a.moveNum;
}else{
this.startMoveNum=1;
}
};
Board.prototype.insertMovesFromMoveList=function(_21c,_21d,_21e,_21f,_220){
var _221=!_21d;
if(clog){
console.log("insertMovesFromMoveList called");
}
if(ctime&&_221){
console.time("insertMovesFromMoveList");
}
if(!this.movesDisplay){
return;
}
if(_221){
this.clearMoveList(_21c);
}
var _222=0;
var _223=_21c.moveNum;
var move=_21c;
while(move!=null&&!move.atEnd){
if(clog){
console.log("move:"+move.output());
}
var _225=move.next;
if(clog){
if(this.currentMove){
console.log("current move:"+this.currentMove.output());
}else{
console.log("no current move");
}
if(_225){
console.log("next move:"+_225.output());
}else{
console.log("no next move");
}
}
if(_221||_21c!=move||_21e==null){
if(clog){
console.log("about to call insertmoveafter");
}
if(_21f!=null){
if(clog){
console.log("inserting after moveToInsertAfter:"+_21f.output());
}
this.insertMoveAfter(_21f,move);
_21f=null;
}else{
if(clog){
console.log("inserting after current move");
}
this.insertMoveAfter(this.currentMove,move);
}
if(clog){
console.log("finished call to insertmoveafter");
}
}else{
if(clog){
console.log("about to replace variationParent:"+_21e.output()+" with move:"+move.output()+" and board:"+this.boardToFen());
}
this.replaceMove(_21e,move,true,true,false,false,true);
}
if(move.beforeComment){
this.insertCommentIntoMoveDisplay(move,move.beforeComment,false);
}
if(move.afterComment){
this.insertCommentIntoMoveDisplay(move,move.afterComment,true);
}
if(clog){
console.log("about to make move:"+move.output()+" with board pos:"+this.boardToFen());
}
this.makeMove(move,this.boardPieces[move.fromColumn][move.fromRow],false,this.moveAnimationLength,false,false);
if(clog){
console.log("made move");
}
this.setCurrentMove(move,true,true);
if(move.numVars>0){
var _226=move.index;
var bm=move.prev;
var _228=-1;
if(bm){
_228=bm.index;
}
var _229=move.numVars;
var vars=move.vars;
move.numVars=0;
move.vars=[];
for(var i=0;i<_229;i++){
this.gotoMoveIndex(_228,true,true,true,true);
if(clog){
console.log("about to call insertMovesFromMoveList with head of variation");
}
this.insertMovesFromMoveList(vars[i],true,move,null,0);
if(clog){
console.log("about to reset currentMoveIndex  after variation insert:"+_226);
}
}
this.gotoMoveIndex(_226,true,true,true,true);
this.backMove();
var cm=this.currentMove;
this.makeMove(cm,this.boardPieces[cm.fromColumn][cm.fromRow],false,this.moveAnimationLength,false,false);
if(clog){
if(this.currentMove){
console.log("popped up from variation, current set back to:"+this.currentMove.output());
}else{
console.log("popped up from variation, current set to null");
}
}
}
move=_225;
_222++;
if(_220>0&&_222>=_220){
break;
}
}
if(_221){
this.gotoMoveIndex(-1,false,false,false,false);
}
if(clog){
var m=this.currentMove;
while(m){
console.log("m:"+m.output());
m=m.next;
}
}
if(ctime&&_221){
console.timeEnd("insertMovesFromMoveList");
}
};
Board.prototype.setupFromLalgArrayIncremental=function(_22e,_22f,_230,_231){
this.outputFirstVar=false;
if(this.movesDisplay&&this.lastCount){
this.movesDisplay.pendingLevelZeroCommentaryClose=false;
for(var i=0;i<this.lastCount;i++){
var mv=YAHOO.util.Dom.get(this.boardName+"-m"+i);
if(mv){
YAHOO.util.Event.purgeElement(mv);
}
}
}
var _234=0;
var _235=_230*2-1;
var _236="";
var _237=false;
var _238=false;
var _239=ChessPiece.WHITE;
var _23a=false;
var _23b=true;
this.currentMove=null;
for(var i=0;i<_22e.length;i++){
if(_22e[i]=="}"){
_23a=false;
if(this.movesDisplay){
_236=_236.replace(/\s+$/g,"");
}
continue;
}else{
if(_23a){
_236+=_22e[i]+" ";
continue;
}else{
if(_22e[i]=="{"){
_236="";
_23a=true;
continue;
}else{
if(_22e[i]=="("){
_237=true;
continue;
}else{
if(_22e[i]==")"){
_238=true;
continue;
}else{
if(_22e[i].charAt(0)=="$"){
continue;
}
}
}
}
}
}
var move=this.createMoveFromString(_22e[i]);
var _23d=false;
if(_23b&&this.boardPieces[move.fromColumn][move.fromRow].colour==ChessPiece.BLACK){
_235++;
_23d=true;
_239=ChessPiece.BLACK;
}
this.startMoveNum=_235;
_23b=false;
move.index=_234++;
var _23e=move.moveString;
_23e=Board.moveToLocale(_23e);
_239=(_239==ChessPiece.BLACK)?ChessPiece.WHITE:ChessPiece.BLACK;
this.insertMoveAfter(this.currentMove,move);
if(clog){
if(move.prev){
if(move.prev.next){
console.log("move.prev.next:"+move.prev.next.output());
}else{
console.log("move.prev:"+move.prev.output()+" next null");
}
}
}
this.makeMove(move,this.boardPieces[move.fromColumn][move.fromRow],false,this.moveAnimationLength,false,false);
this.setCurrentMove(move);
}
this.gotoMoveIndex(-1,false,false,false,false);
};
Board.prototype.displayPendingMoveList=function(){
if(this.pendingMovesOutput&&this.movesDisplay){
var _23f=this.movesDisplay.getMovesDisplay();
if(_23f){
_23f.innerHTML=this.pendingMovesOutput;
var _240=new YAHOO.util.Scroll(_23f,{scroll:{to:[0,0]}},0);
_240.animate();
}
if(this.movesDisplay){
for(var i=0;i<this.pendingMovesOutputCount;i++){
var mv1=YAHOO.util.Dom.get(this.boardName+"-m"+i);
if(mv1){
YAHOO.util.Event.addListener(mv1,"click",this.movesDisplay.gotoMove,this.movesDisplay,true);
if(this.handleCommentClicks){
var _243=YAHOO.util.Dom.get(this.boardName+"-mcb"+i);
if(_243){
YAHOO.util.Event.addListener(_243,"click",this.movesDisplay.clickComment,this.movesDisplay,true);
}
_243=YAHOO.util.Dom.get(this.boardName+"-mca"+i);
if(_243){
YAHOO.util.Event.addListener(_243,"click",this.movesDisplay.clickComment,this.movesDisplay,true);
}
}
}
}
}
}
};
Board.prototype.setMoveSequence=function(_244,_245,_246,_247){
this.tacticMoveArray=new Array();
this.moveArray=this.tacticMoveArray;
this.setMoveSeqLalg(_244,this.tacticMoveArray,_246,_247);
this.tacticsmoveArrayLastMoveIndex=this.lastMoveIndex;
if(false&&_245!="NA"){
this.fullmoveArray=new Array();
this.disableMoveOutput=true;
this.setMoveSeqLalg(_245,this.fullmoveArray,_246,_247);
this.disableMoveOutput=false;
this.fullmoveArrayLastMoveIndex=this.lastMoveIndex;
}else{
this.fullmoveArray=null;
}
this.lastMoveIndex=this.tacticsmoveArrayLastMoveIndex;
};
Board.prototype.resetVariationsPreviousNodes=function(_248,_249){
if(_248.numVars>0){
for(var i=0;i<_248.numVars;i++){
_248.vars[i].prev=_249;
this.resetVariationsPreviousNodes(_248.vars[i],_249);
}
}
};
Board.prototype.reconnectNextNodeVariations=function(_24b,_24c){
if(!_24c){
return;
}
if(_24c.numVars>0){
for(var i=0;i<_24c.numVars;i++){
_24c.vars[i].prev=_24b;
this.reconnectNextNodeVariations(_24b,_24c.vars[i]);
}
}
};
Board.prototype.findFirstMoveFromList=function(move){
var m=move;
while(m&&m.prev!=null){
m=m.prev;
}
return m;
};
Board.prototype.findVariationHeadFromMove=function(move){
var m=move;
while(m&&m.prev&&m.prev.next==m){
m=m.prev;
}
if(m&&m.prev&&m.prev.next!=m){
return m;
}else{
if(m&&!m.prev){
var _252=this.moveArray[0];
if(m!=_252){
return m;
}
}
return null;
}
};
Board.prototype.liftVariation=function(_253){
if(!_253){
return;
}
var _254=null;
var _255=null;
if(_253.prev){
_254=_253.prev.next;
}else{
_254=this.moveArray[0];
_255=_253;
}
var _256=null;
if(this.currentMove&&this.currentMove.prev){
_256=this.currentMove.prev;
}
if(_254){
var _257=_254.numVars;
var vars=_254.vars;
_254.numVars=0;
_254.vars=[];
if(_253.numVars==0){
_253.vars=[];
}
for(var i=0;i<_257;i++){
var _25a=vars[i];
if(clog){
console.log("processing var:"+_25a.output());
}
if(_25a==_253){
if(clog){
console.log("inserted parent var");
}
_253.vars.push(_254);
_253.numVars++;
}else{
_253.vars.push(_25a);
_253.numVars++;
}
}
if(_253.prev){
_253.prev.next=_253;
}
if(clog){
console.log("finished moving variations");
}
if(!_255){
_255=this.findFirstMoveFromList(_253);
}
this.moveArray[0]=_255;
this.gotoMoveIndex(-1,true,true,true,true);
if(clog){
console.log("fm:"+_255.output());
}
this.insertMovesFromMoveList(_255);
}
if(_256){
this.gotoMoveIndex(_256.index);
}
};
Board.prototype.deleteMoveAndLine=function(move){
var m=move;
var oldM=m;
var _25e=false;
var _25f=null;
var _260=this.moveArray[0];
var _261=null;
if(clog){
console.log("delete line:"+move.output());
}
if(clog){
console.log("delete line prev:"+move.prev);
}
if(clog&&move.prev){
console.log("delete line prev.next:"+move.prev.next);
}
if(move&&move.prev&&move.prev.next!=move){
if(clog){
console.log("var is head and not front of move list");
}
_25e=true;
_25f=move.prev.next;
}else{
if(move&&!move.prev&&move!=this.moveArray[0]){
if(clog){
console.log("var is head and front of move list");
}
_25e=true;
_25f=this.moveArray[0];
}
}
if(clog){
console.log("isVariationHead:"+_25e);
}
if(clog){
console.log("fm:"+_260.output());
}
var _262=m.prev;
if(_25e){
_261=_25f;
if(_25f){
if(clog){
console.log("delete variation from parent:"+_25f.output());
}
var _263=[];
for(var i=0;i<_25f.numVars;i++){
if(!(_25f.vars[i]==oldM)){
if(clog){
console.log("saving var:"+_25f.vars[i].output());
}
_263.push(_25f.vars[i]);
}else{
if(clog){
console.log("dropping var:"+_25f.vars[i].output());
}
}
}
_25f.vars=_263;
_25f.numVars=_263.length;
}
}else{
if(_262){
_262.next=null;
_261=_262;
}else{
if(clog){
console.log("deleting entire list");
}
if(this.movesDisplay){
this.movesDisplay.firstNonMove=false;
YAHOO.util.Event.purgeElement(this.movesDisplay.getMovesDisplay(),true);
this.movesDisplay.pendingLevelZeroCommentaryClose=false;
}
var _265=this.movesDisplay.getMovesDisplay();
if(_265){
_265.innerHTML="";
}
this.currentMove=null;
this.startMoveNum=_260.moveNum;
if(clog){
console.log("startFen:"+this.startFen);
}
this.moveIndex=-1;
this.moveArray=[];
this.setupFromFen(this.startFen);
if(this.lastFromSquare){
YAHOO.util.Dom.removeClass(this.lastFromSquare,"ct-from-square");
}
if(this.lastToSquare){
YAHOO.util.Dom.removeClass(this.lastToSquare,"ct-to-square");
}
this.setForwardBack();
return;
}
}
this.moveArray[0]=_260;
this.gotoMoveIndex(-1,true,true,true,true);
if(clog){
console.log("fm:"+_260.output());
}
this.insertMovesFromMoveList(_260);
if(_261){
this.gotoMoveIndex(_261.index);
}
};
Board.prototype.insertMoveAfter=function(_266,_267,_268,_269,_26a,_26b){
addToMovelist=!_268;
if(clog){
console.log("addToMovelist:"+addToMovelist);
}
var _26c="null";
if(_266){
_26c=_266.output();
}
if(clog){
console.log("insert newMove:"+_267.output()+" after:"+_26c);
}
if(_266==null){
this.currentMove=_267;
_267.atEnd=0;
_267.prev=null;
_267.next=null;
this.firstMove=_267;
if(this.startMoveNum>0){
this.currentMove.moveNum=this.startMoveNum;
}else{
if(this.toMove==ChessPiece.WHITE){
this.currentMove.moveNum=1;
}else{
this.currentMove.moveNum=2;
}
}
if(clog){
console.log("startMoveNum:"+this.startMoveNum+" currMoveNum:"+this.currentMove.moveNum);
}
}else{
_267.atEnd=_266.atEnd;
_267.prev=_266;
_266.atEnd=0;
if(clog){
if(_266.next){
console.log("prevMove.next:"+_266.next.output());
}
}
if(_267.equals(_266.next)||_267.equals(_266)){
if(clog){
console.log("inserting move that already exists in variation:"+_266.next.output());
}
var _26d=_266.next;
if(this.firstMove==_26d){
this.firstMove=_267;
}
if(_267.equals(_266)){
_26d=_266;
}
if(_26d.prev&&(_26d.prev.next==_26d)){
_26d.prev.next=_267;
}
if(_26d.next){
_26d.next.prev=_267;
}
addToMovelist=false;
_267.moveNum=_26d.moveNum;
_267.ravLevel=_26d.ravLevel;
_267.index=_26d.index;
_267.fen=_26d.fen;
_267.nextFen=_26d.nextFen;
_267.bestMoves=_26d.bestMoves;
_267.correctMove=_26d.correctMove;
_267.wrongMove=_26d.wrongMove;
_267.next=_26d.next;
_267.vars=_26d.vars;
_267.numVars=_26d.numVars;
this.reconnectNextNodeVariations(_267,_26d.next);
this.moveArray[_267.index]=_267;
if(this.currentMove==_26d){
this.setCurrentMove(_267);
}
}else{
_267.moveNum=_266.moveNum+1;
_267.ravLevel=_266.ravLevel;
_267.next=_266.next;
if(_267.next){
_267.next.prev=_267;
}
}
_266.next=_267;
}
if(addToMovelist){
this.insertIntoMoveDisplay(_266,_267,_269,_26a,_26b);
}
if(_267.next==null){
var _26e=this.createMoveFromString("i1i2");
_267.next=_26e;
_26e.prev=_267;
_26e.moveNum=_267.moveNum+1;
_26e.ravLevel=_267.ravLevel;
_26e.next=null;
_26e.atEnd=1;
_26e.endNode=true;
if(clog){
console.log("created endmove node in insertAfterMove:"+_26e.output());
}
}else{
if(clog){
console.log("allready had a node at end:"+_267.next.output());
}
_267.next.moveNum=_267.moveNum+1;
}
};
function insertBefore(node,_270){
if(_270){
_270.parentNode.insertBefore(node,_270);
}
}
function insertAfter(node,_272){
var _273=_272.parentNode;
_273.insertBefore(node,_272.nextSibling);
}
Board.prototype.replaceIntoMoveDisplay=function(_274,_275,_276,_277,_278){
var _279="null";
if(_274){
_279=_274.output();
}
if(clog){
console.log("replace display newMove:"+_275.output()+" after:"+_279+" hideScore:"+_277);
}
if(!_274){
if(clog){
console.log("null oldMove");
}
this.insertIntoMoveDisplay(null,_275,false,_277);
}else{
if(clog){
console.log("about to get movesdsiplay in replace into move display:"+this.movesDisplay);
}
var _27a=this.movesDisplay.getMovesDisplay();
if(clog){
console.log("got moves display");
}
if(!_27a){
if(clog){
console.log("no movesd disiplay in replace into move display");
}
return;
}
var san=_275.SAN;
if(!san){
if(clog){
console.log("about to make san");
}
san=this.makeShortAlgabraic(_275.fromColumn,_275.fromRow,_275.toColumn,_275.toRow,_275);
if(clog){
console.log("about to made san:"+san);
}
_275.SAN=san;
}
if(clog){
console.log("oldMove.index:"+_274.index);
}
var _27c=this.boardName+"-ms"+_274.index;
var _27d=-1;
if(_274.next){
_27d=this.boardName+"-m"+_274.next.index;
}
if(clog){
console.log("oldMoveId:"+_27c);
}
var _27e=YAHOO.util.Dom.get(_27c);
var _27f=YAHOO.util.Dom.get(_27d);
if(_276){
this.moveIndex++;
_275.index=this.moveIndex;
this.moveArray[this.moveIndex]=_275;
if(clog){
console.log("replace as variation old:"+_274.output()+" new:"+_275.output());
}
var _280=document.createElement("span");
if(typeof _274.ravlevel=="undefined"||_274.ravlevel==0){
YAHOO.util.Dom.addClass(_280,"ct-top-var-start");
}
var _281=this.movesDisplay.outputVariationStart(0,0,_275.moveNum,0);
_275.ravLevel=_274.ravlevel+1;
var _279=Board.moveToLocale(san);
if(_275.prev==null){
this.movesDisplay.firstNonMove=false;
}
var _282=this.movesDisplay.outputMove(this.moveIndex,_275.ravLevel,_275.moveNum,_279,_276,0,_275.moveNum,_275,_277,_278);
var _283=document.createElement("span");
_283.id=(this.boardName+"-ms"+_275.index);
_283.innerHTML=_282+"&nbsp;";
var _284=this.movesDisplay.outputVariationEnd(0,0,_275.moveNum,0);
this.movesDisplay.firstNonMove=true;
var _285=document.createElement("span");
_285.innerHTML=_281;
var _286=document.createElement("span");
_286.innerHTML=_284;
_280.appendChild(_285);
var els=YAHOO.util.Dom.getElementsByClassName("ct-mainline-commentary","div",_280);
var _288=_280;
if(els.length>0){
_288=els[0];
}
_288.appendChild(_283);
_288.appendChild(_286);
_27e.appendChild(_280);
if(_27f){
var els=YAHOO.util.Dom.getElementsByClassName("ct-board-move-movenum","span",_27f);
if(els.length==0){
var _289=_274.next.moveNum;
var _28a=""+Math.round(_289/2)+". ";
var _28b=false;
if(_289%2!=1){
if(clog){
console.log("firstRav:"+firstRav+" firstNonMove:"+this.firstNonMove);
}
if(true||firstRav||!this.firstNonMove){
_28a=Math.round(_289/2)+"... ";
_28b=true;
}else{
_28a="";
}
}
var _283=document.createElement("span");
_283.className="ct-board-move-movenum";
_283.innerHTML=_28a;
insertBefore(_283,_27f.firstChild);
_283=document.createElement("span");
if(_28b){
_283.className="ct-board-move-dottedempty";
_283.innerHTML="&nbsp;";
insertAfter(_283,_27f.firstChild);
}
}
}
}else{
_275.index=_274.index;
this.moveArray[_275.index]=_275;
var _279=Board.moveToLocale(san);
if(_275.prev==null){
this.movesDisplay.firstNonMove=false;
}
var _282=this.movesDisplay.outputMove(_275.index,_275.ravLevel,_275.moveNum,_279,_276,0,_275.moveNum,_275,_277,_278);
var _283=document.createElement("span");
_283.innerHTML=_282+"&nbsp;";
_283.id=(this.boardName+"-ms"+_275.index);
var _28c=[];
if(_27e&&_27e.childNodes){
for(var i=1;i<_27e.childNodes.length;i++){
_28c[i-1]=_27e.childNodes[i];
}
}
if(clog){
console.log("replace as main line not variation old:"+_274.output()+" new:"+_275.output());
}
_27e.parentNode.replaceChild(_283,_27e);
if(_28c){
for(var i=0;i<_28c.length;i++){
_283.appendChild(_28c[i]);
}
}
}
YAHOO.util.Event.removeListener(this.boardName+"-m"+_275.index);
YAHOO.util.Event.addListener((this.boardName+"-m"+_275.index),"click",this.movesDisplay.gotoMove,this.movesDisplay,true);
}
};
Board.prototype.insertCommentIntoMoveDisplay=function(move,_28f,_290){
var _291=this.movesDisplay.getMovesDisplay();
if(!_291){
return;
}
var _292="b";
if(_290){
_292="a";
}
if(move){
var _293=this.boardName+"-mc"+_292+move.index;
var _294=YAHOO.util.Dom.get(_293);
var _295=false;
if(!_294){
_294=document.createElement("span");
_294.id=_293;
_295=true;
}
var _296=move.moveNum%2!=1;
var _297=!_296&&!_290;
if(clog){
console.log("dontResetFirstNoneMove:"+_297+" isBlackMoveNum:"+_296+" insertCommentAfter:"+_290+" move.moveNum:"+move.moveNum+" comment:"+_28f);
}
_294.innerHTML=this.movesDisplay.outputComment(_28f,0,false,_297);
var _298=YAHOO.util.Dom.get((this.boardName+"-m"+move.index));
if(_298){
if(_290){
move.afterComment=_28f;
if(_295){
insertAfter(_294,_298);
}
}else{
move.beforeComment=_28f;
if(_295){
insertBefore(_294,_298);
}
}
}
if(_294&&_295&&this.handleCommentClicks){
YAHOO.util.Event.addListener(_294,"click",this.movesDisplay.clickComment,this.movesDisplay,true);
}
}else{
}
};
Board.prototype.insertIntoMoveDisplay=function(_299,_29a,_29b,_29c,_29d){
var _29e=this.movesDisplay.getMovesDisplay();
if(!_29e){
return;
}
if(clog){
var _29f="null";
if(_299){
_29f=_299.output();
}
console.log("insert display newMove:"+_29a.output()+" after:"+_29f);
}
var san=_29a.SAN;
if(!san){
san=this.makeShortAlgabraic(_29a.fromColumn,_29a.fromRow,_29a.toColumn,_29a.toRow,_29a);
_29a.SAN=san;
}
this.moveIndex++;
_29a.index=this.moveIndex;
this.moveArray[this.moveIndex]=_29a;
var _29f=Board.moveToLocale(san);
var _2a1=false;
var _2a2=null;
if(_299){
_2a2=YAHOO.util.Dom.get((this.boardName+"-ms"+_299.index));
}
if(_2a2){
var els=YAHOO.util.Dom.getElementsByClassName("ct-mainline-commentary","div",_2a2);
if(els.length>0){
_2a1=true;
}
}
var _2a4=this.movesDisplay.outputMove(this.moveIndex,_29a.ravLevel,_29a.moveNum,_29f,_2a1,0,_29a.moveNum,_29a,_29c,_29d);
var _2a5=document.createElement("span");
_2a5.innerHTML=_2a4+"&nbsp;";
_2a5.id=(this.boardName+"-ms"+this.moveIndex);
if(_29b){
YAHOO.util.Dom.setStyle(_2a5,"visibility","hidden");
}
if(_299){
if(clog){
console.log("prevMove.index:"+_299.index+"prevMove:"+_299.output());
}
if(_2a2){
insertAfter(_2a5,_2a2);
}else{
_29e.appendChild(_2a5);
}
}else{
if(_29a.next){
var _2a6=YAHOO.util.Dom.get((this.boardName+"-ms"+_29a.next.index));
insertBefore(_2a5,_2a6);
}else{
_29e.appendChild(_2a5);
}
}
YAHOO.util.Event.removeListener(this.boardName+"-m"+this.moveIndex);
YAHOO.util.Event.addListener((this.boardName+"-m"+this.moveIndex),"click",this.movesDisplay.gotoMove,this.movesDisplay,true);
};
Board.prototype.replaceMove=function(_2a7,_2a8,_2a9,_2aa,_2ab,_2ac,_2ad){
var _2ae="null";
if(_2a7){
_2ae=_2a7.output();
}
if(clog){
console.log("replace newMove:"+_2a8.output()+" after:"+_2ae+" replace as var"+_2a9+" rep move display:"+_2aa+" hideScore:"+_2ab+" replaceAsVariationEvenIfSame:"+_2ad);
if(_2a7&&_2a7.prev){
console.log("replace oldMove.prev:"+_2a7.prev.output());
}
if(_2a7&&_2a7.next){
console.log("replace oldMove.next:"+_2a7.next.output());
}
}
var _2af=false;
var _2b0=null;
var _2b1=0;
if(_2a7.endNode){
if(clog){
console.log("asked to replace endNode,inserting before instead");
}
this.insertMoveAfter(_2a7.prev,_2a8,false,false,_2ab,_2ac);
_2a8.fen=_2a7.fen;
_2a8.nextFen=_2a7.nextFen;
return;
}
if(!_2ad&&_2a8.equals(_2a7)){
if(clog){
console.log("new move is same as old move so not replacing as variation");
}
_2a9=false;
}else{
if(!_2ad&&_2a7&&_2a7.numVars>0){
for(var i=0;i<_2a7.numVars;i++){
var _2b3=_2a7.vars[i];
if(_2a8.equals(_2b3)){
if(clog){
console.log("new move is same as an existing variation varNum:"+i);
console.log("variation:"+_2b3.output());
if(_2b3.next){
console.log("variation next:"+_2b3.next.output());
}
}
_2af=true;
_2b0=_2a7;
_2a7=_2b3;
_2b1=i;
break;
}
}
}
}
if(_2a7==null){
if(clog){
console.log("replaced new move with null oldmove");
}
this.currentMove=_2a8;
_2a8.atEnd=1;
_2a8.next=null;
_2a8.prev=null;
if(this.startPositionAfterOpponentMove){
_2a8.fen=this.startPositionAfterOpponentMove;
_2a8.nextFen=null;
}
if(this.toMove==ChessPiece.WHITE){
this.currentMove.moveNum=1;
}else{
this.currentMove.moveNum=2;
}
this.firstMove=_2a8;
}else{
var _2b4=false;
if(_2a7&&_2a7.prev&&_2a7.prev.next!=_2a7){
_2b4=true;
}
if(this.currentMove==_2a7&&!_2a9){
this.currentMove=_2a8;
}else{
if(clog){
console.log("not setting current move in replacemove");
}
}
_2a8.atEnd=_2a7.atEnd;
_2a8.prev=_2a7.prev;
_2a8.next=_2a7.next;
_2a8.fen=_2a7.fen;
_2a8.nextFen=_2a7.nextFen;
_2a8.bestMoves=_2a7.bestMoves;
_2a8.correctMove=_2a7.correctMove;
_2a8.wrongMove=_2a7.wrongMove;
_2a8.moveNum=_2a7.moveNum;
_2a8.ravLevel=_2a7.ravLevel;
_2a8.index=_2a7.index;
if(clog){
console.log("replacingVariation with var not null:"+_2af);
}
if(_2af){
_2b0.vars[_2b1]=_2a8;
_2a8.vars=_2a7.vars;
_2a8.numVars=_2a7.numVars;
this.reconnectNextNodeVariations(_2a8,_2a7.next);
if(_2a7.next){
_2a7.next.prev=_2a8;
}
this.moveArray[_2a8.index]=_2a8;
if(clog){
console.log("replacing existing sub variation of main line");
if(_2a8.next){
console.log("next of replacement variation:"+_2a8.next.output());
}
}
return;
}
if(!_2a9){
if(clog){
console.log("not replacing as variation");
}
if(!_2b4&&_2a7.prev){
_2a7.prev.next=_2a8;
}
if(_2a7.next){
_2a7.next.prev=_2a8;
}
_2a8.vars=_2a7.vars;
_2a8.numVars=_2a7.numVars;
this.reconnectNextNodeVariations(_2a8,_2a7.next);
if(this.firstMove==_2a7){
this.firstMove=_2a8;
}
this.moveArray[_2a8.index]=_2a8;
}else{
if(clog){
console.log("replacing as variation");
}
if(_2a7.numVars==0){
_2a7.vars=new Array();
}
_2a7.vars[_2a7.numVars++]=_2a8;
_2a7.atEnd=0;
_2a8.next=null;
var _2b5=this.createMoveFromString("i1i2");
_2a8.next=_2b5;
_2b5.prev=_2a8;
_2b5.next=null;
_2b5.atEnd=1;
_2b5.moveNum=_2a8.moveNum+1;
_2b5.ravLevel=_2a8.ravLevel;
_2b5.endNode=true;
}
}
if(_2aa){
this.replaceIntoMoveDisplay(_2a7,_2a8,_2a9,_2ab,_2ac);
}
};
Board.prototype.setCurrentMove=function(move,_2b7,_2b8){
if(!this.cloned&&this.currentMove!=null){
if(this.currentMove.prev!=null){
YAHOO.util.Dom.removeClass(this.boardName+"-m"+this.currentMove.prev.index,"ct-board-move-current");
}
}
this.currentMove=move;
if(!this.cloned&&this.currentMove!=null&&this.currentMove.prev!=null){
var _2b9=this.boardName+"-m"+this.currentMove.prev.index;
if(clog){
console.log("setCurrentMove attempted highlight of id:"+_2b9+" for move:"+move.output());
}
var span=YAHOO.util.Dom.get(_2b9);
if(span){
var cls=span.className;
YAHOO.util.Dom.addClass(span,"ct-board-move-current");
if(this.autoScrollMoves){
if(!_2b8&&(this.scrollVariations||cls.indexOf("ct-board-move-variation")==-1)){
var _2bc=this.movesDisplay.getMovesDisplay();
if(_2bc){
var off=0;
if(_2bc&&_2bc.offsetHeight){
off=_2bc.offsetHeight/2;
}
var y=YAHOO.util.Dom.getY(span)-(YAHOO.util.Dom.getY(_2bc)+off);
var _2bf=new YAHOO.util.Scroll(_2bc,{scroll:{by:[0,y-this.scrollOffsetCorrection]}},this.moveAnimationLength,YAHOO.util.Easing.easeOut);
_2bf.animate();
}
}
}
}
}else{
if(move==null){
if(clog){
console.log("attempted to set current move on null node");
}
}
}
if(!_2b7){
this.setForwardBack();
}
};
Board.prototype.distanceFromInitial=function(){
var _2c0=this.cloneBoard();
_2c0.setupFromFen(Board.INITIAL_FEN,false,false,true,false,false);
var _2c1=0;
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var p1=this.boardPieces[i][j];
var p2=_2c0.boardPieces[i][j];
if(p1==p2){
continue;
}
if(!p2){
continue;
}
if(!p1){
_2c1++;
continue;
}
if(p1.piece==p2.piece&&p1.colour==p2.colour){
continue;
}
_2c1++;
}
}
return _2c1;
};
Board.INITIAL_FEN="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
Board.isFenLegal=function(fen){
function isLegalCastling(c){
if(!c){
return false;
}
c=c.toLowerCase();
for(var i=0;i<c.length;i++){
if(!(c.charAt(i)=="q"||c.charAt(i)=="k"||c.charAt(i)=="-")){
return false;
}
}
return true;
}
function isLegalEnpassant(m){
if(!m){
return false;
}
if(m=="-"){
return true;
}
if(m.length!=2){
return false;
}
if(m.charAt(0)<"a"||m.charAt(0)>"h"){
return false;
}
var n=parseInt(m.charAt(1));
if(isNaN(n)||n<1||n>8){
return false;
}
return true;
}
function isRowLegal(r){
if(!r){
return false;
}
r=r.toLowerCase();
for(var i=0;i<r.length;i++){
if(!isSquareCharLegal(r.charAt(i))){
return false;
}
}
return true;
}
function isSquareCharLegal(c){
switch(c){
case "1":
case "2":
case "3":
case "4":
case "5":
case "6":
case "7":
case "8":
case "p":
case "k":
case "b":
case "q":
case "r":
case "k":
return true;
default:
false;
}
}
if(!fen){
return false;
}
var ss=fen.split(" ");
if(ss.length!=6){
return false;
}
var pos=ss[0].split("/");
if(pos.length!=8){
return false;
}
if(ss[1]!="w"&&ss[1]!="b"){
return false;
}
if(isNaN(parseInt(ss[4]))){
return false;
}
if(isNaN(parseInt(ss[5]))){
return false;
}
if(!isLegalCastling(ss[2])){
return false;
}
if(!isLegalEnpassant(ss[3])){
return false;
}
return true;
};
Board.prototype.boardToUniqueFen=function(_2d0){
var fen=this.boardToFen();
var ss=fen.split(" ");
var _2d3="w";
if(_2d0==ChessPiece.BLACK){
_2d3="b";
}
var _2d4=ss[0]+" "+_2d3+" "+ss[2]+" "+ss[3];
return _2d4;
};
Board.prototype.boardToFen=function(_2d5){
var _2d6="";
for(var row=7;row>=0;row--){
var _2d8=0;
var line="";
if(row<7){
line="/";
}
for(var col=0;col<8;col++){
var _2db=this.boardPieces[col][row];
if(_2db){
var _2dc="";
if(_2d8>0){
_2dc=_2d8+"";
}
line+=_2dc+_2db.getFenLetter();
_2d8=0;
}else{
_2d8++;
}
}
if(_2d8>0){
line+=_2d8+"";
}
_2d6+=line;
}
var fen=_2d6;
var _2de=" w ";
if(_2d5){
if(this.toMove==ChessPiece.WHITE){
_2de=" b ";
}
}else{
if(this.toMove==ChessPiece.BLACK){
_2de=" b ";
}
}
fen+=_2de;
var _2df="";
_2df+=Board.getFenCastleChar(this.canCastleKingSide,"K",ChessPiece.WHITE);
_2df+=Board.getFenCastleChar(this.canCastleQueenSide,"Q",ChessPiece.WHITE);
_2df+=Board.getFenCastleChar(this.canCastleKingSide,"K",ChessPiece.BLACK);
_2df+=Board.getFenCastleChar(this.canCastleQueenSide,"Q",ChessPiece.BLACK);
if(_2df==""){
fen+="- ";
}else{
fen+=_2df+" ";
}
var _2e0=null;
if(this.currentMove){
if(this.currentMove.prev){
_2e0=this.currentMove.prev;
}else{
_2e0=this.prev_move;
}
}else{
_2e0=this.prev_move;
}
var _2e1="- ";
if(_2e0){
var _2e2=this.boardPieces[_2e0.toColumn][_2e0.toRow];
if(_2e2){
if(_2e2.piece==ChessPiece.PAWN){
if(_2e2.colour==ChessPiece.WHITE){
if(_2e0.fromRow==1&&_2e0.toRow==3){
_2e1=Move.columnToChar(_2e0.fromColumn)+"3 ";
}
}else{
if(_2e0.fromRow==6&&_2e0.toRow==4){
_2e1=Move.columnToChar(_2e0.fromColumn)+"6 ";
}
}
}
}
}
fen+=_2e1;
fen+=this.halfMoveNumber+" "+parseInt((this.moveNumber+1)/2);
if(clog){
console.log("moveNumber:"+this.moveNumber+" fen:"+fen);
}
return fen;
};
Board.getFenCastleChar=function(_2e3,_2e4,_2e5){
if(_2e3[_2e5]){
if(_2e5==ChessPiece.WHITE){
return _2e4.toUpperCase();
}else{
return _2e4.toLowerCase();
}
}
return "";
};
Board.prototype.getCastlingString=function(_2e6){
var _2e7=_js("None");
if(this.canCastleKingSide[_2e6]){
_2e7="O-O";
}
if(this.canCastleQueenSide[_2e6]){
if(_2e7==_js("None")){
_2e7="O-O-O";
}else{
_2e7+=",O-O-O";
}
}
return _2e7;
};
Board.prototype.updateToPlay=function(){
if(this.disableUpdateToPlay){
return;
}
if(this.showToMoveIndicators){
if(this.isFlipped){
YAHOO.util.Dom.setStyle(this.boardName+"-top-to-move-inner","background-color","white");
YAHOO.util.Dom.setStyle(this.boardName+"-top-to-move-inner","border","1px solid black");
YAHOO.util.Dom.setStyle(this.boardName+"-bottom-to-move-inner","background-color","black");
YAHOO.util.Dom.setStyle(this.boardName+"-bottom-to-move-inner","border","1px solid white");
}else{
YAHOO.util.Dom.setStyle(this.boardName+"-bottom-to-move-inner","background-color","white");
YAHOO.util.Dom.setStyle(this.boardName+"-bottom-to-move-inner","border","1px solid black");
YAHOO.util.Dom.setStyle(this.boardName+"-top-to-move-inner","background-color","black");
YAHOO.util.Dom.setStyle(this.boardName+"-top-to-move-inner","border","1px solid white");
}
if(this.toMove==ChessPiece.WHITE){
if(this.isFlipped){
YAHOO.util.Dom.addClass(this.boardName+"-top-to-move-outer","ct-to-move-active");
YAHOO.util.Dom.removeClass(this.boardName+"-bottom-to-move-outer","ct-to-move-active");
}else{
YAHOO.util.Dom.addClass(this.boardName+"-bottom-to-move-outer","ct-to-move-active");
YAHOO.util.Dom.removeClass(this.boardName+"-top-to-move-outer","ct-to-move-active");
}
}else{
if(this.isFlipped){
YAHOO.util.Dom.addClass(this.boardName+"-bottom-to-move-outer","ct-to-move-active");
YAHOO.util.Dom.removeClass(this.boardName+"-top-to-move-outer","ct-to-move-active");
}else{
YAHOO.util.Dom.addClass(this.boardName+"-top-to-move-outer","ct-to-move-active");
YAHOO.util.Dom.removeClass(this.boardName+"-bottom-to-move-outer","ct-to-move-active");
}
}
}
var _2e8=YAHOO.util.Dom.get("toPlay");
if(_2e8==null){
return;
}
if(this.toMove==ChessPiece.WHITE){
_2e8.src="/images/whiteknight"+this.getVersString()+".gif";
_2e8.alt=_js("White to play");
}else{
_2e8.src="/images/blackknight"+this.getVersString()+".gif";
_2e8.alt=_js("Black to play");
}
var _2e9=YAHOO.util.Dom.get("fenStatus");
if(_2e9){
var _2ea=this.getCastlingString(ChessPiece.BLACK);
var _2eb=this.getCastlingString(ChessPiece.WHITE);
var s="<div><span>"+_js("White Castling: ")+"</span><span>"+_2eb+"</span></div>"+"<div><span>"+_js("Black Castling: ")+"</span><span>"+_2ea+"</span></div>";
_2e9.innerHTML=s;
}
};
Board.prototype.getBoardDivFromId=function(id){
if(!this[id]){
this[id]=YAHOO.util.Dom.get(id);
}
return this[id];
};
Board.prototype.getBoardDiv=function(){
if(!this.boardDiv){
this.boardDiv=YAHOO.util.Dom.get("ctb-"+this.boardName);
}
return this.boardDiv;
};
Board.prototype.getDocBody=function(){
if(!this.docBody){
var _2ee=document.getElementsByTagName("body");
if(_2ee==null||_2ee.length==0){
alert("Could not find body tag");
}else{
this.docBody=_2ee[0];
}
}
return this.docBody;
};
Board.prototype.getPieceDragDiv=function(){
if(!this.pieceDragDiv){
this.pieceDragDiv=YAHOO.util.Dom.get("pieceDragDiv");
}
return this.pieceDragDiv;
};
Board.prototype.createBoardCoords=function(){
this.coordinatesShown=false;
var _2ef=YAHOO.util.Dom.get(this.boardName+"-fileLabels");
var _2f0=YAHOO.util.Dom.get(this.boardName+"-rankLabels");
if(!_2ef||!_2f0){
return;
}
YAHOO.util.Event.purgeElement(_2ef,true);
_2f0.innerHTML="";
_2ef.innerHTML="";
var _2f1=YAHOO.util.Dom.get(this.boardName+"-boardBorder");
if(!this.showCoordinates){
YAHOO.util.Dom.setStyle(_2ef,"display","none");
YAHOO.util.Dom.setStyle(_2f0,"display","none");
var _2f2=0;
YAHOO.util.Dom.setStyle(_2f1,"width",(this.pieceSize*8+_2f2)+"px");
YAHOO.util.Dom.setStyle(_2f1,"height",(this.pieceSize*8+_2f2)+"px");
return;
}
YAHOO.util.Dom.setStyle(_2ef,"display","block");
YAHOO.util.Dom.setStyle(_2f0,"display","block");
var _2f2=15;
var _2f3=0;
if(check_bad_msie()){
_2f3=this.ie6FixCoordsOffsetSize;
}
if(YAHOO.util.Event.isIE){
_2f3+=this.allIeFixCoordsOffsetSize;
if(document.compatMode!="CSS1Compat"){
_2f3=8;
}
}
YAHOO.util.Dom.setStyle(_2f1,"width",(this.pieceSize*8+_2f2+_2f3)+"px");
YAHOO.util.Dom.setStyle(_2f1,"height",(this.pieceSize*8+_2f2)+"px");
this.coordinatesShown=true;
for(var i=0;i<8;i++){
var _2f5=document.createElement("div");
YAHOO.util.Dom.setStyle(_2f5,"height",this.pieceSize+"px");
YAHOO.util.Dom.setStyle(_2f5,"width","15px");
YAHOO.util.Dom.setStyle(_2f5,"text-align","center");
YAHOO.util.Dom.setStyle(_2f5,"line-height",this.pieceSize+"px");
if(this.isFlipped){
_2f5.innerHTML=""+(i+1);
}else{
_2f5.innerHTML=""+9-(i+1);
}
_2f0.appendChild(_2f5);
}
for(var i=0;i<9;i++){
var _2f6=document.createElement("span");
YAHOO.util.Dom.setStyle(_2f6,"float","left");
YAHOO.util.Dom.setStyle(_2f6,"height","15px");
if(i==0){
YAHOO.util.Dom.setStyle(_2f6,"width","15px");
YAHOO.util.Dom.setStyle(_2f6,"clear","both");
YAHOO.util.Dom.setStyle(_2f6,"margin-top","-5px");
if(_2f3){
YAHOO.util.Dom.setStyle(_2f6,"margin-left","-3px");
}else{
YAHOO.util.Dom.setStyle(_2f6,"margin-left","-2px");
}
var _2f7="";
if(this.isFlipped){
_2f7="whiteblack-flipper"+this.getVersString()+".png";
}else{
_2f7="blackwhite-flipper"+this.getVersString()+".png";
}
_2f6.innerHTML="<span><img id=\""+this.boardName+"-flipper\" title=\""+_js("Flip Board")+"\" src=\""+this.boardImagePath+"/images/"+_2f7+"\"/></span>";
if(!this.disableFlipper){
YAHOO.util.Event.addListener(this.boardName+"-flipper","click",this.flipBoard,this,true);
}
}else{
YAHOO.util.Dom.setStyle(_2f6,"width",this.pieceSize+"px");
YAHOO.util.Dom.setStyle(_2f6,"text-align","center");
if(this.isFlipped){
_2f6.innerHTML=_js(Move.columnToChar(8-(i)));
}else{
_2f6.innerHTML=_js(Move.columnToChar((i-1)));
}
}
_2ef.appendChild(_2f6);
}
var _2f8=YAHOO.util.Dom.get(this.boardName+"-flipper");
if(_2f8){
fix_ie_png(_2f8);
}
};
Board.prototype.showNavigation=function(){
this.disableNavigation=false;
YAHOO.util.Dom.setStyle(this.boardName+"-ct-nav-container","display","block");
};
Board.prototype.hideNavigation=function(){
this.disableNavigation=true;
YAHOO.util.Dom.setStyle(this.boardName+"-ct-nav-container","display","none");
};
Board.prototype.createBoardUI=function(){
var _2f9=this.boardName+"-container";
var _2fa=YAHOO.util.Dom.get(_2f9);
if(_2fa==null){
alert("Could not find board container:"+_2f9);
return;
}
YAHOO.util.Dom.addClass(_2fa,"ct-board-container");
this.boardDiv=null;
var _2fb=document.createElement("div");
_2fb.id=this.boardName+"-boardBorder";
YAHOO.util.Dom.addClass(_2fb,"ct-board-border"+this.squareColorClass);
var _2fc=0;
if(this.showCoordinates){
_2fc=15;
}
YAHOO.util.Dom.setStyle(_2fb,"width",(this.pieceSize*8+_2fc)+"px");
YAHOO.util.Dom.setStyle(_2fb,"height",(this.pieceSize*8+_2fc)+"px");
var _2fd=document.createElement("div");
YAHOO.util.Dom.setStyle(_2fd,"float","left");
_2fd.id=this.boardName+"-rankLabels";
_2fb.appendChild(_2fd);
var _2fe=document.createElement("div");
YAHOO.util.Dom.addClass(_2fe,"ct-board");
YAHOO.util.Dom.setStyle(_2fe,"width",(this.pieceSize*8)+"px");
YAHOO.util.Dom.setStyle(_2fe,"height",(this.pieceSize*8)+"px");
_2fe.id="ctb-"+this.boardName;
var _2ff="ct-white-square"+this.squareColorClass;
var _300="";
var _301=[];
for(var i=7;i>=0;i--){
var s="<div>";
for(var j=0;j<8;j++){
var _305=document.createElement("div");
var _306=this.boardName+"-s"+j+""+i;
var _307=(((j+1)*(i+1))%19/19*100);
var _308=((65-((j+1)*(i+1)))%19/19*100);
s+="<div id=\""+_306+"\" class=\""+_2ff+"\" style=\"width:"+this.pieceSize+"px;height:"+this.pieceSize+"px;background-position:"+_307+"% "+_308+"%\"></div>";
_301.push(_306);
_2ff=(_2ff=="ct-black-square"+this.squareColorClass)?"ct-white-square"+this.squareColorClass:"ct-black-square"+this.squareColorClass;
}
_2ff=(_2ff=="ct-black-square"+this.squareColorClass)?"ct-white-square"+this.squareColorClass:"ct-black-square"+this.squareColorClass;
s+="</div>";
_300+=s;
}
_2fe.innerHTML=_300;
var _309=document.createElement("div");
_309.id=this.boardName+"-fileLabels";
_2fb.appendChild(_2fe);
_2fb.appendChild(_309);
_2fa.appendChild(_2fb);
if(this.showToMoveIndicators){
var _30a=document.createElement("div");
_30a.id=this.boardName+"-moveIndicators";
YAHOO.util.Dom.addClass(_30a,"ct-move-indicators");
_30a.innerHTML="<div class=\"ct-top-to-move-outer\" id=\""+this.boardName+"-top-to-move-outer\"><div  class=\"ct-top-to-move-inner\" id=\""+this.boardName+"-top-to-move-inner\"></div></div><div class=\"ct-bottom-to-move-outer\"  id=\""+this.boardName+"-bottom-to-move-outer\"><div class=\"ct-bottom-to-move-inner\" id=\""+this.boardName+"-bottom-to-move-inner\" ></div>";
_2fa.appendChild(_30a);
YAHOO.util.Dom.setStyle(_2fb,"float","left");
YAHOO.util.Dom.setStyle(_30a,"float","left");
YAHOO.util.Dom.setStyle(_30a,"margin-left","2px");
YAHOO.util.Dom.setStyle(_30a,"height",((this.pieceSize*8)+2)+"px");
YAHOO.util.Dom.setStyle(_30a,"position","relative");
var _30b=document.createElement("div");
YAHOO.util.Dom.setStyle(_30b,"clear","both");
_2fa.appendChild(_30b);
}
this.createBoardCoords();
var _30c=false;
var _30d=YAHOO.util.Dom.get(this.boardName+"-ct-nav-container");
if(!_30d){
_30d=document.createElement("div");
}else{
_30c=true;
_30d.innerHTML="";
}
_30d.id=this.boardName+"-ct-nav-container";
if(!this.dontOutputNavButtons||this.r){
var _30e="";
if(!this.dontOutputNavButtons){
if(!this.problem||!this.problem.isEndgame){
_30e="<span id=\"playStopSpan\"><img class=\"ct-end\" id=\""+this.boardName+"-end\" src=\""+this.boardImagePath+"/images/resultset_last"+this.getVersString()+".gif\" alt=\""+_js("End position")+"\" title=\""+_js("Go to final position")+"\"/>"+"<img class=\"ct-play\" id=\""+this.boardName+"-play\" src=\""+this.boardImagePath+"/images/control_play_blue"+this.getVersString()+".gif\" alt=\""+_js("Play moves")+"\" title=\""+_js("Play sequence of moves")+"\"/>"+"<img class=\"ct-stop\" id=\""+this.boardName+"-stop\" src=\""+this.boardImagePath+"/images/control_stop_blue"+this.getVersString()+".gif\" alt=\""+_js("Stop playing")+"\" title=\""+_js("Stop playing move sequence")+"\"/></span>";
}
}
var _30f="<div class=\"ct-nav-buttons\" id=\""+this.boardName+"-navButtons\"><span id=\""+this.boardName+"-nav-buttons-only\">";
if(!this.dontOutputNavButtons){
var size="";
if(isIphone||isIpad){
size=" width=\"50px\" height=\"34px\" ";
_30e="";
}
if(!(isIphone||isIpad)){
_30f+="<img class=\"ct-start\" id=\""+this.boardName+"-start\" src=\""+this.boardImagePath+"/images/resultset_first"+this.getVersString()+".gif\" alt=\""+_js("Start position")+"\" title=\""+_js("Go to starting position")+"\"/>";
}
_30f+="<img class=\"ct-back\" id=\""+this.boardName+"-back\" "+size+" src=\""+this.boardImagePath+"/images/resultset_previous"+this.getVersString()+".gif\" alt=\""+_js("Previous Move")+"\" title=\""+_js("Go back a move")+"\"/>"+"<img class=\"ct-forward\" id=\""+this.boardName+"-forward\" "+size+" src=\""+this.boardImagePath+"/images/resultset_next"+this.getVersString()+".gif\" alt=\""+_js("Next Move")+"\" title=\""+_js("Go forward a move")+"\"/>"+_30e;
}
if(this.r){
_30f+="<img class=\"ct-forward\" id=\""+this.boardName+"-analyse\" src=\""+this.boardImagePath+"/images/anboard"+this.getVersString()+".gif\" alt=\""+_js("Analyse")+"\" title=\""+_js("Launch analysis board to explore different lines in this position")+"\"/>";
if(!this.g){
_30f+="<img class=\"ct-forward\" id=\""+this.boardName+"-showfen\" src=\""+this.boardImagePath+"/images/copy_fen"+this.getVersString()+".gif\" alt=\""+_js("Copy FEN")+"\" title=\""+_js("Show FEN for current position")+"\"/>";
}
}
if(this.canPasteFen){
_30f+="<img class=\"ct-forward\" id=\""+this.boardName+"-pastefen\" src=\""+this.boardImagePath+"/images/paste_fen"+this.getVersString()+".gif\" alt=\""+_js("Input FEN")+"\" title=\""+_js("Setup position from user supplied FEN or move list")+"\"/>";
}
if(this.g2){
_30f+="<img class=\"ct-forward\" id=\""+this.boardName+"-playcomp\" src=\""+this.boardImagePath+"/images/computer"+this.getVersString()+".gif\" alt=\""+_js("Play Current Position vs Computer")+"\" title=\""+_js("Play current position against computer")+"\"/>";
}
_30f+="</span>";
_30f+="</div>";
if(this.puzzle){
var _311="";
var _312="";
var _313="";
var _314="";
if(this.pieceSize>=29){
_311=_js("Easy");
_312=_js("Medium");
_313=_js("Hard");
_314=_js("Help");
}else{
_311=_js("D1");
_312=_js("D2");
_313=_js("D3");
_314=_js("?");
}
_30f+="<div><form action=\"\"><button type=\"button\" id=\""+this.boardName+"-puzzleSolution\" class=\"asolution-button\">"+_js("Show")+"</button><button id=\""+this.boardName+"-easyPuzzle\" type=\"button\" class=\"puzzle-difficulty\">"+_311+"</button>"+"<button id=\""+this.boardName+"-mediumPuzzle\" type=\"button\" class=\"puzzle-difficulty\">"+_312+"</button>"+"<button id=\""+this.boardName+"-hardPuzzle\" type=\"button\" class=\"puzzle-difficulty\">"+_313+"</button>"+"<button id=\""+this.boardName+"-puzzleHelp\" type=\"button\" class=\"puzzle-difficulty\">"+_314+"</button>"+"<img alt=\"\" class=\"ct-forward\" id=\""+this.boardName+"-problemState\"></img><span id=\""+this.boardName+"-puzzleResult\"></span></form></div>";
_30f+="<div class=\"initially_hidden initially_invisible\" id=\""+this.boardName+"-moves\"></div>";
_30f+="<div class=\"initially_hidden initially_invisible\" id=\""+this.boardName+"-moves\"></div>";
}
_30d.innerHTML=_30f;
}
if(!_30c){
_2fa.appendChild(_30d);
}
if(this.problem){
var body=YAHOO.util.Dom.get("body");
if(body){
YAHOO.util.Dom.setStyle(body,"min-width",((this.pieceSize*8+_2fc)+300+200+120)+"px");
}
}
};
Board.prototype.getPieceDiv=function(){
var _316=this.getBoardDiv();
var _317=document.createElement("div");
this.availPieceDivs[this.uptoId]=_317;
this.availIds[this.uptoId]=YAHOO.util.Dom.generateId(_317);
YAHOO.util.Dom.setStyle(_317,"visibility","hidden");
YAHOO.util.Dom.addClass(_317,"board-piece-start-style");
_316.appendChild(_317);
this.uptoId++;
return _317;
};
Board.prototype.flipToMove=function(_318){
return (_318=="w")?"b":"w";
};
Board.prototype.pieceCharToPieceNum=function(_319){
var _31a;
switch(_319){
case "K":
_31a=ChessPiece.KING;
break;
case "Q":
_31a=ChessPiece.QUEEN;
break;
case "R":
_31a=ChessPiece.ROOK;
break;
case "B":
_31a=ChessPiece.BISHOP;
break;
case "N":
_31a=ChessPiece.KNIGHT;
break;
case "P":
_31a=ChessPiece.PAWN;
break;
}
return _31a;
};
Board.prototype.pieceTypeToChar=function(_31b){
switch(_31b){
case ChessPiece.KING:
return "K";
case ChessPiece.QUEEN:
return "Q";
case ChessPiece.ROOK:
return "R";
case ChessPiece.BISHOP:
return "B";
case ChessPiece.KNIGHT:
return "N";
case ChessPiece.PAWN:
return "P";
}
return "?";
};
Board.prototype.canMoveKnight=function(_31c,_31d,_31e,_31f){
if(_31c+2==_31e&&_31d+1==_31f){
return true;
}
if(_31c+2==_31e&&_31d-1==_31f){
return true;
}
if(_31c-2==_31e&&_31d+1==_31f){
return true;
}
if(_31c-2==_31e&&_31d-1==_31f){
return true;
}
if(_31c+1==_31e&&_31d+2==_31f){
return true;
}
if(_31c-1==_31e&&_31d+2==_31f){
return true;
}
if(_31c+1==_31e&&_31d-2==_31f){
return true;
}
if(_31c-1==_31e&&_31d-2==_31f){
return true;
}
return false;
};
Board.prototype.canMovePawn=function(_320,_321,_322,_323,_324){
var _325=this.boardPieces[_322][_323];
var _326=this.boardPieces[_320][_321];
if(_324){
var _327=this.boardPieces[_324.toColumn][_324.toRow];
if(_327&&_327.piece==ChessPiece.PAWN){
if(_327.colour==ChessPiece.WHITE){
if(_324.fromRow==1&&_324.toRow==3){
if(_322==_324.fromColumn&&_321==3&&_323==2&&(_320==_322+1||_320==_322-1)){
return true;
}
}
}else{
if(_324.fromRow==6&&_324.toRow==4){
if(_322==_324.fromColumn&&_321==4&&_323==5&&(_320==_322+1||_320==_322-1)){
return true;
}
}
}
}
}
if(_325){
if(_326.colour==ChessPiece.WHITE){
if((_320==_322+1||_320==_322-1)&&(_321==_323-1)){
return true;
}
}else{
if((_320==_322+1||_320==_322-1)&&(_321==_323+1)){
return true;
}
}
}else{
if(_320==_322){
if(_326.colour==ChessPiece.WHITE){
if(_321==1){
if(_323==2){
return true;
}else{
if(_323==3&&this.boardPieces[_322][2]==null){
return true;
}
}
}else{
if(_321+1==_323){
return true;
}
}
}else{
if(_321==6){
if(_323==5){
return true;
}else{
if(_323==4&&this.boardPieces[_322][5]==null){
return true;
}
}
}else{
if(_321-1==_323){
return true;
}
}
}
}
}
return false;
};
Board.prototype.canMoveStraight=function(_328,_329,_32a,_32b,_32c,_32d){
var _32e=_328;
var _32f=_329;
var _330=0;
var _331=0;
if(_32a>_328){
_330=1;
}else{
if(_32a<_328){
_330=-1;
}
}
if(_32b>_329){
_331=1;
}else{
if(_32b<_329){
_331=-1;
}
}
if(clog){
console.log("deltaRow:"+_331+" deltaCol:"+_330+" fromCol:"+_328+" fromRow:"+_329+" toCol:"+_32a+" toRow:"+_32b);
}
if(_32c==ChessPiece.ROOK&&(_330!=0&&_331!=0)){
return false;
}
if(_32c==ChessPiece.BISHOP&&(_330==0||_331==0)){
return false;
}
var _332=0;
while(true){
_332++;
_328+=_330;
_329+=_331;
if(_32c==ChessPiece.KING&&_332>1){
if(clog){
console.log("king count:"+_332+" toCol:"+_32a+" toRow:"+_32b);
}
if(_332!=2){
return false;
}
if(_331!=0){
return false;
}
if(!(_32a==6||_32a==2)){
return false;
}
if(_32a==2){
if(this.boardPieces[1][_329]||this.boardPieces[2][_329]||this.boardPieces[3][_329]){
return false;
}
if(!this.canCastleQueenSide[_32d.colour]){
return false;
}
}else{
if(_32a==6){
if(this.boardPieces[5][_329]||this.boardPieces[6][_329]){
if(clog){
console.log("king can't castle intervening piece");
}
return false;
}
if(!this.canCastleKingSide[_32d.colour]){
if(clog){
console.log("king can't castle king side (made previously invalid) colour:"+_32d.colour);
}
return false;
}
}else{
if(clog){
console.log("king not in col 2 or 6");
}
return false;
}
}
var _333="";
_333+=Move.columnToChar(_32e);
_333+=String.fromCharCode("1".charCodeAt(0)+_32f);
_333+=Move.columnToChar((_32e+_330));
_333+=String.fromCharCode("1".charCodeAt(0)+(_32f+_331));
var move=this.createMoveFromString(_333);
var _335=this.cloneBoard();
_335.makeMove(move,_335.boardPieces[_32e][_32f],false,this.moveAnimationLength,false,false);
kingSafe=_335.isKingSafe(_32d.colour,move);
if(clog){
console.log("kingSafe1:"+kingSafe);
}
if(!kingSafe){
return false;
}
var _333="";
_333+=Move.columnToChar(_32e);
_333+=String.fromCharCode("1".charCodeAt(0)+_32f);
_333+=Move.columnToChar(_32e);
_333+=String.fromCharCode("1".charCodeAt(0)+_32f);
var move=this.createMoveFromString(_333);
var _335=this.cloneBoard();
_335.makeMove(move,_335.boardPieces[_32e][_32f],false,this.moveAnimationLength,false,false);
kingSafe=_335.isKingSafe(_32d.colour,move);
var _335=this.cloneBoard();
_335.makeMove(move,_335.boardPieces[_32e][_32f],false,this.moveAnimationLength,false,false);
kingSafe=this.isKingSafe(_32d.colour,move);
if(clog){
console.log("kingSafe2:"+kingSafe);
}
if(!kingSafe){
return false;
}
}
if(_328==_32a&&_329==_32b){
return true;
}
if(_328<0||_328>7||_329<0||_329>7){
return false;
}
if(this.boardPieces[_328][_329]!=null){
return false;
}
}
};
Board.prototype.canMove=function(_336,_337,_338,_339,_33a){
var _33b=_336.column;
var _33c=_336.row;
if(_337>7||_337<0||_338>7||_338<0){
if(clog){
console.log("can't move coz out of bounds");
}
return false;
}
var _33d=this.boardPieces[_337][_338];
var _33e=this.boardPieces[_33b][_33c];
if(_33e==null){
return false;
}
if(_33d&&_33d.colour==_33e.colour){
return false;
}
var _33f=false;
if(_336.piece==ChessPiece.PAWN){
_33f=this.canMovePawn(_33b,_33c,_337,_338,_339);
}else{
if(_336.piece==ChessPiece.KNIGHT){
_33f=this.canMoveKnight(_33b,_33c,_337,_338);
}else{
_33f=this.canMoveStraight(_33b,_33c,_337,_338,_336.piece,_336);
}
}
if(clog){
console.log("moveOk:"+_33f);
}
var _340=true;
if(_33f&&_33a){
var _341="";
_341+=Move.columnToChar(_33b);
_341+=String.fromCharCode("1".charCodeAt(0)+_33c);
_341+=Move.columnToChar(_337);
_341+=String.fromCharCode("1".charCodeAt(0)+_338);
var move=this.createMoveFromString(_341);
var _343=this.cloneBoard();
_343.makeMove(move,_343.boardPieces[_33b][_33c],false,this.moveAnimationLength,false,false);
_340=_343.isKingSafe(_336.colour,move);
}
return _33f&&_340;
};
Board.prototype.is50MoveRule=function(){
return (this.halfMoveNumber>=100);
};
Board.prototype.isCheckmate=function(_344){
return (!this.isKingSafe(this.toMove,_344)&&this.isKingMated(this.toMove,_344));
};
Board.prototype.isStalemate=function(_345){
return (this.isKingSafe(this.toMove,_345)&&(this.getCandidateMoves(this.toMove,_345,true)).length==0);
};
Board.prototype.isKingMated=function(_346,_347){
var _348=null;
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var bp=this.boardPieces[i][j];
if(bp!=null&&bp.piece==ChessPiece.KING&&bp.colour==_346){
_348=bp;
break;
}
}
}
var _34c=[[1,0],[1,1],[1,-1],[-1,0],[-1,1],[-1,-1],[0,1],[0,-1],[2,0],[-2,0]];
var bp=_348;
for(var k=0;k<_34c.length;k++){
if(this.canMove(bp,bp.column+_34c[k][0],bp.row+_34c[k][1],_347,true)){
return false;
}
}
var _34e=this.getCandidateMoves(_346,_347,true,true);
if(_34e.length>0){
return false;
}
return true;
};
Board.prototype.getCandidateMoves=function(_34f,_350,_351,_352){
var _353=new Array();
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var bp=this.boardPieces[i][j];
var _357=[];
if(!bp||bp.colour!=_34f){
continue;
}
switch(bp.piece){
case ChessPiece.KING:
if(_352){
continue;
}
_357=[[1,0],[1,1],[1,-1],[-1,0],[-1,1],[-1,-1],[0,1],[0,-1],[2,0],[-2,0]];
break;
case ChessPiece.KNIGHT:
_357=[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
break;
case ChessPiece.BISHOP:
for(var k=0;k<8;k++){
_357.push([1+k,1+k]);
_357.push([1+k,-1-k]);
_357.push([-1-k,1+k]);
_357.push([-1-k,-1-k]);
}
break;
case ChessPiece.QUEEN:
for(var k=0;k<8;k++){
_357.push([1+k,0]);
_357.push([1+k,1+k]);
_357.push([1+k,-1-k]);
_357.push([-1-k,0]);
_357.push([-1-k,1+k]);
_357.push([-1-k,-1-k]);
_357.push([0,-1-k]);
_357.push([0,1+k]);
}
break;
case ChessPiece.ROOK:
for(var k=0;k<8;k++){
_357.push([1+k,0]);
_357.push([-1-k,0]);
_357.push([0,-1-k]);
_357.push([0,1+k]);
}
break;
case ChessPiece.PAWN:
if(_34f==ChessPiece.BLACK){
_357=[[0,-1],[1,-1],[-1,-1]];
if(j==6){
_357.push([0,-2]);
}
}else{
_357=[[0,1],[1,1],[-1,1]];
if(j==1){
_357.push([0,2]);
}
}
break;
}
for(var k=0;k<_357.length;k++){
if(this.canMove(bp,bp.column+_357[k][0],bp.row+_357[k][1],_350,true)){
_353.push(new Move(bp.column,bp.row,bp.column+_357[k][0],bp.row+_357[k][1]));
if(_351){
return _353;
}
}
}
}
}
return _353;
};
Board.prototype.isKingSafe=function(_359,_35a){
var _35b=null;
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var bp=this.boardPieces[i][j];
if(bp!=null&&bp.piece==ChessPiece.KING&&bp.colour==_359){
_35b=bp;
break;
}
}
}
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var bp=this.boardPieces[i][j];
if(bp!=null&&bp.colour!=_359){
if(this.canMove(bp,_35b.column,_35b.row,_35a,false)){
return false;
}
}
}
}
return true;
};
Board.prototype.freeBoardPieces=function(_35f){
if(this.boardPieces){
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
if(this.boardPieces[i][j]!=null){
this.boardPieces[i][j].free();
this.boardPieces[i][j]=null;
}
}
if(_35f){
this.boardPieces[i]=null;
}
}
}
if(_35f){
this.boardPieces=null;
}
};
Board.prototype.freeBoard=function(){
this.freeBoardPieces(true);
this.freeMoveArray();
};
Board.prototype.freeMoveArray=function(){
if(this.moveArray){
for(var i=0;i<this.moveArray.length;i++){
var m=this.moveArray[i];
if(m){
m.freeMove();
this.moveArray[i]=null;
}
}
}
};
Board.prototype.cloneBoard=function(){
var _364=new Board();
_364.boardName=this.boardName;
_364.cloned=true;
_364.boardPieces=this.copyBoardPieces(true);
_364.moveArray=this.copyMoveArray(false);
_364.canCastleQueenSide=this.copyCastleQueenSide();
_364.canCastleKingSide=this.copyCastleKingSide();
_364.toMove=this.toMove;
_364.restrictedColourMovement=-1;
_364.opponentColour=this.opponentColour;
_364.outputWithoutDisplay=this.outputWithoutDisplay;
_364.isFlipped=this.isFlipped;
_364.isUserFlipped=this.isUserFlipped;
_364.ignoreFlipping=this.ignoreFlipping;
_364.reverseFlip=this.reverseFlip;
_364.moveAnimationLength=this.moveAnimationLength;
_364.moveNumber=this.moveNumber;
_364.halfMoveNumber=this.halfMoveNumber;
_364.startFen=this.startFen;
_364.boardImagePath=this.boardImagePath;
_364.dontUpdatePositionReachedTable=this.dontUpdatePositionReachedTable;
if(this.prev_move){
_364.prev_move=this.prev_move.clone();
}else{
_364.prev_move=null;
}
return _364;
};
Board.prototype.copyCastleQueenSide=function(){
return [this.canCastleQueenSide[0],this.canCastleQueenSide[1]];
};
Board.prototype.copyCastleKingSide=function(){
return [this.canCastleKingSide[0],this.canCastleKingSide[1]];
};
Board.copyMoves=function(_365,_366,_367){
var _368=new Array();
if(!_366){
if(_365&&_365.length>0){
_368=_365.slice(0);
}
}else{
if(_365){
for(var i=0;i<_365.length;i++){
var m=_365[i];
var newM=null;
if(m){
newM=m.clone(true);
}
_368[i]=newM;
}
}
}
if(_367){
for(var i=0;i<_365.length;i++){
if(_365[i].prev){
if(typeof _365[i].prev.index!="undefined"){
_368[i].prev=_368[_365[i].prev.index];
}
}
if(_365[i].next){
if(typeof _365[i].next.index!="undefined"){
_368[i].next=_368[_365[i].next.index];
}
}
}
}
return _368;
};
Board.prototype.copyMoveArray=function(_36c){
return Board.copyMoves(this.moveArray,_36c);
var _36d=new Array();
if(!_36c){
if(this.moveArray&&this.moveArray.length>0){
_36d=this.moveArray.slice(0);
}
return _36d;
}else{
if(this.moveArray){
for(var i=0;i<this.moveArray.length;i++){
var m=this.moveArray[i];
if(m){
var newM=m.clone(true);
_36d[i]=newM;
}
}
}
return _36d;
}
};
Board.prototype.copyBoardPieces=function(_371){
var _372=Board.createBoardArray();
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
if(this.boardPieces[i][j]!=null){
if(_371){
_372[i][j]=this.boardPieces[i][j].makeLightWeight();
}else{
_372[i][j]=this.boardPieces[i][j].copyPiece();
}
}else{
_372[i][j]=null;
}
}
}
return _372;
};
Board.prototype.createPiece=function(_375,_376,_377){
if(_377){
return new LightweightChessPiece(null,_375,_376,this);
}else{
return new ChessPiece(this.getPieceDiv(),_375,_376,this);
}
};
Board.prototype.restoreCastling=function(_378){
this.canCastleKingSide=_378.kingSide;
this.canCastleQueenSide=_378.queenSide;
};
Board.prototype.saveCastling=function(){
var _379=[this.canCastleQueenSide[0],this.canCastleQueenSide[1]];
var _37a=[this.canCastleKingSide[0],this.canCastleKingSide[1]];
return {queenSide:_379,kingSide:_37a};
};
var firstLightProf=true;
var firstHeavyProf=true;
Board.prototype.setupFromFenLightweight=function(fen,_37c,flip,_37e,_37f){
var _380=false&&firstLightProf;
if(_380){
console.profile("setupFromFenLight");
}
this.setupFromFenGeneric(fen,_37c,flip,true,_37e,_37f);
if(_380){
console.profileEnd();
}
};
Board.prototype.setupFromFenHeavyWeight=function(fen,_382,flip,_384,_385){
var _386=false&&firstHeavyProf;
if(_386){
console.profile("setupFromFenHeavy");
}
if(this.lastFromSquare){
YAHOO.util.Dom.removeClass(this.lastFromSquare,"ct-from-square");
}
if(this.lastToSquare){
YAHOO.util.Dom.removeClass(this.lastToSquare,"ct-to-square");
}
this.setupFromFenGeneric(fen,_382,flip,false,_384,_385);
if(_386){
console.profileEnd();
}
};
Board.prototype.setupFromFen=function(fen,_388,flip,_38a,_38b,_38c){
this.positionsSeen=[];
if(_38a){
this.setupFromFenLightweight(fen,_388,flip,_38b,_38c);
}else{
this.setupFromFenHeavyWeight(fen,_388,flip,_38b,_38c);
}
};
Board.prototype.setupFromFenGeneric=function(fen,_38e,flip,_390,_391,_392){
if(ctime){
console.time("setupFromFen"+_390);
}
if(this.oldSelectedSquare){
YAHOO.util.Dom.removeClass(this.oldSelectedSquare,"ct-source-square");
}
this.oldSelectedSquare=null;
this.oldSelectedPiece=null;
this.settingUpPosition=true;
var _393=fen.split(" ");
var _394=_393[0].split("/");
this.halfMoveNumber=parseInt(_393[4]);
this.moveNumber=parseInt(_393[5])*2;
var _395=0;
var row=8;
this.uptoId=0;
this.board_xy=null;
var _397=_393[2];
var _398=null;
this.canCastleQueenSide=[false,false];
this.canCastleKingSide=[false,false];
if(_397!="-"){
if(_397.indexOf("K")>=0){
this.canCastleKingSide[ChessPiece.WHITE]=true;
}
if(_397.indexOf("Q")>=0){
this.canCastleQueenSide[ChessPiece.WHITE]=true;
}
if(_397.indexOf("k")>=0){
this.canCastleKingSide[ChessPiece.BLACK]=true;
}
if(_397.indexOf("q")>=0){
this.canCastleQueenSide[ChessPiece.BLACK]=true;
}
}
if(_392){
this.startMoveNum=this.moveNumber;
}
if(_393[1]=="w"){
if(_392){
this.startMoveNum--;
}
this.toMove=ChessPiece.WHITE;
this.opponentColour=ChessPiece.WHITE;
this.isFlipped=false;
this.moveNumber--;
}else{
this.toMove=ChessPiece.BLACK;
this.opponentColour=ChessPiece.BLACK;
this.isFlipped=true;
}
if(_391){
var _399=_393[3];
if(_399!="-"&&_399.length==2){
var _39a=_399[0];
var _39b=parseInt(_399[1]);
if(_39b==3){
_398=this.createMoveFromString(_39a+"2"+_39a+"4");
}else{
_398=this.createMoveFromString(_39a+"7"+_39a+"5");
}
_398.prevMoveEnpassant=true;
this.prev_move=_398;
}
}
if(_38e){
this.toMove=(ChessPiece.BLACK==this.toMove)?ChessPiece.WHITE:ChessPiece.BLACK;
this.isFlipped=!this.isFlipped;
}
if(flip){
this.isFlipped=true;
}
if(this.reverseFlip){
this.isFlipped=!this.isFlipped;
}
if(this.ignoreFlipping){
this.isFlipped=false;
}
if(this.isUserFlipped){
this.isFlipped=!this.isFlipped;
}
this.updateToPlay();
this.setupPieceDivs();
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
this.boardPieces[i][j]=null;
}
}
for(var i=0;i<8;i++){
var line=_394[i];
row--;
_395=0;
for(var j=0;j<line.length;j++){
var c=line.charAt(j);
var code=line.charCodeAt(j);
var num=code-"0".charCodeAt(0);
if(num>0&&num<9){
while(num--){
var _3a2=this.boardPieces[_395][row];
this.boardPieces[_395][row]=null;
_395++;
}
}else{
var _3a3=(c+"").toLowerCase().charAt(0);
var _3a4=ChessPiece.WHITE;
if(_3a3==c){
_3a4=ChessPiece.BLACK;
}
var cp;
switch(_3a3){
case "k":
cp=this.createPiece(_3a4,ChessPiece.KING,_390);
break;
case "q":
cp=this.createPiece(_3a4,ChessPiece.QUEEN,_390);
break;
case "r":
cp=this.createPiece(_3a4,ChessPiece.ROOK,_390);
break;
case "b":
cp=this.createPiece(_3a4,ChessPiece.BISHOP,_390);
break;
case "n":
cp=this.createPiece(_3a4,ChessPiece.KNIGHT,_390);
break;
case "p":
cp=this.createPiece(_3a4,ChessPiece.PAWN,_390);
break;
default:
alert("unknown piece letter:"+_3a3+" for fen:"+fen);
}
if(isGecko||isOpera){
cp.setPosition(_395,row,false,null,this.moveAnimationLength);
cp.setVisible(true);
}
this.boardPieces[_395][row]=cp;
this.pieces[this.uptoPiece]=cp;
this.pieces[this.uptoPiece].column=_395;
this.pieces[this.uptoPiece].row=row;
this.uptoPiece++;
_395++;
}
}
}
if(!isGecko){
for(var i=0;i<this.uptoPiece;i++){
this.pieces[i].setPosition(this.pieces[i].column,this.pieces[i].row,false,null,0);
}
}
if(!_390){
for(var i=0;i<this.uptoPiece;i++){
this.pieces[i].setVisible(true);
}
}
if(!_390){
this.createBoardCoords();
}
this.settingUpPosition=false;
if(ctime){
console.timeEnd("setupFromFen"+_390);
}
};
Board.prototype.resetMoveListScrollPosition=function(){
var _3a6=this.movesDisplay.getMovesDisplay();
if(_3a6){
var _3a7=new YAHOO.util.Scroll(_3a6,{scroll:{to:[0,0]}},0);
_3a7.animate();
}
};
Board.prototype.changePieceSet=function(_3a8,_3a9){
if(!this.showedIE6Warning){
var str=_js("Depending on your browser you may need to reload the<br/> page for piece size changes to properly take effect.");
alert(str.replace("<br/>","\n"));
}
this.showedIE6Warning=true;
if(check_bad_msie()){
if(!this.showedIE6Warning){
var str=_js("Internet Explorer version 6 does not support dynamic piece size changes.<br/> Please reload page to view new settings.");
alert(str.replace("<br/>","\n"));
}
this.showedIE6Warning=true;
return;
}
var _3ab=this.pieceSize;
this.pieceSet=_3a8;
this.pieceSize=_3a9;
var _3ac=YAHOO.util.Dom.get(this.boardName+"-boardBorder");
var _3ad=0;
if(this.showCoordinates){
_3ad=15;
}
_3ac.className="";
YAHOO.util.Dom.addClass(_3ac,"ct-board-border"+this.squareColorClass);
YAHOO.util.Dom.setStyle(_3ac,"width",(this.pieceSize*8+_3ad)+"px");
YAHOO.util.Dom.setStyle(_3ac,"height",(this.pieceSize*8+_3ad)+"px");
var _3ae=YAHOO.util.Dom.get("ctb-"+this.boardName);
YAHOO.util.Dom.setStyle(_3ae,"width",(this.pieceSize*8)+"px");
YAHOO.util.Dom.setStyle(_3ae,"height",(this.pieceSize*8)+"px");
var _3af="ct-white-square"+this.squareColorClass;
for(var i=7;i>=0;i--){
for(var j=0;j<8;j++){
var _3b2=this.getBoardDivFromId(this.boardName+"-s"+j+""+i);
_3b2.className="";
YAHOO.util.Dom.addClass(_3b2,_3af);
YAHOO.util.Dom.setStyle(_3b2,"width",this.pieceSize+"px");
YAHOO.util.Dom.setStyle(_3b2,"height",this.pieceSize+"px");
var _3b3=(((j+1)*(i+1))%19/19*100);
var _3b4=((65-((j+1)*(i+1)))%19/19*100);
YAHOO.util.Dom.setStyle(_3b2,"background-position",_3b3+"% "+_3b4+"%");
_3af=(_3af=="ct-black-square"+this.squareColorClass)?"ct-white-square"+this.squareColorClass:"ct-black-square"+this.squareColorClass;
}
_3af=(_3af=="ct-black-square"+this.squareColorClass)?"ct-white-square"+this.squareColorClass:"ct-black-square"+this.squareColorClass;
}
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var cp=this.boardPieces[i][j];
if(cp){
cp.icon=get_image_str(ChessPiece.pieceIconNames[cp.colour][cp.piece],cp.board.boardImagePath,cp.board.pieceSet,cp.board.pieceSize,cp.board.addVersion);
if(YAHOO.util.Event.isIE||isOpera){
var _3b6=cp.div;
_3b6.innerHTML="<img src=\""+cp.icon+"\"/>";
var img=_3b6.firstChild;
if(!isOpera){
fix_ie_png(img);
}
}else{
YAHOO.util.Dom.setStyle([cp.div],"backgroundImage","url("+cp.icon+")");
YAHOO.util.Dom.setStyle([cp.div],"background-repeat","no-repeat");
}
YAHOO.util.Dom.setStyle([cp.div],"height",this.pieceSize+"px");
YAHOO.util.Dom.setStyle([cp.div],"width",this.pieceSize+"px");
YAHOO.util.Dom.setStyle([cp.div],"left","");
YAHOO.util.Dom.setStyle([cp.div],"top","");
var xy=cp.getNewXYPosition(cp.column,cp.row);
YAHOO.util.Dom.setXY(cp.div,xy,false);
}
}
}
if(this.moveArray){
var move=this.moveArray[0];
while(move!=null){
if(move.taken){
var cp=move.taken;
if(cp.getNewXYPosition){
cp.icon=get_image_str(ChessPiece.pieceIconNames[cp.colour][cp.piece],cp.board.boardImagePath,cp.board.pieceSet,cp.board.pieceSize,cp.board.addVersion);
if(YAHOO.util.Event.isIE||isOpera){
var _3b6=cp.div;
_3b6.innerHTML="<img src=\""+cp.icon+"\"/>";
YAHOO.util.Dom.setStyle([cp.div],"position","relative");
var img=_3b6.firstChild;
if(!isOpera){
fix_ie_png(img);
}
}else{
YAHOO.util.Dom.setStyle([cp.div],"backgroundImage","url("+cp.icon+")");
YAHOO.util.Dom.setStyle([cp.div],"background-repeat","no-repeat");
}
YAHOO.util.Dom.setStyle([cp.div],"height",this.pieceSize+"px");
YAHOO.util.Dom.setStyle([cp.div],"width",this.pieceSize+"px");
YAHOO.util.Dom.setStyle([cp.div],"left","");
YAHOO.util.Dom.setStyle([cp.div],"top","");
var xy=cp.getNewXYPosition(cp.column,cp.row);
YAHOO.util.Dom.setXY(cp.div,xy,false);
}
}
move=move.next;
}
}
if(this.problem){
var body=YAHOO.util.Dom.get("body");
if(body){
YAHOO.util.Dom.setStyle(body,"min-width",((this.pieceSize*8+_3ad)+300+200+120)+"px");
}
}
this.createBoardCoords();
};
Board.prototype.forwardMove=function(e){
if(this.disableNavigation){
return;
}
if(this.blockFowardBack||this.deferredBlockForwardBack){
if(clog){
console.log("returning early from forward due to block forward on");
}
return;
}
var _3bc=false;
if(this.tactics&&this.tactics.problemActive){
if(clog){
console.log("not forwarding, tactic is active");
}
return;
}
this.blockForwardBack=true;
if(this.currentMove&&!this.currentMove.atEnd){
move=this.currentMove;
if(move){
if(clog){
console.log("forward move:"+move.output());
}
}else{
if(clog){
console.log("forward move with currentmove null");
}
}
if(move.endNode){
if(clog){
console.log("calling processendgame from forward move");
}
if(!_3bc){
this.problem.processEndgame("",true);
}
this.toggleToMove();
this.updateToPlay();
}else{
if(clog){
console.log("forwarding move:"+move.output());
}
var _3bd=null;
piece=this.boardPieces[move.fromColumn][move.fromRow];
if(move.promotion){
_3bd=move.promotion;
piece.prePromotionColumn=null;
piece.prePromotionRow=null;
}
this.updatePiece(piece,move.toColumn,move.toRow,true,true,false,_3bd,true);
this.toggleToMove();
this.updateToPlay();
var _3be=this.currentMove;
if(clog){
if(_3be){
console.log("after forward curmove:"+_3be.output());
}else{
console.log("after forward cur move null");
}
}
for(var i=0;i<this.registeredForwardMovePostUpdateListeners.length;i++){
var _3c0=this.registeredForwardMovePostUpdateListeners[i].forwardMovePostUpdateCallback(move);
}
}
}else{
if(clog){
console.log("already at end");
}
for(var i=0;i<this.registeredForwardAtEndListeners.length;i++){
var _3c0=this.registeredForwardAtEndListeners[i].forwardAtEndCallback();
}
}
this.blockForwardBack=false;
};
Board.prototype.setupEventHandlers=function(){
this.tlf=0;
YAHOO.util.Event.addListener(document,"blur",this.lostFocus,this,true);
if(!this.avoidMouseoverActive){
YAHOO.util.Event.addListener(this.boardName+"-container","mouseover",function(e){
activeBoard=this;
},this,true);
}
if(true||this.clickAndClick){
YAHOO.util.Event.addListener(this.boardName+"-container","click",this.selectDestSquare,this,true);
}
var _3c2="keydown";
if(isGecko){
_3c2="keypress";
}
YAHOO.util.Event.addListener(document,_3c2,function(e){
var _3c4=(e.target)?e.target:e.srcElement;
if(_3c4.form){
return true;
}
var _3c5=_3c4.tagName.toLowerCase();
switch(_3c5){
case "input":
case "textarea":
case "select":
return true;
}
if(activeBoard!=this){
return true;
}
switch(YAHOO.util.Event.getCharCode(e)){
case 37:
this.backMove();
break;
case 39:
this.forwardMove();
break;
case 32:
var ret=this.spaceBar();
if(!ret){
YAHOO.util.Event.preventDefault(e);
}
return ret;
break;
default:
}
return true;
},this,true);
YAHOO.util.Event.addListener(this.boardName+"-forward","click",this.forwardMove,this,true);
YAHOO.util.Event.addListener(this.boardName+"-back","click",this.backMove,this,true);
YAHOO.util.Event.addListener(this.boardName+"-start","click",this.gotoStart,this,true);
YAHOO.util.Event.addListener(this.boardName+"-end","click",this.gotoEnd,this,true);
YAHOO.util.Event.addListener(this.boardName+"-play","click",this.playMoves,this,true);
YAHOO.util.Event.addListener(this.boardName+"-stop","click",this.stopPlayingMoves,this,true);
if(this.r){
YAHOO.util.Event.addListener(this.boardName+"-analyse","click",this.analysePosition,this,true);
YAHOO.util.Event.addListener(this.boardName+"-showfen","click",this.showBoardFen,this,true);
}
if(this.canPasteFen){
YAHOO.util.Event.addListener(this.boardName+"-pastefen","click",this.pasteFen,this,true);
}
if(this.g2){
YAHOO.util.Event.addListener(this.boardName+"-playcomp","click",this.playComp,this,true);
}
};
Board.prototype.addFlipListener=function(_3c7){
this.registeredFlipListeners.push(_3c7);
};
Board.prototype.addSpaceListener=function(_3c8){
this.registeredSpaceListeners.push(_3c8);
};
Board.prototype.flipBoard=function(){
this.isUserFlipped=!this.isUserFlipped;
this.isFlipped=!this.isFlipped;
this.redrawBoard();
this.updateToPlay();
for(var i=0;i<this.registeredFlipListeners.length;i++){
this.registeredFlipListeners[i].boardFlipped(this);
}
};
Board.prototype.spaceBar=function(){
var ret=true;
for(var i=0;i<this.registeredSpaceListeners.length;i++){
ret=this.registeredSpaceListeners[i].spacePressed(this);
}
return ret;
};
Board.prototype.lostFocus=function(){
this.tlf++;
};
Board.prototype.redrawBoard=function(){
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var cp=this.boardPieces[i][j];
if(cp){
var xy=cp.getNewXYPosition(cp.column,cp.row);
YAHOO.util.Dom.setXY(cp.div,xy,false);
}
}
}
if(this.moveArray){
var move=this.moveArray[0];
while(move!=null){
if(move.taken){
var cp=move.taken;
if(cp.getNewXYPosition){
var xy=cp.getNewXYPosition(cp.column,cp.row);
YAHOO.util.Dom.setXY(cp.div,xy,false);
}
}
move=move.next;
}
}
this.createBoardCoords();
if(this.oldSelectedSquare){
YAHOO.util.Dom.removeClass(this.oldSelectedSquare,"ct-source-square");
}
this.oldSelectedSquare=null;
this.oldSelectedPiece=null;
if(this.highlightFromTo){
if(!this.isFlipped){
var _3d1=YAHOO.util.Dom.get(this.boardName+"-s"+this.lastFromColumn+""+this.lastFromRow);
var _3d2=YAHOO.util.Dom.get(this.boardName+"-s"+this.lastToColumn+""+this.lastToRow);
}else{
var _3d1=YAHOO.util.Dom.get(this.boardName+"-s"+(7-this.lastFromColumn)+""+(7-this.lastFromRow));
var _3d2=YAHOO.util.Dom.get(this.boardName+"-s"+(7-this.lastToColumn)+""+(7-this.lastToRow));
}
this.updateFromTo(_3d1,_3d2,this.lastFromRow,this.lastFromColumn,this.lastToRow,this.lastToColumn);
}
};
Board.prototype.getMaxMoveNumber=function(_3d3){
var _3d4=this.getMaxPly(_3d3);
if(_3d4>0){
return parseInt((_3d4+1)/2);
}else{
return 0;
}
};
Board.prototype.getMaxPly=function(_3d5){
var mv=null;
if(_3d5){
if(this.currentMove){
mv=this.currentMove;
if(mv.atEnd){
if(mv.prev){
return mv.prev.moveNum;
}else{
return 0;
}
}
}else{
return 0;
}
}else{
if(this.moveArray){
mv=this.moveArray[0];
}
}
if(!mv){
return 0;
}
while(mv!=null){
if(mv.atEnd){
if(mv.prev){
return mv.prev.moveNum;
}else{
return 0;
}
}
mv=mv.next;
}
return 0;
};
Board.fenPositionOnly=function(fen){
var _3d8=fen.split(" ");
return _3d8[0]+" "+_3d8[1];
};
Board.fenStripMoveClock=function(fen){
var _3da=fen.split(" ");
return _3da[0]+" "+_3da[1]+" "+_3da[2]+" "+_3da[3];
};
Board.fenSamePosition=function(fen1,fen2,_3dd){
if(!fen1||!fen2){
return false;
}
var f1=null;
var f2=null;
if(_3dd){
f1=Board.fenPositionOnly(fen1);
f2=Board.fenPositionOnly(fen2);
}else{
f1=Board.fenStripMoveClock(fen1);
f2=Board.fenStripMoveClock(fen2);
}
return (f1==f2);
};
Board.prototype.findFen=function(mv,brd,fen,_3e3){
var res=this.findFen2(mv,brd,fen,true);
if(res.move){
return res.move;
}else{
if(_3e3){
if(res.clockStrip){
return res.clockStrip;
}else{
if(res.fullStrip){
return res.fullStrip;
}
}
}
}
return null;
};
Board.prototype.findFen2=function(mv,brd,fen,_3e8){
var _3e9=brd.cloneBoard();
var res=Object();
var _3eb=null;
var _3ec=null;
res.move=null;
if(_3e8){
_3e9.gotoMoveIndex(-1,true,true,true,true);
}
var _3ed=null;
while(mv){
var _3ee=_3e9.boardToFen();
if(_3ee==fen){
res.move=_3ed;
res.clockStrip=null;
res.fullStrip=null;
return res;
}else{
if(Board.fenSamePosition(fen,_3ee)){
_3eb=_3ed;
}else{
if(Board.fenSamePosition(fen,_3ee,true)){
_3ec=_3ed;
}
}
}
if(mv.atEnd){
break;
}
if(mv.vars&&mv.vars.length>0){
for(var i=0;i<mv.vars.length;i++){
var _3f0=this.findFen2(mv.vars[i],_3e9,fen,false);
if(_3f0){
if(_3f0.move){
return _3f0;
}else{
if(_3f0.clockStrip){
_3eb=_3f0.clockStrip;
}else{
if(_3f0.fullStrip){
_3ec=_3f0.fullStrip;
}
}
}
}
}
}
if(clog){
console.log("about to make mv:"+mv.output()+" fen:"+_3e9.boardToFen());
}
_3e9.makeMove(mv,_3e9.boardPieces[mv.fromColumn][mv.fromRow],false,this.moveAnimationLength,false,false);
if(clog){
console.log("finished making mv");
}
_3ed=mv;
mv=mv.next;
if(clog){
console.log("toMove:"+_3e9.toMove);
}
_3e9.setCurrentMove(mv);
_3e9.toggleToMove();
}
if(_3eb){
res.clockStrip=_3eb;
}
if(_3ec){
res.fullStrip=_3ec;
}
return res;
};
Board.prototype.gotoFen=function(fen,_3f2){
if(clog){
console.log("about to find fen for:"+fen);
}
var _3f3=this.findFen(this.moveArray[0],this,fen,_3f2);
if(_3f3){
if(clog){
console.log("found move:"+_3f3.output()+" for fen:"+fen);
}
this.gotoMoveIndex(_3f3.index);
}else{
if(clog){
console.log("didn't find move for fen:"+fen);
}
}
};
Board.prototype.getMaxMoveIndex=function(){
return this.moveArray.length-1;
};
Board.prototype.gotoMoveIndex=function(_3f4,_3f5,_3f6,_3f7,_3f8){
if(clog){
console.log("going to move index:"+_3f4);
}
var _3f9=!_3f6;
if(!this.moveArray||this.moveArray.length<=_3f4||(_3f4==-1&&this.moveArray.length==0)){
return;
}
var _3fa=this.boardName+"-piecestaken";
var _3fb=YAHOO.util.Dom.get(_3fa);
if(_3fb){
_3fb.innerHTML="";
}
if(_3f4==-1){
var flip=false;
if(this.prev_move&&!this.prev_move.prevMoveEnpassant){
flip=true;
}
this.setupFromFen(this.startFen,flip,false,_3f8);
if(this.prev_move&&!this.prev_move.prevMoveEnpassant){
this.makeMove(this.prev_move,this.boardPieces[this.prev_move.fromColumn][this.prev_move.fromRow],!_3f6,this.moveAnimationLength,true,true);
this.updateToPlay();
}
if(this.moveArray&&this.moveArray.length>0){
this.setCurrentMove(this.moveArray[0],_3f5);
}else{
this.setCurrentMove(this.firstMove,_3f5);
}
if(!_3f5){
this.setForwardBack();
}
if(!_3f7){
for(var i=0;i<this.registeredGotoMoveIndexListeners.length;i++){
var _3fe=this.registeredGotoMoveIndexListeners[i].gotoMoveIndexCallback(_3f4);
}
}
return;
}
var _3ff=new Array();
var move=this.moveArray[_3f4];
if(clog&&move){
console.log("gotomoveindex move:"+move.output());
if(move.next){
console.log("gotomoveindex move.next:"+move.next.output());
}
if(move.prev){
console.log("gotomoveindex move.prev:"+move.prev.output());
}
}
var _401=0;
if(move.next!=null){
this.setCurrentMove(move.next,_3f5);
}else{
if(clog){
console.log("move next null with move:"+move.output());
}
}
while(move!=null&&!move.dummy){
_3ff[_401++]=move;
move=move.prev;
}
var flip=false;
if(this.prev_move&&!this.prev_move.prevMoveEnpassant){
flip=true;
}
this.setupFromFen(this.startFen,flip,false,true);
if(this.prev_move&&!this.prev_move.prevMoveEnpassant){
if(clog){
console.log("gotomoveindex prev_move:"+this.prev_move.output());
}
this.makeMove(this.prev_move,this.boardPieces[this.prev_move.fromColumn][this.prev_move.fromRow],false,this.moveAnimationLength,true,true);
this.updateToPlay();
}
for(var i=_401-1;i>=1;i--){
var move=_3ff[i];
this.makeMove(move,this.boardPieces[move.fromColumn][move.fromRow],false,this.moveAnimationLength,true,false);
this.toggleToMove();
}
if(!_3f5){
this.convertPiecesFromLightWeight(_3f4);
}
var move=_3ff[0];
this.makeMove(move,this.boardPieces[move.fromColumn][move.fromRow],_3f9,this.moveAnimationLength,true,true);
this.toggleToMove();
this.updateToPlay();
if(!_3f5){
this.setForwardBack();
}
if(!_3f7){
for(var i=0;i<this.registeredGotoMoveIndexListeners.length;i++){
var _3fe=this.registeredGotoMoveIndexListeners[i].gotoMoveIndexCallback(_3f4);
}
}
};
Board.prototype.gotoStart=function(e){
if(this.disableNavigation){
return;
}
if(this.lastFromSquare){
YAHOO.util.Dom.removeClass(this.lastFromSquare,"ct-from-square");
}
if(this.lastToSquare){
YAHOO.util.Dom.removeClass(this.lastToSquare,"ct-to-square");
}
this.gotoMoveIndex(-1);
if(this.problem){
if(this.currentMove&&this.currentMove.bestMoves){
this.problem.showBestMoves(this.currentMove,this.currentMove.bestMoves,this.currentMove.correctMove,this.currentMove.wrongMove);
}else{
this.problem.clearBestMoves();
}
}
};
Board.prototype.gotoEnd=function(e){
if(this.disableNavigation){
return;
}
if(clog){
console.log("goto end called");
}
if(this.tactics&&this.tactics.problemActive){
this.tactics.autoForward=false;
this.tactics.markProblem(false,false,"NULL","NULL");
}
if(clog){
console.log("jumping to start");
}
this.gotoMoveIndex(-1,true,true,true);
var _404=0;
while(this.currentMove&&this.currentMove.next!=null){
var move=this.currentMove;
if(clog){
console.log("going to end move:"+move.output());
}
this.makeMove(move,this.boardPieces[move.fromColumn][move.fromRow],false,this.moveAnimationLength,true,true);
_404=move.index;
this.toggleToMove();
this.setCurrentMove(move.next);
}
for(var i=0;i<this.registeredGotoMoveIndexListeners.length;i++){
var _407=this.registeredGotoMoveIndexListeners[i].gotoMoveIndexCallback(_404);
}
};
Board.prototype.gotoPly=function(_408,_409){
if(clog){
console.log("goto ply called");
}
this.gotoMoveIndex(-1,true,true,true);
var cnt=1;
var _40b=0;
while(cnt<=_408&&this.currentMove&&this.currentMove.next!=null){
var move=this.currentMove;
if(clog){
console.log("going to end move:"+move.output());
}
this.makeMove(move,this.boardPieces[move.fromColumn][move.fromRow],false,this.moveAnimationLength,true,true);
_40b=move.index;
this.toggleToMove();
this.setCurrentMove(move.next);
cnt++;
}
if(_409){
for(var i=0;i<this.registeredGotoMoveIndexListeners.length;i++){
var _40e=this.registeredGotoMoveIndexListeners[i].gotoMoveIndexCallback(_40b);
}
}
};
Board.prototype.playMove=function(self){
if(!self.keepPlayingMoves||!self.currentMove||!self.currentMove.next){
var play=YAHOO.util.Dom.get(this.boardName+"-play");
play.src=this.boardImagePath+"/images/control_play_blue"+this.getVersString()+".gif";
self.keepPlayingMoves=false;
return;
}
self.forwardMove();
setTimeout(function(){
self.playMove(self);
},self.pauseBetweenMoves);
};
Board.prototype.insertLineToMoveIndexPosition=function(_411,_412,_413,_414,_415){
var _414=Board.copyMoves(_414,true,true);
var mv=null;
if(!this.moveArray||this.moveArray.length==0||this.moveArray[0]==null||this.moveArray[0].atEnd||_412==this.startFen){
mv=null;
if(clog){
console.log("no moves or initial position, using first move");
}
}else{
if(clog){
console.log("calling find fen....");
}
if(_411>=0){
mv=this.moveArray[_411];
}
if(!mv){
mv=this.findFen(this.moveArray[0],this,_412,false);
}
if(clog){
console.log("finished calling find fen");
}
if(!mv){
return;
}
}
var _417=-1;
if(this.currentMove){
if(this.currentMove.prev){
_417=this.currentMove.prev.index;
}
}
if(_413){
_414[0].beforeComment=_413;
}
if(clog){
if(mv){
console.log("mv:"+mv.output()+" mv next:"+mv.next+" oldCurrentMoveIndex:"+_417);
}else{
console.log("mv: null oldCurrentMoveIndex:"+_417);
}
}
var _418=null;
var _419=null;
if(mv&&mv.next&&!mv.next.atEnd){
_419=mv.next;
}else{
_418=mv;
}
if(mv){
this.gotoMoveIndex(mv.index);
}else{
if(this.moveArray&&this.moveArray.length>0){
_419=this.moveArray[0];
if(_419){
if(clog){
console.log("variation parent from first move:"+_419.output());
}
this.gotoMoveIndex(-1);
}
}else{
this.currentMove=null;
}
}
if(clog){
if(this.currentMove){
console.log("current move before insertline:"+this.currentMove.output());
}else{
console.log("no current move before insertline");
}
}
if(clog){
if(_419){
console.log("var parent:"+_419.output());
}else{
console.log("var null");
}
if(_418){
console.log("move ins after:"+_418.output());
}else{
console.log("moveinsafter null");
}
}
this.insertMovesFromMoveList(_414[0],true,_419,_418,_415);
if(clog){
if(this.currentMove){
console.log("current move after insertline:"+this.currentMove.output());
}else{
console.log("no current move after insertline");
}
}
this.gotoMoveIndex(_417);
};
Board.prototype.getVersString=function(){
var _41a=".vers"+SITE_VERSION;
if(!this.addVersion){
_41a="";
}
return _41a;
};
Board.prototype.playMoves=function(e){
if(this.disableNavigation){
return;
}
this.keepPlayingMoves=true;
var play=YAHOO.util.Dom.get(this.boardName+"-play");
play.src=this.boardImagePath+"/images/disabled_control_play_blue"+this.getVersString()+".gif";
this.playMove(this);
};
Board.prototype.stopPlayingMoves=function(e){
this.keepPlayingMoves=false;
};
Board.prototype.pasteFen=function(e){
for(var i=0;i<this.registeredPasteFenClickedListeners.length;i++){
var _420=this.registeredPasteFenClickedListeners[i].pasteFenClickedCallback();
}
};
Board.prototype.playComp=function(e){
window.open("/play-computer/"+this.boardToFen());
};
Board.prototype.showBoardFen=function(e){
var fen=this.boardToFen();
var _424=new YAHOO.widget.SimpleDialog("fenDialog",{fixedcenter:false,visible:true,draggable:true,constraintoviewport:false,buttons:[{id:"linkbutton4",text:"Test"},{text:_js("Ok"),handler:function(){
_424.hide();
},isDefault:true}]});
_424.setHeader(_js("Position FEN"));
_424.setBody("<textarea class=\"showPgn\" id=\"fenText\" rows=\"1\" readonly=\"true\" cols=\""+(fen.length+9)+"\">"+fen+"</textarea>");
_424.render(document.body);
_424.setFooter("<span id=\"copyToComment\"></span><span id=\"fenok\"></span>");
_424.center();
var _425=this;
if(this.problem&&this.problem.comments){
var _426=new YAHOO.widget.Button({type:"button",label:_js("Copy To Comment"),container:"fenok",onclick:{fn:function(){
_425.copyFenToComment(fen,Board.COPY_COMMENT_PROBLEM);
_424.hide();
}}});
}
if(this.gameComments){
var _427=new YAHOO.widget.Button({type:"button",label:_js("Copy To Game Comment"),container:"fenok",onclick:{fn:function(){
_425.copyFenToComment(fen,Board.COPY_COMMENT_GAME);
_424.hide();
}}});
}
if(this.playerComments){
var _428=new YAHOO.widget.Button({type:"button",label:_js("Copy To Player Comment"),container:"fenok",onclick:{fn:function(){
_425.copyFenToComment(fen,Board.COPY_COMMENT_PLAYER);
_424.hide();
}}});
}
if(this.openingComments){
var _429=new YAHOO.widget.Button({type:"button",label:_js("Copy To Opening Comment"),container:"fenok",onclick:{fn:function(){
_425.copyFenToComment(fen,Board.COPY_COMMENT_OPENING);
_424.hide();
}}});
}
var _42a=new YAHOO.widget.Button({type:"button",label:_js("Ok"),container:"fenok",onclick:{fn:function(){
_424.hide();
}}});
};
Board.prototype.copyFenToComment=function(fen,_42c){
switch(_42c){
case (Board.COPY_COMMENT_PROBLEM):
if(this.problem){
var flip=false;
var col=fen.split(" ")[1];
var col2=this.startFen.split(" ")[1];
if(col==col2){
flip=true;
}
this.problem.comments.copyFenToComment(fen,flip);
}
break;
case (Board.COPY_COMMENT_GAME):
this.gameComments.copyFenToComment(fen);
break;
case (Board.COPY_COMMENT_PLAYER):
this.playerComments.copyFenToComment(fen);
break;
case (Board.COPY_COMMENT_OPENING):
this.openingComments.copyFenToComment(fen);
break;
}
};
Board.COPY_COMMENT_PROBLEM=0;
Board.COPY_COMMENT_PLAYER=1;
Board.COPY_COMMENT_GAME=2;
Board.COPY_COMMENT_OPENING=3;
Board.prototype.copyAnalysisToComment=function(_430,fen,flip,_433){
switch(_433){
case (Board.COPY_COMMENT_PROBLEM):
if(this.problem){
this.problem.comments.copyAnalysisToComment(_430,fen,flip);
}
break;
case (Board.COPY_COMMENT_GAME):
this.gameComments.copyAnalysisToComment(_430,fen,flip);
break;
case (Board.COPY_COMMENT_PLAYER):
this.playerComments.copyAnalysisToComment(_430,fen,flip);
break;
case (Board.COPY_COMMENT_OPENING):
this.openingComments.copyAnalysisToComment(_430,fen,flip);
break;
}
};
Board.squareColours=new Array(8);
var pCol=ChessPiece.BLACK;
for(var i=0;i<8;i++){
Board.squareColours[i]=new Array(8);
for(var j=0;j<8;j++){
Board.squareColours[i][j]=pCol;
pCol=Board.invertToMove(pCol);
}
pCol=Board.invertToMove(pCol);
}
Board.getSquareColour=function(i,j){
return Board.squareColours[i][j];
};
Board.prototype.isInsufficientMaterial=function(_436){
var _437=0;
var _438=0;
var _439=0;
var _43a=0;
var _43b=0;
var _43c=0;
var _43d=0;
var _43e=0;
var _43f=0;
var _440=0;
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var p=this.boardPieces[i][j];
if(p){
if(p.piece==ChessPiece.PAWN){
if(p.colour==ChessPiece.WHITE){
_437++;
}else{
_438++;
}
}else{
if(p.piece!=ChessPiece.KING){
if(p.colour==ChessPiece.WHITE){
_439++;
if(p.piece==ChessPiece.KNIGHT){
_43b++;
}else{
if(p.piece==ChessPiece.BISHOP){
if(Board.getSquareColour(i,j)==ChessPiece.WHITE){
_43d++;
}else{
_43e++;
}
}
}
}else{
_43a++;
if(p.piece==ChessPiece.KNIGHT){
_43c++;
}else{
if(p.piece==ChessPiece.BISHOP){
if(Board.getSquareColour(i,j)==ChessPiece.WHITE){
_43f++;
}else{
_440++;
}
}
}
}
}
}
}
}
}
function checkBothPieces(){
if(_437>0||_438>0){
return false;
}
if(_439==_43a==0){
return true;
}else{
if(_439==_43b&&_43a==0){
return true;
}else{
if(_43a==_43c&&_439==0){
return true;
}else{
if(_439==_43d&&_43a==_43f){
return true;
}else{
if(_439==_43e&&_43a==_440){
return true;
}else{
if(_43a==_43f&&_439==_43d){
return true;
}else{
if(_439==_440&&_439==_43e){
return true;
}
}
}
}
}
}
}
return false;
}
if(_436==-1){
return checkBothPieces();
}else{
if(_436==ChessPiece.WHITE){
if(checkBothPieces()){
return true;
}
if(_437==0&&_439==0){
return true;
}else{
if(_439==_43d&&_43a==_43f){
return true;
}else{
if(_439==_43e&&_43a==_440){
return true;
}else{
if(_439==_43b&&(_43a==0&&_438==0)){
return true;
}
}
}
}
return false;
}else{
if(checkBothPieces()){
return true;
}
if(_438==0&&_43a==0){
return true;
}else{
if(_43a==_43f&&_439==_43d){
return true;
}else{
if(_43a==_440&&_439==_43e){
return true;
}else{
if(_43a==_43c&&(_439==0&&_437==0)){
return true;
}
}
}
}
return false;
}
}
};
Board.prototype.analysePosition=function(e){
window.parentBoard=this;
var _445=(this.pieceSize*8)+450+50;
var _446=(this.pieceSize*8)+250;
var _447=window.open("/windows/analyse.html",this.analysisWindowName,"width="+_445+",height="+_446+",resizable=1,scrollbars=1,location=0,copyhistory=0,status=0,toolbar=0,menubar=0");
_447.focus();
};
Board.prototype.backMove=function(e){
if(this.disableNavigation){
return;
}
if(this.blockFowardBack||this.deferredBlockForwardBack){
return;
}
var _449=this.currentMove;
if(this.tactics){
if(this.tactics.problemActive){
return;
}
}
this.blockForwardBack=true;
if(this.currentMove&&this.currentMove.prev!=null){
YAHOO.util.Dom.removeClass(this.lastFromSquare,"ct-from-square");
YAHOO.util.Dom.removeClass(this.lastToSquare,"ct-to-square");
this.lastFromRow=null;
if(this.oldSelectedSquare){
YAHOO.util.Dom.removeClass(this.oldSelectedSquare,"ct-source-square");
}
this.oldSelectedSquare=null;
this.oldSelectedPiece=null;
var col=this.toMove;
if(col==ChessPiece.WHITE){
col=ChessPiece.BLACK;
}else{
col=ChessPiece.WHITE;
}
if(!this.dontUpdatePositionReachedTable){
var _44b=this.boardToUniqueFen(col);
if(this.positionsSeen[_44b]){
this.positionsSeen[_44b]--;
}
}
this.toggleToMove();
this.updateToPlay();
move=this.currentMove.prev;
if(move){
if(clog){
console.log("backwards moving to prev move:"+move.output()+" from current move:"+this.currentMove.output());
}
}
this.setCurrentMove(move);
piece=this.boardPieces[move.toColumn][move.toRow];
if(!piece){
if(clog){
console.log("got empty piece in backMove");
}
}
takenPiece=move.taken;
this.board_xy=null;
piece.setPosition(move.fromColumn,move.fromRow,true,null,this.moveAnimationLength);
this.boardPieces[move.fromColumn][move.fromRow]=piece;
if(move.promotion){
piece.changePiece("p");
}
piece.setVisible(true);
this.canCastleQueenSide[0]=move.preCastleQueenSide[0];
this.canCastleQueenSide[1]=move.preCastleQueenSide[1];
this.canCastleKingSide[0]=move.preCastleKingSide[0];
this.canCastleKingSide[1]=move.preCastleKingSide[1];
this.halfMoveNumber=move.preHalfMoveNumber;
var _44c=false;
if(piece.piece==ChessPiece.KING&&Math.abs(move.fromColumn-move.toColumn)>1){
_44c=true;
}
this.moveNumber--;
if(this.moveNumber<=0){
this.moveNumber=1;
}
if(takenPiece&&!_44c){
this.board_xy=null;
var _44d=move.toColumn;
var _44e=move.toRow;
if(piece.piece==ChessPiece.PAWN&&move.fromColumn!=move.toColumn&&takenPiece.enPassant){
_44e=move.fromRow;
this.boardPieces[move.toColumn][move.toRow]=null;
}
takenPiece.setPosition(_44d,_44e,false,null,this.moveAnimationLength);
this.boardPieces[_44d][_44e]=takenPiece;
move.taken=null;
this.processTaken(takenPiece,false);
}else{
this.boardPieces[move.toColumn][move.toRow]=null;
}
if(_44c){
var _44f=move.toRow;
var _450;
var _451;
if(move.fromColumn>move.toColumn){
_450=0;
_451=3;
}else{
_450=7;
_451=5;
}
var _452=this.boardPieces[_451][_44f];
_452.setPosition(_450,_44f,true,null,this.moveAnimationLength);
this.boardPieces[_450][_44f]=_452;
this.boardPieces[_451][_44f]=null;
}
if(move!=null&&move.prev!=null&&move.prev.next!=move){
move=move.prev.next;
if(clog){
if(move){
console.log("moving backwards out of variation moving to:"+move.output());
}else{
console.log("jumping out of variation to null move");
}
}
}
for(var i=0;i<this.registeredBackMovePreCurrentListeners.length;i++){
var _454=this.registeredBackMovePreCurrentListeners[i].backMovePreCurrentCallback(move,_449);
}
this.setCurrentMove(move);
this.setForwardBack();
}
this.blockForwardBack=false;
};
Board.prototype.getMovesToCurrent=function(){
var mvs=[];
var res=[];
var mv=this.currentMove;
if(!mv||!mv.prev){
return res;
}
mv=mv.prev;
while(mv){
mvs.push(mv);
mv=mv.prev;
}
for(var i=mvs.length-1;i>=0;i--){
res.push(mvs[i].toMoveString());
}
return res;
};
Board.prototype.getAllMoves=function(){
var mv=null;
if(this.moveArray&&this.moveArray.length>0){
mv=this.moveArray[0];
}else{
mv=this.firstMove;
}
if(!mv){
return [];
}
var mvs=[];
var res=[];
while(mv&&!mv.atEnd){
res.push(mv.toMoveString());
mv=mv.next;
}
return res;
};
Board.prototype.countPly=function(){
var mv=null;
if(this.moveArray&&this.moveArray.length>0){
mv=this.moveArray[0];
}else{
mv=this.firstMove;
}
var _45d=0;
while(mv&&!mv.atEnd){
_45d++;
mv=mv.next;
}
return _45d;
};
Board.prototype.processTaken=function(_45e,_45f){
var _460=this.boardName+"-piecestaken";
var _461=YAHOO.util.Dom.get(_460);
if(_461){
if(_45f){
var _462=get_image_str(ChessPiece.pieceIconNames[_45e.colour][_45e.piece],this.boardImagePath,this.pieceSet,this.pieceTakenSize,this.addVersion);
_461.innerHTML=_461.innerHTML+"<img src=\""+_462+"\"/>";
}else{
var _463=_461.innerHTML.split("<");
_461.innerHTML="";
for(var i=1;i<_463.length-1;i++){
_461.innerHTML=_461.innerHTML+"<"+_463[i];
}
}
}
};
Pool=function(){
this.pool=new Array();
this.count=-1;
this.numGot=0;
this.numPut=0;
};
Pool.prototype.getObject=function(){
var o=null;
if(this.count>=0){
this.numGot++;
o=this.pool[this.count--];
}
return o;
};
Pool.prototype.putObject=function(o){
if(o!=null){
this.numPut++;
this.pool[++this.count]=o;
}
};
var boardPool=new Pool();
function touchHandler(_467){
var _468=_467.changedTouches,_469=_468[0],type="";
switch(_467.type){
case "touchstart":
type="mousedown";
break;
case "touchmove":
type="mousemove";
break;
case "touchend":
type="mouseup";
break;
default:
return;
}
var _46b=document.createEvent("MouseEvent");
_46b.initMouseEvent(type,true,true,window,1,_469.screenX,_469.screenY,_469.clientX,_469.clientY,false,false,false,false,0,null);
_469.target.dispatchEvent(_46b);
_467.preventDefault();
}
function initIphone(_46c){
_46c.addEventListener("touchstart",touchHandler,true);
_46c.addEventListener("touchmove",touchHandler,true);
_46c.addEventListener("touchend",touchHandler,true);
_46c.addEventListener("touchcancel",touchHandler,true);
}
FenBoard=function(fen,_46e){
if(typeof _46e.pieceSize=="undefined"){
_46e.pieceSize=24;
}
_46e.fenBoard=true;
_46e.dontOutputNavButtons=true;
_46e.avoidMouseoverActive=true;
this.chessapp=new ChessApp(_46e);
this.chessapp.init();
this.chessapp.board.disableUpdateToPlay=true;
this.chessapp.board.setupFromFen(fen,false,false,false);
this.board=this.chessapp.board;
this.board.startFen=fen;
};

