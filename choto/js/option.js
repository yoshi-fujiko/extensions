$(function() {
	var modFav = new modFavInit();
});

modFavInit = function() {
	this.favData = $("#FAV_DATA");
	this.count = "count";
	this.today = null;
	this.mmsec = 86400000;
	this.storage = localStorage;
	this.start();
}

modFavInit.prototype = {
	start: function() {
		this.today = this.gettingDate().getTime();
		this.dispFav();
	},

	// お気に入り表示
	dispFav: function() {
		var getData, temp, term, title;
		if (this.storage.length > 1) {
			for (var i in this.storage) {
				temp = "";
				if (i == this.count) {
					continue;
				}
				else {
					getData = JSON.parse(this.storage.getItem(i));
					term = this.atDate(getData.limit);
					temp += '<tr rel="' + i + '">';
					temp += '<td class="titleFld"><p>' + getData.title.entityEncord() + '</p></td>';
					temp += '<td class="uriFld"><a href="getData.uri" target="_blank">' + getData.uri + '</a></td>';
					temp += '<td class="atDayFld"><input type="number" value="' + term + '" class="period" pattern="^[0-9]+$" />日</td>';
					temp += '<td class="modFld"><input type="button" value="変更" class="modOk" /></td>';
					temp += '<td class="delFld"><span class="del"><img src="img/del.png" alt="削除" width="16" height="16" /></span></td>';
					temp += '</tr>';
					this.favData.append(temp);
				}
			}
			this.checkPeriod();
			this.modTtl()		// タイトル編集
			this.modFav();		// データ変更
			this.delFav();		// データ削除
		}
		else {
			temp += '<tr>';
			temp += '<td colspan="5" class="taC">ちょっと気に入っているものはありません。</td>';
			temp += '</tr>';
			this.favData.append(temp);
		}
	},

	// 保持期間算出
	atDate: function(limit) {
		return (limit - this.today) / this.mmsec;;
	},

	// タイトル編集
	modTtl: function() {
		var selfObj = this;
		$(".titleFld > p").live("click", function() {
			var title = $(this).text();
			console.log(title.entityDecord())
			$(this).parent().html('<input type="text" class="modTtl" value="' + title.entityEncord() + '" autofocus="autofocus" />');
			selfObj.setTtl();
		});
	},

	setTtl: function() {
		$(".titleFld > .modTtl").bind("blur", function() {
			var val = $(this).val()
			$(this).parent().html("<p>" + val.entityEncord() + "</p>");
		});
	},

	// データ変更
	modFav: function() {
		var selfObj = this;
		$(".modOk").on("click", function() {
			var tr = $(this).parent().parent();
			var key = tr.attr("rel");
			// webstorage
			var item = JSON.parse(selfObj.storage.getItem(key));
			if (item) {
				var title = tr.find(".titleFld > p").text();
				var period = tr.find(".period").val();
				var limit = selfObj.today + period * selfObj.mmsec;
				if (!item.favicon) {
					item.favicon = "img/def.png";
				}
				var setData = {
					"title":title,
					"uri":item.uri,
					"favicon":item.favicon,
					"limit":limit,
					"period":period
				}
				selfObj.storage.setItem(key, JSON.stringify(setData));
				alert("変更しました。");
			}
			else {
				alert("ERROR:mod\n - data not found -");
				location.reload();
			}
		});
	},

	// データ削除
	delFav: function() {
		var selfObj = this;
		$(".del").on("click", function() {
			var tr = $(this).parent().parent();
			var key = tr.attr("rel");
			var title = tr.find(".titleFld > span").text();
			var item = selfObj.storage.getItem(key);
			if (item) {
				if (confirm(title + "\n削除します。")) {
					tr.remove();
					selfObj.storage.removeItem(key);
				}
				else {
					return false;
				}
			}
			else {
				alert("ERROR:del\n - data not found -");
				location.reload();
			}
		});
	},

	// 保持期間入力チェック
	checkPeriod: function() {
		$(".period").on("change", function() {
			var val = $(this).val();
			if (!val.match(/^[0-9]{1,3}$/)) $(this).val(0);
		});
	},

	// 日付取得
	gettingDate: function() {
		var date = new Date();
		return new Date(date.getFullYear() + "," + (date.getMonth() + 1) + "," + date.getDate());
	},
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