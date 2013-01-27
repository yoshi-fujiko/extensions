var parseFav = function(favData) {
	var limit, dispData = new Object();
	var d = new Date();
	var nowDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
	for (var i in favData) {
		if (i != "count") {
			limit = (favData[i].limit - nowDay) / 86400000;
			if (!dispData[limit]) dispData[limit] = new Array();
			dispData[limit].push(favData[i]);
		}
	}
	setData = createFav(dispData);
	postMessage(setData);
}

var createFav = function(dispData) {
	var temp = "";
	var getData, favicn, title;
	for (var i in dispData) {
		temp += '<dl class="favData">';
		i == 0 ? atDay = '今' : atDay = "あと" + i;
		temp += '<dt>' + atDay + '日</dt><dd><ul>';
		for (var j = 0, J = dispData[i].length; j < J; j++) {
			getData = dispData[i][j];
			!getData.favicon ? favicn = "img/def.png" : favicn = getData.favicon;
			title = getData.title.entityEncord();
			//temp += '<li style="background-image:url(' + favicn + ');"><a href="' + getData.uri + '" target="_blank" title="' + title + '">' + shortTitle(title) + '</a></li>';
			temp += '<li style="background-image:url(' + favicn + ');"><span><a href="' + getData.uri + '" target="_blank" title="' + title + '">' + title + '</a></span></li>';
		}
		temp += '</ul></dd></dl>';
	}
	return temp;
}

var shortTitle = function(title) {
	var re;
	if (title.length > 19) {
		re = title.substr(0, 20) + "...";
	}
	else {
		re = title;
	}
	return re;
}

if (!String.prototype.entityEncord) {
	String.prototype.entityEncord= function(obj) {
		var regQuote = function(str) {
			return str.toString()
			.replace(/\\/g, '\\\\')
			.replace(/\^/g, '\\^')
			.replace(/\$/g, '\\$')
			.replace(/\./g, '\\.')
			.replace(/\*/g, '\\*')
			.replace(/\+/g, '\\+')
			.replace(/\?/g, '\\?')
			.replace(/\(/g, '\\(')
			.replace(/\)/g, '\\)')
			.replace(/\[/g, '\\[')
			.replace(/\]/g, '\\]')
			.replace(/\{/g, '\\{')
			.replace(/\}/g, '\\}')
			.replace(/\|/g, '\\|')
			.replace(/\=/g, '\\=')
			.replace(/\!/g, '\\!')
			.replace(/\:/g, '\\:')
			.replace(/\-/g, '\\-');
		}
		var regStr = new Array('&', '"', '<', '>');
		var entityRef = {'&':'&amp;', '"':'&quot;', '<':'&lt;', '>':'&gt;'};
		if (typeof(obj) == "object") {
			for (var i in obj) {
				entityRef[i] = obj[i];
				regStr.push(regQuote(i));
			}
		}
		var reg = new RegExp(regStr.join("|"), "g");
		var repEntity = function(word) {return entityRef[word];}
		return this.replace(reg, repEntity);
	}
}


if (!String.prototype.entityDecord) {
	String.prototype.entityDecord = function(obj) {
		var regQuote = function(str) {
			return str.toString()
			.replace(/\\/g, '\\\\')
			.replace(/\^/g, '\\^')
			.replace(/\$/g, '\\$')
			.replace(/\./g, '\\.')
			.replace(/\*/g, '\\*')
			.replace(/\+/g, '\\+')
			.replace(/\?/g, '\\?')
			.replace(/\(/g, '\\(')
			.replace(/\)/g, '\\)')
			.replace(/\[/g, '\\[')
			.replace(/\]/g, '\\]')
			.replace(/\{/g, '\\{')
			.replace(/\}/g, '\\}')
			.replace(/\|/g, '\\|')
			.replace(/\=/g, '\\=')
			.replace(/\!/g, '\\!')
			.replace(/\:/g, '\\:')
			.replace(/\-/g, '\\-');
		}
		var regStr = new Array('&gt;', '&lt;', '&quot;', '&amp;');
		var entityRef = {'&gt;':'>', '&lt;':'<', '&quot;':'"', '&amp;':'&'};
		if (typeof(obj) == "object") {
			for (var i in obj) {
				entityRef[i] = obj[i];
				regStr.push(regQuote(i));
			}
		}
		var reg = new RegExp(regStr.join("|"), "g");
		var repEntity = function(word) {return entityRef[word];}
		return this.replace(reg, repEntity);
	}
}


onmessage = function(rec) {
	parseFav(rec.data);
}