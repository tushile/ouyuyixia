var vote={
	categoryid:CONFIG.vote.categoryid,
	vid_code:CONFIG.vote.contentid,
	price:CONFIG.vote.price,
	pid:CONFIG.vote.pid,
	name:CONFIG.vote.name,
	vote_id:CONFIG.vote.vote_id,
	vote_domain:CONFIG.vote.vote_domain,
	rule_title:CONFIG.vote.rule_title,
	$shareZt:$('.common-skin-shareZt'),
	$indexTop10:$('.common-skin-indexTop10-tabs'),
	$rankSlide:$("#rankSlide"),
	$top10Box:$("#top10Box"),
	$albumTab:$("#albumTab"),
	timerpageList:true,
	timersearchList:false,
	page:1,
	$schinpMod:$('#schinpMod'),
	$payBtn:$('#payBtn'),
	clockStart:-1,
	currentSelectSn:0,//当前选择的选手的编号
	nowTime:CONFIG.vote.nowtime,
	mybar:0,//轮播效果的setInterval计数
	gid:0,//支付所选择的gift礼物id
	free_gid:19,
	timeLines:[],
	sentWatchs:[],

	init: function(){
		var me = this;
		var pg = me.$schinpMod.find('.common-skin-schIco').data('page');
		me.$indexTop10.on('click', 'li', function() {
			var that = $(this);
			var index = that.index();
			that.addClass('active').siblings().removeClass('active');
			me.voteTop(1);
		});

		me.activeTab();
		// me.activeNav();
		me.initVideo();
		me.initCsAlbum();
		me.initUser();
		me.initStage();
		me.initLoader();

		var qst_btn = document.getElementById('qst_btn');
		if(qst_btn != null){
			$("#qst_btn").on('click',function(e){
				me.hidQuickBuyTips();
				return false;
			});

			setTimeout(function(){me.hidQuickBuyTips();}, 10000);
		}
		
		var countdownTitle = CONFIG.vote.info_paybtn_title != '' ? CONFIG.vote.info_paybtn_title : '加油助力';

		//计时器
		var timer2 = setInterval(function() {
			if (me.clockStart == -1) {
				me.clockStart = (new Date().getTime()) / 1000;
			}
			var now = CONFIG.vote.nowtime + ((new Date().getTime()) / 1000 - me.clockStart);
			me.nowTime = now;

			var countDownBox_title = $("#countDownBox_title");
			var countDownBox = $("#countDownBox");
	       	if(countDownBox.size()<=0){
	       		return;
	       	}
	       	
	        var diff = 0;
	        if(now <= CONFIG.vote.starttime){
				diff = CONFIG.vote.starttime - now;
				var dtime = 86400;
				var day = Math.floor(diff / dtime);day=day<10?'0'+day:day;
				var hour = Math.floor((diff % dtime)/3600);hour=hour<10?'0'+hour:hour;
				var minute = Math.floor((diff%3600)/60);minute=minute<10?'0'+minute:minute;
				var second = Math.floor(diff%60);second=second<10?'0'+second:second;
				
				countDownBox_title.html(countdownTitle + "开始倒计时");

				countDownBox.html(
					'<span class="common-skin-daojishi-num gwhy-daojishi-num">'+day+'</span> 天 \
					<span class="common-skin-daojishi-num gwhy-daojishi-num">'+hour+'</span> 时 \
					<span class="common-skin-daojishi-num gwhy-daojishi-num">'+minute+'</span> 分 \
					<span class="common-skin-daojishi-num gwhy-daojishi-num">'+second+'</span> 秒\
				');
	        }else if(now<=CONFIG.vote.endtime){
				diff = CONFIG.vote.endtime - now;
				var dtime = 86400;
				var day = Math.floor(diff / dtime);day=day<10?'0'+day:day;
				var hour = Math.floor((diff % dtime)/3600);hour=hour<10?'0'+hour:hour;
				var minute = Math.floor((diff%3600)/60);minute=minute<10?'0'+minute:minute;
				var second = Math.floor(diff%60);second=second<10?'0'+second:second;
				countDownBox_title.html(countdownTitle + "结束倒计时");
				countDownBox.html(
					'<span class="common-skin-daojishi-num gwhy-daojishi-num">'+day+'</span> 天 \
					<span class="common-skin-daojishi-num gwhy-daojishi-num">'+hour+'</span> 时 \
					<span class="common-skin-daojishi-num gwhy-daojishi-num">'+minute+'</span> 分 \
					<span class="common-skin-daojishi-num gwhy-daojishi-num">'+second+'</span> 秒\
				');
	        }else{
	        	countDownBox.html(countdownTitle + '已结束！');
	        }
		}, 1000);
		if (pg == 'index') {
			var sval = $.trim(me.$schinpMod.find('.common-skin-schInp').val());
			if (sval) {
				me.searchVote(1);
			} else {
				me.voteRank(1);
			}
			me.$rankSlide.on('click', '.hd li', function() {
				var that = $(this);
				var index = that.index();
				that.addClass('on').siblings().removeClass('on');
				me.$schinpMod.find('.common-skin-schInp').val('');
				me.voteRank(1);
			}).on('click', '.unvt', function() {
				if (me.status == 0) {
					var d = new Date(CONFIG.vote.starttime * 1000);
					d = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日" + d.getHours() + "时" + ((d.getMinutes() > 0) ? d.getMinutes() + "分" + d.getSeconds() + "秒" : '');
					me.showAlert('提示信息', countdownTitle + '尚未开始<br>开始时间：' + d + '');
				} else if (me.status == 2) {
					me.showAlert('提示信息', countdownTitle + '活动已结束！');
				}
				return false;
			});

			if(CTK.domain_prefix == 'dev'){
				var timer = setInterval(function() {
					if (me.timerpageList) {
						me.voteRank(me.page);
					} else if (me.timersearchList) {
						var sval = $.trim(me.$schinpMod.find('.common-skin-schInp').val());
						if (sval != '') {
							me.searchVote(1);
						}
					}
				}, 30000);
			}

			me.$schinpMod.on('click', '.common-skin-schIco', function() {

				var sval = $.trim(me.$schinpMod.find('.common-skin-schInp').val());
				if (!sval) {
					me.voteRank(1);
				} else {
					me.searchVote(1);
				}
				return false;
			});
			setTimeout(function() {
				if(CONFIG.content.paysucc==1){
					window.location.href = CONFIG.content.feature_url;
				}
			}, 3000);

		} else if (pg == "info") {
			me.$schinpMod.on('click', '.common-skin-schIco', function() {
				var sval = $.trim(me.$schinpMod.find('.common-skin-schInp').val());
				if (sval) {
					location.href = CONFIG.content.feature_url + '&q=' + encodeURIComponent(sval) + '#top10BoxAnchor';
				} else {
					location.href = CONFIG.content.feature_url + '#top10BoxAnchor';
				}
				return false;
			});
			var showPayPanel = function() {
				if (!CTK.curUser.uid) {
					CTK.redirect_wx(CONFIG.vote.wx_app, '', CONFIG.vote.wx_scope);
					return true;
				}

				me.playClickSound('http://mv01.chezhuyihao.cn/audio/vt/click_material.mp3');
				if (me.nowTime < CONFIG.vote.starttime) {
					var d = new Date(CONFIG.vote.starttime * 1000);
					d = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日" + d.getHours() + "时" + ((d.getMinutes() > 0) ? d.getMinutes() + "分" + d.getSeconds() + "秒" : '');
					me.showAlert('提示信息', countdownTitle + '尚未开始<br>开始时间：' + d + '');
				} else if(me.nowTime > CONFIG.vote.endtime) {
					me.showAlert('提示信息', countdownTitle + '已经结束!');
				} else {
					$(".common-skin-zzc").show();
					$("#paySuccessPanel").hide();
					$("#payPanel").show();
				}
			};
			$('.common-skin-tp-btn').on('click', showPayPanel);
			$('.info-vote-button').on('click', showPayPanel);
			var objectid = CONFIG.rank_info.objectid;
			setPayPanelEvent(objectid);
			setTimeout(function() {
				if(CONFIG.content.paysucc==1){
					window.location.href = CONFIG.content.feature_url+'&sn='+CONFIG.rank_info.sn;
				}
			}, 3000);
		}else if (pg == "team"){
			$(document).ready(function() {
				me.teamVote(1);
			});
			
			me.$rankSlide.on('click', '.hd li', function() {
				var that = $(this);
				var index = that.index();
				that.addClass('on').siblings().removeClass('on');
				me.$schinpMod.find('.common-skin-schInp').val('');
				me.teamVote(1);
			}).on('click', '.unvt', function() {
				if (me.status == 0) {
					var d = new Date(CONFIG.vote.starttime * 1000);
					d = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日" + d.getHours() + "时" + ((d.getMinutes() > 0) ? d.getMinutes() + "分" + d.getSeconds() + "秒" : '');
					me.showAlert('提示信息', countdownTitle + '尚未开始<br>开始时间：' + d + '');
				} else if (me.status == 2) {
					me.showAlert('提示信息', '活动已结束！');
				}
				return false;
			});

			var timer = setInterval(function() {
				if (me.timerpageList) {
					me.teamVote(me.page);
				} else if (me.timersearchList) {
					var sval = $.trim(me.$schinpMod.find('.common-skin-schInp').val());
					if (sval != '') {
						me.searchVote(1);
					}
				}
			}, 30000);

			me.$schinpMod.on('click', '.common-skin-schIco', function() {
				var sval = $.trim(me.$schinpMod.find('.common-skin-schInp').val())
				if (sval) {
					location.href = CONFIG.content.feature_url + '&q=' + encodeURIComponent(sval) + '#top10BoxAnchor';
				} else {
					location.href = CONFIG.content.feature_url + '#top10BoxAnchor';
				}
				return false;
			});
			setTimeout(function() {
				if(CONFIG.content.paysucc==1){
					window.location.href = CONFIG.content.feature_url;
				}
			}, 3000);			
		}
		if(CONFIG.content.paysucc==1){
			$(".common-skin-zzc").show();
			$("#paySuccessPanel").show();
			$("#payPanel").hide();
		}
		$(".common-skin-zzc").find(".common-skin-zzc-close").click(function(){
			$(".common-skin-zzc").hide();
		});
	},
	showNum: function(data) {
		if (data.result == 1) {
			$('#peoTotal').text(data.vote.total_count);
			$('#ticksTotal').text(data.vote.vote_count);
		} else {
			$('#peoTotal').text(0);
			$('#ticksTotal').text(0);
		}
	},
	voteRank: function(page) {
		var me = this;
		var limit = CONFIG.vote.page_limit > 0 ? CONFIG.vote.page_limit : 10;

		var feature_domain = me.vote_domain != '' ? me.vote_domain : CTK.pre_feature + CTK.base;
		var url = feature_domain + '/vote/vote_list';
		var paras;
		if( CONFIG.vote.group_info != null){
			var ulLength = me.$rankSlide.find('.hd ul').length;
			if(ulLength == 2){
				var oIndex = me.$rankSlide.find('.common-skin-rankSlide-tabs li.on').index();
				var getData = me.$rankSlide.find('.common-skin-second-tabs li.on');
				var gname = getData.data('group');
				paras = {
					'limit': limit,
					'gname': gname,
					'vote_id': me.vote_id,
					'o': oIndex
				};
			} else {
				var getData = me.$rankSlide.find('.common-skin-rankSlide-tabs li.on');
				var gname = getData.data('group');
				paras = {
					'limit': limit,
					'gname': gname,
					'vote_id': me.vote_id
				};
			}
		} else {
			var oIndex = me.$rankSlide.find('.common-skin-rankSlide-tabs li.on').index();
			var oTitle = me.$rankSlide.find('.common-skin-rankSlide-tabs li.on').html();
			if(oTitle == me.rule_title){
				var feature_domain = me.vote_domain != '' ? me.vote_domain : CTK.pre_feature + CTK.base;
				var url = feature_domain + '/vote/rule';
				paras = {
					'vote_id': me.vote_id,
				};
				
				$.getJSON(url, paras, function(rs) {
					if (rs.result == 1 ) {
						var s = me.getRuleTemplate(rs.data);
						me.$rankSlide.find('.common-skin-tabSame-rank-ul').html(s);
					} else {
						me.$rankSlide.find('.common-skin-tabSame-rank-ul').html('');
					}
					me.$rankSlide.find('#pageBox').html('');
				});
				return;
			}else{
				paras = {
					'limit': limit,
					'vote_id': me.vote_id,
					'o': oIndex
				};
			}
		}

		me.page = page || 1;
		me.timerpageList = true;
		me.timersearchList = false;
		
		
		$.getJSON(url + "?page=" + page, paras, function(rs) {
			me.showNum(rs);
			if (rs.result == 1 && rs.data.length > 0) {
				var s = me.getListTemplate(rs.data, rs.vote.status);
				me.$rankSlide.find('.common-skin-tabSame-rank-ul').html(s);
				var pageParas = {};
				pageParas.dataTotalNum = rs.total;//数据总数
				pageParas.perPageNum = limit;//每页显示的数据数
				pageParas.pageBtnMaxNum = 3;//分页按钮的最大数

				var pageHtml = me.pageTo(page, pageParas);
				me.$rankSlide.find('#pageBox').html(pageHtml);

				me.setRankListAnimate(1);
				} else {
				me.$rankSlide.find('.common-skin-tabSame-rank-ul').html('');
				me.$rankSlide.find('#pageBox').html('');
			}
		});
	},
  	
	voteTop: function(page) {
		var me = this;
		if (CONFIG.vote.nowtime > CONFIG.vote.starttime) {
			var feature_domain = me.vote_domain != '' ? me.vote_domain : CTK.pre_feature + CTK.base;
			var url = feature_domain + '/vote/vote_list';

			var o = me.$shareZt.find('.common-skin-indexTop10-tabs li.active');
			var gname = o.data('group');
			var limit = o.data('limit');

			me.timerpageList = true;
			me.timersearchList = false;
			var paras = {
					'limit': limit,
					'vote_id': me.vote_id
				}
			if( gname != null){
				paras.gname = gname;
			}
			$.getJSON(url + "?page=" + page, paras, function(rs) {
				if (rs.result == 1 && rs.data.length > 0) {
					me.$top10Box.html(me.getTopTemplate(rs.data, rs.vote.status));
					me.setsliderevent();

					me.showNum(rs);
				}
			});
		} else {
			$(".indexTop10").html('');
		}
	},
	getTopTemplate:function(data,status){
	    var html = '';
	    var me = this;

		var wide_bd_height = CONFIG.vote.img_style == 2 ? 'style="height: 2.5rem;"' : '';
		var wide_hd_height = CONFIG.vote.img_style == 2 ? 'style="height: 2.5rem; line-height: 2.5rem;"' : '';

	    html += 
        '<div class="hd">' +
          	'<a href="javascript:;" class="common-skin-indexTop-program-next gwhy-next-color"' + wide_hd_height +'><i></i></a>' +
          	'<a href="javascript:;" class="common-skin-indexTop-program-prev gwhy-prev-color"' + wide_hd_height + '><i></i></a>' +
        '</div>' +
        '<div class="bd"' + wide_bd_height + '>' +
          	'<ul class="common-skin-indexTop10-picList">';
		
		var img_height = 229;
		if(me.vote_id > 600 ){
			img_height = 280;
		}

	    $.each(data,function(i,v){
			var imgurl = CTK.isEmpty(v.imgurl)?'http://img01.chezhuyihao.cn/M00/01/51/rBUAC15UjF-AezSHAAC6Zsvaoxo380.png':v.imgurl;
	      	html += 
	      	'<li objectid="'+v.objectid+'">' + 
	          	'<div class="common-skin-tabSame-rank-li-box">'+
				  '<a class="common-skin-tabSame-rank-imgBox clearfix" href="'+CONFIG.content.feature_url+'&sn='+v.sn+(v.team_id != '' ? '&team_id='+v.team_id : '')+'">'+

						'<img src="'+ (CONFIG.vote.img_style == 2 ? CTK.imgResize(imgurl,294,170):CTK.imgResize(imgurl,200,img_height))+'" alt="">'+
						'<div class="common-skin-indexTop10-title clearfix">'+
							'<p class="common-skin-indexTop10-title">'+v.name+'</p>'+
						'</div>'+
					'</a>'+
				'</div>'+

	        '</li>';
	    });
	    html += '</ul>' +
	    '</div>';
	    return html;
	  },
  	//检查是否需要投票
  	checkIsVote:function(v){
		var group = null;
		if(CONFIG.vote.group_info == null){
			return true;
		}
		for(var i=0;i<CONFIG.vote.group_info.length;i++){
			group = CONFIG.vote.group_info[i];
			if(group.gname == v.group){
				return group.is_vote == 1;
			}
		}
		return true;
  	},
	//需要投票的模版
	getListTemplate:function(data,sts){
		var me = this;

		if(CONFIG.vote.tpl_type == 10){
			return me.getVideoListTemplate(data,sts);
		}else if (CONFIG.vote.tpl_type == 20){
			return me.getAudioListTemplate(data,sts);
		}else if (CONFIG.vote.tpl_type == 1){
			return me.getThinPhotoListTemplate(data,sts);
		}else{
			return me.getPhotoListTemplate(data,sts);
		}
	},
	getPhotoListTemplate:function(data,sts){
		var me = this;
	    var html = '<section class="tabSame rank">'+
              '<ul class="clearfix common-skin-tabSame-rank-ul">';
			
			var voteBtnClass = (CONFIG.vote.is_animation != 1) ? 'common-skin-tabSame-rank-vt' : 'rank-vote-button';

			$.each(data,function(i,v){
			var is_vote = me.checkIsVote(v);
			is_vote = CONFIG.vote.hide_home_vote == 1 ? false : is_vote;

			if(CTK.isEmpty(CONFIG.vote.vtbtn_title)){
				var vtbtn = '<button class="'+ voteBtnClass + (sts == 2 ? ' disabled' : '') + ' fl" '+ ( v.is_team == 1 && v.team_id != '' ? 'onclick="showTeam('+v.team_id+','+v.sn+');">' : 'onclick="showPayPanel(this);">')+(CONFIG.vote.name=='加油'?'加 油':'加 油')+'</button>';
			}else{
				var vtbtn = '<button class="'+ voteBtnClass +  ' fl" '+ ( v.is_team == 1 && v.team_id != '' ? 'onclick="showTeam('+v.team_id+','+v.sn+');">' : 
					'onclick="javascrtpt:window.location.href=' + "'" + CONFIG.content.feature_url + '&sn=' + v.sn + "'" + '">') + CONFIG.vote.vtbtn_title+'</button>';

			}

			var btnhtml=
			'<div class="common-skin-tabSame-rank-f-box clearfix">'+
				'<p class="common-skin-tabSame-rank-amount fr">' + v.amount + '</p>'+ vtbtn
			'</div>'+
			'<div class="common-skin-tabSame-rank-bottom-line fr"></div>';
			var clickHtml = '';

			if(sts == 2){
	         	btnhtml =
	         	'<div class="common-skin-tabSame-rank-f-box clearfix">'+
					'<p class="common-skin-tabSame-rank-amount fr">' + v.amount + '</p>'+ vtbtn					
				'</div>'+
				'<div class="common-skin-tabSame-rank-bottom-line fr disabled"></div>';
	        }

			var img_width = 290;
			var img_height = 352;
			if(CONFIG.vote.img_style == 0){
				img_width = 290;
				img_height = 290;
			}else if(me.vote_id > 600){
				img_height = 406;
			}

      		html += 
            '<li class="common-skin-tabSame-rank-li" objectid="' + v.objectid + '" sn="' + v.sn + '">'+
				'<div class="common-skin-tabSame-rank-li-box">'+
					'<a class="common-skin-tabSame-rank-imgBox clearfix" href="'+CONFIG.content.feature_url+(v.is_team == 1 && v.team_id != '' ? '&team_id='+v.team_id : '') +'&sn='+v.sn+'">'+
						'<img src="'+ (CONFIG.vote.img_style == 0 ? CTK.imgResize(v.imgurl,img_width,img_height) : CTK.imgResize(v.imgurl,img_width,img_height)) +'" alt="">'+
					'</a>'+
					'<div class="common-skin-tabSame-rank-vote clearfix">'+
						'<div class="common-skin-tabSame-rank-dL">'+

							'<div class="common-skin-tabSame-rank-num">'+
								'<span class="common-skin-tabSame-rank-num-box gwhy-num-box">'+v.sn+'</span>'+
							'</div>'+
							'<p class="common-skin-tabSame-rank-name">'+v.name+'</p>'+
						'</div>'+
					'</div>'+
				'</div>'+
				(is_vote ? btnhtml : '')+
			'</li>';
    	});
    	html += '</ul>';
    	html += '</section>';
    	return html;
	  },
	  getThinPhotoListTemplate:function(data,sts){
		var me = this;
	    var html = '<section class="tabSame rank">'+
              '<ul class="clearfix common-skin-tabSame-rank-ul">';
			
			var voteBtnClass = (CONFIG.vote.is_animation != 1) ? 'common-skin-tabSame-rank-vt' : 'rank-vote-thin-button';

			$.each(data,function(i,v){
			var is_vote = me.checkIsVote(v);
			is_vote = CONFIG.vote.hide_home_vote == 1 ? false : is_vote;

			if(CTK.isEmpty(CONFIG.vote.vtbtn_title)){
				var vtbtn = '<button class="'+ voteBtnClass + (sts == 2 ? ' disabled' : '') + ' fl" '+ ( v.is_team == 1 && v.team_id != '' ? 'onclick="showTeam('+v.team_id+','+v.sn+');">' : 'onclick="showPayPanel(this);">')+(CONFIG.vote.name=='加油'?'加 油':'加 油')+'</button>';
			}else{
				var vtbtn = '<button class="'+ voteBtnClass +  ' fl" '+ ( v.is_team == 1 && v.team_id != '' ? 'onclick="showTeam('+v.team_id+','+v.sn+');">' : 
					'onclick="javascrtpt:window.location.href=' + "'" + CONFIG.content.feature_url + '&sn=' + v.sn + "'" + '">') + CONFIG.vote.vtbtn_title+'</button>';

			}

			var btnhtml=
			'<div class="common-skin-tabSame-rank-f-box clearfix">' + vtbtn
			'</div>'+
			'<div class="common-skin-tabSame-rank-bottom-line fr"></div>';
			var clickHtml = '';

			if(sts == 2){
	         	btnhtml =
	         	'<div class="common-skin-tabSame-rank-f-box clearfix">' + vtbtn
				'</div>'+
				'<div class="common-skin-tabSame-rank-bottom-line fr disabled"></div>';
	        }
      		html += 
            '<li class="common-skin-tabSame-rank-li" objectid="' + v.objectid + '" sn="' + v.sn + '">'+
				'<div class="common-skin-tabSame-rank-li-box">'+
					'<a class="common-skin-tabSame-rank-imgBox clearfix" href="'+CONFIG.content.feature_url+(v.is_team == 1 && v.team_id != '' ? '&team_id='+v.team_id : '') +'&sn='+v.sn+'">'+
						'<img src="'+ (CONFIG.vote.img_style == 0 ? CTK.imgResize(v.imgurl,290,290) : CTK.imgResize(v.imgurl,290,352)) +'" alt="">'+
					'</a>'+
					'<div class="common-skin-tabSame-rank-vote clearfix">'+
						'<div class="common-skin-tabSame-rank-dL">'+

							'<div class="common-skin-tabSame-rank-num">'+
								'<span class="common-skin-tabSame-rank-num-box gwhy-num-box">'+v.sn+'</span>'+
							'</div>'+
							'<p class="common-skin-tabSame-rank-thin-name fl">'+v.name+'</p>'+
							((is_vote!=false)?'<p class="common-skin-tabSame-rank-thin-amount fr">' + v.amount + '</p>':'') +
						'</div>'+
					'</div>'+
				'</div>'+
				(is_vote ? btnhtml : '')+
			'</li>';
    	});
    	html += '</ul>';
    	html += '</section>';
    	return html;
	  },	  
	  getTeamListTemplate:function(data,sts){
	    var me = this;
	    var html = '<ul id="team_list" class="team_list">';
			
			var voteBtnClass = (CONFIG.vote.is_animation != 1) ? 'common-skin-tabSame-rank-vt' : 'rank-vote-button';
		var total = 0;
		$.each(data,function(i,v){
			total += v.amount;
		});
    	$.each(data,function(i,v){
			var is_vote = me.checkIsVote(v);
			var pct = me.percent(v.amount, total);

			var btnhtml=
			'<div class="vote_btn">'+
				'<button class="'+ voteBtnClass + ' fl" '+ ( v.is_team == 1 && v.team_id != '' ? 'onclick="showTeam('+v.team_id+','+v.sn+');">' : 'onclick="showPayPanel(this);">')+(CONFIG.vote.name=='加油'?'加 油':'加 油')+'</button>'+
			'</div>';
			var clickHtml = '';

			if(sts == 2){
	         	btnhtml =
				 '<div class="vote_btn">'+
					 '<button class="'+ voteBtnClass + ' disabled fl" '+ ( v.is_team == 1 && v.team_id != '' ? 'onclick="showTeam('+v.team_id+','+v.sn+');">' : 'onclick="showPayPanel(this);">')+(CONFIG.vote.name=='加油'?'加 油':'加 油')+'</button>'+
				 '</div>';
	        }
      		html += 
            '<li class="li_content" objectid="' + v.objectid + '" sn="' + v.sn + '">'+
				'<div class="sn">'+ v.sn + '</div>' +
				'<div class="contestant">' +
					'<div class="name">' + v.name + '</div>' + 
					'<div class="tickets"><p class="common-skin-tabSame-rank-amount fr">' + v.amount + '</p></div>' + 
					'<div class="progress">' + 
						'<div class="progress-bar" lay-percent="50%" style="width: ' + pct + ';">' + 
							'<span class="progress-text">' + pct + '</span>' + 
						'</div>' +
					'</div>' +
				'</div>' +
			'</li>' +

			'<li class="li_operate"  objectid="' + v.objectid + '" sn="' + v.sn + '">' + btnhtml
			'</li>'
    	});
    	html += '</ul>';
    	return html;
  	},	  
	  getVideoListTemplate:function(data,sts){
	    var me = this;
	    var html = '<section class="tabSame rank">'+
              '<ul class="clearfix common-skin-tabSame-rank-ul">';
			
			var voteBtnClass = (CONFIG.vote.is_animation != 1) ? 'common-skin-tabSame-rank-vt' : 'rank-vote-button';

			var img_width = 290;
			var img_height = 352;
			if(CONFIG.vote.img_style == 0){
				img_width = 290;
				img_height = 290;
			}else if(CONFIG.vote.img_style == 2){
				img_width = 294;
				img_height = 170;
			}

			$.each(data,function(i,v){
			var is_vote = me.checkIsVote(v);
			is_vote = CONFIG.vote.hide_home_vote == 1 ? false : is_vote;

			if(CONFIG.vote.vtbtn_title == ''){
				var vtbtn = '<button class="'+ voteBtnClass + (sts == 2 ? ' disabled' : '') + ' fl" '+ ( v.is_team == 1 && v.team_id != '' ? 'onclick="showTeam('+v.team_id+','+v.sn+');">' : 'onclick="showPayPanel(this);">')+(CONFIG.vote.name=='加油'?'加 油':'加 油')+'</button>';
			}else{
				var vtbtn = '<button class="'+ voteBtnClass +  ' fl" '+ ( v.is_team == 1 && v.team_id != '' ? 'onclick="showTeam('+v.team_id+','+v.sn+');">' : 
					'onclick="javascrtpt:window.location.href=' + "'" + CONFIG.content.feature_url + '&sn=' + v.sn + "'" + '">') + CONFIG.vote.vtbtn_title+'</button>';

			}

			var btnhtml=
			'<div class="common-skin-tabSame-rank-f-box clearfix">'+
				'<p class="common-skin-tabSame-rank-amount fr">' + v.amount + '</p>'+ vtbtn
			'</div>'+
			'<div class="common-skin-tabSame-rank-bottom-line fr"></div>';
			var clickHtml = '';

			if(sts == 2){
	         	btnhtml =
	         	'<div class="common-skin-tabSame-rank-f-box clearfix">'+
					'<p class="common-skin-tabSame-rank-amount fr">' + v.amount + '</p>'+ vtbtn					
				'</div>'+
				'<div class="common-skin-tabSame-rank-bottom-line fr disabled"></div>';
			}
			
			var info_url = CONFIG.content.feature_url+(v.is_team == 1 && v.team_id != '' ? '&team_id='+v.team_id : '') +'&sn='+v.sn;
      		html += 
            '<li class="common-skin-tabSame-rank-li" objectid="' + v.objectid + '" sn="' + v.sn + '">'+
				'<div class="common-skin-tabSame-rank-li-box" style="position: relative">'+
					'<div class="common-skin-tabSame-rank-small-num">' + v.sn + '</div>' + 
					'<a class="common-skin-tabSame-rank-imgBox clearfix" href="'+ info_url +'">'+
						'<img src="'+ CTK.imgResize(v.imgurl, img_width, img_height) +'" alt="">'+
					'</a>'+
					'<div class="video-play-buttun"></div>' +
					'<a href="' + info_url +'">'+ 
					'<a href="' + info_url +'">'+ '<div class="common-skin-tabSame-rank-vote clearfix">'+
						'<div class="common-skin-tabSame-rank-dL">'+
							'<div class="common-skin-tabSame-rank-num">'+
								
							'</div>'+
							'<p class="common-skin-tabSame-rank-name" style="margin-top: -24px">'+v.name+'</p>'+
						'</div>'+
					'</div></a>'+
				'</div>'+
				(is_vote ? btnhtml : '')+
			'</li>';
    	});
    	html += '</ul>';
    	html += '</section>';
    	return html;
	  },
	  getAudioListTemplate:function(data,sts){
	    var me = this;
	    var html = '<section class="tabSame rank">'+
              '<ul class="clearfix common-skin-tabSame-rank-ul">';
			
			var voteBtnClass = (CONFIG.vote.is_animation != 1) ? 'common-skin-tabSame-rank-vt' : 'rank-vote-button';

			var img_width = 290;
			var img_height = 352;
			if(CONFIG.vote.img_style == 0){
				img_width = 290;
				img_height = 290;
			}else if(CONFIG.vote.img_style == 2){
				img_width = 294;
				img_height = 170;
			}

			$.each(data,function(i,v){
			var is_vote = me.checkIsVote(v);
			is_vote = CONFIG.vote.hide_home_vote == 1 ? false : is_vote;

			if(CONFIG.vote.vtbtn_title == ''){
				var vtbtn = '<button class="'+ voteBtnClass + (sts == 2 ? ' disabled' : '') + ' fl" '+ ( v.is_team == 1 && v.team_id != '' ? 'onclick="showTeam('+v.team_id+','+v.sn+');">' : 'onclick="showPayPanel(this);">')+(CONFIG.vote.name=='加油'?'加 油':'加 油')+'</button>';
			}else{
				var vtbtn = '<button class="'+ voteBtnClass +  ' fl" '+ ( v.is_team == 1 && v.team_id != '' ? 'onclick="showTeam('+v.team_id+','+v.sn+');">' : 
					'onclick="javascrtpt:window.location.href=' + "'" + CONFIG.content.feature_url + '&sn=' + v.sn + "'" + '">') + CONFIG.vote.vtbtn_title+'</button>';

			}

			var btnhtml=
			'<div class="common-skin-tabSame-rank-f-box clearfix">'+
				'<p class="common-skin-tabSame-rank-amount fr">' + v.amount + '</p>'+ vtbtn
			'</div>'+
			'<div class="common-skin-tabSame-rank-bottom-line fr"></div>';
			var clickHtml = '';

			if(sts == 2){
	         	btnhtml =
	         	'<div class="common-skin-tabSame-rank-f-box clearfix">'+
					'<p class="common-skin-tabSame-rank-amount fr">' + v.amount + '</p>'+ vtbtn					
				'</div>'+
				'<div class="common-skin-tabSame-rank-bottom-line fr disabled"></div>';
			}

			if(CONFIG.vote.hide_home_vote == 1){
				var audio_info = '<div class="title bd-s">' + v.name + '</div>' +
				'<div class="toupiao none">' +
				'<i class="tickets"></i>' + v.amount + '</div>';
			}else{
				var audio_info = '<div class="title">' + v.name + '</div>' +
				'<div class="toupiao ">' +
				'<i class="tickets"></i>' + v.amount + '</div>';
			}
			
			var info_url = CONFIG.content.feature_url+(v.is_team == 1 && v.team_id != '' ? '&team_id='+v.team_id : '') +'&sn='+v.sn;
      		html += 
            '<a class="common-skin-audio-item bd-s" href="' + info_url + '">' + 
				'<div class="sn sn-color">' + v.sn + '</div>' + 
				'<div class="right ai-bd ai-bd-btm">' +
					'<div class="song">' + audio_info + 
					'</div>' +
					'<div class="playtn">' +
						'<span class="playbtn-img"></span>' +
					'</div>' +
				'</div>' +
			'</a>';
    	});
    	html += '</ul>';
    	html += '</section>';
    	return html;
	  },	  
	  getTeamListTemplate:function(data,sts){
	    var me = this;
	    var html = '<ul id="team_list" class="team_list">';
			
			var voteBtnClass = (CONFIG.vote.is_animation != 1) ? 'common-skin-tabSame-rank-vt' : 'rank-vote-button';
		var total = 0;
		$.each(data,function(i,v){
			total += v.amount;
		});
    	$.each(data,function(i,v){
			var is_vote = me.checkIsVote(v);
			var pct = me.percent(v.amount, total);

			var btnhtml=
			'<div class="vote_btn">'+
				'<button class="'+ voteBtnClass + ' fl" '+ ( v.is_team == 1 && v.team_id != '' ? 'onclick="showTeam('+v.team_id+','+v.sn+');">' : 'onclick="showPayPanel(this);">')+(CONFIG.vote.name=='加油'?'加 油':'加 油')+'</button>'+
			'</div>';
			var clickHtml = '';

			if(sts == 2){
	         	btnhtml =
				 '<div class="vote_btn">'+
					 '<button class="'+ voteBtnClass + ' disabled fl" '+ ( v.is_team == 1 && v.team_id != '' ? 'onclick="showTeam('+v.team_id+','+v.sn+');">' : 'onclick="showPayPanel(this);">')+(CONFIG.vote.name=='加油'?'加 油':'加 油')+'</button>'+
				 '</div>';
	        }
      		html += 
            '<li class="li_content" objectid="' + v.objectid + '" sn="' + v.sn + '">'+
				'<div class="sn">'+ v.sn + '</div>' +
				'<div class="contestant">' +
					'<div class="name">' + v.name + '</div>' + 
					'<div class="tickets"><p class="common-skin-tabSame-rank-amount fr">' + v.amount + '</p></div>' + 
					'<div class="progress">' + 
						'<div class="progress-bar" lay-percent="50%" style="width: ' + pct + ';">' + 
							'<span class="progress-text">' + pct + '</span>' + 
						'</div>' +
					'</div>' +
				'</div>' +
			'</li>' +

			'<li class="li_operate"  objectid="' + v.objectid + '" sn="' + v.sn + '">' + btnhtml
			'</li>'
    	});
    	html += '</ul>';
    	return html;
  	},
	//处理投票规则返回
	getRuleTemplate:function(data){
	    var me = this;
	    var html = '<section class="tabSame common-skin-vote-rule-text">'+
              '<ul class="clearfix common-skin-tabSame-rank-ul">';
        
		html += data['rule_desc'] ;
      		
    	html += '</ul>';
		html += '</section>';
    	return html;
  	},
	percent: function(num, total) {
		num = parseFloat(num);
		total = parseFloat(total);
		if (isNaN(num) || isNaN(total)) {
			return "0%";
		}
		return total <= 0 ? "0%" : (Math.round(num / total * 10000) / 100.00)+"%";
	},		  
	searchVote: function(page) {
		var tmp = '';
		var me = this;
		var limit = 10;
		var q = $.trim(me.$schinpMod.find('.common-skin-schInp').val());
		me.timersearchList = true;
		me.timerpageList = false;
		if (!q) return;

		var feature_domain = me.vote_domain != '' ? me.vote_domain : CTK.pre_feature + CTK.base;
		var url = feature_domain + '/vote/seach';
		var paras = {
			'q': q,
			'vote_id': me.vote_id,
			'limit': limit,
			'page': page
		};
		
		$.getJSON(url, paras, function(rs) {
			me.showNum(rs);
			if (rs.result == 1 && rs.data.length > 0) {
				me.$rankSlide.find('.common-skin-tabSame-rank-ul').html(me.getListTemplate(rs.data, rs.vote.status));
				var pageParas = {};
				pageParas.dataTotalNum = rs.total;//数据总数
				pageParas.perPageNum = limit;//每页显示的数据数
				pageParas.pageBtnMaxNum = 3;//分页按钮的最大数

				var pageHtml = me.pageTo(page, pageParas, 1);
				me.$rankSlide.find('#pageBox').html(pageHtml);

			} else {
				var tmp = '<section class="common-skin-sou-kong" style="display: block">'+
					'<img src="http://img01.chezhuyihao.cn/M00/FF/FF/gif/notfound.gif" alt="">'+
					'<p>抱歉，未能搜索到相关信息~</p>'+
				'</section>';
				me.$rankSlide.find('.common-skin-tabSame-rank-ul').html(tmp);
				me.$rankSlide.find('#pageBox').html('');
			}
		});
	},
	teamVote: function(page,tid) {
		var tmp = '';
		var team_id = 0;
		var me = this;
		var limit = 100;

		var team_id =  (tid == "" || tid == null || tid == undefined) ? CONFIG.team.team_id : tid;
		me.timersearchList = true;
		me.timerpageList = false;
		if (!team_id) return;
		var feature_domain = me.vote_domain != '' ? me.vote_domain : CTK.pre_feature + CTK.base;
		var url = feature_domain + '/vote/team_list';
		var paras = {
			'vote_id': me.vote_id,
			'team_id': team_id,
			'limit': limit,
			'page': page
		};
		$.getJSON(url, paras, function(rs) {
			me.showNum(rs);
			if (rs.result == 1 && rs.data.length > 0) {
				if(rs.vote.listmode == 1){
					me.$rankSlide.find('.common-skin-tabSame-rank-ul').html(me.getTeamListTemplate(rs.data, rs.vote.status));
				}else{
					me.$rankSlide.find('.common-skin-tabSame-rank-ul').html(me.getListTemplate(rs.data, rs.vote.status));
				}
				var pageParas = {};
				pageParas.dataTotalNum = rs.total;//数据总数
				pageParas.perPageNum = limit;//每页显示的数据数
				pageParas.pageBtnMaxNum = 3;//分页按钮的最大数

				var pageHtml = me.pageTo(page, pageParas, 1);
				me.$rankSlide.find('#pageBox').html(pageHtml);

				me.setRankListAnimate(2);
			} else {
				var tmp = '<section class="common-skin-sou-kong" style="display: block">'+
					'<img src="http://img01.chezhuyihao.cn/M00/FF/FF/gif/notfound.gif" alt="">'+
					'<p>抱歉，未能搜索到相关信息~</p>'+
				'</section>';
				me.$rankSlide.find('.common-skin-tabSame-rank-ul').html(tmp);
				me.$rankSlide.find('#pageBox').html('');
			}
		});
	},	
	payCommit: function(data, callback) {
		var me = this;
		var sn = me.currentSelectSn > 0 ? me.currentSelectSn : CONFIG.rank_info.sn;
		var para_obj = {
			'pid': data.pid,
			'amount': data.num,
			'is_wap': 2,
			'categoryid': me.categoryid,
			'contentid': me.vid_code,
			'objectid': data.objectid,
			'gid': me.gid,
			'vote_id': me.vote_id,
			'objecturl': data.objecturl + "&n=" + data.num + "&o=" + data.objectid + "&sn=" + sn
		};
		$.getJSON(CTK.pre_pay + CTK.base + '/pay/commit', para_obj, function(rs) {
			typeof callback == "function" && callback(rs);
			return false;
		});
	},
	//分页
	pageTo:function(currPageIdx, paras, isSearch){
		if(paras==null || paras.dataTotalNum == null || paras.dataTotalNum <= 0){
			return '';
		}
		var dataTotalNum = paras.dataTotalNum;//数据总数
		
		var perPageNum = paras.perPageNum?paras.perPageNum:10;//每页显示的数据数
		var pageBtnMaxNum = paras.pageBtnMaxNum?paras.pageBtnMaxNum:3;//分页按钮的最大数
		
		var totalPageNum =  Math.ceil(dataTotalNum/perPageNum);
		
		if(currPageIdx< 1 || currPageIdx > totalPageNum || totalPageNum <= 1){
			return '';
		}
		var funName = "javascript:loadVoteList";
		if(isSearch == 1){
			funName = "javascript:loadSearchList";
		}

		var html = '<div class="common-skin-bd-page">';
		if(paras.showTotalNum){
			html+='<a class="common-skin-bd-page-li" href="javascript:void(0);">' + dataTotalNum + '条</a>';
		}
		if(totalPageNum > 1){
			if(currPageIdx-1<1){
				html += '<span class="common-skin-bd-page-li"><</span> ';
			}else{
				html += '<a class="common-skin-bd-page-li" href="'+funName+'(' + (currPageIdx - 1) + ')"><</a> ';
			}
		}
		var startIdx,endIdx;
		if(currPageIdx<pageBtnMaxNum){
			startIdx = currPageIdx - Math.floor(pageBtnMaxNum/2);
			startIdx = startIdx < 1 ? 1 : startIdx;
			endIdx = startIdx + pageBtnMaxNum-1;
			endIdx = endIdx > totalPageNum ? totalPageNum : endIdx;
		}else{
			endIdx = currPageIdx + Math.floor(pageBtnMaxNum/2);
			endIdx = endIdx > totalPageNum ? totalPageNum : endIdx;
			startIdx = endIdx - pageBtnMaxNum + 1;
			startIdx = startIdx < 1 ? 1 : startIdx;
		}
		if(startIdx>1){
			html += '<a class="common-skin-bd-page-li" href="'+funName+'(1);">1</a>';//首页				
		}
		if(startIdx>2){
			html += '<span class="common-skin-bd-page-li">···</span>';					
		}
		for(var idx = startIdx;idx<=endIdx;idx++){
			if(idx==currPageIdx){
				html += '<span class="common-skin-bd-page-li common-skin-on-page">'+idx+'</span>';					
			}else{
				html += '<a class="common-skin-bd-page-li" href="'+funName+'('+idx+');">'+idx+'</a>';					
			}
		}
		if(endIdx < totalPageNum - 1){
			html += '<span class="common-skin-bd-page-li">···</span>';
		}
		if(endIdx < totalPageNum){
			html += '<a class="common-skin-bd-page-li" href="'+funName+'(' + totalPageNum + ');">'+totalPageNum+'</a>';//尾页
		}
		if(totalPageNum > 1){
			if(currPageIdx+1>totalPageNum){
				html += '<span class="common-skin-bd-page-li">></span>';
			}else{
				html += '<a class="common-skin-bd-page-li" href="'+funName+'(' + (currPageIdx + 1) + ')" class="a1">></a>';
			}
		}
		return html;
	},
	setsliderevent: function(){
		var me = this;
		var cishu = 0;
		var ulLeft = 0;
		var dis = 2.84;
		// var slideIndex = 10; //$(".picList").children("li:last").index()+1;
		var slideIndex = $(".common-skin-indexTop10-picList").children("li").length;
		var picListWidth = (slideIndex * dis);
		var yidongcishu = slideIndex - 3;

		if ($(".common-skin-indexTop10-picList").size() > 0) {
			$(".common-skin-indexTop10-picList").css('width', picListWidth + "rem");
		}

		function slides() {
			var piclist = $(".common-skin-indexTop10-picList");
			if (piclist.size() <= 0) {
				return
			}
			
			if (cishu < yidongcishu) {
				ulLeft -= dis;
				cishu++;
			} else {
				cishu = 0;
				ulLeft = 0;
			}
			piclist.animate({
				left: ulLeft + "rem"
			});
		}
		if(me.mybar>0) clearInterval(me.mybar);
		if(slideIndex>3){
			me.mybar = setInterval(slides, 3000);
		}else{
			return;
		}
		$(".common-skin-indexTop-program-prev").click(function() {
			if (cishu < yidongcishu) {
				ulLeft -= dis;
				$(".common-skin-indexTop10-picList").animate({
					left: ulLeft + "rem"
				});
				cishu++;
			}
		})
		$(".common-skin-indexTop-program-next").click(function() {
			if (ulLeft >= 0) {} else {
				ulLeft += dis;
				$(".common-skin-indexTop10-picList").animate({
					left: ulLeft + "rem"
				});
				cishu--;
			}
		});
	},
	activeTab: function(){
		var tabitem = document.querySelectorAll(".tab-item");
		var voteitem = document.querySelectorAll(".common-skin-vote-item");
		for (var i = 0; i < tabitem.length; i++) {
			tabitem[i].onclick = function () {
				var index = this.getAttribute("index");
				for (var j = 0; j < tabitem.length; j++) {
					tabitem[j].classList.remove('active');
				}
				this.classList.add('active');
	
				for (var j = 0; j < voteitem.length; j++) {
					var albumNav = document.getElementById("albumNav");
					if(!CTK.isEmpty(albumNav) ){
						if(index == 0){
							if(albumNav.style.display == 'none'){
								albumNav.style.display = 'block';
								album.switchSecene(0);
							}
							
						}else{
							albumNav.style.display = 'none';
						}

					}			
					if (index == voteitem[j].getAttribute("index")) {
						voteitem[j].style.display = "block";
					} else {
						voteitem[j].style.display = "none";
					}
				}
			}
		}		
	},
	activeNav: function(){
		var navitem = document.querySelectorAll(".nav-item");
		var albumitem = document.querySelectorAll(".common-skin-album-item");

		for (var i = 0; i < navitem.length; i++) {
			navitem[i].onclick = function () {
				var index = this.getAttribute("index");
				for (var j = 0; j < navitem.length; j++) {
					navitem[j].classList.remove('active');
				}
				this.classList.add('active');
	
				for (var j = 0; j < albumitem.length; j++) {
					if (index == albumitem[j].getAttribute("index")) {
						albumitem[j].style.display = "block";
					} else {
						albumitem[j].style.display = "none";
					}
				}
			}
		}		
	},	
	showAlert: function(title, msg){
		if(CONFIG.vote.is_animation == 1){
			layer.open({type: 0, content: msg, skin: 'msg', shadeClose: true, time: 3});
		}else{
			layer.open({
				content: msg,
				btn: ['确认']
				});
		}
	},
	popImgWin: function(imgurl) {
		var img = '<img src="' + imgurl + '">';
		layer.open({
			type: 1,
			shade: 0.6,
			anim: 0,
			content: img,
			btn: ['关闭']
		}); 
	},
	setRankListAnimate: function(from){
		if(CONFIG.vote.is_animation != 1){
			return;
		}

		var animateButton = function(e) {
			e.preventDefault;
			e.target.classList.remove('animate');
			
			e.target.classList.add('animate');
			setTimeout(function(){
				e.target.classList.remove('animate');
			},700);
		};

		//投票个人列表或团队列表
		if(from == 1 || from == 2 ){
			$(".common-skin-tabSame-rank-imgBox").children('img').bind("touchstart touchend",function(){
				$(this).toggleClass("zoomIn");
			})
			
			var classname = document.getElementsByClassName("rank-vote-button");
			for (var i = 0; i < classname.length; i++) {
				classname[i].addEventListener('touchstart', animateButton, false);
			}				
		}

		//启动
		if(from == 0){
			var classname = document.getElementsByClassName("info-vote-button");
			for (var i = 0; i < classname.length; i++) {
				classname[i].addEventListener('touchstart', animateButton, false);
			}	

			$(".common-skin-gift-p-li").children('img').bind("touchstart touchend",function(){
				$(this).toggleClass("fadeInDown");
			})

		}
	},
	playClickSound: function(audio_url){ 
		return ;

		if(CONFIG.vote.is_animation != 1){
			return;
		}

		document.getElementById("sound_btn").innerHTML='<audio autoplay="autoplay"><source src="' + audio_url 
			+ '" type="audio/mpeg" /><embed hidden="true" preload="auto" autostart="true" loop="false" /></audio>';
	},
	hidQuickBuyTips: function(){
		if(!$('.quick_buy_tips').hasClass('none')){
			$('.quick_buy_tips').addClass('none');
		}
	},
	createTimeLineArr: function(video_id, dur){
		var me = this;
		var timeLine = me.timeLines[video_id];
		if(dur <= 0 || !CTK.isEmpty(timeLine)){
			return;
		}

		var timeLine = new Array();
		for(var i = 1; i <= dur; i++){
			timeLine[i] = 0;
		}

		me.timeLines[video_id] = timeLine;
	},
	setTimeLinePlayed: function(video_id, dur, curTime){
		if(curTime <= 0 || dur <= 0){
			return;
		}

		var me = this;
		var timeLine = me.timeLines[video_id];
		if(CTK.isEmpty(timeLine)){
			var timeLine = new Array();
			me.timeLines[video_id] = timeLine;
		}

		var m = Math.ceil(curTime/60);

		timeLine[m] = 1;
		me.timeLines[video_id] = timeLine;

		var percent = curTime / dur ;
		if(percent >= 0.5){
			var sent = me.sentWatchs[video_id];
			if(CTK.isEmpty(sent) || sent != 1){
				me.sendWatched(video_id);
				var id = "icon-" + video_id;
				document.getElementById(id).innerHTML = '已完成学习';
			}			
		}
	},
	checkFullPlay: function(video_id, dur){
		var me = this;
		var timeLine = me.timeLines[video_id];
		if(CTK.isEmpty(timeLine)){
			return false;
		}

		var watched_minutes = 0;
		var max_m = Math.floor(dur/60);
		for(var i = 1; i <= max_m; i++){
			if(timeLine[i] == 1){
				watched_minutes++;
			}
		}

		var free_minutes = max_m - watched_minutes;
		return free_minutes <= 2 ? true: false;
	},
	sendWatched: function(video_id){
		var me = this;
		var sent = me.sentWatchs[video_id];
		if(sent == 1){
			return;
		}
		me.sentWatchs[video_id] = 1;

		var feature_domain = vote.vote_domain != '' ? vote.vote_domain : CTK.pre_feature + CTK.base;
		var url = feature_domain + '/vote/watched';
		var paras = {
			'vote_id': CONFIG.vote.vote_id,
			'video_id': video_id
		};
		$.getJSON(url, paras, function(rs) {
			if (rs.result == 1 ) {
				var id = "icon-" + video_id;
				document.getElementById(id).innerHTML = '已完成学习';
			} 		
		});
	},	
	initVideo: function(){
		var me = this;
		var extBannerSwiperContainer = document.getElementById("ext-banner-swiper-container");
		if(extBannerSwiperContainer != null){
			var extBannerSwiper = new Swiper('.swipe_100', {
				pagination: '.pagination-ext-banner',
				paginationClickable: true,
				autoplay : 5000,
			});
		}

		var playback_video = $(".playback_video");
		if(playback_video.length > 0){
				var swiper = new Swiper('.swiper-container-playback', {
					slidesPerView : 'auto',
					paginationClickable: true,
					spaceBetween: 10,
				});			
				
				var mult_players = $(".mult-player");
				if(mult_players.length == 0){
					return;
				}
				
				//添加事件，若需要完整学习（full study）
				if(CONFIG.vote.need_study_flag == 1){
					for(var i = 0; i < mult_players.length; i++ ){
						var mult_player = $(mult_players[i]);
						var player = $( "#player-" + mult_player.attr("id"));
	
						player.on('durationchange', function() {
							var dur = Math.floor(this.duration);
							var video_id = $(this).attr('id');
	
						});
						
						player.on('timeupdate', function () { 
							var dur = Math.floor(this.duration);
							var curTime = Math.floor(this.currentTime);
							var video_id = $(this).attr('id');
							
							var icoId = document.getElementById("icon-" + video_id);
							if(icoId == null){
								return;
							}					

							if (!CTK.curUser.uid) {
								CTK.redirect_wx(CONFIG.vote.wx_app, '', CONFIG.vote.wx_scope);
								return true;
							}

							me.setTimeLinePlayed(video_id, dur, curTime);
	
						});	
	
						player.on('ended', function () { 
							var dur = Math.floor(this.duration);
							var video_id = $(this).attr('id');
							var icoId = document.getElementById("icon-" + video_id);
							if(icoId == null){
								return;
							}					

							var isfull = me.checkFullPlay(video_id, dur);

							if(isfull == true){
								me.sendWatched(video_id);
							}
						});						
					}
				}

				playback_video.click(function () {
					var player_playurl = $(this).attr("playurl");
					var player_imgurl = $(this).attr("imgurl");
					playback_video.removeClass("click_color");
					$(this).addClass("click_color");
					var video_id = $(this).attr("id");
					var is_video = $(this).attr("is_video");

					if (!CTK.curUser.uid) {
						CTK.redirect_wx(CONFIG.vote.wx_app, '', CONFIG.vote.wx_scope);
						return true;
					}
					
					for(var i = 0; i < mult_players.length; i++ ){
						var mult_player = $(mult_players[i]);
						
						if(!mult_player.hasClass('video-hide') && video_id != mult_player.attr("id")){
							var old_player = $("#player-" + mult_player.attr("id"));

							if(old_player.length > 0){
								old_player[0].pause();
							}
						}
						if(video_id == mult_player.attr("id")){
							mult_player.removeClass('video-hide');
							var cur_player = $("#player-" + video_id);
							
							if(cur_player.length > 0){
								cur_player.play;
							}

						}else{
							mult_player.addClass('video-hide');
						}
					}
				})
		}		
	},
	initCsAlbum: function(){
		var me = this;
		var contestantAlbum = document.getElementById("contestant-album-container");
		if(contestantAlbum != null && CONFIG.contestant_album_count > 1){
			var w = $(".common-skin-program-area").width();
			$('.contestant-album-box').css('width', w);

			var csAlbumSwiper = new Swiper('.contestant-album-container', {
				// pagination: '.swiper-pagination',
				// paginationClickable: true,
				nextButton: '.swiper-button-next',
				prevButton: '.swiper-button-prev',
				parallax: true,
				spaceBetween: 20,
				speed: 600,
			});
		}
		

		if(contestantAlbum != null){
			$('div.pinch-zoom').each(function () {
				new RTP.PinchZoom($(this), {});
			});
		}
	},
	initUser: function(){
		var me = this;
		var feature_domain = vote.vote_domain != '' ? vote.vote_domain : CTK.pre_feature + CTK.base;
		var url = feature_domain + '/vote/bind';

		var bindBtn = $(".bind_button");
		if(bindBtn != null){
			//绑定
			bindBtn.on('click', function() {
				if (!CTK.curUser.uid) {
					CTK.redirect_wx(CONFIG.vote.wx_app, '', CONFIG.vote.wx_scope);
					return true;
				}				
								
				var contestantInputSn = $("#contestantInputSn").val();
				if (CTK.isEmpty(contestantInputSn)) {
					vote.showAlert('提示信息', '请输入参赛编号');
					return false;
				}
				
				var data = {
					'sn': contestantInputSn,
					'vote_id': CONFIG.vote.tpid,
					'is_bind': 1,
				};

				$.getJSON(url, data, function(rs) {
					if (rs.result == 1) {
						layer.open({content: '恭喜您，已绑定成功啦!<br>绑定编号：' + rs.data.sn + "，参赛名：" + rs.data.name, btn: ['确认'],
						yes: function(index, layero){
							window.location.reload();
						},});
					} else {
						layer.open({content:  rs.msg, btn: ['确认']});
					}
				});	
			});			
		}
		var unbindBtn = $(".unbind_button");
		if(unbindBtn != null){
			unbindBtn.on('click', function() {
				if (!CTK.curUser.uid) {
					CTK.redirect_wx(CONFIG.vote.wx_app, '', CONFIG.vote.wx_scope);
					return true;
				}				
								
				var paras = {
					'vote_id': CONFIG.vote.tpid,
					'is_bind': 0,
				};
								
				$.getJSON(url, paras, function(rs) {
					if (rs.result == 1) {
						layer.open({content: '恭喜您，已成功解绑啦!', btn: ['确认'],
						yes: function(index, layero){
							window.location.reload();
						},});
					} else {
						layer.open({content:  rs.msg, btn: ['确认']});
					}
				});	
			});			
		}
	},	
	initStage: function(){
		var me = this;
		var contestantStageContainer = document.getElementById("contestant-stage-container");
		if(contestantStageContainer != null && CONFIG.contestant_album_count > 1){
			var swiper = new Swiper('.swiper-container-stage', {
				slidesPerView : 'auto',
				paginationClickable: true,
				spaceBetween: 5,
			});	
		}	
	},
	initLoader: function(){
		if(CTK.isEmpty(CONFIG.vote.loader_time) || CONFIG.vote.loader_time <= 0){
			return;
		}

		if(!CTK.isEmpty(document.referrer)){
			return;
		}
		
		$('#loader_start_page')[0].style.display = "block";

		$(".enter_text").click(function() {
			$('#loader_start_page')[0].style.display = "none";
		})

		var count = CONFIG.vote.loader_time;
		var timer = setInterval(function() {
			count--;
			if(count<0){
				$('#loader_start_page')[0].style.display = "none";
				return;
			}
			$(".poster-countdown")[0].innerHTML=count;
		}, 1000)

		$(".poster-countdown")[0].innerHTML = CONFIG.vote.loader_time;	
	},
	checkShowLoaderPop: function(flag){
		var key = 'POP_LOADER_FLAG_' + flag;
		var val = sessionStorage.getItem(key);
		if(val == '1'){
			return false;
		}
		
		sessionStorage.setItem(key,'1'); 
		return true;
	},		
}

$(document).ready(function() {
	vote.init();

	if(CTK.domain_prefix != ''){
		CTK.curUser.uid = 55;
	}

	var ua = window.navigator.userAgent.toLowerCase();
	if(ua.match(/MicroMessenger/i) == 'micromessenger' && CONFIG.vote.vote_id < 83){
		CTK.curUser.uid = 55;
	}

	if (CTK.domain_prefix == '' && ua.match(/MicroMessenger/i) != 'micromessenger') {
		CTK.redirect_wx(CONFIG.vote.wx_app, '', CONFIG.vote.wx_scope);
		return true;
	}

	if(CONFIG.vote.is_unforced_login == 0 && !CTK.curUser.uid){
		CTK.redirect_wx(CONFIG.vote.wx_app, '', CONFIG.vote.wx_scope);
		return true;
	}

	//分页按钮调用
	window.loadVoteList = function(page) {
		var $rankSlide = $("#rankSlide");
		vote.voteRank(page);
		var top = $rankSlide.offset().top;
		$('body').scrollTop(top);
	};
	window.loadSearchList = function(page) {
		var $rankSlide = $("#rankSlide");
		vote.searchVote(page);
		var top = $rankSlide.offset().top;
		$('body').scrollTop(top);
	};
	vote.voteTop(1);
	// 最佳标签切换
	$(".common-skin-indexTop10-tabs").find("li").click(function() {
		$(this).addClass("active").siblings("li").removeClass("active");
	});
	$(".common-skin-indexTop10-tabs").find("li").eq(0).addClass("active").siblings("li").removeClass("active");
	// 分组标签切换
	if(CTK.isEmpty(CONFIG.vote.active_group)){
		$(".common-skin-rankSlide").children(".hd").find("li").click(function() {
			$(this).addClass("on").siblings("li").removeClass("on");
		});
		$(".common-skin-rankSlide").children(".hd").find("li").eq(0).addClass("on").siblings("li").removeClass("on");
	}
	// 底部标签切换
	$(".common-skin-shuoming .common-skin-menu li").click(function() {
		$(this).addClass("on").siblings().removeClass("on");
		var bottomIndex = $(this).index();
		var index;
		if(bottomIndex == 2){
			index = 1;
		} else if (bottomIndex == 4){
			index = 2;
		} else {
			index = 0;
		}
		$(".common-skin-shuoming").children("div").eq(index).show().siblings("div").hide();
	});
	//说明文本按钮
	$(".common-skin-shuoming .common-skin-menu li").eq(0).addClass("on").siblings().removeClass("on");
	$(".common-skin-shuoming").children("div").eq(0).show().siblings("div").hide();

	vote.setRankListAnimate(0);
});

function showPayPanel(dom) {
	if (!CTK.curUser.uid) {
		CTK.redirect_wx(CONFIG.vote.wx_app, '', CONFIG.vote.wx_scope);
		return true;
	}				
		
	vote.playClickSound('http://mv01.chezhuyihao.cn/audio/vt/click_material.mp3');
	$('.common-skin-chose-inp').val('');
	$('.common-skin-a-pay').text('立即支付');
	$('.common-skin-chose-p-li').removeClass('common-skin-chose-on');
	$('.common-skin-gift-p-li').removeClass('common-skin-gift-on');

	var countdownTitle = CONFIG.vote.info_paybtn_title != '' ? CONFIG.vote.info_paybtn_title : '加油助力';
	if (vote.nowTime < CONFIG.vote.starttime) {
		var d = new Date(CONFIG.vote.starttime * 1000);
		d = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日" + d.getHours() + "时" + ((d.getMinutes() > 0) ? d.getMinutes() + "分" + d.getSeconds() + "秒" : '');
		vote.showAlert('提示信息', countdownTitle + '尚未开始<br>开始时间：' + d + '');
	} else if(vote.nowTime > CONFIG.vote.endtime) {
		vote.showAlert('提示信息', countdownTitle + '已经结束!');
	} else {
		$(".common-skin-zzc").show();
		$("#paySuccessPanel").hide();
		$("#payPanel").show();
	}
	var objectid = $(dom).parents('li').attr('objectid');
	vote.currentSelectSn = $(dom).parents('li').attr('sn');
	setPayPanelEvent(objectid, vote.currentSelectSn);
}

function showTeam(team_id,sn){
	vote.playClickSound('http://mv01.chezhuyihao.cn/audio/vt/click_material.mp3');
	window.location.href = CONFIG.content.feature_url + '&team_id=' + team_id + '&sn=' + sn;
}

function setPayPanelEvent(objectid, sn) {
	var payContainer = $(".common-skin-zzc");
	var payPanel = $("#payPanel");
	payPanel.show();
	var voteInputNum = 300;
	var payBtn = $(".common-skin-a-pay");
	
	$(".pay-panel-title").text(objectid.replace('_', ' '));
	
	payContainer.find(".common-skin-zzc-close").click(function(){
		payContainer.hide();
	});
	//输入
	voteInputNum.on('keyup', function() {
		var that = $(this);
		var num = that.val().replace(/\D/, '');
		var total = parseFloat(num * vote.price).toFixed(2);
		$(".common-skin-a-pay").text("立即支付"+total+"元");
		that.val(num);
		vote.gid = 0;//自定义输入gid为0
		payPanel.find(".common-skin-chose-p-li").removeClass("common-skin-chose-on");
		payPanel.find(".common-skin-gift-p-li").removeClass("common-skin-gift-on");
		$(".common-skin-a-pay").css('background-color','#26A65B');
	});
	//设置支付选择按钮
	payPanel.find(".common-skin-chose-p-li").click(function(){
		$(this).addClass("common-skin-chose-on").siblings().removeClass("common-skin-chose-on");
		var num = 300;
		vote.gid =  $(this).data("gid");
		voteInputNum.val(num);
		var total = parseFloat(num * vote.price).toFixed(2);
		$(".common-skin-a-pay").text("立即支付"+total+"元");
	});
	payPanel.find(".common-skin-gift-p-li").click(function(){
		vote.playClickSound('http://mv01.chezhuyihao.cn/audio/vt/click_material.mp3');
		$(this).addClass("common-skin-gift-on").siblings().removeClass("common-skin-gift-on");
		var num = $(this).data("votenum");
		vote.gid =  $(this).data("gid");

		voteInputNum.val(300);
		var total = parseFloat(num * vote.price).toFixed(2);
		if(vote.gid == vote.free_gid){
			$(".common-skin-a-pay").text("为选手加油1");
			$(".common-skin-a-pay").css('background-color','#D24D57');
			
			var feature_domain = vote.vote_domain != '' ? vote.vote_domain : CTK.pre_feature + CTK.base;
			var url = feature_domain + '/vote/free';
			var paras = {
				'vote_id': CONFIG.vote.vote_id
			};
			$.getJSON(url, paras, function(rs) {
			});

		}else{
			$(".common-skin-a-pay").text("立即支付"+total+"元");
			$(".common-skin-a-pay").css('background-color','#26A65B');
		}
	});	
	//支付按钮
	payBtn.on('click', function() {
		vote.playClickSound('http://mv01.chezhuyihao.cn/audio/vt/click_material.mp3');

		//未登录
		if (!CTK.curUser.uid) { 
			CTK.redirect_wx(CONFIG.vote.wx_app, '', CONFIG.vote.wx_scope);
			return false;
		}

		var countdownTitle = CONFIG.vote.info_paybtn_title != '' ? CONFIG.vote.info_paybtn_title : '加油助力';
		if(vote.nowTime < CONFIG.vote.starttime){
          var d = new Date(CONFIG.vote.starttime * 1000);
          d = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日" + d.getHours() + "时" + ((d.getMinutes() > 0) ? d.getMinutes() + "分" + d.getSeconds() + "秒" : '');
          vote.showAlert('提示信息', countdownTitle + '尚未开始<br>开始时间：' + d + '');
          return;
        }else if(vote.nowTime > CONFIG.vote.endtime){
			vote.showAlert('提示信息', '活动已结束！');
          return;
        }

		var num = 300;
		if (!/^([0-9]+)$/.test(num) || num <= 0 || num > CONFIG.vote.max_custom_input) {
			vote.showAlert('提示信息', '需要选中后，再提交');
			return false;
		}
		if (!objectid) {
			vote.showAlert('提示信息', countdownTitle + '对象不能为空！');
			return false;
		}
		var data = {
			'num': num,
			'pid': CONFIG.vote.pid,
			'objectid': objectid,
			'objecturl': CONFIG.content.redirect_url,
		};

		vote.payCommit(data, function(rs) {
			var countdownTitle = CONFIG.vote.info_paybtn_title != '' ? CONFIG.vote.info_paybtn_title : '加油助力';
			if (rs.result == 1 || (rs.data != undefined && rs.data.oid)) {
				if(vote.gid == vote.free_gid){
					layer.open({content: '恭喜您，已加' + countdownTitle + '成功啦!', btn: ['确认'],
					yes: function(index, layero){
						window.location.reload();
					},});
				}else{
					var oid = rs.data.oid;
					var pay_url = CTK.pre_pay + CTK.base + '/pay/' + oid + '.html';
					CTK.redirect_wx(CONFIG.vote.wx_app, pay_url, CONFIG.vote.wx_scope);
				}				
			} else {
				layer.open({content:  rs.msg, btn: ['确认']});
			}
		});
		return false;
	});
}







(function(window,undefined){
	var vheight = Math.ceil($('body').width()*9/16);
	$("#video-wrap").height(vheight);
	function NetLive(data){
		this.config = data;
		this.bd = $('body');
		this.video = null;
		this.videoWrap = $("#video-wrap");
		this.netactionBox = $('.netaction-box');
		this.shareBtn = this.netactionBox.find('.shareBtn');
		this.sharelist = this.netactionBox.find('.sharelist');
		this.videoInfo = $("#net-info");
		this.videoList = $("#video-more");
		this.categoryid = 1;//1=网络直播 2=点播
		this.vheight = Math.ceil(this.bd.width()*9/16);
	}

	NetLive.prototype = {

		init:function(){

			var me = this;

			me.video = me.videoWrap.find('video');
			//播放后清除poster图片
			if(me.video.size()>0){
				var myVideo = me.video[0];
				myVideo.addEventListener("playing", function(e) {
					myVideo.poster = '';
				});
			}

			//多路直播
			var ulWidth = 0;
			var muti_index = 0;
			var windowWidth = $(window).width();
			$.each(me.videoList.find('li'),function(i,v){
				ulWidth += v.offsetWidth + parseInt($(v).css('margin-left'));
			});
			if(ulWidth <= windowWidth){
				me.videoList.css('overflow-x','hidden');
			}
			if(me.videoList.find('ul').size()>0)me.videoList.find('ul').css({'width':ulWidth});
			me.videoList.on('click','li',function(){

				var $endTip = $("#endTip");
				var that = $(this);
				var playurl = that.data('playurl');
				that.addClass('highlight').siblings().removeClass('highlight');
				if($endTip.size() > 0){
					$endTip.remove();
				}
				if(playurl){
					me.video.show();
					me.videoWrap.find('img').hide();
					me.video[0].poster = that.find('img').attr('src');

					var postion = that.attr('date-wm_postion');

					//关闭多路直播
					var data_active = that.attr('data-active');
					if(that.index()!=0 && data_active == 0){
						return false;
					}
					if(muti_index == that.index()){
						me.video[0].play();
					}else{
						me.video[0].src = playurl;
						me.video[0].load();
						me.video[0].play();
					}
				}else{
					if(that.index()==0 && CONFIG.netlive.status==2 && CONFIG.netlive.is_self==0){
						var html  = '<div class="endTip" id="endTip">';
						html += '<p>直播正在剪辑中</p>';
						html += '</div>';
						me.video[0].pause();
						me.videoWrap.append(html);
					}
					me.video.hide();
					me.videoWrap.find('.t-img').attr('src', that.data('imgurl')).show();

					var status = that.data('status');
					var uid = that.data('uid');
					if(!uid) return false;
					$.getJSON(CTK.pre_show + CTK.base + '/show/api/get_lives_uids?uids='+uid,{}, function(rs){
						if(rs.result != 1 || !rs.data || !rs.data[uid] || rs.data[uid]['status'] != '10'){
							if(status == 0){
								var html  = '<div class="endTip" id="endTip">';
								html += '<p>直播还未开始</p>';
								html += '</div>';
								me.video[0].pause();
								me.videoWrap.append(html);
							}else if(status == 1){
								var html = '';
								html += '<div class="endTip" id="endTip">';
								html += '<p>直播暂停中</p>';
								html += '</div>';
								me.video[0].pause();
								me.videoWrap.append(html);
							}else if(status >= 2){
								var html = '';
								html += '<div class="endTip" id="endTip">';
								html += '<p>直播已结束</p>';
								html += '</div>';
								me.video[0].pause();
								me.videoWrap.append(html);
							}
						}else{

							//关闭多路直播
							var data_active = that.attr('data-active');
							if(data_active ==0){
								me.video[0].src = rs.data[uid].playurl;
								me.video[0].load();
								me.video[0].poster = that.find('img').attr('src');
								me.video.show();
								return false;
							}else{
								me.video[0].src = rs.data[uid].playurl;
								me.video[0].load();
								me.video[0].poster = that.find('img').attr('src');
								me.video.show();
								me.videoWrap.find('img').hide();
								me.video[0].play();
							}
						}
					});
				}
				var postion = that.attr('date-wm_postion');
				muti_index = that.index();
				return false;
			});
		},

	}

	window.NetLive = NetLive;
})(window);

$(function(){
	var oNetLive = new NetLive(CONFIG.netlive);
	oNetLive.init();

});

//没有playurl时更换封面图
function get_img(img) { $('.t-img').attr('src',img) }

/*
//显示隐藏 多线路封面图
$(window).scroll(function(){
	if($(window).scrollTop()>0){
		$(".t-img").hide();
	}else{
		$(".t-img").hide();
	};
});
*/