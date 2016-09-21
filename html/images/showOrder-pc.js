(function(){
  var beforeSendFn = function(ajaxRequest){
    ajaxRequest.setRequestHeader("Accept", "application/json");
  };
  var completeFn = function(){
  };
  var successFn = function(json){
    if(typeof json === 'string'){
      try{
        json = eval("(" + json + ")");
      }catch(e){
      }
    }
    this.callBack(json);
  };
  var errorFn = function(x, t, e){
    var data = {
      success: false
    };
    if(t == "timeout"){
      data.message = "请求超时";
    }else if(x.status == 404){
      data.message = "404:您访问的资源不存在";
    }else{
      data.message = "未知异常！源：" + (x && x.responseText) + "； 错误类型：" + t + "；异常：" + e;
    }
    this.callBack(data);
  };
  window.Common = {
    sendFormData: function(url, callBack, data, options){
      options = options || {};
      $.ajax($.extend({
        url: url,
        type: 'post',
        async: true,
        data: data,
        beforeSend: beforeSendFn,
        complete: completeFn,
        success: successFn,
        error: errorFn,
        callBack: callBack
      }, options));
    },
  };
  var urlHead = 'http://eshop.haier.com/';//url头部
  var urlObj = {
    isShowOrder: urlHead + '/showorder/isShowOrder',//判断用户是否晒单服务
    showOrderList: urlHead + '/showorder/showOrderList',//晒单活动列表页服务
    saveShowOrder: urlHead + '/showorder/saveShowOrder',//晒单保存服务
    saveAssist: urlHead + '/showorder/saveAssist',//晒单点赞服务
    showOrderPicUpload: urlHead + '/showorder/showOrderList',//上传图片保存
  };
  var showOrderObj = {};
  window.showOrderObj = showOrderObj;//对外释放的对象
  showOrderObj.showOrderList = function(currentPage, pageSize){
    /*查询晒单列表*/
    var url = urlObj.showOrderList;
    var params = {
      currentPage: currentPage,
      pageSize: !pageSize && 9//默认为9个
    };
    Common.sendFormData(url, function(data){
      if(data.isSuccess){
        var orderListHtml = genOrderListHtml(data.data.resultList);
        var orderListPar = $('#scrollDiv');
        //添加进去
        orderListPar.html(orderListHtml);
      }else{
        alert(data.resultMsg);
      }
    }, params);
  };
  var genOrderListHtml = function(data){
    /*组合晒单的html*/
    var len = data.length;
    var ul = $('<ul></ul>');
    for(var i = 0; i < len; i++){
      var ord = data[i];
      var img = $('<a class="m-imgbox"><img src="' + ord.showPics.split(',')[0] + '"/></a>');
      var name = $('<div class="m-leftname">ID：' + ord.productID + '</div>');
      var zan = $('<a class="z-zan" data-showOrderId="' + ord.idsUserId + '"></a>');
      var zanNum = $('<div class="m-nubmer">' + ord.assistcount + '</div>');
      var zanPar = $('<div class="m-rightzan"></div>');
      zanPar.append(zan);
      zanPar.append(zanNum);
      var content = $('<div class="m-contbox"></div>');
      content.append(name);
      content.append(zanPar);
      var li = $('<li></li>');
      li.append(img);
      li.append(content);
      ul.append(li);
    }
    return ul;
  };

  function clickZan(e){
    /*点赞事件*/
    var tg = e.target;
    var $tg = $(tg);
    if(!$tg.hasClass('z-zan')){
      return;
    }
    var url = urlObj.saveAssist;
    var params = {
      showOrderId: $tg.attr('data-showOrderId')
    };
    Common.sendFormData(url, function(data){
      if(data.isSuccess){
        var $zanNum = $($tg.siblings('.m-nubmer'));
        var num = $zanNum.html() * 1;
        $zanNum.html(++num);
      }else{
        alert(data.resultMsg);
      }
    }, params);
  }

  function bindLis(){
    $('#scrollDiv').off('click');
    $('#scrollDiv').on('click', clickZan);
  }

  (function init(){
    /*初始化页面*/
    bindLis();//绑定事件
    showOrderObj.showOrderList();//查询列表页

  })();
})();