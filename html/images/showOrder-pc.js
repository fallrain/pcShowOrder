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

  var showOrderObj = {
    currentPage: 1
  };
  window.showOrderObj = showOrderObj;//对外释放的对象
  showOrderObj.showOrderList = function(currentPage, pageSize){
    /*查询晒单列表*/
    var url = urlObj.showOrderList;
    var params = {
      currentPage: showOrderObj.currentPage || 1,
      pageSize: pageSize || 9//默认为9个
    };
    Common.sendFormData(url, function(data){
      if(data.isSuccess){
        if(!data.data){
          showOrderObj.currentPage--;
          return;
        }
        var orderListHtml = genOrderListHtml(data.data.resultList);
        var orderListPar = $('#scrollDiv');
        //添加进去
        orderListPar.html(orderListHtml);
        $('.js-m-imgbox').off('click', showMyOrder)
        $('.js-m-imgbox').click(showMyOrder)
      }else{
        alert(data.resultMsg);
      }
    }, params);
  };
  var genOrderListHtml = function(data){
    /*组合晒单的html*/
    showOrderObj.ordsData = data;
    var len = data.length;
    var ul = $('<ul></ul>');
    for(var i = 0; i < len; i++){
      var ord = data[i];
      var img = $('<a class="js-m-imgbox m-imgbox" data-index="' + i + '"><img src="' + ord.showPics.split(',')[0] + '"/></a>');
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

  function fillInMyOrd(data){
    /*我的晒单信息*/
    $('#js-nosd').removeClass("z-blo");
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

  function toShowOrder(data){
    /*填写信息晒单*/
    $('#js-sd').removeClass("z-blo");
    $('#js-nosd').addClass("z-blo");
    var ordList = data.data.orderList;
    //<li>小厨师 空气炸锅 AF-F001</li>
    var ordListLen = ordList.length;
    var liAy = [];
    for(var i = 0; i < ordListLen; i++){
      var ord = ordList[i];
      var li = '<li data-id="' + ord.id + '" data-productID="' + ord.goods_id + '" data-orderId="' + ord.order_id + '" data-productDesc="' + ord.showContent + '">';
      li += ord.GOODS_NAME + '</li>';
      liAy.push(li);
    }
    $('#beShowOrd').html(liAy.join(''));
  }

  function showOederCheck(){
    /*判断是否晒单来判断*/
    var beShowurl = urlObj.isShowOrder;
    Common.sendFormData(beShowurl, function(data){
      if(data.isSuccess){
        var isshow = data.data.isshow;
        if(isshow == 0){//有数据
          $('#js-nosdt').addClass("z-blo");
        }
        if(isshow == 1){
          fillInMyOrd(data);
        }
      }
    });
  }

//图片上传绑定事件
  $.jUploader.setDefaults({
    cancelable: true, // 可取消上传
    allowedExtensions: ['jpg', 'png'], // 只允许上传图片
    messages: {
      upload: '上传',
      cancel: '取消',
      emptyFile: "{file} 为空，请选择一个文件.",
      //invalidExtension: "{file} 后缀名不合法. 只有 {extensions} 是允许的.",
      invalidExtension: "只能上传后缀名是 {extensions} 的图片。",
      onLeave: "文件正在上传，如果你现在离开，上传将会被取消。"
    }
  });
  var smtImgsAy = [];//保存图片的数组

  function bindUpImg(){
    /*图片都绑定上事件*/
    smtImgsAy = [];//开始就置空
    for(var i = 0; i < 5; i++){
      $.jUploader({
        button: 'upImg' + i, // 这里设置按钮id
        action: urlHead + '/showorder/showOrderPicUpload',
        // 开始上传事件
        onUpload: function(data){
        },
        // 上传完成事件
        onComplete: function(name, data){
          if(data.isSuccess){
            var picSrc = urlHead + data.data; //获取图片路径
            var btn = this.button;
            var img = btn.siblings('img');
            img.prop('src', picSrc);
            btn.css('display', 'none');
            img.css('display', 'block');
            var btnId = btn.prop('id');
            var btnIdNum = btnId.substr(btnId.length - 1) * 1 + 1;
            if(btnIdNum > 4){
              return;
            }
            $('#upImg' + btnIdNum).css('display', 'block');
            smtImgsAy.push(data);
          }else{
            alert(data.resultMsg);
          }
        },
        // 系统信息显示（例如后缀名不合法）
        showMessage: function(message){
        },
        // 取消上传事件
        onCancel: function(fileName){
        },
        debug: true
      });
    }
  }

  var upImg = function(data){
    /*上传图片的html*/
    var imglen = data.length;
    var upimgul = $('<ul class="m-upimg"></ul>');
    for(var i = 0; i < 5; i++){
      var ord = data[i];
      var upImg = $('<div class="js-m-imgbox m-imgbox"><img src=""/></div>');
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
        $tg.addClass('z-crt');
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

  function checkShowOrdForm(){
    /*校验表单*/
    var showContentStr = $('#showContent').val();
    var isContentSuc = checkNumOfContent(showContentStr);
    //检查图片
    var isImgSuc = true;
    if(smtImgsAy.length < 1){
      $('#upImgTip').css('display', 'block');
      isImgSuc = false;
    }else{
      $('#upImgTip').css('display', 'none');
    }
    var isOrdIdSuc = !!$('#js-name').html();
    if(!$('#js-name').html()){
      $('#ordSltTip').css('display', 'block');
    }else{
      $('#ordSltTip').css('display', 'none');
    }
    if(isContentSuc && isImgSuc && isOrdIdSuc){
      return true;
    }
  }

  function smtOrd(){
    /*提交晒单*/
    if(!checkShowOrdForm()){
      alert('请完整填写表单！');
      return;
    }
    var ordSlt = $('#js-name');
    var id = ordSlt.attr('data-id');
    var productID = ordSlt.attr('data-productID');
    var productDesc = ordSlt.attr('sata-productDesc');
    var orderId = ordSlt.attr('data-orderId');
    var showContent = $('#showContent').val();
    var showPics = smtImgsAy.join(',');
    var params = {
      id: id,
      productID: productID,
      productDesc: productDesc,
      orderId: orderId,
      showContent: showContent,
      showPics: showPics,
    };
    var url = urlObj.saveShowOrder;
    Common.sendFormData(url, function(data){
      if(data.isSuccess){
        $('#js-sdsuc').show();
      }else{
        //alert(data.resultMsg);
        $('#js-sdfail').show();
      }
    }, params);
  }

  function showMyOrder(){
    /*点击图片展示订单*/

    var $this = $(this);
    //去掉点赞的样式
    $('.z-rightzanbox').prop('disabled', false);
    $('.z-rightzanbox').removeClass('z-crt');

    var num = $this.attr('data-index');
    var ordData = showOrderObj.ordsData[num];
    showOrderObj.curMyOrdData = ordData;
    //slider_cont 大图 <li class="silder_panel clearfix"><a href="#"><img src="images/2012101623050497.jpg"/></a></li>
    //smImg 小缩略图 <li><a href="#"><i></i><img src="images/img-xcsl01.jpg"/></a></li>
    //myOrdId ID
    //myOrdDec 晒单内容
    //myOrdPrdDec 商品说明
    var showPicsAy = ordData.showPics.split(',');
    var picsLen = showPicsAy.length;
    var bigPicLiAy = [];
    var smPicLiAy = [];
    for(var i = 0; i < picsLen; i++){
      var pic = showPicsAy[i];
      var picSrc = urlHead + pic;
      bigPicLiAy.push('<li class="silder_panel clearfix"><a href="#"><img src="' + picSrc + '"/></a></li>');
      smPicLiAy.push('<li><a href="#"><i></i><img src="' + picSrc + '"/></a></li>');
    }
    $('#slider_cont').html(bigPicLiAy.join(''));//添加进大图
    $('#smImg').html(smPicLiAy.join(''));//添加进小图
    $('#myOrdId').html(ordData.productID);//产品ID
    $('#myOrdDec').html(ordData.showContent);
    $('#myOrdPrdDec').html(ordData.productDesc);

    $("#js-tc").addClass("z-blo");//显示弹层
  }

  function jumpPage(){
    /*翻页*/
    var $this = $(this);
    var type = $this.attr('data-jumps');
    if(type == 'pre'){
      if(--showOrderObj.currentPage < 1){
        showOrderObj.currentPage = 1;
      }
    }else{
      ++showOrderObj.currentPage;
    }
    showOrderObj.showOrderList();
  }

  function myOrdClickZan(){
    /*点赞事件*/
    var $this = $(this);
    $this.prop('disabled', true);
    var url = urlObj.saveAssist;
    var params = {
      showOrderId: showOrderObj.curMyOrdData.idsUserId
    };
    Common.sendFormData(url, function(data){
      if(data.isSuccess){
        $this.addClass('z-crt');
      }else{
        $this.prop('disabled', false);
        alert(data.resultMsg);
      }
    }, params);
  }

  function bindLis(){
    $('#scrollDiv').off('click');
    $('#scrollDiv').on('click', clickZan);
    $('#z-up').on('click', smtOrd);
    bindUpImg();//绑定上传图片事件
    $('.js-jump-page').on('click', jumpPage);
    $('.z-rightzanbox').click(myOrdClickZan);
  }

  (function init(){
    /*初始化页面*/
    showOederCheck();//晒单服务
    bindLis();//绑定事件
    showOrderObj.showOrderList();//查询列表页
  })();
})();