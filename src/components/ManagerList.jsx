import { useMemo, useState } from 'react'
import {
  managers,
  managerTypes,
  strategyGroups,
  getStrategyGroup,
} from '../data/managers.js'
import ManagerCard from './ManagerCard.jsx'
import { SearchIcon } from './Icons.jsx'

const groupFilters = ['全部', ...strategyGroups]

export default function ManagerList({ onSelect }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('全部')
  const [category, setCategory] = useState('全部')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return managers.filter((m) => {
      // 类型筛选
      if (type !== '全部' && m.type !== type) return false
      // 策略一级分类筛选
      if (
        category !== '全部' &&
        !m.strategies.some((s) => getStrategyGroup(s.category) === category)
      )
        return false
      // 关键词搜索：名称、标签、策略名、概述
      if (!q) return true
      const haystack = [
        m.name,
        m.shortName,
        m.type,
        m.location,
        m.controller,
        ...m.tags,
        m.overview,
        ...m.strategies.map((s) => s.name + s.category + s.desc),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [query, type, category])

  // 汇总统计
  const totalStrategies = managers.reduce(
    (sum, m) => sum + m.strategies.length,
    0
  )

  return (
    <>
      <div className="hero">
        <div className="hero-inner">
          <h1>
            委外<em>管理人</em>信息管理与检索平台
          </h1>
          <p>
            汇集券商资管、基金、保险资管、信托等外部管理人的公司背景、特色策略、实盘表现与合作落地情况。
            机构来访时，可快速检索管理人，一站式掌握其全盘信息。
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="num">{managers.length}</div>
              <div className="lbl">合作管理人</div>
            </div>
            <div className="hero-stat">
              <div className="num">{totalStrategies}</div>
              <div className="lbl">特色策略</div>
            </div>
            <div className="hero-stat">
              <div className="num">{managerTypes.length - 1}</div>
              <div className="lbl">机构类型</div>
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
              placeholder="搜索管理人名称、机构类型、特色策略（如：对冲打新、城投债、量化指增、港股红利…）"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="filter-row">
            <span className="filter-label">机构类型</span>
            {managerTypes.map((t) => (
              <button
                key={t}
                className={`chip ${type === t ? 'active' : ''}`}
                onClick={() => setType(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="filter-row">
            <span className="filter-label">策略方向</span>
            {groupFilters.map((c) => (
              <button
                key={c}
                className={`chip ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="result-count">
          共匹配到 <b>{filtered.length}</b> 家管理人
        </div>

        {filtered.length > 0 ? (
          <div className="grid">
            {filtered.map((m) => (
              <ManagerCard key={m.id} manager={m} onClick={onSelect} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="big">🔍</div>
            <div>未找到匹配的管理人，试试其他关键词或筛选条件</div>
          </div>
        )}
      </div>
    </>
  )
}
