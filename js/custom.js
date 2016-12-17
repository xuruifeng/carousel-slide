function Custom(){};

/**
 * 获取视口的宽度高度(不包括滚动条)
 *
 * offsetWidth 表示带边框width+padding*2（左右两个）+border*2（左右两个）
 * document.documentElement.clientHeight    这个获取到的是当前视口的高度
 * documentElement 表示的应该是html根元素
 * document.documentElement.offsetHeight    这个获取到的是body的height的值    很奇怪  chrome49.0.2623.75
 */
Custom.prototype.getViewportClientWH = function(){
    var json = {};
    json.width = document.body.clientWidth;
    json.height = document.body.clientHeight;
    return json;
}

/**
 * 获取视口的宽度高度(包括滚动条)
 * 主要是为了跟媒体查询配对使用，媒体查询的width是带滚动条的width
 * 应该是属于比较新的属性，用的时候要注意判断浏览器是否支持这个属性
 */
Custom.prototype.getViewportMediaWH = function(){
    var json = {};
    json.width = window.innerWidth;
    json.height = window.innerHeight;
    return json;
}

/**
 * 通过元素id获取到元素的width和height  (不带单位，number类型)
 * @param id
 */
Custom.prototype.getEleWHToId = function(id){
    var ele = document.getElementById(id);
    var json = {};
    json.width = ele.offsetWidth;
    json.height = ele.offsetHeight;
    return json;
}

/**
 * 通过元素className获取到元素的width和height（这个className在一个页面中只能出现一次）
 * @param className
 */
Custom.prototype.getEleWHToClassName = function(className){
    var ele = document.getElementsByClassName(className);
    var json = {};
    json.width = ele.offsetWidth;
    json.height = ele.offsetHeight;
    return json;
}

/**
 * 判断是否是pc访问
 */
Custom.prototype.IsPC = function(){
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
    }
    return flag;
}

/**
 * 判断浏览器是否支持某个css样式属性，如果支持返回样式name，如果不支持，返回null
 * @param syName    必须是公共css属性名
 * @returns {*}
 */
Custom.prototype.isCssStyleName = function(syName){
    var csNames = document.documentElement.style ? document.documentElement.style : document.body.style;
    var syNames = [];
    syNames.push(syName);
    syNames.push("-webkit-" + syName);
    syNames.push("-moz-" + syName);
    syNames.push("-ms-" + syName);
    syNames.push("-o-" + syName);
    var length = syNames.length;
    for(var i = 0; i<length; i++){
        if(syNames[i] in csNames){
            return syNames[i];
        }
    }
    return null;
}

/**
 * 某一元素的相同事件不覆盖而是叠加
 * @param ele           js元素对象
 * @param eventName     触发事件的名称例如：onmouseover，onclick等
 * @param func          新添加的事件方法
 */
Custom.prototype.addEvent = function(ele,eventName,func) {
    var funcLast = ele[eventName];
    if (typeof funcLast != "function") {
        ele[eventName] = func;
    } else {
        ele[eventName] = function () {
            funcLast();
            func();
        }
    }
}

/**
 * 通过jquery对象获取当前元素相对于页面的坐标位置
 * topY,bootomY,leftX,rightX
 * @param $ele
 */
Custom.prototype.getPosition = function($ele){
    var json = {};
    json.topY = $ele.offset().top;
    json.bottomY = $ele.offset().top + $ele.outerHeight();
    json.leftX = $ele.offset().left;
    json.rightX = $ele.offset().left + $ele.outerWidth();
    return json;
}

/**
 * 判断浏览器是否支持指定事件    如果支持返回支持的事件名称，如果不支持返回""
 * @param ele           js元素对象
 * @param eventName     事件名称（例如：onclick，onmouseover）    事件名称前不能有前缀（浏览器私有属性的前缀）
 * @returns {*}
 */
Custom.prototype.isSupportEvent = function(ele,eventName){
    //通过查找原型链上的方法来判断事件是否在其中，进而判断是否支持着个事件名称   问题是原型链是一层一层的找，而这里只写了一层
    //return (eventName in ele.__proto__);

    //首先在数组中加入公共的事件名称，然后分别加入不同的私有事件名称（优选选用公共的事件名称   浏览器私有事件名称一般被测试使用，不完善）
    var syNames = [];
    syNames.push(eventName);
    syNames.push("-webkit-" + eventName);
    syNames.push("-moz-" + eventName);
    syNames.push("-ms-" + eventName);
    syNames.push("-o-" + eventName);
    var length = syNames.length;
    /**
     * 根据类型判断
     *      如果某个元素没有着个事件名称，                                         则typeof 是 undefined      值是  undefined
     *      如果某个元素有着个事件的名称，但是这个事件没有被赋值（function(){}）,  则typeof 是 Object         值是  null
     *      如果某个元素有着个事件的名称，但是这个事件有被赋值（function(){}）,    则typeof 是 function         值是  赋予的function方法
     */
    for(var i=0;i<length;i++){
        if(typeof ele[syNames[i]] != "undefined"){
            return syNames[i];
        }else{
            return "";
        }
    }
}

/**
 *根据传入的两个参数，在html查找是否存在这样的dom对象，如果存在返回true，不存在返回false
 * @param eleSting  传入string
 * @param typeName  传入string的类型  "id","className","tagName"
 */
Custom.prototype.isDomdefine = function(eleSting,typeName){
    if(typeof eleSting === "undefined" || typeof typeName === "undefined"){
        console.log("Custom isDomdefine必须传递两个参数");
        return false;
    }
    switch(typeName){
        case "id":
            if(document.getElementById(eleSting)){
                return true;
            }else{
                return false;
            }
            break;
        case "className":
            //不论是否找到，都会返回一个数组
            if(document.getElementsByClassName(eleSting).length !== 0 ){
                return true;
            }else{
                return false;
            }
            break;
        case "tagName":
            if(document.getElementsByTagName(eleSting).length !== 0 ){
                return true;
            }else{
                return false;
            }
            break;
    }
}

/**
 * 判断传入的参数是否存在  存在返回参数，不存在返回false（不能返回参数本身，如果参数是""，则用if判断出的是false，所以无法链式调用）
 * function在调用参数的时候，会自动初始化参数，因此就算没有传递参数，参数也会被初始化，没有传递的参数的typeof是undefined
 * "".cc这个不会报错，会返回undefined   但是如果是undefined.cc这个会报错
 * @param param
 */
Custom.prototype.isUndefined = function(param){
    if(typeof param === "undefined"){
        return true;
    }else{
        return false;
    }
}

/**
 * 判断传入的参数数据类型是否是string
 * @param string
 */
Custom.prototype.isString = function(paramString){
    if(typeof paramString === "string"){
        return true;
    }else{
        return false;
    }
}

/**
 * 判断传入参数是否string类型，并且不是""或者"  "    是string并且不是空格返回true  否则返回false
 * @param paramString
 */
Custom.prototype.isStringNotBlank = function(paramString){
    if(typeof paramString !== "string"){
        console.log("isStringNotBlank  custom.js，传入参数不是string类型");
        return false;
    }else if(paramString.trim() === ""){
        return false;
    }else{
        return true;
    }
}


/**
 * 传入jsDom对象（非数组），返回jsDomStyle    jsDomStyle.width,jsDomStyle.height   计算后的值，string类型 例如：180px;
 * @param jsDom
 * @returns {*}
 */
Custom.prototype.getStyle = function(jsDom){
    var jsDomStyle;
    if (window.getComputedStyle) {
        jsDomStyle = window.getComputedStyle(jsDom, null);    // 非IE
    } else {
        jsDomStyle = jsDom.currentStyle;  // IE
    }
    return jsDomStyle;
}


/*Object.prototype.toString.call(null);    区分对象数组和null使用*/
