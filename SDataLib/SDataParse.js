/**
 * Created by shawngoodwin on 3/26/14.
PunchList:
*
*Return SDatav2 Error Object
*Test with sax stream parse error
*Test SData Parse error
 */
var Transform=require('stream').Transform;
var util=require('util');
var sax=require('sax');

module.exports = function (options, callback) {
    var ret = new SDataParse(options, callback)
    if (ret.callback) ret.on('error', ret.callback)
    return ret
};
module.exports.SDataParse=SDataParse;
function SDataParse(options,callback){
    var SDataParseSelf=this;
    this.options=options || {};
    this.options.objectMode=true;
    Transform.call(this,this.options);
    this.saxStream=sax.createStream(false,{trim:false,xmlns:false});
    this.sDataJSON={};
    //SaxStream Parse Logic
    this.saxStream.on('error',function(e){
        if(SDataParseSelf.options.debug===true){console.error("Sax Error",e);}
        this._parser.error=null;
        SDataParseSelf.emit('error',e);
    });

    this.saxStream.on("opentag",function(node){
        if(SDataParseSelf.options.debug===true){console.log('opentag'+JSON.stringify(node));}
        if(node.name=='SDATA:PAYLOAD'){
            //Start of SData Payload Next Tag is Object
            this.IsSData=true;
            this.level=0;
        } else if(this.IsSData===true){
            if(this.level===0){
                //root tag
                this.level++;
                //get attrib
                this.currentContract=node.name;
                SDataParseSelf.sDataJSON.$url=node.attributes['SDATA:URI'];
                SDataParseSelf.sDataJSON.$resourceKind=this.currentContract;
            } else {
                //data tag
                this.level++;
                this.sDataKey=node.name;
                this.sDataSelfClosing=node.isSelfClosing;
            }
        }
    });

    this.saxStream.on("closetag",function(ct){
        if(SDataParseSelf.options.debug===true){console.log('closetag'+JSON.stringify(ct));}
        if(ct==="SDATA:PAYLOAD") {
            this.IsSData=false;
            if(this.level!==0){
                //TODO:Handle Parse Error
                if(this.options.debug===true){console.log('Parse Error')}
                SDataParseSelf.emit('error',new Error('SData Parse Error'));
            }
        } else if(this.IsSData===true){
            if(SDataParseSelf.options.debug===true){console.log(ct);}
            if(ct===this.currentContract){
                //reached end of current contract
                this.level--;
                SDataParseSelf.push(SDataParseSelf.sDataJSON);
                SDataParseSelf.sDataJSON={};
            } else {
                //reached end of data tag
                this.level--;
                if(this.sDataSelfClosing===false){
                    SDataParseSelf.sDataJSON[this.sDataKey]=this.sDataText;
                } else{
                    SDataParseSelf.sDataJSON[this.sDataKey]='';
                }
            }
        }
    });
    this.saxStream.on("text",function(t){
        if(this.IsSData===true){
            if(SDataParseSelf.options.debug===true){console.log('text:'+t);}
            this.sDataText=t;
        }
    });
    this.saxStream.on('end',function(){
        if(SDataParseSelf.options.debug===true){console.log('sDataJSON'+JSON.stringify(SDataParseSelf.sDataJSON));}
            if(this.level!==0){
                SDataParseSelf.emit('error',new Error('SData Parse Error'));
            } else {
                SDataParseSelf.push(null);
            }
        }
    );
};
util.inherits(SDataParse,Transform);
SDataParse.prototype._transform=function(chuck,encoding,done){
    this.saxStream.write(chuck,encoding);
    done();
}
