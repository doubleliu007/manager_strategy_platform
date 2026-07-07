import { useEffect, useState } from 'react'
import { managers } from './data/managers.js'
import Header from './components/Header.jsx'
import ManagerList from './components/ManagerList.jsx'
import ManagerDetail from './components/ManagerDetail.jsx'

export default function App() {
  const [selectedId, setSelectedId] = useState(null)

  const selected = managers.find((m) => m.id === selectedId)

  // 切换视图时回到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedId])

  const goHome = () => setSelectedId(null)

  return (
    <>
      <Header onHome={goHome} />
      {selected ? (
        <ManagerDetail manager={selected} onBack={goHome} />
      ) : (
        <ManagerList onSelect={setSelectedId} />
      )}
      <footer className="footer">
        <div className="risk">风险提示：理财非存款 · 产品有风险 · 投资须谨慎</div>
        <div>
          © 宁银理财有限责任公司 · 委外管理人策略展示平台（内部使用）
        </div>
        <div style={{ opacity: 0.6, marginTop: 4 }}>
          本平台数据仅供内部投研参考，产品历史业绩不代表未来表现。
        </div>
      </footer>
    </>
  )
}
