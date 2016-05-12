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
