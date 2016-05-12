/**
 * 用户自定义脚本.
 */
(function(window, Object, undefined) {

/**
 * Created by zouhq on 2016/5/6.
 */
qc.Stick = {
	onDownFlag: false
};

// define a user behaviour
var stick = qc.defineBehaviour('qc.engine.stick', qc.Behaviour, function() {
    // need this behaviour be scheduled in editor
    //this.runInEditor = true;
    var self = this;
    self.onDownFlag = false;
}, {
    // fields need to be serialized
    stickNode: qc.Serializer.NODE
});

// Called when the script instance is being loaded.
stick.prototype.awake = function() {
	var self = this,
        input = self.game.input;
    self.stickNode.height = 0;
    self.addListener(self.gameObject.onDown,function(){
        self.onDownFlag = true;

    },self);
    self.addListener(self.gameObject.onUp,function(){
        
        self.onDownFlag = false;

    },self);
    
};

stick.prototype.update = function(){

    var self = this;
    if(self.onDownFlag){
        self.stickNode.height +=2;
    }
};


}).call(this, this, Object);
