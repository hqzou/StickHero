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