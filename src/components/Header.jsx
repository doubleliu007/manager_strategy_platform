export default function Header({ onHome }) {
  return (
    <div className="top-bar">
      <div className="top-bar-inner">
        <img
          className="top-logo"
          src="/bnb-logo.png"
          alt="宁银理财"
          onClick={onHome}
        />
        <div className="top-divider" />
        <div onClick={onHome}>
          <div className="top-title">
            委外<span>管理人</span>策略展示平台
          </div>
          <div className="top-sub">MANAGER STRATEGY PLATFORM</div>
        </div>
        <div className="top-spacer" />
        <div className="top-tag">内部投研知识库</div>
      </div>
    </div>
  )
}
