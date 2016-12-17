/**
 * Created by Administrator on 2016/10/25 0025.
 */

var custom = new Custom();
/**
 *  默认根据元素进行轮播
 */
/**
 * 定义carousel对象   构造方法（structure）
 * @param json["boxId"]                     轮播元素的父元素id
 * @param json["boxChildCLassName"]         轮播元素相同的className
 * @param json["lineShowSize"]              每次展示轮播元素的数量（banner轮播一般是展示1，如果是多图轮播，一次展示几张图就是几）
 * @param json["moveSize"]                  每次点击上一页或者下一页时轮播的移动量（轮播元素的width设置为百分比，box-sizing:border-box;padding-left,padding-right来实现间隙的设置，如果是单图轮播是1，如果是多图轮播，每次点击上一页的时候隐藏一个图片再展示一个图片，是1，如果是展示的多图同时隐藏，然后再展示出相同数量的图片，则这个move值就是这个数量）
 * @param json["autoMotion"]                是否自动轮播
 * @param json["autoMotionTime"]            每次自动轮播的间隔时间
 */
function carousel(json){
    //轮播元素和next prev，nav等按钮共同的副元素   必须是非空元素(通过id获取元素，为了防止页面中出现一个以上的轮播可能造成的错误)
    if(custom.isDomdefine(json["boxId"],"id")){
        this.boxId = json["boxId"];
    }else{
        console.log("传入的轮播父元素id有无，请检查后重新输入");
        return;
    }

    //轮播元素的className(在传入轮播元素id的dom中查找是否存在此元素，防止出现不必要的错误   如果有一个以上的轮播js调用，万一两个轮播的轮播元素的className都一样就惨兮兮了)
    if(typeof json["boxChildCLassName"] === "undefined"){
        console.log("请输出轮播元素的ClassName,轮播元素的ClassName必须被输入");
        return;
    }else if(document.getElementById(this.boxId).getElementsByClassName(json["boxChildCLassName"]).length === 0){
        console.log("在输入的id的dom中找不到className的dom对象，请确认输入className是否正确");
    }else{
        this.boxChildCLassName = json["boxChildCLassName"];
    }

    //显示的轮播元素个数
    //如果如果参数未设置，则默认为1，每次显示一个轮播元素（banner展示）
    if(custom.isUndefined(json["lineShowSize"])){
        json["lineShowSize"] = 1;
        this.lineShowSize = 1;
    //如果显示轮播元素的个数传入参数不是数值类型，return
    }else if(typeof json["lineShowSize"] !== "number"){
        console.log("显示轮播元素的个数传入参数不是数值类型");
        return;
    }else{
        this.lineShowSize = json["lineShowSize"];
    }

    //每次轮播的偏移量设置（数值类型，轮播元素个数为单位）
    //如果参数未设置，则默认等于显示轮播元素的个数（banner展示）
    if(custom.isUndefined(json["moveSize"])){
        json["moveSize"] = json["lineShowSize"];
        this.moveSize = json["moveSize"];
    //如果传入轮播偏移量参数不是数值类型，return
    }else if(typeof json["moveSize"] !== "number"){
        console.log("每次轮播的偏移量传入的参数不是数值类型");
        return;
    //如果传入的轮播偏移量的数值大于传入的轮播显示轮播元素个数的参数或者1，return（如果大于，会出现部分元素不被显示）
    }else if(json["moveSize"] > json["lineShowSize"]){
        console.log("轮播偏移量不能大于轮播显示的轮播元素个数");
        return;
    }else{
        this.moveSize = json["moveSize"];
    }

    //是否自动播放轮播  true 播放  false 不播放      不传入参数默认自动播放
    if(typeof json["autoMotion"] !== "boolean"){
        this.autoMotion = true;
    }else{
        this.autoMotion = json["autoMotion"];
    }

    //自动轮播的间隔时间
    if(this.autoMotion){
        if(typeof json["autoMotionTime"] === "undefined"){
            this.autoMotionTime = 3000;
        }else if(typeof json["autoMotionTime"] !== "number"){
            console.log("请输入数值类型的自动轮播的间隔时间");
            return;
        }else{
            this.autoMotionTime = json["autoMotionTime"];
        }
    }else{
        if(typeof json["autoMotionTime"] !== "undefined"){
            console.log("请确认自动播放轮播参数填写是否正确");
            return;
        }
    }

    //上一页btn的id

    if(custom.isDomdefine(json["prevId"],"id")){
        this.prevId = json["prevId"];
    }else{
        console.log("请检查输入的上一页的元素id是否正确");
    }

    //下一页btn的id
    if(custom.isDomdefine(json["nextId"],"id")){
        this.nextId = json["nextId"];
    }else{
        console.log("请检查输入的下一页的元素id是否正确");
    }

    //初始化时，显示在第一个位置的轮播元素的index
    this.positionFirstIndex = 0;
    //计算出每个轮播元素的宽度继承的百分比例   单位 "%"
    this.boxChildWidth = undefined;
    //设置出当前展示的轮播元素的z-index的值（最大，目的是为了遮盖其他元素到达指定位置的时的元素动画效果）
    this.zIndexMax = 5;
    //设置z-index的最小值（给那些需要进行隐藏的动画元素使用）
    this.zIndexMin = 1;
    //上次轮播方向 默认true（下一页） false（上一页）
    this.direction  = undefined;
    //轮播一次所需要的时间
    this.animationTime = undefined;
    //存储interval 的值（setTimeout不保险，用interval比较保险）
    this.interval = undefined;
}

/**
 * 执行轮播
 * @param prevId            上一页按钮的id
 * @param nextId            下一页按钮的id
 * @param animationTime     动画时间（毫秒）    在对应的轮播元素样式上必须有transition:all animationTime(过渡毫秒数)
 */
carousel.prototype.run = function(){
    //初始化，计算一些需要的参数值，并存入当前对象中
    this.init();
    //设置当前显示的轮播元素的z-index
    this.showZIndexMax();
    //设置当前轮播元素的位置关系（为后面的prev或者next click做准备）
    this.setPrevAndNextPosition();

    var prev = getJqueryForId(this.prevId);
    var next = getJqueryForId(this.nextId);
    var carouselThis = this;
    //为了防止自适应等重复调用的问题，jquery会累加事件，不能使用jquery
    prev[0].onclick = function(){
        carouselThis.direction = false;
        carouselThis.showZIndexMax();
        carouselThis.clickPrev();
        carouselThis.setPrevAndNextPosition();
    }
    next[0].onclick = function(){
        carouselThis.direction = true;
        carouselThis.showZIndexMax();
        carouselThis.clickNext();
        carouselThis.setPrevAndNextPosition();
    }
    if(this.autoMotion){
        this.interval = setInterval(function(){
            carouselThis.direction = true;
            carouselThis.showZIndexMax();
            carouselThis.clickNext();
            carouselThis.setPrevAndNextPosition();
        },this.autoMotionTime);
    }

    document.getElementById(this.boxId).onmouseover = function(){
        if(carouselThis.interval){
            clearInterval(carouselThis.interval);
            carouselThis.interval = null;
        }
    };

    document.getElementById(this.boxId).onmouseout = function(){
        if(carouselThis.autoMotion && !carouselThis.interval){
            carouselThis.interval = setInterval(function(){
                carouselThis.direction = true;
                carouselThis.showZIndexMax();
                carouselThis.clickNext();
                carouselThis.setPrevAndNextPosition();
            },carouselThis.autoMotionTime);
        }
    }
}

/**
 *  传入新的参数（当onload的时候，原有的参数设置可能会导致显示效果极差，因此通过这个方法重新设置参数）
 */
carousel.prototype.onChangeParam = function(json){
    //重新设置显示的轮播元素个数
    if(typeof json["lineShowSize"] === "number"){
        this.lineShowSize = json["lineShowSize"];
    }

    //重新设置每次轮播的偏移量设置（数值类型，轮播元素个数为单位）
    if(typeof json["moveSize"] === "number"){
        this.moveSize = json["moveSize"];
    }

    //设置轮播播放时间间隔
    if(json["autoMotion"] && typeof json["autoMotionTime"] === "number"){
        this.autoMotionTime = json["autoMotionTime"];
    }

    //重新设置是否自动播放轮播  true 播放  false 不播放
    if(typeof json["autoMotion"] === "boolean"){
        this.autoMotion = json["autoMotion"];
        if(this.interval){
            clearInterval(this.interval);
            this.interval = null;
        }
        if(this.autoMotion && typeof this.autoMotionTime === "number"){
            var carouselThis = this;
            this.interval = setInterval(function(){
                carouselThis.direction = true;
                carouselThis.showZIndexMax();
                carouselThis.clickNext();
                carouselThis.setPrevAndNextPosition();
            },carouselThis.autoMotionTime);
        }
    }

    var $boxId = getJqueryForId(this.boxId);
    //因为是轮播，因此轮播元素的数量必须大于或者等于展示是轮播元素数量加上两倍的偏移量，如果小于则会不断的对轮播元素进行克隆
    var $boxChildCLassName = $("."+this.boxChildCLassName);

    //设置宽度的百分比例
    this.boxChildWidth = (1/this.lineShowSize)*100;
    //设置宽度之后，被克隆的轮播元素都有宽度的设置
    $boxChildCLassName.css({
        "width":this.boxChildWidth + "%",
        "z-index":this.zIndexMin,
    });
    //设置上一页，下一页按钮元素的高度(轮播元素是根据百分比例设置宽度的，高度则通过固定宽高比例或者里面的图片撑开，因此高度不一定是固定的值)和z-index(必须比轮播元素中z-index的最大的值要大，不然可能会被遮盖)
    var height = $($boxChildCLassName[0]).css("height");
    $boxId.css("height",height);
    getJqueryForId(this.prevId).css({
        "height":height,
        "z-index":this.zIndexMax+1,
    });
    getJqueryForId(this.nextId).css({
        "height":height,
        "z-index":this.zIndexMax+1,
    });
    //实现轮播效果，轮播元素数量最少是展示数量加上两倍的偏移量
    //最少是展示数量加上两倍的偏移量，为了轮播展示的次序无变化，如果小于展示数量加上两倍的偏移量，每次添加的都为 html中轮播元素（源文件中而不是12中）的元素数组
    var addChildBoxList = $boxChildCLassName.clone();

    //循环添加元素，直到达到（展示数量加上两倍的偏移量）或者大于（展示数量加上两倍的偏移量）为止
    while(getJqueryForClassName(this.boxChildCLassName).length < (this.lineShowSize + this.moveSize * 2)){
        $boxId.append(addChildBoxList.clone());
    }
    this.boxChildCList = getJqueryForClassName(this.boxChildCLassName);
    this.showZIndexMax();
    this.direction = undefined;
    this.setPrevAndNextPosition();
    if(custom.isCssStyleName("transition")){
        this.boxChildCList.css(custom.isCssStyleName("transition"),"all .3s");
    }
}

/**
 * 轮播初始化    window onload时调用
 * 将轮播元素的高度设置给轮播元素父元素的高度
 * 判断轮播元素数量是否是等于或大于（展示数量加上偏移量的两倍），如果小于则不断的进行克隆，直到等于或大于为止（滑动轮播）
 */
carousel.prototype.init = function(){
    var $boxId = getJqueryForId(this.boxId);
    //因为是轮播，因此轮播元素的数量必须大于或者等于展示是轮播元素数量加上两倍的偏移量，如果小于则会不断的对轮播元素进行克隆
    var $boxChildCLassName = $("."+this.boxChildCLassName);

    //设置宽度的百分比例
    this.boxChildWidth = (1/this.lineShowSize)*100;
    //设置宽度之后，被克隆的轮播元素都有宽度的设置
    $boxChildCLassName.css({
            "width":this.boxChildWidth + "%",
            "z-index":this.zIndexMin,
    });
    //轮播元素是absolute（不是absolute无法轮播），因此box无法从内部撑开，获取轮播元素高度，并将高度设置给轮播父元素
    var prevId = this.prevId;
    var nextId = this.nextId;

    //设置上一页，下一页按钮元素的高度(轮播元素是根据百分比例设置宽度的，高度则通过固定宽高比例或者里面的图片撑开，因此高度不一定是固定的值)和z-index(必须比轮播元素中z-index的最大的值要大，不然可能会被遮盖)
    var height = $($boxChildCLassName[0]).css("height");
    $boxId.css("height",height);
    getJqueryForId(prevId).css({
        "height":height,
        "z-index":this.zIndexMax+1,
    });
    getJqueryForId(nextId).css({
        "height":height,
        "z-index":this.zIndexMax+1,
    });

    //实现轮播效果，轮播元素数量最少是展示数量加上两倍的偏移量
    //最少是展示数量加上两倍的偏移量，为了轮播展示的次序无变化，如果小于展示数量加上两倍的偏移量，每次添加的都为 html中轮播元素（源文件中而不是12中）的元素数组
    var addChildBoxList = $boxChildCLassName.clone();

    //循环添加元素，直到达到（展示数量加上两倍的偏移量）或者大于（展示数量加上两倍的偏移量）为止
    while(getJqueryForClassName(this.boxChildCLassName).length < (this.lineShowSize + this.moveSize * 2)){
        $boxId.append(addChildBoxList.clone());
    }
    this.boxChildCList = getJqueryForClassName(this.boxChildCLassName);
    //设置宽度和位置    目的是防止js运行过慢导致显示问题
    for(var i=0;i<this.lineShowSize;i++){
        $(this.boxChildCList[i]).css({"left":i*this.boxChildWidth+"%","json":this.zIndexMax});
    }
    this.animationTime = 300;
    if(custom.isCssStyleName("transition")){
        this.boxChildCList.css(custom.isCssStyleName("transition"),"all .3s");
    }
}

/**
 * 轮播元素定位设置
 * 每当执行完一次轮播之后调用此函数 为下一个轮播做准备
 */
carousel.prototype.setPrevAndNextPosition = function(){
    //根据上一次方向设置位置关系
    //如果上一次的方向是true（下一页）那么只设置下一页的位置关系即可
    //如果上一次的方向是false（上一页）那么只设置上一页的位置关系即可
    //如果没有方向信息，则表示没有进行则分别设置上一页和下一页的位置关系
    if(typeof this.direction !== "undefined"){
        var setPositionArray = this.direction?this.getNextArray(this.positionFirstIndex):this.getPrevArray(this.positionFirstIndex);
        //下一页位置设置
        if(this.direction){
            var leftPosition = 100;
            for(var i=0;i<this.moveSize;i++){
                $(this.boxChildCList[setPositionArray[i]]).css("left",leftPosition + (i+1)*this.boxChildWidth + "%" );
            }
        //上一页位置设置
        }else{
            var leftPosition = this.moveSize * this.boxChildWidth*(-1);
            for(var i=0;i<this.moveSize;i++){
                $(this.boxChildCList[setPositionArray[i]]).css("left",leftPosition + i*this.boxChildWidth + "%" );
            }
        }
    //设置上一页和下一页的位置
    }else{
        var nextArray = this.getNextArray(this.positionFirstIndex);
        var prevArray = this.getPrevArray(this.positionFirstIndex);
        var middleArray = this.getMiddleArray(this.positionFirstIndex);
        //当前显示
        for(var i=0;i<this.lineShowSize;i++){
            $(this.boxChildCList[middleArray[i]]).css("left",i*this.boxChildWidth + "%");
        }
        //下一页
        var leftPosition = 100;
        for(var i=0;i<this.moveSize;i++){
            $(this.boxChildCList[nextArray[i]]).css("left",leftPosition + (i+1)*this.boxChildWidth + "%" );
        }
        //上一页
        var leftPosition = this.moveSize * this.boxChildWidth*(-1);
        for(var i=0;i<this.moveSize;i++){
            $(this.boxChildCList[prevArray[i]]).css("left",leftPosition + i*this.boxChildWidth + "%" );
        }
    }
/**
 * old 版本
    var json = this.getprevAndNextPositionIndex();
    var nextFirstIndex = json["nextFirstIndex"];
    var nextLastIndex = json["nextLastIndex"];
    var prevFirstIndex =  json["prevFirstIndex"];
    var prevLastIndex = json["prevLastIndex"];
    //设置上一页的位置
    if(prevFirstIndex <= prevLastIndex){
        for(var i=prevLastIndex,j=-1; i>= prevFirstIndex; i--,j--){
            $(this.boxChildCList[i]).css("left",j*this.boxChildWidth+"%");
        }
    }else{
        var j = -1;
        for(var i=prevLastIndex; i>=0;i--,j--){
            $(this.boxChildCList[i]).css("left",j*this.boxChildWidth+"%");
        }
        for(var i=this.boxChildCList.length-1; i>=prevFirstIndex;i--,j--){
            $(this.boxChildCList[i]).css("left",j*this.boxChildWidth+"%");
        }
    }

    //设置下一页的位置
    if(nextFirstIndex <= nextLastIndex){
        for(var i= nextFirstIndex,j=this.lineShowSize -1 + 1; i<= nextLastIndex; i++,j++){
            $(this.boxChildCList[i]).css("left",j*this.boxChildWidth+"%");
        }
    }else{
        var j=this.lineShowSize -1 + 1;
        for(var i= nextFirstIndex; i<= this.boxChildCList.length-1; i++,j++){
            $(this.boxChildCList[i]).css("left",j*this.boxChildWidth+"%");
        }
        for(var i= 0; i<= nextLastIndex; i++,j++){
            $(this.boxChildCList[i]).css("left",j*this.boxChildWidth+"%");
        }
    }
*/
}

/**
 * 下一页动画
 */
carousel.prototype.clickNext = function(){
    var animationArray = this.getMiddleArray(this.positionFirstIndex).concat(this.getNextArray(this.positionFirstIndex));
    var cssTyleName = custom.isCssStyleName("transition");
    if(cssTyleName){
        for(var i=0; i<animationArray.length;i++){
            $(this.boxChildCList[animationArray[i]]).css("left",(i - this.moveSize)*this.boxChildWidth + "%");
        }
    }else{
        for(var i=0; i<animationArray.length;i++){
            $(this.boxChildCList[animationArray[i]]).animate("left",(i - this.moveSize)*this.boxChildWidth + "%");
        }
    }

    //重置当前展示的第一个轮播元素的index
    this.positionFirstIndex = animationArray[this.moveSize - 1 + 1];
}

/**
 * 上一页动画
 */
carousel.prototype.clickPrev = function(){
    var animationArray = this.getPrevArray(this.positionFirstIndex).concat(this.getMiddleArray(this.positionFirstIndex));
    var cssTyleName = custom.isCssStyleName("transition");
    if(cssTyleName){
        for(var i=0; i<animationArray.length; i++){
            $(this.boxChildCList[animationArray[i]]).css("left",i*this.boxChildWidth + "%");
        }
    }else{
        for(var i=0; i<animationArray.length; i++){
            $(this.boxChildCList[animationArray[i]]).animate("left",i*this.boxChildWidth + "%");
        }
    }
    //重置当前展示的第一个轮播元素的index
    this.positionFirstIndex = animationArray[0];
}

/**
 * 通过轮播元素数组和传入的显示轮播元素第一个元素的index，返回上一页的array
 * @param firstIndex
 */
carousel.prototype.getPrevArray = function(firstIndex){
    var prevArray = [];
    if(firstIndex < this.moveSize){
        for(var i=this.boxChildCList.length + firstIndex - this.moveSize; i < this.boxChildCList.length; i++){
            prevArray.push(i);
        }
        for(var i=0; i<firstIndex;i++){
            prevArray.push(i);
        }
    }else{
        for(var i=0,j=(firstIndex - this.moveSize); i<this.moveSize;i++,j++){
            prevArray.push(j);
        }
    }
    return prevArray;
}

/**
 * * 通过轮播元素数组和传入的显示轮播元素第一个元素的index，以及显示轮播元素个数，返回当前显示的轮播元素的array
 * @param firstIndex
 */
carousel.prototype.getMiddleArray = function(firstIndex){
    var middleArray = [];
    if(firstIndex + this.lineShowSize - 1 > this.boxChildCList.length - 1){
        for(var i = firstIndex; i<= this.boxChildCList.length - 1; i++){
            middleArray.push(i);
        }
        for(var i=0; i < this.lineShowSize - (this.boxChildCList.length - 1 - firstIndex + 1);i++){
            middleArray.push(i);
        }
    }else{
        for(var i=0,j=firstIndex;i<this.lineShowSize;i++,j++){
            middleArray.push(j);
        }
    }
    return middleArray;
}

/**
 * * 通过轮播元素数组和传入的显示轮播元素第一个元素的index，返回下一页的array
 * @param firstIndex
 */
carousel.prototype.getNextArray = function(firstIndex){
    var nextArray = [];
    var endIndex = this.getMiddleArray(firstIndex)[this.lineShowSize - 1];
    if(endIndex + this.moveSize > this.boxChildCList.length - 1){
        for(var i = endIndex + 1; i<this.boxChildCList.length; i++){
            nextArray.push(i);
        }
        for(var i = 0 ; i<this.moveSize - (this.boxChildCList.length -1 - (endIndex + 1) + 1);i++){
            nextArray.push(i);
        }
    }else{
        for(var i = endIndex + 1,j=0;j<this.moveSize;i++,j++){
            nextArray.push(i);
        }
    }
    return nextArray;
}

/**
 * 设置当前展示的轮播元素的z-index  将展示的轮播元素的z-index设置的比较大，防止被覆盖
 */
carousel.prototype.showZIndexMax = function(){
    this.boxChildCList.css("z-index",this.zIndexMin);
    var middleArray = this.getMiddleArray(this.positionFirstIndex);
    for(var i=0; i<middleArray.length;i++){
        $(this.boxChildCList[middleArray[i]]).css("z-index",this.zIndexMax);
    }
    if(typeof this.direction === "boolean"){
        //下一页
        if(this.direction){
            var nextArray = this.getNextArray(this.positionFirstIndex);
            for(var i=0; i<nextArray.length;i++){
                $(this.boxChildCList[nextArray[i]]).css("z-index",this.zIndexMax);
            }
            //上一页
        }else{
            var prevArray = this.getPrevArray(this.positionFirstIndex);
            for(var i=0; i<prevArray.length;i++){
                $(this.boxChildCList[prevArray[i]]).css("z-index",this.zIndexMax);
            }
        }
    }
}

/**
 * 通过id获取jquery对象
 * @param id
 */
function getJqueryForId(id){
    return $("#" + id);
}

/**
 * 通过className获取jquery对象
 * @param className
 * @returns {*|jQuery|HTMLElement}
 */
function getJqueryForClassName(className){
    return $("." + className);
}



