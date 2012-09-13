/*
 * @description:调试工具
 * */

var dorsyConsole = function(){ 
    var _this = this;
    this.vars = [];
    this.timer = setInterval(function(){_this.dump();},3000);
};

dorsyConsole.prototype = {
    var_dump: function($var){
    },
    addWatch: function(obj,name){//对象,属性名
        this.vars.push([obj,name]);
    },
    dump: function(){
        for(var i = 0;i < this.vars.length;i ++){
            var msg = this.vars[i][0].constructor.name + "." + this.vars[i][1];
            console.log(msg + ":" + this.vars[i][0][this.vars[i][1]]);
        }
    }
};

var DC = new dorsyConsole();
