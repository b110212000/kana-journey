import React from 'react';
import {BookOpen, Sun, Moon, Share2, Info, RefreshCw, ChevronDown, CheckCircle2, WifiOff, LibraryBig, ExternalLink} from 'lucide-react';
import AppSharing from './AppSharing';
import {useToast} from './ToastProvider';
import './settings.css';

function SettingSection({id,icon:Icon,title,summary,open,onToggle,children,newBadge=false}) {
  return <section className={'settingItem '+(open?'expanded':'')}>
    <button type="button" className="settingItemButton"
      aria-expanded={open} aria-controls={'settings-panel-'+id}
      onClick={()=>onToggle(open?null:id)}>
      <span className="settingItemIcon" aria-hidden="true"><Icon size={20}/></span>
      <span className="settingItemText"><strong>{title}</strong><small>{summary}</small></span>
      {newBadge&&<span className="settingAvailableTag">有更新</span>}
      <ChevronDown size={19} className="settingItemChevron" aria-hidden="true"/>
    </button>
    {open&&<div className="settingItemPanel" id={'settings-panel-'+id}>{children}</div>}
  </section>;
}

export default function SettingsView({
  level,levels,onLevelChange,theme,onThemeChange,
  version,update,open,onToggle,appIcon,questionBank,starterQuestionCount
}) {
  const notify=useToast();
  const hasNew=update.available;
  const checkUpdate=async()=>{
    const outcome=await update.check();
    if(outcome==='available')notify('偵測到新版本，現在可以立即更新。');
    else if(outcome==='current')notify('YOMIO 已是最新版本 v'+version+'。');
    else if(outcome==='offline')notify('目前沒有網路，請連線後再檢查。','error');
    else notify('暫時無法檢查更新，請稍後重試。','error');
  };
  const updateLabel = hasNew ? '新版本 v'+update.latest+' 已推出' :
    update.status==='offline'?'目前離線':
    update.status==='error'?'上次檢查失敗':
    update.status==='checking'?'正在檢查更新':'已是最新版本';
  return <section className="page narrow settingsPage settingsSimplified">
    <div className="settingBrandCompact">
      <img src={appIcon} alt="" />
      <span><strong>YOMIO</strong><small>個人化你的日文學習</small></span>
    </div>
    <div className="settingList">
      <SettingSection id="level" icon={BookOpen} title="學習程度"
        summary={'目前程度 · '+level} open={open==='level'} onToggle={onToggle}>
        <p className="settingHelper">調整程度後會套用至單字、課程與測驗。</p>
        <label className="settingSelectLabel" htmlFor="study-level">目前程度</label>
        <select className="settingSelect" id="study-level" value={level}
          onChange={event=>onLevelChange(event.target.value)}>
          {levels.map(item=><option value={item.id} key={item.id}>{item.id} · {item.subtitle}</option>)}
        </select>
        <p className="settingHelper settingLevelDescription">{levels.find(item=>item.id===level)?.description}</p>
      </SettingSection>

      <SettingSection id="theme" icon={theme==='dark'?Moon:Sun} title="顯示模式"
        summary={theme==='dark'?'深色模式':'淺色模式'} open={open==='theme'} onToggle={onToggle}>
        <div className="themeChoices" role="group" aria-label="切換顯示模式">
          <button type="button" className={theme==='light'?'selected':''} aria-pressed={theme==='light'}
            onClick={()=>onThemeChange('light')}><Sun size={19}/> 淺色</button>
          <button type="button" className={theme==='dark'?'selected':''} aria-pressed={theme==='dark'}
            onClick={()=>onThemeChange('dark')}><Moon size={19}/> 深色</button>
        </div>
      </SettingSection>

      <SettingSection id="sharing" icon={Share2} title="分享與安裝"
        summary="分享連結、加入手機主畫面" open={open==='sharing'} onToggle={onToggle}>
        <AppSharing/>
      </SettingSection>

      <SettingSection id="bank" icon={LibraryBig} title="題庫資訊"
        summary="各級題目數、題型與參考資源" open={open==='bank'} onToggle={onToggle}>
        <p className="settingHelper">YOMIO 的練習題依程度分類。每回合只抽一部分題目，下面可以查看完整題庫數量。</p>
        <div className="bankOverview" aria-label="JLPT 題庫統計">
          <div className="bankRow">
            <strong>初階</strong><span>{starterQuestionCount} 題</span>
            <small>五十音與生活單字</small>
          </div>
          {['N5','N4','N3','N2','N1'].map(id=>{
            const questions=questionBank[id]||[];
            return <div className="bankRow" key={id}>
              <strong>{id}</strong><span>{questions.length} 題</span>
              <small>{['單字','文法','讀解'].map(type=>type+' '+questions.filter(q=>q.type===type).length).join(' · ')}</small>
            </div>;
          })}
        </div>
        <div className="bankResourceList">
          <strong>模擬考與題型參考</strong>
          <a href="https://www.jlpt.jp/tw/samples/sampleindex.html" target="_blank" rel="noopener noreferrer">JLPT 官方試題集 <ExternalLink size={14}/></a>
          <a href="https://jlptsensei.com/downloads/jlpt-n5-practice-test/" target="_blank" rel="noopener noreferrer">JLPT Sensei 免費練習資源 <ExternalLink size={14}/></a>
          <a href="https://www.unagibun.com/jlpt-online/" target="_blank" rel="noopener noreferrer">Unagibun 線上模擬考 <ExternalLink size={14}/></a>
        </div>
        <p className="settingFinePrint">外部連結僅供參考題型與練習方式。YOMIO 題目為自行編寫的練習題，並非官方試題或授權轉載的模擬試卷。</p>
      </SettingSection>

      <SettingSection id="update" icon={RefreshCw} title="版本更新"
        summary={updateLabel} newBadge={hasNew} open={open==='update'} onToggle={onToggle}>
        <div className="settingVersionRows">
          <div><span>目前版本</span><strong>v{version}</strong></div>
          <div><span>已發布版本</span><strong>{['current','available'].includes(update.status)?'v'+update.latest:'尚未取得'}</strong></div>
        </div>
        {hasNew?<div className="settingUpdateFound">
          <span className="updateGreenDot" aria-hidden="true"/>
          <p>v{update.latest} 已發布，點擊下方即可載入最新版本。</p>
        </div>:<p className="settingHelper">
          {update.status==='current'?<><CheckCircle2 size={16}/> 已使用最新版本。</>:
           update.status==='offline'?<><WifiOff size={16}/> 離線時無法檢查更新。</>:
           update.status==='error'?'目前無法取得版本資訊，可以稍後再試。':'正在取得已發布版本資訊…'}
        </p>}
        <button className="settingUpdateButton" type="button"
          disabled={update.status==='checking'}
          onClick={hasNew?update.installLatest:checkUpdate}>
          <RefreshCw size={18} className={update.status==='checking'?'isChecking':''}/>
          {hasNew?'立即更新至 v'+update.latest:update.status==='checking'?'檢查中…':'檢查更新'}
        </button>
        <p className="settingFinePrint">更新僅重新載入已發布的網站程式，不會清除本機學習紀錄；進行測驗時不會自動重整。</p>
      </SettingSection>

      <SettingSection id="about" icon={Info} title="關於 YOMIO"
        summary="應用程式與資料說明" open={open==='about'} onToggle={onToggle}>
        <div className="settingVersionRows">
          <div><span>應用程式</span><strong>YOMIO</strong></div>
          <div><span>本機資料</span><strong>僅此裝置</strong></div>
        </div>
        <p className="settingFinePrint">五十音、單字與 JLPT 分級練習。尚未支援雲端同步，清除瀏覽器資料可能失去紀錄。</p>
      </SettingSection>
    </div>
    <p className="settingFooter">每天一點，日文更近一點。</p>
  </section>;
}
