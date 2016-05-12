/**
 * Created by zouhq on 2016/5/9.
 */
//棍子类
var Stick = qc.defineBehaviour('qc.StickHero.Stick',qc.Behaviour,function(){

	//棍子增长标志位
	this.increaseFlag = false;

	//该棍子是否激活
	this.activeStick = false;
},{

});

Stick.prototype.awake = function(){


	//监听是否有点击
	this.addListener(qc.StickHero.uiEvent,function(eventName){
		if(eventName === 'onDown'){
			if(this.activeStick)
			this.increaseFlag = true;
		}
		else if(eventName === 'onUp'){
			if(this.activeStick){
				this.increaseFlag = false;
				this.activeStick = false;
				this.stickRotate();

			}

		}
	},this);
};

Stick.prototype.update = function(){

	if(this.increaseFlag){
		this.gameObject.height +=10;
	}
};
//初始化棍子
Stick.prototype.init = function(pillar){

	this.gameObject.height = 0;
	this.gameObject.rotation = 0;
	this.gameObject.switchParent(pillar.gameObject);
	this.gameObject.anchoredX = pillar.gameObject.width;
};

//棍子旋转
Stick.prototype.stickRotate = function(){

	//获取TweenRotation组
	var trs = this.gameObject.getScripts('qc.TweenRotation');
	trs.forEach(function(tr){
		if(tr.flag === 'start'){

			tr.onFinished.addOnce(this.finishRotate,this);
			tr.resetToBeginning();
			tr.playForward();
		}
	},this);
};

//派发事件
Stick.prototype.finishRotate = function(){

	qc.StickHero.uiEvent.dispatch('startWalk',this);
};