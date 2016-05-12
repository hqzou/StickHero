// make sure requestAnimationFrame work
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

var subaraHandler = function() {
}
subaraHandler.prototype = {};
subaraHandler.prototype.constructor = subaraHandler;

// start loading
subaraHandler.prototype.start = function(totalAssetCount) {
	var self = this;
    this.totalCount = totalAssetCount;
    this.Timer = setInterval(self.repeat,200);
	
	var style = document.getElementById('subaraLoading').getAttribute('style');
    document.getElementById('subaraLoading').setAttribute('style', style);
	
	var style2 = document.getElementById('loadingText').getAttribute('style');
    document.getElementById('loadingText').setAttribute('style', style2);
}

// notify the loading progress
subaraHandler.prototype.progress = function(curCount) {
	var percent = Math.floor(curCount / this.totalCount * 100);
    var progressBlock = document.getElementById('progressBlock');
    var progressPercent = document.getElementById('progressPercent');

    progressBlock.style.width = percent + "%";
    progressPercent.innerHTML = percent + "%";
}

// All assets are loaded
subaraHandler.prototype.finish = function() {
    this.tickState = 'fadeout';
    this.startFadingOutTime = new Date().getTime();
}

subaraHandler.prototype._tick = function() {

    var self = qici.loadingHandler;
    if (self.tickState === 'done')
        return;

    requestAnimationFrame(self._tick);

    // resize
    var width = document.documentElement.clientWidth;
    if (window.innerWidth && window.innerWidth < width) {
        width = window.innerWidth;
    }
    var progressWidth = width - 40 > 640 ? 640 : width - 40;
    var height = document.documentElement.clientHeight;
    if (window.innerHeight && window.innerHeight < height) {
        height = window.innerHeight;
    }

    var progress = document.getElementById('progress');
    progress.style.width = progressWidth + "px";

    progress.style.bottom =  "50px";
    progress.style.left = (width - progressWidth) / 2 + "px";

    if (self.tickState === 'normal')
        return;

    // fadeout
    var time = new Date().getTime();
    var delta = time - self.startFadingOutTime;

    var rate = delta / 500;
    if (rate > 1) {
        // finish fadeout
        self.tickState = 'done';

        var loadingDiv = document.getElementById('loading');
        loadingDiv.parentNode.removeChild(loadingDiv);
		var subaraLoading = document.getElementById('subaraLoading');
    	subaraLoading.parentNode.removeChild(subaraLoading);
		var loadingText = document.getElementById('loadingText');
    	loadingText.parentNode.removeChild(loadingText);
    }
    else {
        document.getElementById('loading').style.opacity = 1 - rate;
    }
}

if (qici.config.loadingHandler === 'subaraHandler')
    document.write('\
<div id="loading" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:100;background-image:url(./Assets/texture/bg.png);background-size:100% 100%"">\
    <div id="progress" style="position:absolute;width:320px;height:20px;background:#ebebeb;\
    border-left:1px solid transparent;border-right:1px solid transparent;border-radius:10px;">\
        <span id="progressBlock" style="width:0%;position: relative;float: left;margin: 0 -1px;min-width: 30px;\
        height: 18px;line-height: 16px;text-align: right;background: #cccccc;border: 1px solid;border-color: #bfbfbf #b3b3b3 #9e9e9e;\
        border-radius: 10px;background-image: -webkit-linear-gradient(top, #f0f0f0 0%, #dbdbdb 70%, #cccccc 100%);\
        background-image: -moz-linear-gradient(top, #f0f0f0 0%, #dbdbdb 70%, #cccccc 100%);\
        background-image: -o-linear-gradient(top, #f0f0f0 0%, #dbdbdb 70%, #cccccc 100%);\
        background-image: linear-gradient(to bottom, #f0f0f0 0%, #dbdbdb 70%, #cccccc 100%);\
        -webkit-box-shadow: inset 0 1px rgba(255, 255, 255, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);\
        box-shadow: inset 0 1px rgba(255, 255, 255, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);\
        right: 0;z-index: 1;height: 18px;">\
            <span style="position: absolute;border-radius: 10px;background: url(./Assets/texture/progressbar.png) 0 0 repeat-x;top: 0;bottom: 0;left: 0;\
            right: 0;z-index: 1;height: 18px;"></span>\
            <span id="progressPercent" style="padding: 0 8px;font-size: 11px;font-weight: bold;color: #404040;color: rgba(0, 0, 0, 0.7);\
            text-shadow: 0 1px rgba(255, 255, 255, 0.4);">0%</span>\
        </span>\
    </div>\
</div>'+
'<div id="subaraLoading" style="position:absolute;top:10%;left:0;width:100%;height:90%;z-index:102;background-image:url(./Assets/texture/loading.png);background-repeat: no-repeat;background-size:100% auto"></div>'+
'<div id="loadingText" style="position: absolute;z-index: 999; left: 50%; top: 70%; width:160px;margin-left:-80px;">拼命加载中,请稍等...</div>'
);

// register the loadingHandler
if (qici.config.loadingHandler === 'subaraHandler')
{
    qici.loadingHandler = new subaraHandler();
    qici.loadingHandler._tick();
}