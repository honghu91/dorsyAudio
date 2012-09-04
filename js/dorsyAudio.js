/*
 *@author dorsywang
 *以adobe audition为设计出发原点，构造需求（暂时webkit内核only)
 *dorsyAudio是以多轨混缩音频为基础对象，要实现单轨音的编辑（均衡、剪辑等），多轨音音场
 * */
var dorsyAudio = function(){
    //constructor

    var audioDuration = 0;
    var Painter = function(SA){//SA presents singleAudio Object

    /*
     * @description: just draw the audio graph
     * */
        var P = {
            canvas: "",
            ctx: "",
            msg: "",
            bilv: 0,
            paintData:[],//[[canvasElement,x,y]]
            init: function(){
                var canvas = document.createElement("canvas");
                canvas.id = "dorsyAudio_audioGraph";
                canvas.width = "1400";
                canvas.height = "400";
                document.body.appendChild(canvas);

                var msg = document.createElement("div");
                msg.class="dorsyAudio_msg";
                document.body.appendChild(msg);

                this.canvas = canvas;
                this.ctx = canvas.getContext("2d");
                this.msg = msg;

                this.attEvent();
            },
            drawAudioGraph: function(audioBuffer){
                var canvas = document.createElement("canvas");
                canvas.width = this.canvas.width;
                canvas.height = this.canvas.height;
                var ctx = canvas.getContext("2d");
                ctx.translate(0,200);

                var l = audioBuffer.length;
                var bilv = l / parseInt(this.canvas.width);
                this.bilv = bilv;

                ctx.strokeStyle = "navy";
                for(var i = 0,l = audioBuffer.length;i < l;i += 100){
                   ctx.lineTo(i / bilv,audioBuffer[i] * 100); 
                }
                ctx.stroke();
                var data = [canvas,0,0];
                this.paintData.push(data);
                this.drawLine();
            },
            attEvent: function(){
                var _this = this;
                this.canvas.onmousedown = function(e){
                    _this.clearCanvas();
                    _this.paintData[1][1] = e.offsetX;
                    _this.draw();
                    var currTime = e.offsetX / parseInt(_this.canvas.width) * audioDuration;
                    SA.setCurrTime(currTime);

                    _this.showMsg(currTime + "s");
                }
            },
            draw: function(){
                for(var i = 0;i < this.paintData.length;i ++){
                    this.ctx.drawImage(this.paintData[i][0],this.paintData[i][1],this.paintData[i][2]);
                }
            },
            drawLine: function(){
                var canvas = document.createElement("canvas");
                canvas.width = "3";
                canvas.height = this.canvas.width;
                var ctx = canvas.getContext("2d");
                ctx.moveTo(1,0);
                ctx.lineTo(1,800);
                ctx.stroke();
                var data = [canvas,0,0];
                this.paintData.push(data);
            },
            clearCanvas: function(){
                this.ctx.clearRect(0,0,parseInt(this.canvas.width),parseInt(this.canvas.height));
            },
            showMsg: function(msg){
                this.msg.innerHTML = msg;
            }
        };
        return P;

    };

    //single audio class
     singleAudio = function(url){
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
                            audioDuration = buffer.duration;
                            _this.play();
                            _this.draw();
                            if(callBack) callBack();
                        },onError);
                };
                request.send();
            },
            setCurrTime: function(time){
                context.currentTime = time;
            },
            play: function(){//play sound

                var source = context.createBufferSource();
                source.buffer = this.buffer;
                source.connect(context.destination);
                source.noteOn(0);
            },
            setChannel: function(side){
                /*
                 * @description: set right channel on or left
                 *
                 * */
                var splitter = context.createChannelSplitter(2);
                var source = context.createBufferSource();
                source.buffer = this.buffer;
                source.connect(splitter);
                splitter.connect(context.destination)
                source.noteOn(1);

            },
            setAnalyse: function(){
                /*
                 * @description: analyse audio graph
                 *
                 * */
                
                analyser = context.createAnalyser();
                analyser.fftSize = 2048;
                var source = context.createBufferSource();
                source.connect(analyser);
                analyser.connect(context.destination);
                var analyserView1 = new AnalyserView("view1");
                analyserView1.initByteBuffer();
                analyserView1.doFrequencyAnalysis();
                
            },
            draw: function(){
                //var oscillator = context.createOscillator();
                var data = this.buffer.getChannelData(0);
                var painter = new Painter(this);
                painter.init();
                painter.drawAudioGraph(data);
                painter.draw();
  
            }
        };
        return singleAudioObj;
    };

    var MutiAudio = {
        tracks: [],//Audio array
        addTrack: function(){//support for different arguments as 's','g',...  or 's',[],... or [],...
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
            var _this = this;
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
var a = new singleAudio('aspire.mp3');
var c = new singleAudio('a.mp3');
a.load();
c.load();
//b.addTrack("a.mp3");
//b.load();
