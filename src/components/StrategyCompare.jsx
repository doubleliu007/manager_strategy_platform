import { useMemo, useState } from 'react'
import {
  managers,
  strategyGroups,
  strategyTaxonomy,
  getStrategyGroup,
} from '../data/managers.js'
import { SearchIcon, ArrowRight } from './Icons.jsx'

// 将各管理人策略拍平为可横向比较的记录
const allStrategies = managers.flatMap((m) =>
  m.strategies.map((s) => ({
    ...s,
    managerId: m.id,
    managerName: m.shortName,
    managerType: m.type,
    group: getStrategyGroup(s.category),
  }))
)

// 统计每个一级分类下的策略数量
const groupCounts = strategyGroups.reduce((acc, g) => {
  acc[g] = allStrategies.filter((s) => s.group === g).length
  return acc
}, {})

// 从形如 "3.98%" / "-0.40%" / "约3%" / "R2" 的文本中解析数值
function parseNum(val) {
  if (typeof val !== 'string') return null
  const m = val.match(/-?\d+(\.\d+)?/)
  return m ? parseFloat(m[0]) : null
}

// 按关键词从策略 metrics 中挑选指标值
function pickMetric(metrics, keywords) {
  if (!metrics) return null
  for (const kw of keywords) {
    const found = metrics.find((x) => x.label.includes(kw))
    if (found) return found.value
  }
  return null
}

// 归一化出用于横向对比的核心列
function normalize(s) {
  return {
    ...s,
    annual: pickMetric(s.metrics, ['年化']),
    ret: pickMetric(s.metrics, ['收益', '区间']),
    drawdown: pickMetric(s.metrics, ['回撤']),
    sharpe: pickMetric(s.metrics, ['夏普']),
  }
}

const COMPARE_COLS = [
  { key: 'annual', label: '参考年化' },
  { key: 'ret', label: '区间/累计收益' },
  { key: 'drawdown', label: '最大回撤' },
  { key: 'sharpe', label: '夏普比率' },
]

function valClass(key) {
  if (key === 'drawdown') return 'neg'
  if (key === 'annual' || key === 'ret') return 'pos'
  return ''
}

function StrategyTable({ rows, sort, onSort, onSelectManager }) {
  return (
    <div className="table-wrap">
      <table className="perf-table compare-table">
        <thead>
          <tr>
            <th>管理人</th>
            <th>策略名称</th>
            <th>风险等级</th>
            {COMPARE_COLS.map((c) => (
              <th
                key={c.key}
                className={`sortable ${sort.key === c.key ? 'sorted' : ''}`}
                onClick={() => onSort(c.key)}
              >
                {c.label}
                <span className="sort-ind">
                  {sort.key === c.key ? (sort.dir === 'desc' ? '▼' : '▲') : '⇅'}
                </span>
              </th>
            ))}
            <th>核心亮点</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, i) => (
            <tr
              key={i}
              className="compare-row"
              onClick={() => onSelectManager(s.managerId, s.name)}
            >
              <td className="prod">
                <div className="cmp-mgr">{s.managerName}</div>
                <span className="cmp-mgr-type">{s.managerType}</span>
              </td>
              <td className="cmp-strat">{s.name}</td>
              <td>
                <span className="cmp-risk">{s.risk}</span>
              </td>
              {COMPARE_COLS.map((c) => (
                <td key={c.key} className={s[c.key] ? valClass(c.key) : 'muted'}>
                  {s[c.key] || '—'}
                </td>
              ))}
              <td className="cmp-highlight">{s.highlight || '—'}</td>
              <td className="cmp-go">
                <ArrowRight size={15} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function StrategyCompare({ onSelectManager }) {
  const [group, setGroup] = useState(strategyGroups[0])
  const [sub, setSub] = useState('全部')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: null, dir: 'desc' })

  // 当前一级分类下、真实存在策略的二级分类
  const subsInGroup = useMemo(
    () =>
      strategyTaxonomy[group].filter((sc) =>
        allStrategies.some((s) => s.category === sc)
      ),
    [group]
  )

  const q = query.trim().toLowerCase()

  const applySort = (list) => {
    if (!sort.key) return list
    return [...list].sort((a, b) => {
      const av = parseNum(a[sort.key])
      const bv = parseNum(b[sort.key])
      if (av === null && bv === null) return 0
      if (av === null) return 1
      if (bv === null) return -1
      return sort.dir === 'desc' ? bv - av : av - bv
    })
  }

  const matchQuery = (s) =>
    !q ||
    [s.name, s.managerName, s.desc, s.highlight]
      .join(' ')
      .toLowerCase()
      .includes(q)

  // 需要渲染的二级分类分组
  const sections = useMemo(() => {
    const targets = sub === '全部' ? subsInGroup : [sub]
    return targets
      .map((sc) => ({
        sub: sc,
        rows: applySort(
          allStrategies
            .filter((s) => s.category === sc && matchQuery(s))
            .map(normalize)
        ),
      }))
      .filter((sec) => sec.rows.length > 0)
  }, [group, sub, query, sort, subsInGroup])

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { key, dir: 'desc' }
    )
  }

  const totalRows = sections.reduce((n, sec) => n + sec.rows.length, 0)

  return (
    <>
      <div className="hero">
        <div className="hero-inner">
          <h1>
            同类<em>策略</em>横向比较
          </h1>
          <p>
            将各合作机构的特色策略按"固收 / 权益 / 混合类"三大方向及细分策略归集，
            横向对比同类策略的参考年化、回撤、夏普等核心指标，辅助快速筛选与优选适配的合作管理人。
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="num">{allStrategies.length}</div>
              <div className="lbl">策略总数</div>
            </div>
            <div className="hero-stat">
              <div className="num">{strategyGroups.length}</div>
              <div className="lbl">一级分类</div>
            </div>
            <div className="hero-stat">
              <div className="num">{managers.length}</div>
              <div className="lbl">覆盖管理人</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="toolbar">
          <div className="search-wrap">
            <SearchIcon />
            <input
              className="search-input"
              placeholder="在当前一级分类内搜索策略名、管理人、说明关键词…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="filter-row">
            <span className="filter-label">一级分类</span>
            {strategyGroups.map((g) => (
              <button
                key={g}
                className={`chip chip-lg ${group === g ? 'active' : ''}`}
                onClick={() => {
                  setGroup(g)
                  setSub('全部')
                  setSort({ key: null, dir: 'desc' })
                }}
              >
                {g} <span className="chip-count">{groupCounts[g]}</span>
              </button>
            ))}
          </div>

          <div className="filter-row">
            <span className="filter-label">二级分类</span>
            <button
              className={`chip ${sub === '全部' ? 'active' : ''}`}
              onClick={() => setSub('全部')}
            >
              全部
            </button>
            {subsInGroup.map((sc) => {
              const count = allStrategies.filter((s) => s.category === sc).length
              return (
                <button
                  key={sc}
                  className={`chip ${sub === sc ? 'active' : ''}`}
                  onClick={() => setSub(sc)}
                >
                  {sc} <span className="chip-count">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {totalRows > 0 ? (
          sections.map((sec) => (
            <div className="section" key={sec.sub}>
              <div className="section-title" style={{ marginBottom: 14 }}>
                {group} · {sec.sub}
                <span className="section-count">{sec.rows.length} 个策略</span>
              </div>
              <StrategyTable
                rows={sec.rows}
                sort={sort}
                onSort={toggleSort}
                onSelectManager={onSelectManager}
              />
            </div>
          ))
        ) : (
          <div className="empty">
            <div className="big">🔍</div>
            <div>当前分类下暂无匹配的策略，试试其他关键词或分类</div>
          </div>
        )}

        <div className="source-note">
          * 指标由各管理人材料中披露的策略指标自动归集，口径（成立以来 / 年度 / 区间）可能存在差异，
          "—" 表示该策略未披露对应指标。点击任意行可查看该管理人全盘信息。历史业绩不代表未来表现。
        </div>
      </div>
    </>
  )
}
