/**
 * Created by zouhq on 2016/5/9.
 */
var Main = qc.defineBehaviour('qc.StickHero.Main',qc.Behaviour,function(){


	this.startStick = null;
},{
	pillars: qc.Serializer.NODE,

	player: qc.Serializer.NODE,

	scoreText: qc.Serializer.NODE,

	clue: qc.Serializer.NODE
});

Main.prototype.awake = function(){

	var self = this;

	//監聽遊戲開始事件
	self.addListener(qc.StickHero.uiEvent,function(e){
		if(e === 'startGame' || e === 'restart'){
			self.restart();
		}
	},self);

	//监听柱子已初始化
	self.addListener(qc.StickHero.uiEvent,function(eventName,arg){
		if(eventName === 'onPillarReady'){
			self._onPillarReady(arg);
		}
	},self);

	//监听屏幕是否有点击
	self.addListener(self.gameObject.onDown,function(){
		qc.StickHero.uiEvent.dispatch('onDown');
	},self);
	self.addListener(self.gameObject.onUp,function(){
		qc.StickHero.uiEvent.dispatch('onUp');
	},self);

	//设置为不可交互
	this.addListener(qc.StickHero.uiEvent,function(e){

		if(e === 'onUp'){
			this.gameObject.interactive = false;
		}
	},this);

	//成功的处理
	this.addListener(qc.StickHero.uiEvent,function(e,pillar){
		if(e === 'success'){
			this._onStep(pillar);
		}
	},this);
};

//柱子已初始化完毕
Main.prototype._onPillarReady = function(pillarList) {
	this.startPillar = pillarList[0];
	this.startStick = this.startPillar.stick;
	this.startStick.activeStick  = true;

	//初始化hero
	var players = this.player.getScript('qc.StickHero.Player');

	players.init(this.startPillar);


	//设置屏幕可交互
	this.gameObject.interactive = true;
};

Main.prototype.restart = function(e){

	var self = this;

	//重置
	qc.StickHero.reset();

	//得分清零
	this.scoreText.text = '' + qc.StickHero.me._current;
	//相機位置調整
	var camera = self.pillars.parent,
		tp = camera.TweenPosition;

	tp.onFinished.addOnce(self.start,self);

	// 重置相机位置
	self.resetCamera();

	// 显示游戏界面
	self.show();
};

//開始遊戲
Main.prototype.start = function (e) {

	// 重置柱子列表
	var pool = this.pillars.getScript('qc.StickHero.Pillars');
	pool.reset();

};

//重置相機
Main.prototype.resetCamera = function () {
	var self = this;
	var camera = self.pillars.parent,
		tp = camera.TweenPosition;
	tp.to = new qc.Point(-camera.parent.width * 0.5, 0);
	tp.setCurrToStartValue();
	tp.resetToBeginning();
	tp.playForward();
};

//显示游戏界面
Main.prototype.show = function(){

	this.clue.visible = true;

	this.gameObject.visible = true;

	//提示三秒后自动消隐
	this.game.timer.add(3000,function(){
		this.clue.visible = false;
	},this);
};

//成功
Main.prototype._onStep = function(pillar) {
	this._step = pillar;
	var playerScript = this.player.getScript('qc.StickHero.Player');
	playerScript.fall(pillar);

	//加分
	qc.StickHero.me.current++;
	this.scoreText.text = '' + qc.StickHero.me.current;

	// 矫正柱子的位置
	this.adjustPillar();

	// 下一个跳台
	var pool = this.pillars.getScript('qc.StickHero.Pillars');
	pool.next();

	//更新柱子
	var pillarsScript = this.pillars.getScript('qc.StickHero.Pillars'),
		pillars = pillarsScript.pillarList;
	this._onPillarReady(pillars);


};

/**
 * 走到跳台上后，调整柱子位置
 */
Main.prototype.adjustPillar = function() {
	var camera = this.pillars.parent,
		s = camera.getScript('qc.TweenPosition'),
		step = this._step.gameObject,
		p = new qc.Point(-step.x - camera.parent.width * 0.5, 0);
	s.to = p.clone();
	s.setCurrToStartValue();
	s.resetToBeginning();
	s.playForward();

};