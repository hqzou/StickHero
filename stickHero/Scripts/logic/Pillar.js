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
