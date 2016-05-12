/**
 * 用户自定义脚本.
 */
(function(window, Object, undefined) {

/**
 * Created by zouhq on 2016/5/9.
 */
var Stick = qc.StickHero = {


	uiEvent: new qc.Signal(),

	//游戏宽度
	GAMEWIDTH: 640,

	//柱子宽度
	PILLARWIDTH: 150
};

//入口
Stick.initGame = function(excel,game){
	game.log.trace('开始游戏');

	this.game = game;

	//实例化Me类
	this.me = new qc.StickHero.Me();

	//柱子逻辑类
	this.logicpillar = new qc.StickHero.LogicPillar(excel);

	// 派发脚本准备就绪事件
	this.uiEvent.dispatch('onLogicReady');
};

//重置
Stick.reset = function(){
	this.me.reset();
};
/**
 * Created by zouhq on 2016/5/9.
 */
var Me = qc.StickHero.Me = function(){

	//當前關卡
	this.level = 1;

	//當前分數
	this._current = 0;

	//歷史最高分
	this._best = 0;

	//遊戲是否結束
	this.gameOverFlag = false;

	//获取数据
	var game = qc.StickHero.game;

	if(game.storage.get('current')){
		this._current = game.storage.get('current');
	}

	if(game.storage.get('best')){
		this._best = game.storage.get('best');
	}
};

Me.prototype = {};
Me.prototype.constructor  = Me;

Object.defineProperties(Me.prototype,{
	current: {
		get: function(){
			return this._current;
		},

		set: function(v){
			this._current = v;
			if(this.best < v){
				this.best = v;
			}
		}
	},

	best: {
		get: function(){
			return this._best;
		},

		set: function(v){
			this._best = v;
			var game = qc.StickHero.game;
			game.storage.set('best',v);
			game.storage.save();
		}
	}
});

//重置
Me.prototype.reset  = function(){

	var self = this;
	self.level = 1;
	self.current = 0;
	self.gameOverFlag  = false;
};
/**
 * Created by zouhq on 2016/5/9.
 */
var PillarInfo = function(row) {
	this.id = row.id * 1;
	this.minLv = row.minLv * 1;
	this.maxLv = row.maxLv * 1 || Infinity;
	this.thickness = row.thickness * 1;
};

var Pillar = qc.StickHero.LogicPillar = function(excel) {


	if(!excel){
		excel = G.game.assets.load('config')
	}
	// 柱子信息列表
	this.infoList = [];

	// 关卡与柱子粗细值对应表
	this.infoMap = {};

	var sheet = excel.findSheet('pillar');
	if (sheet) {
		sheet.rows.forEach(function(row) {
			this.infoList.push(new PillarInfo(row));
		}, this);
	}
};

/**
 * 获取柱子粗细值
 * @return {number}
 */
Pillar.prototype.getInfo = function(level) {
	var info = this.infoMap[level];
	if (!info) {
		var p = this._find(level);
		info = {
			//柱子宽度
			thickness : qc.StickHero.PILLARWIDTH
		};
		if (p) {
			info.thickness *= p.thickness;
		}
		this.infoMap[level] = info;
	}
	return info;
};

/**
 * 遍历获取柱子粗细百分比
 * @param  {number} level - 关卡数
 * @return {number}
 */
Pillar.prototype._find = function(level) {
	for (var i = 0, len = this.infoList.length; i < len; i++) {
		var info = this.infoList[i];
		if (level < info.minLv)
			continue;
		if (level >= info.minLv && level <= info.maxLv)
			return info;
	}
	return null;
};

//游戏结束类
var GameOver = qc.defineBehaviour('qc.StickHero.GameOver',qc.Behaviour,function(){

},{
	restartBtn: qc.Serializer.NODE,
	current: qc.Serializer.NODE,
	best: qc.Serializer.NODE
});

GameOver.prototype.awake = function(){

	//游戏结束事件派发
	this.addListener(qc.StickHero.uiEvent,function(e){
		if(e === 'gameOver'){
			this.showMenu();
		}
	},this);

	//监听重新开始按钮
	this.addListener(this.restartBtn.onClick,this.restart,this);

};

//显示游戏结束界面
GameOver.prototype.showMenu = function(){
	this.gameObject.visible = true;
	this.current.text = 'current' +'    ' + qc.StickHero.me.current;
	this.best.text = 'best' + '    ' + qc.StickHero.me.best;
};

//重来
GameOver.prototype.restart = function(){

	this.gameObject.visible = false;
	qc.StickHero.uiEvent.dispatch('restart');
};

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
	self.addListener(qc.StickHero.uiEvent,function(e){

		if(e === 'onUp'){
			this.gameObject.interactive = false;
		}
	},this);

	//成功的处理
	self.addListener(qc.StickHero.uiEvent,function(e,pillar){
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

	//提示两秒后自动消隐
	this.game.timer.add(2000,function(){
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
/**
 * Created by zouhq on 2016/5/9.
 */
// 柱子类
var Pillar = qc.defineBehaviour('qc.StickHero.uiPillar', qc.Behaviour, function() {

	this.stick = null;

}, {
	// 棍子预制
	stickPrefab : qc.Serializer.PREFAB

});

/**
 * 初始化柱子
 * @param  {number} start - 上一个柱子的x轴坐标
 */
Pillar.prototype.init = function(prePillar, level) {

	// 获取柱子的宽度
	var info = qc.StickHero.logicpillar.getInfo(level);
	this.gameObject.width = info.thickness;


	if (prePillar === null) {
		this.gameObject.x = 0;
	}
	else {
		this.gameObject.x = prePillar.gameObject.x + qc.StickHero.GAMEWIDTH - this.gameObject.width;

	}

	// 创建棍子对象
	if (!this.stick){
		this.stick = this.createStick();
	}


	// 初始化棍子
	this.initStick();
};


//创建棍子
Pillar.prototype.createStick = function() {
	var node = this.game.add.clone(this.stickPrefab, this.gameObject.parent.parent);
	return node.getScript('qc.StickHero.Stick');
};

/**
 * 初始化棍子
 */
Pillar.prototype.initStick = function() {
	this.stick.init(this);
};

/**
 * Created by zouhq on 2016/5/9.
 */
// 柱子池
var Pillars= qc.defineBehaviour('qc.StickHero.Pillars', qc.Behaviour, function() {
	this.pillarList = [];
	qc.StickHero.pillars = this;
}, {
	// 柱子预制
	pillarPrefab : qc.Serializer.PREFAB
});

Pillars.prototype.awake = function() {
	this.addListener(qc.StickHero.uiEvent,function(e){
		if(e === 'onLogicReady'){
			this._init();
		}
	},this);
};

/**
 * 初始化柱子
 */
Pillars.prototype._init = function() {

	var prePillar = null;
	for (var i = 0; i < 3; i++) {
		var pillar = this.pillarList[i] || this.createPillar();
		if (prePillar) {
			pillar.init(prePillar, i);
		}
		else {
			pillar.init(null, i);
		}
		prePillar = pillar;
		this.pillarList[i] = pillar;
	}

	qc.StickHero.uiEvent.dispatch('onPillarReady',this.pillarList);
};

/**
 * 创建柱子
 */
Pillars.prototype.createPillar = function() {
	var node = this.game.add.clone(this.pillarPrefab, this.gameObject);
	return node.getScript('qc.StickHero.uiPillar');
};

/**
 * 下一关
 */
Pillars.prototype.next = function() {
	var p = this.pillarList.shift();
	this.pillarList.push(p);

	var step = this.getStep();
	qc.StickHero.me.level += 1;
	p.init(step, qc.StickHero.me.level);
};

/**
 * 重置柱子列表
 */
Pillars.prototype.reset = function () {
	this._init();
};

/**
 * 获取跳台
 * @return {qc.Node}
 */
Pillars.prototype.getStep = function() {
	return this.pillarList[1];
};

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
	this.gameObject.anchoredX = 10;
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
/**
 * Created by zouhq on 2016/5/9.
 */
var Welcome = qc.defineBehaviour('qc.StickHero.Welcome',qc.Behaviour,function(){

},{
	title: qc.Serializer.NODE,
	startBtn: qc.Serializer.NODE,
	excelConfig: qc.Serializer.EXCELASSET
});

Welcome.prototype.awake = function(){

	var self = this;

	qc.StickHero.initGame(self.excelConfig,self.game);

	//監聽開始按鈕
	self.addListener(self.startBtn.onClick,self.start,self);
};

//開始遊戲
Welcome.prototype.start = function(){

	var self = this;
	qc.StickHero.uiEvent.dispatch('startGame');
	self.hide();
};

//隱藏歡迎界面
Welcome.prototype.hide = function(){

	var self = this;
	self.gameObject.visible = false;
};

}).call(this, this, Object);
