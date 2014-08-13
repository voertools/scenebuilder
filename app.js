var Editor = (function(win,doc,undefined){
	var rich = doc.getElementById("rich-input"),
		code = doc.getElementById("code-input"),
		author = doc.getElementById("author"),
		suggest = doc.getElementById("suggestion-input"),
		suggestList = doc.getElementById("suggestions");
	
	var nextUpdate;
	function update(){
		rich.innerHTML = pretty(rich.innerHTML);
	}
	function handleInput(e){
		win.clearTimeout(nextUpdate);
		nextUpdate = win.setTimeout(update,5000);
	}
	rich.addEventListener("input",handleInput);
	
	var openBracket = false,
		openBrace = false;
	function handleKey(e){
		if(backspace) openBracket = false;
		if(openBracket){
			bracketSuggest(e.key||String.fromCharCode(e.charCode));
		}else if(openBrace){
			braceSuggest(e.key||String.fromCharCode(e.charCode));
		}else{
			clearSuggestions();
		}
		if(e.charCode == 91 && !openBracket){ 		//[
			e.preventDefault();
			openBracket = true;
			suggestBuffer = "";
			insertAtCursor(rich,"[]");
		}else if(e.charCode == 93 && openBracket){	//]
			e.preventDefault();
			openBracket = false;
			moveCursor(1);
		}else if(e.charCode == 123 && !openBrace){	//{
			e.preventDefault();
			openBrace = true;
			suggestBuffer = "";
			insertAtCursor(rich,"{}");
		}else if(e.charCode == 125 && openBrace){	//}
			e.preventDefault();
			openBrace = false;
			setCursor(win.getSelection().anchorNode.textContent.indexOf("}",window.getSelection().anchorOffset)+1);
		}
		backspace = false;
	}
	suggestBuffer = "";
	commandBuffer = "";
	function bracketSuggest(c){
		clearSuggestions();
		if(c == "]") return;
		suggestBuffer += c.toLowerCase();
		commandBuffer = suggestBuffer.split(".")[1]||"";
		suggest.textContent = suggestBuffer;
		var s = findSuggestions(commandBuffer);
		
		if(s.length < 15){
			for (var i = s.length;i--;){
				suggestList.innerHTML += "<li>"+s[i]+"</li>";
			}
		}
	}
	var backspace = false;
	win.addEventListener("keydown",function(e){if(e.keyCode==8)backspace = true;});
	win.addEventListener("keypress",handleKey);
	win.addEventListener("click",function(e){openBracket = false;});
	
	var conditionalBuffer,
		braceSplit,
		conditionSelect,
		suggestHead;
	function braceSuggest(c){
		clearSuggestions();
		if(c == "}") return;
		suggestBuffer += c.toLowerCase();
		braceSplit = suggestBuffer.split(" ");
		conditionalBuffer = braceSplit[0];
		conditionSelect = conditionals.indexOf(conditionalBuffer);
		if(conditionSelect == 1 && braceSplit[1]){
			conditionalBuffer += " " + braceSplit[1];
			conditionSelect = conditionals.indexOf(conditionalBuffer);
		}
		suggestHead = (conditionSelect == 0)?"<b>if</b> | ":"if | ";
		suggestHead += (conditionSelect == 2 || conditionSelect == 3)?"<b>else if</b> | ":"else if | ";
		suggestHead += (conditionSelect == 1)?"<b>else</b>":"else";
		suggest.innerHTML = suggestHead;
	}
	
	function clearSuggestions(){
		while (suggestList.lastChild) {
			suggestList.removeChild(suggestList.lastChild);
		}
		suggest.textContent = "";
	}
	function findSuggestions(text){
		var s = [];
		for(var i = parserCalls.length;i--;){
			if(parserCalls[i].substr(0,text.length).toLowerCase()==text){
				s.push(parserCalls[i]);
			}
		}
		return s;
	}
	
	function pretty(str){
		var pattern = new RegExp("(^|[\\(\\s\"-])'([\\s\\S]*?)'($|[\\)\\s\".,;:?!-])", 'g'),
			replace = '$1' + '\u2018' + '$2' + '\u2019' + '$3';
		var old;
		do {
			old = str;
			str = str.replace(pattern, replace);
		} while (old != str);
		var subs = [
			{pattern: "'",                            replace: '\u2019'},	//apostrophe
			{pattern: '"($|[\\)\\s/.,;:?!\\u2019])',  replace: '</i>\u201d' + '$1'},	//right quote
			{pattern: '(^|[\\(\\s-/\\u2018])"',       replace: '$1' + '\u201c<i>'},	//left quote
			{pattern: '--',                           replace: '\u2013'},	//en dash
			{pattern: '\\*\\*($|[\\)\\s/.,;:?!\\u2019])',  replace: '</b>.' + '$1'},	//right bold
			{pattern: '(^|[\\(\\s-/\\u2018])\\*\\*',       replace: '$1' + '<b>'},	//left bold
			{pattern: '</b>..|.</b>.',						replace: '</b>.'}
		];
		for (var i = 0, l = subs.length; i < l; ++i) {
			var sub = subs[i];
			pattern = new RegExp(sub.pattern, 'g');
			str = str.replace(pattern, sub.replace);
		}
		return str;
	}
	function insertAtCursor(myField, myValue) {
		var selection = window.getSelection(),
			startPos = selection.anchorOffset,
			endPos = selection.focusOffset;
			console.log(startPos);
		selection.anchorNode.textContent = selection.anchorNode.textContent.substring(0, startPos)
			+ ((startPos == 0)?myValue[0]:myValue)
			+ selection.anchorNode.textContent.substring(endPos, selection.anchorNode.textContent.length);
		setCursor((startPos == 0)?1:startPos + myValue.length-1);
		//if(startPos == 0)selection.focusNode.textContent += myValue[1];
	}
	function moveCursor(amount){
		var sel = window.getSelection(),
			range = sel.getRangeAt(0),
			start = range.startOffset + amount;
		setCursor(start);
	}
	function setCursor(pos){
		var sel = window.getSelection(),
			range = sel.getRangeAt(0);
		range.setStart(range.startContainer,pos);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
	}
	
	var parserCalls = ["armor","ass","asshole","ball","balls","belly","biggestBreastDescript","biggestCock","biggestCockHead","biggestSheath","breastCupSize","breasts","butt","chest","clit","clits","cock","cockBiggest","cockColor","cockHead","cockHeadBiggest","cockHeads","cockNounComplex","cockNounSimple","cockSmallest","cockTail","cocks","cocksLight","crotch","cum","cumColor","cumFlavor","cumNoun","cumVisc","cunt","cuntColor","cuntTail","cunts","dickColor","dickNipple","dickNipples","eachClit","eachCock","eachCockHead","eachTail","eachVagina","eachVagina","ear","ears","eye","eyeColor","eyePigment","eyes","face","feet","foot","fullChest","gear","girlCum","girlCumColor","girlCumFlavor","girlCumNoun","girlCumVisc","groin","hair","hairs","he","heShe","height","him","himHer","hip","hips","his","hisHer","hisHers","knees","knot","leg","legs","lip","lips","lowerGarment","lowerGarments","lowerUndergarment","milk","milkColor","milkFlavor","milkNoun","milkVisc","milkyNipple","milkyNipples","multiCocks","name","nipple","nippleCock","nippleCocks","nippleColor","nipples","oneClit","oneCock","oneTail","oneTailCunt","oneTailgina","oneVagina","pussies","pussy","pussyOrAsshole","race","sack","she","sheath","sheathBiggest","short","skin","skinFurScales","skinFurScalesNoun","skinNoun","smallestCock","tail","tailCock","tailCunt","tailVagina","tailgina","tails","thigh","thighs","toes","tongue","underGarment","underGarments","upperGarment","upperGarments","upperUndergarment","vagOrAss","vagina","vaginaColor","vaginas"];
	var conditionals = ["if","else","else if","elif"]
})(window, document);