import { useEffect, useRef, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { ArrowLeft, StarIcon } from './Icons.jsx'

const TABS = ['基本情况', '特色策略', '实盘表现', '合作落地']
const PIE_COLORS = ['#f8a430', '#ffb85c', '#ffcc85', '#ffdfaf', '#ffedd4', '#e5892a']

function cellClass(val) {
  if (typeof val !== 'string') return ''
  if (val.trim().startsWith('-') && val.includes('%')) return 'neg'
  if (val.includes('%')) return 'pos'
  return ''
}

export default function ManagerDetail({
  manager,
  onBack,
  initialTab = '基本情况',
  highlightStrategy = null,
}) {
  const [tab, setTab] = useState(initialTab)
  const initial = manager.shortName.slice(0, 2)

  // 从策略比较页跳转进来时，切到指定 tab
  useEffect(() => {
    setTab(initialTab)
  }, [initialTab, manager.id, highlightStrategy])

  return (
    <>
      <div className="detail-top">
        <div className="detail-top-inner">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft /> 返回管理人列表
          </button>
          <div className="detail-head">
            <div className="detail-badge">{initial}</div>
            <div>
              <div className="detail-name">{manager.shortName}</div>
              <div className="detail-fullname">{manager.name}</div>
              <div className="detail-meta">
                <span>类型：<b>{manager.type}</b></span>
                <span>成立：<b>{manager.established}</b></span>
                <span>注册地：<b>{manager.location}</b></span>
                <span>实际控制人 / 股东：<b>{manager.controller}</b></span>
              </div>
              <div className="detail-tags">
                {manager.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-nav">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="container">
        {tab === '基本情况' && <BasicTab manager={manager} />}
        {tab === '特色策略' && (
          <StrategyTab manager={manager} highlight={highlightStrategy} />
        )}
        {tab === '实盘表现' && <PerformanceTab manager={manager} />}
        {tab === '合作落地' && <CooperationTab manager={manager} />}

        <div className="source-note">
          数据来源：{manager.source}　|　本平台为内部投研知识库，产品历史业绩不代表未来表现，投资须谨慎。
        </div>
      </div>
    </>
  )
}

/* ---------------- 基本情况 ---------------- */
function BasicTab({ manager }) {
  return (
    <>
      <div className="metric-strip">
        {manager.highlightMetrics.map((m, i) => (
          <div className="metric-box" key={i}>
            <div className="v">{m.value}</div>
            <div className="l">{m.label}</div>
            {m.unit && <div className="u">{m.unit}</div>}
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-title">公司背景</div>
        <div className="panel">
          <div className="overview-text">{manager.overview}</div>
          <div className="feature-grid">
            {manager.features.map((f, i) => (
              <div className="feature-item" key={i}>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(manager.scaleBreakdown || manager.scaleTrend) && (
        <div className="section">
          <div className="section-title">管理规模结构</div>
          <div className="two-col">
            {manager.scaleBreakdown && (
              <div className="chart-panel">
                <h4>资产 / 业务结构（{manager.scaleUnit}）</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={manager.scaleBreakdown}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={50}
                      paddingAngle={2}
                      label={(e) => e.label}
                      labelLine={false}
                      fontSize={11}
                    >
                      {manager.scaleBreakdown.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => `${v} ${manager.scaleUnit}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {manager.scaleTrend && (
              <div className="chart-panel">
                <h4>规模增长趋势（{manager.scaleUnit}）</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={manager.scaleTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="year" fontSize={12} stroke="#999" />
                    <YAxis fontSize={11} stroke="#999" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {Object.keys(manager.scaleTrend[0])
                      .filter((k) => k !== 'year')
                      .map((k, i) => (
                        <Bar
                          key={k}
                          dataKey={k}
                          stackId="a"
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                          radius={i === 0 ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                        />
                      ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-title">投研团队</div>
        <div className="panel">
          <div className="overview-text">{manager.team}</div>
          {manager.awards && manager.awards.length > 0 && (
            <>
              <div style={{ marginTop: 20, fontWeight: 700, fontSize: 15 }}>
                荣誉奖项
              </div>
              <div className="award-list">
                {manager.awards.map((a, i) => (
                  <span className="award" key={i}>
                    {a}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ---------------- 特色策略 ---------------- */
function StrategyTab({ manager, highlight }) {
  const highlightRef = useRef(null)

  useEffect(() => {
    if (highlight && highlightRef.current) {
      const t = setTimeout(() => {
        highlightRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 120)
      return () => clearTimeout(t)
    }
  }, [highlight, manager.id])

  return (
    <div className="section">
      <div className="section-title">特色策略介绍（{manager.strategies.length}）</div>
      <div className="strategy-grid">
        {manager.strategies.map((s, i) => {
          const isHit = highlight && s.name === highlight
          return (
          <div
            className={`strat-card ${isHit ? 'strat-card-hit' : ''}`}
            key={i}
            ref={isHit ? highlightRef : null}
          >
            <div className="strat-head">
              <div className="strat-name">{s.name}</div>
              <span className="strat-cat">{s.category}</span>
            </div>
            <div className="strat-risk">
              风险等级：<b>{s.risk}</b>
            </div>
            <div className="strat-desc">{s.desc}</div>
            {s.metrics && s.metrics.length > 0 && (
              <div className="strat-metrics">
                {s.metrics.map((m, j) => (
                  <div className="strat-metric" key={j}>
                    <div className="v">{m.value}</div>
                    <div className="l">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
            {s.highlight && (
              <div className="strat-highlight">
                <span>亮点</span>
                <div>{s.highlight}</div>
              </div>
            )}
          </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- 实盘表现 ---------------- */
function PerformanceTab({ manager }) {
  const cols = manager.performanceCols
  return (
    <div className="section">
      <div className="section-title">代表产品实盘表现</div>
      <div className="table-wrap">
        <table className="perf-table">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {manager.performance.map((row, i) => {
              const vals = Object.values(row)
              return (
                <tr key={i}>
                  {vals.map((v, j) => (
                    <td key={j} className={j === 0 ? 'prod' : cellClass(v)}>
                      {v}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="source-note" style={{ borderTop: 'none', marginTop: 12 }}>
        * 数据截至各管理人材料披露日，历史业绩不代表未来表现。
      </div>
    </div>
  )
}

/* ---------------- 合作落地 ---------------- */
function CooperationTab({ manager }) {
  const c = manager.cooperation
  return (
    <div className="section">
      <div className="section-title">合作业务落地规模与表现</div>
      <div className="coop-summary">
        <div className="lbl">{c.totalLabel}</div>
        <div className="val">{c.totalValue}</div>
        <div className="note">{c.note}</div>
      </div>
      {c.items.map((item, i) => (
        <div className="coop-item" key={i}>
          <div className="coop-item-head">
            <h4>{item.name}</h4>
            <span className="coop-scale">{item.scale}</span>
          </div>
          <p>{item.desc}</p>
          {item.perf && (
            <div className="coop-perf">
              <b>实盘业绩：</b>
              {item.perf}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
