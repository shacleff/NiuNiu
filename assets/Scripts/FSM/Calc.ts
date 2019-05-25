import StateBase from "../components/StateBase";
import * as Define from "../Define";
import Game from "../Game";
import UIMgr from "../UIMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Calc extends StateBase {

    @property({type:cc.Enum(Define.GameState),serializable:true})
    public state:Define.GameState = Define.GameState.Calc;

    onLoad(){
        
    }
    
    public stateInitialize(){
        cc.warn("calc!!!");

        //delay time for allkill anime
        let delay: number = 0;



        UIMgr.Inst.animMgr.playShowAllCardAnim(()=>{
            if(this.isAllKill()) {
                this.allKill();
                delay = 3;
                cc.warn("delay");
            }
            this.scheduleOnce(()=>{
                this.moneyFlow();
                if(Define.GameInfo.Inst.players[0].win_bet > 0)
                    this.victory()
                this.m_FSM.setState(Define.GameState.End);
            }, delay);
            
        });
    }

    public stateRelease(){

    }

    public stateUpdate(dt: number){
    }

    //check show all kill or not
    isAllKill() : boolean{
        //show anyway if only 2 player
        if(Define.GameInfo.Inst.playerCount == 2)
            return true;
        //check if banker win all the other
        for(let index = 0;index < Define.GameInfo.Inst.playerCount;index++){
            //skip self
            if(index == Define.GameInfo.Inst.bankerIndex) continue;
            //check all kill
            let profit = Define.GameInfo.Inst.players[index].win_bet;
            if(profit > 0){
                cc.log("not all kill by player"+index);
                return false;
            }
        }
        return true;
    }

    //show banker get and then banker give
    moneyFlow(){
        this.bankerWin(Define.GameInfo.Inst.bankerIndex);
        this.bankerLose(Define.GameInfo.Inst.bankerIndex);
    }

    bankerWin(bankerSeat: number){
        for(let index = 0;index < Define.GameInfo.Inst.playerCount;index++){
            //skip self
            if(index == bankerSeat) continue;
            //check really lose to banker
            let profit = Define.GameInfo.Inst.players[index].win_bet;
            if(profit < 0){
                UIMgr.Inst.players[index].moneyChange(profit,40);
                UIMgr.Inst.animMgr.playCoinFlow(index, bankerSeat, ()=>{
                    UIMgr.Inst.players[bankerSeat].setShiny();
                    UIMgr.Inst.players[bankerSeat].moneyChange(-profit,40);
                });
            }
        }
    }

    bankerLose(bankerSeat: number){
        for(let index = 0;index < Define.GameInfo.Inst.playerCount;index++){
            //skip self
            if(index == bankerSeat) continue;
            //check really lose to banker
            let profit = Define.GameInfo.Inst.players[index].win_bet;
            if(profit > 0){
                UIMgr.Inst.players[bankerSeat].moneyChange(-profit,40);
                UIMgr.Inst.animMgr.playCoinFlow(bankerSeat, index, ()=>{
                    UIMgr.Inst.players[index].setShiny();
                    UIMgr.Inst.players[index].moneyChange(profit,40);
                });
            }
        }
    }

    allKill(){
        UIMgr.Inst.animMgr.playAllKill();
    }

    victory(){
        UIMgr.Inst.animMgr.playVictory();
    }

    

}
