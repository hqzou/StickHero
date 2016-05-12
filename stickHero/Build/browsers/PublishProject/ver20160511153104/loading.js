(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var testHandler = function() {
	this.count = 0;
	this.tickState = 'normal';
};
testHandler.prototype = {};
testHandler.prototype.constructor = testHandler;

// start loading
testHandler.prototype.start = function(totalAssetCount) {
    
    var self = this;
    this.totalCount = totalAssetCount;
    this.Timer = setInterval(self.repeat,200);
};

// notify the loading progress
testHandler.prototype.progress = function(curCount) {
	var widthSize = document.getElementById('progressbarBg').clientWidth;
	var percent = Math.floor(curCount / this.totalCount * 100);


	var size = Math.floor(widthSize * percent / 100);
	
	document.getElementById('progressbar').style.width = size + 'px';
	
	document.getElementById('size').innerHTML = percent + '%';

};

// All assets are loaded
testHandler.prototype.finish = function() {
	clearInterval(this.Timer);
	this.tickState = 'fadeout';
    this.startFadingOutTime = new Date().getTime();
};

testHandler.prototype.repeat = function(){
	
	if(this.count < 3) {
	
        this.count++;
        document.getElementById('msg').innerHTML+=".";
   	} else {
        document.getElementById('msg').innerHTML="游戏加载中";
        this.count=0;
    }
};

testHandler.prototype._tick = function() {

    var self = qici.loadingHandler;
    if (self.tickState === 'done')
        return;

    requestAnimationFrame(self._tick);
    if (self.tickState === 'normal')
        return;


    var time = new Date().getTime();
    var delta = time - self.startFadingOutTime;

    var rate = delta / 500;
    if (rate > 1) {
        // 移除进度条
        self.tickState = 'done';
        
    	var loading = document.getElementById('loading');

    	loading.parentNode.removeChild(loading);
    }
    else {
        document.getElementById('loading').style.opacity = 1 - rate;
    }
}

if (qici.config.loadingHandler === 'testHandler'){
	// margin:-22px 0px 0px -22px;position:absolute;left:50%;top:50%;

	  // document.write('<div id="progressbarBg" style="width: 371px; height: 28px;margin:-22px 0px 0px -22px;position:absolute;left:50%;top:50%; color: #c1ff84; z-index: 2;background-color: transparent; background-image: url(images/progressbar_bg.png); background-repeat: no-repeat;"></div>'+
			// 		'<div id="progressbar" style="width: 0px; height: 28px; margin:-22px 0px 0px -22px;position:absolute;left:50.15%;top:50.3%;color: #c1ff84; z-index: 10; background-color: transparent;background-image: url(images/progressbar.png); background-repeat: no-repeat;"></div>'+
			// 		'<div id="msg" style="margin:-22px 0px 0px -22px;position:absolute;left:56%;top:55%; z-index: 5;">游戏加载中</div>'+
			// 		'<div id="size" style="margin:-22px 0px 0px -22px;position:absolute;left:70%;top:50%;"> </div>');
    // document.write( '<div id="loading" style="margin:-22px 0px 0px -22px;position:absolute;left:35%;top:50%;">'+
    // 				'<div id="progressbarBg" style="position: absolute; width: 371px; height: 28px; left: 105px; top: 105px; color: #c1ff84; z-index: 2;background-color: transparent; background-image: url(images/progressbar_bg.png); background-repeat: no-repeat;"></div>'+
				// 	'<div id="progressbar" style="position: absolute; width: 0px; height: 28px; left: 108px; top: 107px; color: #c1ff84; z-index: 10; background-color: transparent;background-image: url(images/progressbar.png); background-repeat: no-repeat;"></div>'+
				// 	'<div id="msg" style="position: absolute;  left: 240px; z-index: 5;  top: 125px; width:130px">游戏加载中</div>'+
				// 	'<div id="size" style="position: absolute;left: 480px; top: 105px;"> </div>'+
				// 	'</div>');
    document.write( '<div id="loading" style="pisition:absolute; top:0;left:0;width:100%;height:100%;z-index:10000;background:gray;">'+
                    '<div id="progressbarBg" style="position:absolute;width:371px; height: 28px; background-image: url(images/progressbar_bg.png); background-repeat: no-repeat;"></div>'+
                    '<div id="progressbar" style="position: absolute; width: 0px; height: 28px; background-image: url(images/progressbar.png); background-repeat: no-repeat;"></div>'+
                    '<div id="msg" style="position: absolute;width:130px">游戏加载中</div>'+
                    '<div id="size" style="position: absolute;"> </div>'+
                    '</div>');

}
    

// register the loadingHandler
if (qici.config.loadingHandler === 'testHandler'){
    qici.loadingHandler = new testHandler();
    qici.loadingHandler._tick();
}