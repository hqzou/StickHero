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
		this.gameObject.x =0;
	}
	else {
		this.gameObject.x = prePillar.gameObject.x + qc.StickHero.GAMEWIDTH - this.gameObject.width - 20;

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
