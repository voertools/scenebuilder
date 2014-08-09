var Editor = (function(win,doc,undefined){
	var rich = doc.getElementById("rich-input");
	var code = doc.getElementById("code-input");
	var author = doc.getElementById("author");
	
	function update(){
		rich.value = pretty(rich.value);
		code.value = unpretty(rich.value);
	}
	window.setInterval(update,5000);
	
	function unpretty(str){
		//strip out all newlines, we'll add them back as needed
		str = str.replace(/\r\n?/g, "\n");
		str = str.replace(/\n/g,"\\n");
		//chop up all the lines for parsing
		var tmp = str.split("\\n"),
			conditionalFlag = false,
			replace = "",
			lastResult = 0;
		
		//run through lines for parsing
		for (var i = 0,l = tmp.length;i < l; ++i){
			if(tmp[i].substr(0,2) == "//"){		//looks like a comment
				lastResult = 2;
				if((tmp[i].substr(2,2).toLowerCase() == "if") || 
						(tmp[i].substr(2,3).toLowerCase() ==  " if")){	//conditional start!
					if(conditionalFlag){	//Already started a conditional, need else if
						replace = "\n}";
						replace += "else if(";
						replace += tmp[i].substr(tmp[i].indexOf("f")+2);
						replace += "){"
						tmp[i] = replace;
					}else{					//this is the first statement
						conditionalFlag = true;
						replace = "\nif(";
						replace += tmp[i].substr(tmp[i].indexOf("f")+2);
						replace += "){"
						tmp[i] = replace;
					}
				}else if((tmp[i].substr(2,4).toLowerCase() == "else") || 
							(tmp[i].substr(2,5).toLowerCase() ==  " else")){	//conditional end
					//need to close the previous statement
					replace = "\n}";
					replace += "else{";
					tmp[i] = replace;
					conditionalFlag = false;
				}else if((tmp[i].substr(2,5).toLowerCase() == "merge") ||
							(tmp[i].substr(2,6).toLowerCase() == " merge")){	//conditional ended already
					replace  = conditionalFlag?"\n}":"";
					tmp[i] = replace;
					lastResult = 1;
				}else{	//comment is really just a comment, leave it alone
				}
			}else{	//not a comment, must be text!
				replace = "";
				replace += "\nthis.output(\"";
				if(lastResult == 1) replace += "\\n\\n";
				replace += tmp[i];
				replace += "\");";
				if((lastResult == 2) && !conditionalFlag) replace += "\n}";
				tmp[i] = replace;
				lastResult = 1;
			}
			console.log(replace);
		}
		str = tmp.join("");
		if(author.value != "") str = "this.author(\""+author.value+"\");"+str;
		return str;
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
			{pattern: "'",                            replace: '\u2019'},			//apostrophe
			{pattern: '"($|[\\)\\s/.,;:?!\\u2019])',  replace: '</i>\u201d' + '$1'},	//right quote
			{pattern: '(^|[\\(\\s-/\\u2018])"',       replace: '$1' + '\u201c<i>'},	//left quote
			{pattern: '--',                           replace: '\u2013'}			//en dash
		];
		for (var i = 0, l = subs.length; i < l; ++i) {
			var sub = subs[i];
			pattern = new RegExp(sub.pattern, 'g');
			str = str.replace(pattern, sub.replace);
		}
		return str;
	}
})(window, document);