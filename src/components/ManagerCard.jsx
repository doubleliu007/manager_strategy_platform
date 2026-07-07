import { ArrowRight } from './Icons.jsx'

export default function ManagerCard({ manager, onClick }) {
  const initial = manager.shortName.slice(0, 2)
  const m1 = manager.highlightMetrics[0]
  const m2 = manager.highlightMetrics[1] || manager.highlightMetrics[0]

  return (
    <div className="card" onClick={() => onClick(manager.id)}>
      <div className="card-head">
        <div className="card-badge">{initial}</div>
        <div>
          <div className="card-title">{manager.shortName}</div>
          <span className="card-type">{manager.type}</span>
        </div>
      </div>

      <div className="card-overview">{manager.overview}</div>

      <div className="card-metrics">
        <div className="card-metric">
          <div className="v">{m1.value}</div>
          <div className="l">{m1.label}</div>
        </div>
        <div className="card-metric">
          <div className="v">{m2.value}</div>
          <div className="l">{m2.label}</div>
        </div>
      </div>

      <div className="card-tags">
        {manager.tags.slice(0, 4).map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>

      <div className="card-foot">
        <span className="card-strat-count">
          {manager.strategies.length} 个特色策略 · 成立于 {manager.established}
        </span>
        <span className="card-cta">
          查看全盘信息 <ArrowRight size={15} />
        </span>
      </div>
    </div>
  )
}
