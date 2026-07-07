import { useEffect, useState } from 'react'
import { managers } from './data/managers.js'
import Header from './components/Header.jsx'
import ManagerList from './components/ManagerList.jsx'
import ManagerDetail from './components/ManagerDetail.jsx'
import StrategyCompare from './components/StrategyCompare.jsx'

export default function App() {
  const [view, setView] = useState('managers')
  const [selectedId, setSelectedId] = useState(null)
  // 从策略比较页跳转时，记录需要定位/高亮的策略名
  const [focusStrategy, setFocusStrategy] = useState(null)

  const selected = managers.find((m) => m.id === selectedId)

  // 切换视图时回到顶部（进入带高亮的详情页时不强制置顶，交由高亮滚动处理）
  useEffect(() => {
    if (selectedId && focusStrategy) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedId, view, focusStrategy])

  const goHome = () => {
    setSelectedId(null)
    setFocusStrategy(null)
    setView('managers')
  }

  const handleNav = (v) => {
    setSelectedId(null)
    setFocusStrategy(null)
    setView(v)
  }

  // 从策略比较页跳转到某管理人详情（可携带需高亮的策略名）
  const handleSelectManager = (id, strategyName = null) => {
    setSelectedId(id)
    setFocusStrategy(strategyName)
  }

  const handleBack = () => {
    setSelectedId(null)
    setFocusStrategy(null)
  }

  let content
  if (selected) {
    content = (
      <ManagerDetail
        manager={selected}
        onBack={handleBack}
        initialTab={focusStrategy ? '特色策略' : '基本情况'}
        highlightStrategy={focusStrategy}
      />
    )
  } else if (view === 'strategies') {
    content = <StrategyCompare onSelectManager={handleSelectManager} />
  } else {
    content = <ManagerList onSelect={(id) => handleSelectManager(id)} />
  }

  return (
    <>
      <Header onHome={goHome} view={view} onNav={handleNav} />
      {content}
      <footer className="footer">
        <div className="risk">风险提示：理财非存款 · 产品有风险 · 投资须谨慎</div>
        <div>
          © 宁银理财有限责任公司 · 合作机构策略展示平台（内部使用）
        </div>
        <div style={{ opacity: 0.6, marginTop: 4 }}>
          本平台数据仅供内部投研参考，产品历史业绩不代表未来表现。
        </div>
      </footer>
    </>
  )
}
