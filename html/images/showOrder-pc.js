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
  var urlHead = 'http://123.103.113.66';//url头部
  var urlObj = {
    isShowOrder: urlHead + '/showorder/isShowOrder',//判断用户是否晒单服务
    showOrderList: urlHead + '/showorder/showOrderList',//晒单活动列表页服务
    saveShowOrder: urlHead + '/showorder/saveShowOrder',//晒单保存服务
    saveAssist: urlHead + '/showorder/saveAssist',//晒单点赞服务
    showOrderPicUpload: urlHead + '/showorder/showOrderList',//上传图片保存
  };


  function showOederCheck(){
    var beShowurl = urlObj.isShowOrder;
    Common.sendFormData(beShowurl, function(data){
      if(data.isSuccess){
        var isshow = data.data.isshow;
        if(isshow == 0){//有数据
          $('#js-nosdt').addClass("z-blo");
        }
        if(isshow == 11){
          $('#js-sd').addClass("z-blo");
          var order = data.data.showOrder;
          var showOrderPar = $('#js-sd');
          var proName = $('#js-sdname');
          proName.html(order.productDesc);
          var proNum = $('#js-sdOrderId');
          proNum.html(order.orderId);
          var proCont = $('#js-sdcont');
          proCont.html(order.showContent);
          var proClickzan = $('#js-dznum');
          proClickzan.html(order.assistcount);

          var showOrderImgPar = $('#js-sdpics');
          var showPics = order.showPics.split(',');
          var picLen = showPics.length;
          for(var i = 0; i < picLen; i++){
            var pic = showPics[i];
            var img = $('<img src="' + pic + '"/>');
            var imgPar = $('<div class="m-listimg"></div>');
            imgPar.append(img);
          }
          showOrderImgPar.html(imgPar);
        }
      }
    });
  }


  var showOrderObj = {};
  window.showOrderObj = showOrderObj;//对外释放的对象
  showOrderObj.showOrderList = function(currentPage, pageSize){
    /*查询晒单列表*/
    var url = urlObj.showOrderList;
    var params = {
      currentPage: currentPage || 1,
      pageSize: pageSize || 9//默认为9个
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

  var upImg = function(data){
    /*上传图片的html*/
    var imglen = data.length;
    var upimgul = $('<ul class="m-upimg"></ul>');
    for(var i = 0; i < 5; i++){
      var ord = data[i];
      var upImg = $('<div class="m-imgbox"><img src=""/></div>');
      var btnImg = $('<a class="z-add"></a>');
      var btnSave = $('<a class="z-up"></a>');
      var li = $('<li></li>');
      li.append(btnImg);
      li.append(upImg);
      li.append(btnSave);
      upimgul.append(li);
    }
  };

  function clickZan(e){
    /*点赞事件*/
    var tg = e.target;
    var $tg = $(tg);
    if(!$tg.hasClass('z-zan')){
      return;
    }
    $tg.prop('disabled', true);
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
        $tg.prop('disabled', false);
        alert(data.resultMsg);
      }
    }, params);
  }

  function checkNumOfContent(str){
    /*检查字数*/
    var len = str.split('').length;
    if(len > 10 && len <= 100){
      $('#showContentTip').html('输入晒单文字不得少于10个字多于100个字');
      return true;
    }
    $('#showContentTip').html('输入错误！输入晒单文字不得少于10个字多于100个字');
  }

  function smtOrd(){
    /*提交晒单*/
    var showContentStr=$('#showContent').val();
    checkNumOfContent(showContentStr);
  }

  function bindLis(){
    $('#scrollDiv').off('click');
    $('#scrollDiv').on('click', clickZan);
    $('#z-up').on('click', smtOrd);
  }

  (function init(){
    /*初始化页面*/
    showOederCheck();//晒单服务
    bindLis();//绑定事件
    showOrderObj.showOrderList();//查询列表页
  })();
})();