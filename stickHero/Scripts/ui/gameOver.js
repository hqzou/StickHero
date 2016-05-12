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
