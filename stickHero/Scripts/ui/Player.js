/**
 * Created by zouhq on 2016/5/9.
 */
var Player = qc.defineBehaviour('qc.StickHero.Player',qc.Behaviour,function(){

	//获取跳台
	this._step = null;
},{
	pillars: qc.Serializer.NODE
});

Player.prototype.awake = function(){

	//监听事件
	this.addListener(qc.StickHero.uiEvent,function(e,stickScript){

		if(e === 'startWalk'){
			this.walk(stickScript);
		}
	},this);
};

//初始化Hero位置
Player.prototype.init = function(pillar) {
	// 停止hero动作播放
	this.gameObject.stop();


	// 设置hero位置
	this.gameObject.switchParent(pillar.gameObject);
	this.gameObject.anchoredX = 0;
	this.gameObject.anchoredY = 0;
	this.gameObject.rotation = 0;
};

//走路
Player.prototype.walk = function(stickScript){
	var tp = this.gameObject.TweenPosition;
	tp.setCurrToStartValue();
	tp.to = new qc.Point(this.gameObject.parent.width + stickScript.gameObject.height,0);

	// 以每秒200的速度前进
	if (tp.from.x >= tp.to.x) {
		tp.to = tp.from;
		tp.duration = 0;
	}
	else {
		var deltaX = tp.to.x - tp.from.x;
		// 以每秒200的速度前进
		tp.duration = deltaX * 0.005;
	}

	tp.onFinished.addOnce(function(){
		this.walkFinish(stickScript);
	},this);
	this.gameObject.playAnimation('walk');
	tp.resetToBeginning();
	tp.playForward();

};

//已走完
Player.prototype.walkFinish = function(stickScript){

	this.gameObject.stop();
	this.gameObject.playAnimation('stop');

	//获取跳台
	var pillar = this.pillars.getScript('qc.StickHero.Pillars').getStep();
	this._step = pillar;
	this.gameObject.switchParent(pillar.gameObject.parent);

	//判断是否成功
	if(this.gameObject.x > pillar.gameObject.x + pillar.gameObject.width || this.gameObject.x < pillar.gameObject.x){
		this.gameObject.switchParent(stickScript.gameObject);
		var trs = stickScript.gameObject.getScripts('qc.TweenRotation');
		trs.forEach(function(tr){

			if(tr.flag === 'over'){
				tr.onFinished.addOnce(function(){
					this.gameObject.anchoredY = 1500;
					//派发游戏结束事件
					qc.StickHero.uiEvent.dispatch('gameOver');
				},this);
				tr.resetToBeginning();
				tr.playForward();
			}
		},this);
		return;
	}

	//成功
	qc.StickHero.uiEvent.dispatch('success',pillar);
};

//落到站台上
Player.prototype.fall = function(pillar) {

	this.init(pillar);
};