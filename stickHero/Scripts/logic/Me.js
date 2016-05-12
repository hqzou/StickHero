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