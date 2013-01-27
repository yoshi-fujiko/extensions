var alittleBookmark;
chrome.tabs.getSelected(null, function(tab) {
	alittleBookmark = new alittleBookmarkInit(tab);
});

chrome.tabs.onSelectionChanged.addListener(function(tabid){
	chrome.tabs.getSelected(null, function(tab) {
		alittleBookmark = new alittleBookmarkInit(tab);
	});
});

alittleBookmarkInit = function(tab) {
	this.tab = tab;
	this.storage = localStorage;
	this.worker;
	this.key = 0;
	this.count = "count";
	this.date;
	this.mmsec = 86400000;
	this.PB_PERIOD       = $("#PB_PERIOD");
	this.REG_MSG         = $("#REG_MSG");
	this.LITTLE_BOOKMARK = $("#LITTLE_BOOKMARK");
	this.LOADER          = $("#LOADER");
	this.VIEW            = $("#VIEW")
	this.start();
}

alittleBookmarkInit.prototype = {
	start: function() {
		this.date = this.gettingDate();
		this.init();
		this.checkPeriod();
	},

	// 初期設定
	init: function() {
		var getData;
		if (this.storage.length > 0) {
			for (var i in this.storage) {
				getData = this.storage.getItem(i);
				if (i == this.count) {
					this.key = parseFloat(getData);				// keyがあれば取得
				}
				else {
					this.delFav(i, JSON.parse(getData));		// 期限切れデータ削除
				}
			}
			// お気に入り表示
			this.dispFav();
		}
		this.dispTitle();
		this.setBookmark();
	},

	// お気に入りにセットするページタイトル表示
	dispTitle: function() {
		$("#SET_TITLE").html(this.tab.title);
	},

	// お気に入り登録イベント
	setBookmark: function() {
		var selfObj = this;
		this.LITTLE_BOOKMARK.on("click", function() {
			var favicon, period, limit;
			// メッセージリセット
			selfObj.REG_MSG.html("");
			// 期間
			period = parseFloat(selfObj.PB_PERIOD.val());
			// データ削除日
			limit = selfObj.date.getTime() + period * selfObj.mmsec;
			// favicon
			selfObj.tab.status == "complete" ? favicon = selfObj.tab.favIconUrl : favicon = "";
			// データ登録
			selfObj.addFav(selfObj.tab.title, selfObj.tab.url, favicon, limit, period);
		});
	},

	// 日付取得
	gettingDate: function() {
		var date = new Date();
		return new Date(date.getFullYear() + "," + (date.getMonth() + 1) + "," + date.getDate());
	},

	// 保有期間入力チェック
	checkPeriod: function() {
		this.PB_PERIOD.on("change", function() {
			var val = $(this).val();
			if (!val.match(/^[0-9]{1,3}$/)) $(this).val(0);
		});
	},

	// お気に入り登録
	addFav: function(title, url, favicon, limit, period) {
		var getData,
			regFlag,
			setData = {
				"title":title,
				"uri":url,
				"favicon":favicon,
				"limit":limit,
				"period":period,
			}

		// 登録重複処理
		if (this.storage.length != 0) {
			for (var j in this.storage) {
				if (j == this.count) {
					continue;
				}
				else {
					getData = JSON.parse(this.storage.getItem(j));
					// 登録済
					if (getData.uri == setData.uri) {
						regFlag = "exist";
						// 期間変更
						if (getData.period != setData.period) {
							regFlag = j;
							break;
						}
						else {
							break;
						}
					}
					// 未登録
					else {
						regFlag = "new";
					}
				}
			}
			switch (regFlag) {
				case "exist":
					this.REG_MSG.html("登録済です");
					break;
				case "new":
					this.storage.setItem(this.key, JSON.stringify(setData));
					this.storage.setItem(this.count, this.key + 1);
					this.REG_MSG.html("登録しました");
					break;
				default:
					this.storage.setItem(regFlag, JSON.stringify(setData));
					this.REG_MSG.html("期間変更しました");
					break;
			}
		}
		else {
			this.storage.setItem(this.key, JSON.stringify(setData));
			this.storage.setItem(this.count, this.key + 1);
			this.REG_MSG.html("登録しました");
		}
		// 登録後、お気に入り表示
		if (regFlag != "exist") this.dispFav();
	},

	// 期限切れお気に入り削除
	delFav: function(key, val) {
		limit = val.limit;
		diffDay = limit - this.date.getTime();
		if (diffDay < 0) {
			this.storage.removeItem(key);
		}
	},

	// お気に入り表示(worker)
	dispFav: function() {
		var selfObj = this;
		var favData = new Object;
		if (this.storage.length > 0) {
			this.LOADER.show();
			for (var i in this.storage) {
				favData[i] = JSON.parse(this.storage.getItem(i));
			}
			// worker
			this.worker = new Worker("js/disp_fav.js");
			this.worker.postMessage(favData);
			this.worker.onmessage = function(re) {
				selfObj.VIEW.html(re.data);
			}
			this.LOADER.hide();
			//this.parseFav(favData);
		}
	},

	// worker用テスト
	/*parseFav: function(favData) {
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
		var setData = this.createFav(dispData);
		console.log(setData)
	},

	createFav: function(dispData) {
		var temp = "";
		var getData;
		for (var i in dispData) {
			temp += '<dl class="favData">';
			console.log(i == 0)
			i == 0 ? atDay = '今' : atDay = "あと" + i;
			temp += '<dt>' + atDay + '日</dt>';
			for (var j = 0, J = dispData[i].length; j < J; j++) {
				getData = dispData[i][j];
				temp += '<dd><span style="background-image:url(' + getData.favicon + ');"><a href="' + getData.uri + '" target="_blank">' + getData.title + '</a></span></dd>';
			}
			temp += '</dl>';
		}
		return temp;
	}*/
}