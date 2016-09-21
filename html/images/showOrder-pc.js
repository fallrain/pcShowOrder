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
  var urlHead = 'http://172.16.1.98:8089/';//url头部
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
        var orderListPar = $('$scrollDiv');
        //添加进去
        orderListPar.html(orderListHtml);
      }else{
        alert(data.resultMsg);
      }
    }, params);
  };
  var genOrderListHtml = function(data){
    /*组合晒单的html*/
    var returnHtml = '';
    var len = data.length;
  /*  <li>
    <a class="m-imgbox"><img src="images/img-sd07.jpg" alt=""/></a>
      <div class="m-contbox">
      <div class="m-leftname">ID：滴漏式咖啡机</div>
    <div class="m-rightzan">
      <a class="z-zan"></a>
      <div class="m-nubmer">51</div>
      </div>
      </div>
      </li>*/

    for(var i = 0; i < len; i++){
      var ord=data[i];
      var img=$('<a class="m-imgbox"><img src="'+ord.showPics.split(',')[0]+'"/></a>');
      var name=$('<div class="m-leftname">ID：'+ord.productID+'</div>');
      var zan =$('<a class="z-zan"></a>');
      //var zanNum=$('<div class="m-nubmer">'+ord.+'</div>');
    }
  };
})();