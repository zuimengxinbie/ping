/**
 * Created by lenovo on 2017/2/13.
 */
var provinc;
var city_code;

var Request = new UrlSearch(); //实例化

isApp();

if(getcookie('provinc') == ''){
	addcookie('provinc','140');
	addcookie('provinc_name','山西省');
}

if(getcookie('city_code') == ''){
	addcookie('city_code','140100000000');
	addcookie('city_name','太原市');
}

$(function () {
	$.ajaxSettings.crossDomain = true;
	$.ajaxSettings.xhrFields = {
		withCredentials: true
	}

	isApp();

});

/*
(function($) {
    $.ajaxSetup({
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        }
    });
})(jQuery);*/


//正则匹配
var validator ={
	'mobile':/^1[3456789][0-9]{9}$/,
	'pay_pwd':/^[0-9]{6}$/,
};

function isApp(){
	var UserAgent = navigator.userAgent.toLowerCase();

	if((UserAgent.match(/lct_app/i) == "lct_app") || Request.isApp == 1){

		addcookie('isApp','1',24);

		getMember();

	}else{

		delCookie('isApp');

	}
}

function getCode($url){
	var qrcode = new QRCode(document.getElementById("qrcode"), {
		width : 100,
		height : 100,
		value:$url
	});
	qrcode.clear();
	qrcode.makeCode($url);
}


/**
 * 构造一个倒计时函数
 * @param countdown
 */
function settimeReciprocal(countdown,mobile,t) {

	voice_flg = false;
	if (countdown == 0) {
		$('#send_sms').text('重新发送');
		$('#send_sms').attr('class','ident-txt');
		$('#reciprocal').attr('class','f-time');

		$('.try-voice-grey')[0] ? $('.try-voice-grey').attr('onclick',"sendVoice("+mobile+","+t+")") : 'false';

		$('.try-voice-grey')[0] ? $('.try-voice-grey')[0].className = 'try-voice' : 'false';
		voice_flg = true;
		return;
	} else {
		countdown--;
	}
	$('#reciprocal').find('span').text(countdown);
	//过1秒后执行倒计时函数
	setTimeout(function() {settimeReciprocal(countdown,mobile,t)},1000)
}
/**
 * 设置cookie
 * @param {string} name  键名
 * @param {string} value 键值
 * @param {integer} days cookie周期
 */
function addcookie(name,value,hours) {
	if (hours) {
		var date = new Date();
		date.setTime(date.getTime()+(hours*3600*1000));
		var expires = "; expires="+date.toGMTString();
	}else{
		var expires = "";
	}
	document.cookie = name+"="+escape(value)+expires+"; path=/;domain=.lecuntao.com";
}

// 获取cookie
function getcookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = unescape(ca[i]);
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return "";
}

// 删除cookie
function delCookie(name) {
	addcookie(name,"",-1);
}

/**
 * 删除所有cookie
 */

function clearCookie(){
	var keys=document.cookie.match(/[^ =;]+(?=\=)/g);
	if (keys) {
		for (var i = keys.length; i--;){
			if(keys[i] == "provinc" || keys[i] == "city_code" || keys[i] == "provinc_name"  || keys[i] == "city_name"){

			}else{
				delCookie(keys[i]);
			}
		}
	}
}

function search_address(typeFlg,key_word) {
	if(typeFlg==0){
		jumpUrl('search','search.html?keyword='+key_word);
	}else if(typeFlg==1){
		jumpUrl('search','search_shop.html?store_name='+key_word);
	}
}
/**
 * 检测是否登录
 * @param state
 * @returns {boolean}
 */
function checklogin(){

	if(!getcookie('token')){

		goLogin();

	    return false;

    }else {
        return true;
    }

}

/**
 * 商家检测是否登录
 * @param state
 * @returns {boolean}
 */
function check_login_store(){

	if(!getcookie('store_token')){

		window.location.href = '/store/login/shop_login.html';
		return false;

	}else {
		return true;
	}

}


function goLogin() {

	delCookie('token');

	if(!getcookie('jump_url')){
		addcookie('jump_url',window.location.href,1);
	}

	if(isWeiXin()){

		window.location.href = WxLoginUrl+'&act=login&op=bindOpenid&client=checkWapLogin';

	}else if(IsPC()){
		var ref_url = encodeURIComponent(window.location.href);

		window.location.href = wwwSiteUrl+"/shop/index.php?act=login&op=index&ref_url="+ref_url;

	}else{

		if((Request.isApp == 1 || getcookie('isApp') == 1) && Request.isWap != 1){
			delCookie('jump_url');
			jumpUrl("index","?app_jump_url=login&url=login");
		}else{
			jumpUrl("index","login.html");
		}
	}
}

//调用微信自动登录
//判断是否微信登陆
function isWeiXin() {
	var ua = window.navigator.userAgent.toLowerCase();
	if (ua.match(/MicroMessenger/i) == 'micromessenger') {
		return true;
	} else {
		return false;
	}
}

/*
    返回上一页
 */
function historyBack() {
	if(getcookie("isApp") == 1){

		window.location.href = WapSiteUrl+"?app_jump_url=back_close";

	}else{

		history.go(-1);
	}


}
/**
 *发送语音验证码
 */
function sendVoice(phone,t) {
	var vali = validator.mobile;
	if (!vali.test(phone)) {
		alert('请填写正确手机号!');
		return false;
	}

	var result = false;
	$.ajax({
		url: ApiUrl,
		type: 'post',
		dataType: 'json',
		data: {async: false, 'mobile': phone, 'act': 'sms', 'op': 'send_voice', 't': t ,'key':getcookie('token')},
		async: false,
		success: function (data) {
			if (data.code != 200) {
				alert(data['msg']);
				result = false;
			} else {
				result = true;
			}
		},
	});
	return result;

}


/**
 * 发送验证码
 * @param phone 手机号
 * @param t     发送类型
 */
function send_sms(phone,t) {

    var sessid = null;

    var vali = validator.mobile;
    if (!vali.test(phone)) {
        alert('请填写正确手机号!');
        return false;
    }
    if(t==2 || t==1){
        var sessid = $(window.frames[0].document).find("#sessid").val();

    }
    var result = false;
    $.ajax({
        url: ApiUrl,
        type: 'post',
        dataType: 'json',

        data: {async: false, 'mobile': phone, 'act': 'sms', 'op': 'send_sms', 't': t ,'key':getcookie('token') ,'sessid':sessid},

        async: false,

        success: function (data) {


			if (data.code != 200) {
				alert(data['msg']);
                if(data.code == 4010){
                	$('#codeState').val('');
				}
 				return;

            } else {
                result = true;
            }
        },
    });
    return result;

}

//获取sessionId
function getSessionId(){

	var c_name = 'PHPSESSID';

	if(document.cookie.length>0){

		c_start=document.cookie.indexOf(c_name + "=")

		if(c_start!=-1){

			c_start=c_start + c_name.length+1

			c_end=document.cookie.indexOf(";",c_start)

			if(c_end==-1) c_end=document.cookie.length

			return unescape(document.cookie.substring(c_start,c_end));

		}

	}

}

//  获取参数
function UrlSearch()
{
	var name,value;
	var str = decodeURI(location.href); //取得整个地址栏
	var num = str.indexOf("?")
	str = str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]

	var arr = str.split("&"); //各个参数放到数组里
	for(var i = 0;i < arr.length;i++){
		num = arr[i].indexOf("=");
		if(num>0){
			name = arr[i].substring(0,num);
			value = arr[i].substr(num+1);
			this[name] = value;
		}
	}

}

//弹出浮层
function outPop(text,s) {
	$('#pop').css('display','block');
	$('#pop .pop-code').text(text);

	setTimeout(function() {
		$('#pop').css('display','none')
	},s)
}

//  URL跳转
function jumpUrl(model,url){
	if(getcookie("isApp") == 1 && Request.key){
		if(url.indexOf("?") >= 0){
			url += "&";
		}else{
			url += "?";
		}

		url += "key=" + Request.key;
	}
	window.location.href = WapSiteUrl+getSite(model)+url;
}

//样式
function mobileStyle(name,state,color){
	if(state){
		name.css("background", color);
	}else{
		name.css("background", color);
	}
	name.attr("disabled", state);
}

//  获取模块模板路径
function getSite(model){
	var jumpModel;
	switch(model)
	{
		case "pay":
			jumpModel = paySite;
			break;
		case "search":
			jumpModel = searchSite;
			break;
		case "member":
			jumpModel = memberSite;
			break;
		case "index":
			jumpModel = indexSite;
			break;
		case "goods":
			jumpModel = goodsSite;
			break;
		case "museum":
			jumpModel = museumSite;
			break;
		case "market":
			jumpModel = marketSite;
			break;
		case "about":
			jumpModel = aboutSite;
			break;
		case "account":
			jumpModel = accountSite;
			break;
		case "store":
			jumpModel = storeSite;
			break;
		case "refund":
			jumpModel = refundSite;
			break;
		case "world_goods":
			jumpModel = worldSite;
			break;
		case "address":
			jumpModel = addressSite;
			break;
		case "activity":
			jumpModel = activitySite;
			break;
		case "pin_tuan":
			jumpModel = "/tpl/pin_tuan/";
			break;
		default:
			jumpModel = indexSite;
	}
	return jumpModel;
}

//  自动定位省市（使用首先引入新浪api的js文件）
function orientation() {
	var province = ""; //remote_ip_info['province'];
	var city = "";//remote_ip_info['city'];

	//实例化城市查询类
	var citysearch = new AMap.CitySearch();
	//自动获取用户IP，返回当前城市
	citysearch.getLocalCity(function (status, result) {
		if (status === 'complete' && result.info === 'OK') {
			if (result && result.city && result.bounds) {

				city = result.city;
				province = result.province;

				if (province || city) {
					$.ajax({
						type: "POST",  //提交方式
						data: {city_name: city, province_name: province},
						dataType: 'json',
						url: ApiUrl + "&act=index&op=getCityId",//路径
						success: function (data) {//返回数据根据结果进行相应的处理
							if (data.code != 200) {
								//alert(data['msg']);
							} else {
								if (data.datas.province_id) {
									addcookie('provinc', data.datas.province_id);
									addcookie('provinc_name', province);
								}
								if (data.datas.city_id) {
									addcookie('city_code', data.datas.city_id);
									addcookie('city_name', city);
								}
								location.href = "/";
							}
						}
					});
				}
			}
		}
	});
}

//返回
function icon_ret(){

	jumpUrl("index","");

}

$("#local_home").on("click",function(){

	location.href = "http://home.lecuntao.com/index.html";
});

$("#local_pc").on("click",function(){

	location.href = "http://www.lecuntao.com/?isMobile=1";
});

function delMember(){

	delCookie('token');
	delCookie('member_name');
	delCookie('member_lev');
	delCookie('is_lxytyd');

}


function getMember(){

	if(Request.isApp == 1 || getcookie('isApp') == 1){

		addcookie('isApp','1',24);
		if(!Request.key){
			delMember();
		}

		if(Request.key && (Request.key != getcookie('token'))){

			// ajax 请求
			addcookie('token',Request.key,24);

			$.ajax({
				url: ApiUrl,
				type: 'post',
				dataType: 'json',
				data: {async: false, 'act': 'member', 'op': 'getMemberInfo','key':Request.key},
				async: false,
				success: function (data) {
					if (data.code == 200) {
						addcookie('token',data.datas.key,24);
						addcookie('member_name',data.datas.member_name,24);
						addcookie('member_lev',data.datas.member_lev,24);
						addcookie('is_lxytyd',data.datas.is_lxytyd,24);
					}else{
						delCookie('token');
					}
				},
			});

		}
	}else{
		delCookie('isApp');
	}
}

function IsPC()
{
	var userAgentInfo = navigator.userAgent.toLowerCase();
	var Agents = new Array("android", "iphone", "symbianos", "windows phone", "ipad", "ipod");
	var flag = true;
	for (var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
	}
	return flag;
}


