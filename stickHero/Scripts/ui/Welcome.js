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