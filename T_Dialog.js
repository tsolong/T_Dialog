//检测浏览器版本和类型
var T_Browser = {
    version : (navigator.userAgent.toLowerCase().match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
    msie : /msie/.test(navigator.userAgent.toLowerCase()) && !/opera/.test(navigator.userAgent.toLowerCase()),
    mozilla : /mozilla/.test(navigator.userAgent.toLowerCase()) && !/(compatible|webkit)/.test(navigator.userAgent.toLowerCase()),
    opera : /opera/.test(navigator.userAgent.toLowerCase()),
    safari : /webkit/.test(navigator.userAgent.toLowerCase())
};

//检测IE6浏览器
var T_IE6 = (T_Browser.msie && T_Browser.version == "6.0") ? true : false;

//定义zIndex起始值
var T_zIndex = 10000;

/*
 * Name: T_Mask
 * Author: Tsolong
 * Q   Q: 415802721
 * Email: tsolong@126.com
 * Create Date: 2013-03-29
 * Last Update: 2013-05-15
 *
 * Description: 网页遮罩层
 * -------------------------
 * 支持用new关键字创建多个遮罩层，每个遮罩层互不影响
 * 支持网页内容垂直或水平滚动时和改变浏览器窗口大小时的全方位遮罩效果
 * 支持IE6+以及其它主流浏览器,IE6采用absolute定位，其它浏览器采用fixed定位
 * 支持淡入淡出效果，fade参数为true时，则打开和关闭都使用淡入淡出效果，false时，则打开和关闭都不使用
 *
 * Parameter:
 * -------------------------
 * fade     打开和关闭遮罩层时是否使用淡入淡出效果，默认false，参数可选值(true、false)，可选参数
 *
 * Example:
 * -------------------------
 * 创建一个遮罩层
 * var mask = new T_Mask(true);
 * 关闭遮罩层
 * mask.close();
 */

T_Mask = function(fade) {

    fade = fade || false;

    var maskDiv = $("<div class=\"T_Mask\"></div>");

    function scrollFun() {
        maskDiv.css({
            "left" : $(document).scrollLeft() + "px",
            "top" : $(document).scrollTop() + "px"
        });
    }

    function resizeFun() {
        maskDiv.css({
            "width" : $(window).width() + "px",
            "height" : $(window).height() + "px"
        });
    }

    function showFun() {
        maskDiv.css({
            "width" : $(window).width() + "px",
            "height" : $(window).height() + "px",
            "left" : "0px",
            "top" : "0px",
            "position" : T_IE6 ? "absolute" : "fixed",
            "zIndex" : ++T_zIndex,
            "backgroundColor" : "#000",
            "opacity" : fade ? "0" : "0.7"
        });

        if (maskDiv.css("position") == "absolute") {
            scrollFun();
            $(window).scroll(scrollFun);
        }
        $(window).resize(resizeFun);

        maskDiv.appendTo($("body"));

        if (fade) {
            maskDiv.fadeTo(200, 0.7);
        }
    }

    function closeFun() {
        if (maskDiv.css("position") == "absolute") {
            $(window).unbind("scroll", scrollFun);
        }
        $(window).unbind("resize", resizeFun);

        maskDiv.remove();
        maskDiv = null;
    }


    this.close = function() {
        this.close = function() {
            alert("mask is closed");
        };
        if (maskDiv != null) {
            if (fade) {
                maskDiv.fadeTo(200, 0, function() {
                    closeFun();
                });
            } else {
                closeFun();
            }
        }
    }
    showFun();
}
/*
 * Name: T_Drag
 * Author: Tsolong
 * Q   Q: 415802721
 * Email: tsolong@126.com
 * Create Date: 2013-03-29
 * Last Update: 2013-05-15
 *
 * Description: 网页拖拽函数
 * -------------------------
 * 参数dragObj和moveObj必须是一个jQuery对象，否则不添加拖拽功能，即无任何效果
 * 调用拖拽函数前，请先设置好元素的定位方式，支持absolute定位或fixed定位，IE6只支持absolute定位，在IE6下若设置成fixed定位则不添加拖拽功能，即无任何效果
 * 尽量把移动块的html代码放在body节点下面，不要使用嵌套定位，以免造成获取元素的绝对位置不正确，从而达不到预期的效果
 * 支持快速拖拽，所有浏览器均无卡或延迟的问题
 * 支持只允许在当前浏览器可视窗口范围内拖拽
 * 支持IE6+以及其它主流浏览器
 *
 * Parameter:
 * -------------------------
 * options     参数集对象，默认参数集见函数中，参数类型(Object)，必选参数
 *
 * Example:
 * -------------------------
 * T_Drag({
 *      "dragObj" : jQuery_dragObj,
 *      "moveObj" : jQuery_moveObj,
 *      "window" : true
 * })；
 */

T_Drag = function(options) {

    var op = {
        "dragObj" : null, //鼠标拖拽的元素，默认null，参数必须是一个jQuery对象，若不是则不添加拖拽功能，必选参数
        "moveObj" : null, //拖拽时移动的元素，默认null，参数必须是一个jQuery对象，若不是则不添加拖拽功能，必选参数
        "window" : false //只允许在浏览器可视窗口内拖拽，默认false，参数可选值(true、false)，可选参数
    };

    if ( typeof (options) == "object") {
        for (var x in options) {
            op[x] = options[x];
        }
    }

    if (op.dragObj != null && typeof (op.dragObj) == "object" && op.dragObj[0] && op.moveObj != null && typeof (op.moveObj) == "object" && op.moveObj[0]) {

        var pos = op.moveObj.css("position");
        if (pos == "absolute" || (pos == "fixed" && !T_IE6)) {

            op.moveObj.mousedown(function() {
                $(this).css("zIndex", ++T_zIndex);
            });
            /*
            * 为了解决在IE8、9、10下产生拖动不流畅的问题，所以在dragObj.mousedown和document.mousemove两个事件处理函数末尾添加了return false语句来解决该问题
            * 但这样添加了return false则阻止了mousedown的事件冒泡，从而moveObj.mousedown事件得不到调用，则单击拖动对象时不能将该对象的zIndex置于最顶层
            * 只好将标准添加事件的写法  op.dragObj.mousedown(T_Drag.start)
            * 换成不标准的写法即  op.dragObj[0].onmousedown = T_Drag.start
            * 这样才能确保既不去掉return false语句让对象拖动流畅，又能实现点击将对象置于顶层
            */
            //op.dragObj.mousedown(T_Drag.start);
            op.dragObj[0].onmousedown = T_Drag.start;
            //保存拖动时需要用到的参数选项
            op.dragObj[0].options = op;
            op.dragObj.css("cursor", "move");
        }
    }
}
T_Drag.start = function(e) {

    e = window.event || e;
    //保存当前拖动的对象
    T_Drag.currentDragObj = this;
    var op = T_Drag.currentDragObj.options;

    var left = parseInt(op.moveObj[0].offsetLeft);
    var top = parseInt(op.moveObj[0].offsetTop);

    op.moveObj[0].lastMouseX = parseInt(e.clientX);
    op.moveObj[0].lastMouseY = parseInt(e.clientY);

    //计算并保存对象允许拖动的坐标范围
    if (op.window) {
        op.moveObj[0].minMouseX = parseInt(e.clientX) - left;
        op.moveObj[0].minMouseY = parseInt(e.clientY) - top;
        if (op.moveObj.css("position") == "absolute") {
            op.moveObj[0].minMouseX += parseInt($(document).scrollLeft());
            op.moveObj[0].minMouseY += parseInt($(document).scrollTop());
        }
        op.moveObj[0].maxMouseX = op.moveObj[0].minMouseX + parseInt($(window).width()) - parseInt(op.moveObj.outerWidth());
        op.moveObj[0].maxMouseY = op.moveObj[0].minMouseY + parseInt($(window).height()) - parseInt(op.moveObj.outerHeight());
    }

    $(document).mousemove(T_Drag.move);
    $(document).mouseup(T_Drag.end);

    //用于解决在IE8、9、10下产生拖动不流畅的问题
    return false;
}
T_Drag.move = function(e) {

    e = window.event || e;
    var op = T_Drag.currentDragObj.options;

    var left = parseInt(op.moveObj[0].offsetLeft);
    var top = parseInt(op.moveObj[0].offsetTop);

    var mouseX = parseInt(e.clientX);
    var mouseY = parseInt(e.clientY);

    if (op.window) {
        mouseX = Math.max(mouseX, op.moveObj[0].minMouseX);
        mouseY = Math.max(mouseY, op.moveObj[0].minMouseY);
        mouseX = Math.min(mouseX, op.moveObj[0].maxMouseX);
        mouseY = Math.min(mouseY, op.moveObj[0].maxMouseY);
    }

    op.moveObj.css({
        "left" : left + (mouseX - op.moveObj[0].lastMouseX) + "px",
        "top" : top + (mouseY - op.moveObj[0].lastMouseY) + "px"
    });

    op.moveObj[0].lastMouseX = mouseX;
    op.moveObj[0].lastMouseY = mouseY;

    //用于解决在IE8下产生拖动不流畅的问题
    return false;
}
T_Drag.end = function() {
    var op = T_Drag.currentDragObj.options;

    $(document).unbind("mousemove", T_Drag.move);
    $(document).unbind("mouseup", T_Drag.end);

    //清出对象允许拖动的坐标范围
    if (op.window) {
        op.moveObj[0].minMouseX = null;
        op.moveObj[0].minMouseY = null;
        op.moveObj[0].maxMouseX = null;
        op.moveObj[0].maxMouseY = null;
    }

    //清出当前拖动的对象
    T_Drag.currentDragObj = null;
}
/*
 * Name: T_Dialog
 * Author: Tsolong
 * Q   Q: 415802721
 * Email: tsolong@126.com
 * Create Date: 2013-03-29
 * Last Update: 2013-05-15
 *
 * Description: 网页对话框
 * -------------------------
 * 支持IE6+以及其它主流浏览器
 * 支持5种对话框类型(alert,warning,success,error,confirm)
 * 支持自定义按钮文本
 * 支持3种定位方式(自定义位置，可视窗口居中，可视窗居中并固定)这3种位置都是相对于当前浏览器可视窗口的定位
 * 支持对话框和遮罩层在打开或关闭时使用淡入淡出效果
 * 支持遮罩层
 * 支持拖拽，拖拽过程中顺畅不卡，可设置只允许在当前浏览器可视窗口范围内拖拽
 * 支持回调函数，根据判断button的值，即可获取到用户是点了哪了按钮关闭了对话框
 *
 * Parameter:
 * -------------------------
 * options     参数集对象，默认参数集见函数中，参数类型(Object)，必选参数
 *
 * Example:
 * -------------------------
 * 创建一个确认对话框
 * var myDialog = new T_Dialog({
 *      "type" : "confirm",
 *      "title" : "系统确认",
 *      "msg" : "您确认要删除这些数据吗？",
 *      "fade" : true,
 *      "callBack" : function(button) {
 *          new T_Dialog({
 *              "msg" : "您选择了 " + button + " 按钮"
 *          });
 *      }
 * })；
 * 手动关闭指定的对话框
 * myDialog.close();
 */

T_Dialog = function(options) {

    //default options
    this.op = {
        "type" : "alert", //对话框类型，目前支持5种对话框，默认alert，参数可选值(alert,warning,success,error,confirm)，可选参数，(prompt,custom,iframe)这三种类型将在后续功能中开发
        "title" : "系统提示", //对话框标题，默认"系统提示"，参数类型(String)，可选参数
        "msg" : "系统提示", //对话框提示信息，默认"系统提示"，参数类型(String)，可选参数
        "text" : {
            "close" : "关闭", //关闭按钮提示文本 ，默认"关闭"，参数类型(String)，可选参数
            "confirm" : "确定", //确定按钮文本，默认"确定"，参数类型(String)，可选参数
            "cancel" : "取消"//取消按钮文本，默认"取消"，参数类型(String)，可选参数
        }, //对话框相关文本，可选参数
        "width" : "300", //对话框宽度(不含padding border margin) ，默认"300"，参数类型(String，Number)，不要在参数后面加"px"，可选参数
        "height" : "200", //此参数暂时不可用，在后续开发其它类型的对话框时才使用，only support dialog type (custom and iframe)
        "left" : "centerFixed", //对话框左侧位置，默认"centerFixed"，参数可选值(String or Number[当前可视窗口一个自定义位置],center[当前可视窗口居中],centerFixed[当前可视窗口居中并固定])，可选参数
        "top" : "centerFixed", //对话框顶部位置，参数默认值和参数可选值同left一样，可选参数，注：(只有把left和top同时设置成center或centerFixed时，才能达到居中或居中固定的效果，即：left:center,top:center或left:centerFixed,top:centerFixed，自定义位置设置：left:100,top:100)
        "fade" : false, //打开和关闭对话框时是否使用淡入淡出效果，默认false，参数可选值(true、false)，可选参数，注：(当对话框的遮罩层打开时，fade:true，对话框和遮罩层在打开或关闭的时候都使用淡入淡出效果，fade:false，则都不使用)
        "mask" : true, //是否打开网页遮罩层，默认true，参数可选值(true、false)，可选参数
        "drag" : {
            "open" : true, //是否允许对话框可拖拽，默认true，参数可选值(true、false)，可选参数
            "window" : true //只允许在浏览器可视窗口内拖拽，默认true，参数可选值(true、false)，可选参数
        }, //对话框拖拽，可选参数
        "callBack" : null//当对话框关闭后的回调函数，默认null，参数类型(Function)，可选参数，注：(回调函数可接受一个button参数，button参数值[close,confirm,cancel]，用于在回调函数中判断是点了哪个按钮关闭了对话框，如：callBack:function(button){alert(button)})
    };

    //replace the new options
    if ( typeof (options) == "object") {
        for (var x in options) {
            if ( typeof (options[x]) == "object") {
                for (var xx in options[x]) {
                    this.op[x][xx] = options[x][xx];
                }
            } else {
                this.op[x] = options[x];
            }
        }
    }

    //init
    this.init();
}
T_Dialog.prototype = {
    //此方法供内部使用，请勿调用
    "init" : function() {

        //save this
        var oThis = this;

        //create the mask
        if (this.op.mask) {
            this.mask = new T_Mask(this.op.fade);
        }

        //create the dialog html
        this.Dialog = $("<div class=\"T_Dialog\"></div>");
        var Dialog_Top = $("<div class=\"T_Dialog_Top\">" + this.op.title + "</div>");
        var Dialog_Close = $("<a class=\"T_Dialog_Close\" title=\"" + this.op.text.close + "\"></a>");
        var Dialog_Middle = $("<div class=\"T_Dialog_Middle\"></div>");
        var Dialog_Msg = $("<div class=\"T_Dialog_Msg T_Dialog_" + this.op.type + "\">" + this.op.msg + "</div>");
        var Dialog_Control = $("<div class=\"T_Dialog_Control\"></div>");
        var Dialog_confirmBtn = $("<button type=\"button\" class=\"T_Dialog_Button\">" + this.op.text.confirm + "</button>");

        //hover function
        function hoverFun(obj, className) {
            obj.bind("mouseenter mouseleave", function() {
                $(this).toggleClass(className);
            });
        }

        //button hover event
        hoverFun(Dialog_Close, "T_Dialog_Close_Hover");
        hoverFun(Dialog_confirmBtn, "T_Dialog_Button_Hover");

        //button click event
        Dialog_Close.click(function() {
            oThis.close("close");
        });
        Dialog_confirmBtn.click(function() {
            oThis.close("confirm");
        });

        //create the cancel button html
        if (this.op.type == "confirm") {
            var Dialog_cancelBtn = $("<button type=\"button\" class=\"T_Dialog_Button\">" + this.op.text.cancel + "</button>");
            //button hover event
            hoverFun(Dialog_cancelBtn, "T_Dialog_Button_Hover");
            //button click event
            Dialog_cancelBtn.click(function() {
                oThis.close("cancel");
            });
        }

        //append element
        Dialog_Top.append(Dialog_Close).appendTo(this.Dialog);
        this.op.type == "confirm" ? Dialog_Control.append(Dialog_confirmBtn).append(Dialog_cancelBtn) : Dialog_Control.append(Dialog_confirmBtn);
        Dialog_Middle.append(Dialog_Msg).append(Dialog_Control).appendTo(this.Dialog);

        //settinngs css
        this.Dialog.css({
            "width" : this.op.width + "px",
            "position" : "absolute",
            "left" : "0px",
            "top" : "0px",
            "opacity" : "0",
            "zIndex" : ++T_zIndex
        });

        //先将Dialog添加到页面中，设置完全透明，若不这样，在下面设置Dialog居中时会产生计算的坐标并不是完全居中于当前视窗的，因为在元素没有附加到页面中时，获取对话框的宽和高是不精确的
        $("body").append(this.Dialog);

        //center function
        function centerFun() {
            var x = (parseInt($(window).width()) - parseInt(this.Dialog.outerWidth())) / 2;
            var y = (parseInt($(window).height()) - parseInt(this.Dialog.outerHeight())) / 2;
            if (this.Dialog.css("position") == "absolute") {
                x += parseInt($(document).scrollLeft());
                y += parseInt($(document).scrollTop());
            }
            this.Dialog.css({
                "left" : x + "px",
                "top" : y + "px"
            });
        }


        this.center = function() {
            centerFun.apply(oThis);
        }
        //init position
        if (parseInt(this.op.left) && parseInt(this.op.top)) {
            this.Dialog.css({
                "left" : parseInt(this.op.left) + parseInt($(document).scrollLeft()) + "px",
                "top" : parseInt(this.op.top) + parseInt($(document).scrollTop()) + "px"
            });
        } else if (this.op.left == "center" && this.op.top == "center") {
            this.center();
        } else if (this.op.left == "centerFixed" && this.op.top == "centerFixed") {
            if (!T_IE6) {
                this.Dialog.css({
                    "position" : "fixed"
                });
            }
            this.center();

            //window scroll and resize event
            $(window).scroll(this.center);
            $(window).resize(this.center);

        } else {
            this.center();
        }

        //drag
        if (this.op.drag.open) {
            T_Drag({
                "dragObj" : Dialog_Top,
                "moveObj" : this.Dialog,
                "window" : this.op.drag.window
            });
        }

        //focus function
        function focusFun() {
            var dialogType = this.op.type;
            if (dialogType == "alert" || dialogType == "warning" || dialogType == "success" || dialogType == "error") {
                Dialog_confirmBtn.focus();
            } else if (dialogType == "confirm") {
                Dialog_cancelBtn.focus();
            }

            //T_Dialog.queue
            if (T_Dialog_queue_locked) {
                T_Dialog.queue.show();
            }
        }

        //show dialog
        if (this.op.fade) {
            this.Dialog.fadeTo(200, 1, function() {
                //focus
                focusFun.apply(oThis);
            });
        } else {
            this.Dialog.css("opacity", "1");
            //focus
            focusFun.apply(this);
        }
    },
    //关闭对话框函数，供外部实例化的对象调用
    "close" : function(button) {

        //replace the this.close()
        this.close = function() {
            alert("dialog is closed");
        };

        //close function
        function closeFun() {
            //remove window scroll and resize event
            if (this.op.left == "centerFixed" || this.op.top == "centerFixed") {
                $(window).unbind("scroll", this.center);
                $(window).unbind("resize", this.center);
            }

            this.Dialog.remove();
            this.Dialog = null

            //callBack
            var callBack = this.op.callBack;
            this.op = null;
            if (callBack != null && typeof (callBack) == "function") {
                callBack(button);
            }
        }

        //close
        if (this.Dialog != null) {
            //close mask
            if (this.op.mask && this.mask != null) {
                this.mask.close();
                this.mask = null;
            }
            //close dialog
            if (this.op.fade) {
                var oThis = this;
                this.Dialog.fadeOut(200, function() {
                    closeFun.apply(oThis);
                });
            } else {
                closeFun.apply(this);
            }
        }
    }
}

//保存每一个对话框创建时需要的options参数
var T_Dialog_queue_list = [];

//队列创建对话框过程中的一个锁，默认打开
var T_Dialog_queue_locked = false;

/*
 * Name: T_Dialog.queue
 * Author: Tsolong
 * Q   Q: 415802721
 * Email: tsolong@126.com
 * Create Date: 2013-03-29
 * Last Update: 2013-05-15
 *
 * Description: 网页对话框队列函数
 * -------------------------
 * 当同时需要创建多个对话框时，则可以调用此队列函数，来实现每一个对话框依次创建
 * 缺点：不能保存每一个创建的对话框实例
 *
 * Parameter:
 * -------------------------
 * options     参数集对象，同T_Dialog函数的options参数一样
 *
 * Example:
 * -------------------------
 * T_Dialog.queue({
 *      "type" : "alert",
 *      "title" : "系统提示",
 *      "msg" : "请输入您的用户名",
 *      "fade" : true,
 *      "mask" : false
 * });
 * T_Dialog.queue({
 *      "type" : "warning",
 *      "title" : "系统警告",
 *      "msg" : "您的密码过于简单，请即时修改",
 *      "fade" : true,
 *      "mask" : false
 * });
 */

T_Dialog.queue = function(options) {
    T_Dialog_queue_list.push(options);
    if (T_Dialog_queue_list.length > 0 && !T_Dialog_queue_locked) {
        //locked-锁住
        T_Dialog_queue_locked = true;
        T_Dialog.queue.show();
    }
}
//此函数供内部调用
T_Dialog.queue.show = function() {
    if (T_Dialog_queue_list.length > 0) {
        var options = T_Dialog_queue_list[0];
        T_Dialog_queue_list.shift();
        new T_Dialog(options);
    } else {
        //locked-打开
        T_Dialog_queue_locked = false;
    }
}
