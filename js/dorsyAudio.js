/*
 *@author dorsywang
 *以adobe audition为设计出发原点，构造需求（暂时webkit内核only)
 *dorsyAudio是以多轨混缩音频为基础对象，要实现单轨音的编辑（均衡、剪辑等），多轨音音场
 * */
var dorsyAudio = function(){
    //constructor


    //single audio class
     var singleAudio = function(url){
        var context = new webkitAudioContext();
        var singleAudioObj = {
            url: url,
            buffer: null,
            load: function(callBack){
                var _this = this;
                var request = new XMLHttpRequest();
                var onError = function(e){alert(e)};
                request.open('POST',this.url,true);
                request.responseType = 'arraybuffer';

                request.onload = function(){
                        context.decodeAudioData(request.response, function(buffer){
                            _this.buffer = buffer;
                            //_this.play();
                            callBack();
                        },onError);
                };
                request.send();
            },
            play: function(){

                var source = context.createBufferSource();
                source.buffer = this.buffer;
                source.connect(context.destination);
                source.noteOn(0);
            }
        };
        return singleAudioObj;
    };

    var MutiAudio = {
        tracks: [],//Audio array
        addTrack: function(){//support for diffents arguments as 's','g',...  or 's',[],... or [],...
            for(var i = 0;i < arguments.length;i ++){
                var type = typeof(arguments[i]);
                if(type === "string"){
                    var audio = new singleAudio(arguments[i]);
                    this.tracks.push(audio);
                }else if(type === "object"){
                    var isArray = ('slice' in arguments[i]);
                    if(isArray){
                        for(var j = 0;j < arguments[i].length;j ++){
                            var audio = new singleAudio(arguments[i][j]);
                            this.tracks.push(audio);
                        }
                    }
                }
            }
        },
        load: function(callBack){//load all track sound
            _this = this;
            for(var i = 0;i < this.tracks.length;i ++){
                this.tracks[i].load(function(){_this.fireReady(i);});
            }
        },
        play: function(){
            for(var i = 0;i < this.tracks.length;i ++){
                this.tracks[i].play();
            }
        },
        fireReady: function(i){
            if(i == this.tracks.length) this.play();
        }
        
    };
    return MutiAudio;
};
var b = new dorsyAudio();
//var a = new singleAudio('a.mp3');
//a.load();
b.addTrack("a.mp3");
b.load();
