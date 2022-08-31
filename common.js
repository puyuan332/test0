import {
    assetManager,
    AssetManager,
    log,
    ResolutionPolicy,
    screen,
    Size,
    UITransform,
    view,
    _decorator,
} from 'cc';
import {DEBUG} from 'cc/env';
import {TAutoRegEventCom, TScene} from 'rubix-lib-hf';
import {I18nMgr} from '../extensions/i18n/assets/NI18nMgr';
import {
    C_AUDIO_KEY,
    C_BUNDLE_LIST,
    C_WIN_PATH,
} from './mainScene/script/global/NConst';
import {E_StageType} from './mainScene/script/global/NEnum';
import {gFunctions, NGlobal} from './mainScene/script/global/NGlobal';
import {NDebugLayer} from './mainScene/script/layer/NDebugLayer';
import {NTopLayer} from './mainScene/script/layer/NTopLayer';
import {NWinLayer} from './mainScene/script/layer/NWinLayer';
import NP from './mainScene/script/netWork/netProtocol.js';

const {ccclass} = _decorator;
@ccclass('NMainScene')
export class NMainScene extends TScene {
    private _nextStage: E_StageType;
    public get nextStage(): E_StageType {
        return this._nextStage;
    }

    private _autoRegCom: TAutoRegEventCom;

    onLoad() {
        super.onLoad();
        NGlobal.Init(this);
        this._autoRegCom = new TAutoRegEventCom(this);
        this._autoRegCom.addEventRegExp(/_NetRespone$/);
        this.getDebugLayer().node.active = false;
        if (!DEBUG) {
            this.getDebugLayer().destroy();
        }
    }

    start() {
        this._autoRegCom.autoRegisteredEvent();
        this._lastStageKey = E_StageType.NONE;
        this._stageKey = E_StageType.NONE;

        assetManager.loadBundle('common', () => {
            this.enterStage(E_StageType.LOBBY);
            this.initAudio();
            this.initPlat();
        });
    }

    private getSearchParams(search: string) {
        const searchParams = new Map<string, string>();
        const searchStr = search.substring(1);
        const searchArr = searchStr.length ? searchStr.split('&') : [];
        searchArr.forEach((item) => {
            let i = item.indexOf('=', 0);
            let key = decodeURIComponent(item.substring(0, i));
            let value = decodeURIComponent(item.substring(i + 1, item.length));
            if (key) {
                searchParams.set(key, value);
            }
        });
        return searchParams;
    }

    public autoAdapterSize() {
        log('autoAdapterSize');
        let dr = view.getDesignResolutionSize();
        let s = screen.windowSize;
        log('screen size', s.width, s.height);
        let rw = s.width;
        let rh = s.height;
        let finalW = rw;
        let finalH = rh;

        if (rw / rh > dr.width / dr.height) {
            finalH = dr.height;
            finalW = (finalH * rw) / rh;
        } else {
            finalW = dr.width;
            finalH = (rh / rw) * finalW;
        }

        view.setDesignResolutionSize(finalW, finalH, ResolutionPolicy.UNKNOWN);
        let cvs = this.getComponent(UITransform);
        cvs.width = finalW;
        cvs.height = finalH;
        log('final size', finalW, finalH);
    }

    /**
     * getContentSize
     */
    public getContentSize(): Size {
        let cvs = this.getComponent(UITransform);
        return new Size(cvs.width, cvs.height);
    }

    /**
     * initPlat
     */
    public initPlat() {
        // 读取平台信息
        let paramList = this.getSearchParams(location.search);
        if (paramList.get('token')) {
            NGlobal.userData.Account.svrToken = paramList.get('token');
        }
        if (paramList.get('platid')) {
            NGlobal.userData.Account.platId = Number(paramList.get('platid'));
        }
        if (paramList.get('lang')) {
            I18nMgr.language = paramList.get('lang');
            let lang: string = paramList.get('lang');
            if (lang != 'en' && lang != 'zh_cn') {
                I18nMgr.language = 'en';
            }
        } else {
            I18nMgr.language = 'en';
        }
    }

    private initAudio() {
        NGlobal.audioMgr.init(
            NGlobal.AssteMgr,
            C_BUNDLE_LIST.COMMON,
            'res/audio/',
            C_AUDIO_KEY
        );
    }

    /**
     * getWinLayer
     */
    public getWinLayer(): NWinLayer {
        return this.layerList[2];
    }

    public getTopLayer(): NTopLayer {
        return this.layerList[3] as NTopLayer;
    }

    public getDebugLayer(): NDebugLayer {
        return this.layerList[4] as NDebugLayer;
    }

    public enterStage(stageKey: number): void {
        if (this._stageKey != E_StageType.LOADING) {
            this._nextStage = stageKey;
            stageKey = E_StageType.LOADING;
        } else {
            this._nextStage = E_StageType.NONE;
        }
        NGlobal.AssteMgr.loadBundleAsync(
            gFunctions.getBundleNameByStageKey(stageKey)
        ).then((_: AssetManager.Bundle) => {
            super.enterStage(stageKey);
            NGlobal.winMgr.currStageKey = stageKey;
        });
    }

    public exitStage(lastStageKey: number, stageKey: number): any {
        // NOTE: 清理资源等等
        switch (stageKey) {
            case E_StageType.LOBBY:
                break;

            default:
                break;
        }
    }

    /**
     * enterFullScreen
     */
    public enterFullScreen(): Promise<any> {
        return new Promise((resolve, _) => {
            if (screen.supportsFullScreen) {
                screen.requestFullScreen().then(() => {
                    // this.autoAdapterSize();
                    resolve(undefined);
                });
            } else {
                // this.autoAdapterSize();
                resolve(undefined);
            }
        });
    }

    public exitFullScreen(): Promise<any> {
        return screen.exitFullScreen();
    }

    public PMD_TICKREQUESTNULLUSERPMD_CS_NetRespone(
        data: NP.core.TickRequestNullUserPmd_CS
    ) {
        // let cmd: NP.core.TickRequestNullUserPmd_CS =
        //     NP.core.TickRequestNullUserPmd_CS.create();
        // cmd.cmd_name = 'Pmd.TickRequestNullUserPmd_CS';
        // cmd.requesttime = data.requesttime;
        // cmd.mytime = Math.floor(new Date().getTime() / 1000);
        // NGlobal.netMgr.ws.sendData(cmd.toJSON());
        //
        let cmd = {
            cmd_name: 'Pmd.TickReturnNullUserPmd_CS',
            requesttime: data.requesttime,
            mytime: Math.floor(new Date().getTime() / 1000),
        };
        NGlobal.netMgr.ws.sendData(cmd);
    }

    public Pmd_UserLoginReturnFailLoginUserPmd_S_NetRespone(data: any) {
        if (data.retcode && data.retcode == 5) {
            NGlobal.winMgr.showTips(
                I18nMgr.getLanguageByKey('common.RepeatRecords'),
                I18nMgr.getLanguageByKey('common.RefreshPage')
            );
        }
    }
}
