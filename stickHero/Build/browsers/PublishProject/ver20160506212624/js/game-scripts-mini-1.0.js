(function(e,t,n){qc.Stick={onDownFlag:!1};var r=qc.defineBehaviour("qc.engine.stick",qc.Behaviour,function(){var e=this;e.onDownFlag=!1},{stickNode:qc.Serializer.NODE});r.prototype.awake=function(){var e=this,t=e.game.input;e.stickNode.height=0,e.addListener(e.gameObject.onDown,function(){e.onDownFlag=!0},e),e.addListener(e.gameObject.onUp,function(){e.onDownFlag=!1},e)},r.prototype.update=function(){var e=this;e.onDownFlag&&(e.stickNode.height+=2)}}).call(this,this,Object)