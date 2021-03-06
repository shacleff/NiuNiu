import Game from "./Game";
import Converter, * as Define from "./Define";
import DistributePokerAnimation from "./Anime/DistributePokerAnimation";
import CoinFlowAnimation from "./Anime/CoinFlowAnimation";
import UIMgr from "./UIMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimMgr extends cc.Component {
    @property(DistributePokerAnimation) pokerAnime: DistributePokerAnimation = null;
    @property(CoinFlowAnimation) coinAnime:CoinFlowAnimation = null;
    @property(cc.Node) playePokerRoot: cc.Node = null;
    


    onLoad() {

    }

    playStartGame(callback?) {
        Game.Inst.animationMgr.play("StartGameAnim", 1, false, () => {
            if (callback != undefined) {
                callback();
            }
        })
        UIMgr.Inst.AudioMgr.playStartGame();
    }

    playCardTypeError(){
        UIMgr.Inst.AudioMgr.playCardError();
        Game.Inst.animationMgr.play("CardTypeErrorAnim", 1,false); 
    }

    playCoinFlow(fromSeat: number, toSeat: number, callback?){
        this.coinAnime.fromSeat = fromSeat;
        this.coinAnime.toSeat = toSeat;
        Game.Inst.animationMgr.play("CoinFlowAnim",1,false,()=>{
            cc.warn("coin flow complete");
            if (callback != undefined) {
                callback();
            }
        }); 
    }

    playChooseCompleteAnim(){
        let pos: cc.Vec2 =cc.v2(-80,-365);
        let Interval: number = 1;
        for (let index:number = 0; index < 5; index++) {
            let node:cc.Node = this.playePokerRoot.children[index];
            node.active = true;
            //set start position
            let action:cc.ActionInstant = cc.spawn(
                cc.moveTo( Interval , pos.x + 40*index , pos.y).easing(cc.easeQuinticActionOut()),
                cc.scaleTo(Interval,0.8).easing(cc.easeQuinticActionOut())
            )
            node.runAction(action);  
        }     
    }

    /**
     * 發牌動畫
     */
    playDistributePoker(callback?) {
        //set player number
        this.pokerAnime.playerCount = Define.GameInfo.Inst.playerCount;
        UIMgr.Inst.AudioMgr.playDistribute();
        Game.Inst.animationMgr.play("DistributePokerAnim", 3, false, () => {
            if (callback != undefined)
                callback();
        });
    }

    /**
     * 當recover在playCard階段  需要補牌
     */
    playRecoverCard(){
        cc.warn("////recover card////");
        this.pokerAnime.playerCount = Define.GameInfo.Inst.playerCount;
        Game.Inst.animationMgr.play("DistributePokerAnim", 3, false);
    }

    playShowAllCardAnim(callback?){
        let playerCount = Define.GameInfo.Inst.playerCount;
        //hide complete UI    consider server delay,delay little(?)
        this.scheduleOnce(()=>{
            cc.log("hide"+(playerCount+1)+"player complete");
            for(let index = 0;index< playerCount;index++)
            UIMgr.Inst.CardStatusUIMgr.setComplete(index,false);
        },1)
        //cc.warn("playerTotal"+playerCount);
        //cc.warn("playing"+0+"type"+Define.GameInfo.Inst.players[0].cardType);
        this.playCardTypeAnim(Define.GameInfo.Inst.players[0].cardType);
        for(let index = 1; index < playerCount - 1; index++){
            this.scheduleOnce(()=>{ 
                //cc.log("schedule player" + index);
                this.playShowCardAnim(index);
            },index*2);
        };
        this.scheduleOnce(()=>{ 
            //cc.log("schedule player" + (playerCount - 100));
            this.playShowCardAnim(playerCount - 1,callback);
        },(playerCount-1)*2);
        

    }

    /**各玩家亮牌表演 */
    playShowCardAnim(seat: number, callback?){
        //cc.log("play Type show card"+seat);
        UIMgr.Inst.cardUIMgr.setCard(seat,()=>{
            UIMgr.Inst.CardStatusUIMgr.setType(seat,Define.GameInfo.Inst.players[seat].cardType);
            UIMgr.Inst.AudioMgr.playCardTypeTalk(Define.GameInfo.Inst.players[seat].cardType, Define.GameInfo.Inst.players[seat].gender);
            cc.warn("setType"+seat);
            this.scheduleOnce(function(){
                cc.warn("playing"+seat+"type"+Define.GameInfo.Inst.players[seat].cardType);
                this.playCardTypeAnim(Define.GameInfo.Inst.players[seat].cardType, callback);
            },1);
        });
    }

    /**牌型動畫(若普通牌型則直接callback) */
    playCardTypeAnim(type: Define.CardType, callback?){
        let animName: string = Converter.getCardTypeAnimText(type);
        //let animRate: number = Converter.getCardTypeAnimRate(type);
        let audioName : string = Converter.getCardTypeAudioIndex(type);
        if(animName == "NoneType") {
            if (callback != undefined)
                callback();
        }
        else{
            UIMgr.Inst.AudioMgr.playCardTypeAnim(audioName);
            Game.Inst.animationMgr.play(animName, 1,false, callback); 
        }
        //cc.log("playType:"+animName + "RATE : "+animRate);
    }

    playAllKill(callback?){
        UIMgr.Inst.AudioMgr.playAllKill();
        Game.Inst.animationMgr.play("allKill", 1, false, () => {
            if (callback != undefined)
                callback();
        });
    }

    playVictory(callback?){
        UIMgr.Inst.AudioMgr.playVictory();
        Game.Inst.animationMgr.play("victory", 1,false, callback);
    }

    testPlay(){
        this.playStartGame(()=>{
            this.playAllKill(()=>{
                this.playCardTypeAnim(Define.CardType.smallCow,()=>{
                    this.playCardTypeAnim(Define.CardType.cowCow,()=>{
                        this.playCardTypeAnim(Define.CardType.goldCow,()=>{
                            this.playCardTypeAnim(Define.CardType.silverCow,()=>{
                                this.playCardTypeAnim(Define.CardType.bomb,()=>{
                                    this.playVictory(()=>{
                                        this.playCardTypeError();
                                    });  
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    testBanker(){
        Game.Inst.animationMgr.play("banker0", 1,false);
        Game.Inst.animationMgr.play("banker1", 1,false);
        Game.Inst.animationMgr.play("banker2", 1,false);
        Game.Inst.animationMgr.play("banker3", 1,false);
        Game.Inst.animationMgr.play("banker4", 1,false);
    }

}
