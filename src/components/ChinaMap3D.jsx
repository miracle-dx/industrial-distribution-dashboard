import { useEffect, useRef, useState, useCallback } from 'react'
import * as echarts from 'echarts'
import chinaJson from '../../public/china.json'
import {
  provinceData,
  mapData,
  getEconomicDescription,
  getDevelopmentPosition,
  getYouthProspect,
  getUpgradeDirection,
  getEmergingIndustries,
  getKeyZones,
  getPolicySupport,
  getGrowthRateColor,
  getGrowthRateText,
  getProvinceName
} from '../data/provinceData'
import './ChinaMap3D.css'

export default function ChinaMap3D() {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const autoPlayTimer = useRef(null)
  const currentIndexRef = useRef(-1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // 默认显示北京
  const [currentProvince, setCurrentProvince] = useState(null)
  const isHoveringRef = useRef(false)

  // 停止自动轮播
  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current)
      autoPlayTimer.current = null
    }
  }, [])

  // 启动自动轮播
  const startAutoPlay = useCallback(() => {
    stopAutoPlay()
    autoPlayTimer.current = setInterval(() => {
      if (!chartInstance.current) return
      // 切换到下一个省份
      currentIndexRef.current = (currentIndexRef.current + 1) % mapData.length
      const nextItem = mapData[currentIndexRef.current]
      if (!nextItem) return

      const province = provinceData[nextItem.name]
      if (province) {
        setCurrentProvince(province)
        // 更新高亮和tooltip
        chartInstance.current.dispatchAction({
          type: 'downplay',
          seriesIndex: 0
        })
        chartInstance.current.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          dataIndex: currentIndexRef.current
        })
        chartInstance.current.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: currentIndexRef.current
        })
      }
    }, 3000) // 每3秒切换一次
  }, [stopAutoPlay])

  // 初始化高亮北京
  const initHighlight = useCallback(() => {
    if (!chartInstance.current) return
    // 默认高亮北京
    setCurrentProvince(provinceData['北京市'])
    const beijingIndex = mapData.findIndex(item => item.name === '北京市')
    if (beijingIndex >= 0) {
      currentIndexRef.current = beijingIndex
      chartInstance.current.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: beijingIndex
      })
      chartInstance.current.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: beijingIndex
      })
    }
    // 启动自动轮播
    startAutoPlay()
  }, [startAutoPlay])

  useEffect(() => {
    const initChart = async () => {
      if (!chartRef.current) return

      try {
        setLoading(true)
        setError(null)

        // 使用本地静态地图数据
        echarts.registerMap('china', chinaJson)

        chartInstance.current = echarts.init(chartRef.current)

        const option = {
          backgroundColor: 'transparent',
          tooltip: {
            show: true,
            trigger: 'item',
            alwaysShowContent: true,
            backgroundColor: 'rgba(0,20,40,0.9)',
            borderColor: '#00ffff',
            borderWidth: 1,
            textStyle: { color: '#fff' },
            padding: 12,
            extraCssText: 'border-radius: 6px; box-shadow: 0 0 20px rgba(0,255,255,0.3);',
            formatter: function(params) {
              if (params.name) {
                const info = provinceData[params.name]
                if (info) {
                  const gdpFormatted = info.gdp.toLocaleString()
                  return `
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #00ffff;">${params.name}</div>
                    <div style="margin-bottom: 5px;"><span style="color: #888;">主要产业：</span>${info.industry}</div>
                    <div><span style="color: #888;">2024年GDP：</span><span style="color: #ff0000; font-weight: bold;">${gdpFormatted}</span> 亿元</div>
                  `
                }
                return `<div style="font-weight: bold;">${params.name}</div>`
              }
              return params.name
            }
          },
          visualMap: {
            show: true,
            min: 0,
            max: 140000,
            inRange: {
              color: ['#001a33', '#0a3a6a', '#1a5a9a', '#00aaff', '#ff8800', '#ff4400', '#ff0000']
            },
            text: ['高GDP', '低GDP'],
            textStyle: {
              color: '#fff'
            },
            calculable: true,
            left: '320px',
            bottom: '30px'
          },
          series: [{
            type: 'map',
            map: 'china',
            name: '中国地图',
            roam: false,
            zoom: 1.2,
            aspectScale: 0.9,
            label: {
              show: false,
              color: '#fff',
              fontSize: 10
            },
            itemStyle: {
              areaColor: '#0a3a6a',
              borderColor: '#00ffff',
              borderWidth: 1,
              borderType: 'solid',
              shadowBlur: 10,
              shadowColor: 'rgba(0, 255, 255, 0.3)'
            },
            emphasis: {
              label: {
                show: true,
                color: '#fff',
                fontSize: 12
              },
              itemStyle: {
                areaColor: '#1a5a9a',
                borderWidth: 2,
                borderColor: '#00ffff'
              }
            },
            select: {
              disabled: true
            },
            data: mapData
          }]
        }

        chartInstance.current.setOption(option)

        // 监听点击事件 - 点击省份才切换卡片信息
        chartInstance.current.on('click', function(params) {
          if (params.data && params.data.name) {
            const province = provinceData[params.data.name]
            if (province) {
              setCurrentProvince(province)
              // 停止自动轮播
              stopAutoPlay()
              // 更新地图tooltip和高亮
              const index = mapData.findIndex(item => item.name === params.data.name)
              if (index >= 0) {
                currentIndexRef.current = index
                chartInstance.current.dispatchAction({
                  type: 'showTip',
                  seriesIndex: 0,
                  dataIndex: index
                })
                chartInstance.current.dispatchAction({
                  type: 'highlight',
                  seriesIndex: 0,
                  dataIndex: index
                })
              }
            }
          }
        })

        // 鼠标离开地图，恢复自动轮播
        chartInstance.current.on('mouseout', function() {
          startAutoPlay()
        })

        setLoading(false)

        // 初始化高亮北京
        initHighlight()
      } catch (err) {
        console.error('地图加载失败:', err)
        setError(err.message || '地图数据加载失败')
        setLoading(false)
      }
    }

    initChart()

    const handleResize = () => {
      chartInstance.current?.resize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      stopAutoPlay()
      chartInstance.current?.dispose()
    }
  }, [startAutoPlay, stopAutoPlay, initHighlight])

  // 鼠标事件处理
  const handleMouseEnter = () => {
    isHoveringRef.current = true
  }

  const handleMouseLeave = () => {
    isHoveringRef.current = false
  }

  return (
    <div className="map-wrapper">
      {/* 左侧：两个面板上下排列 */}
      <div className="side-panel">
        {/* 上方：基础数据信息面板 */}
        <div className="info-card">
          <h3>基本信息</h3>
          <div className="panel-province-name">
            {currentProvince ? getProvinceName(currentProvince) : '等待加载'}
          </div>
          <table className="info-table">
            <tbody>
              <tr>
                <td>常住人口</td>
                <td>
                  {currentProvince ? `${currentProvince.population.toLocaleString()} 万` : '-'}
                </td>
              </tr>
              <tr>
                <td>2024年GDP</td>
                <td className="text-red">
                  {currentProvince ? `${currentProvince.gdp.toLocaleString()} 亿元` : '-'}
                </td>
              </tr>
              <tr>
                <td>GDP全国排名</td>
                <td className="text-yellow">
                  {currentProvince ? `第 ${currentProvince.rank} 名` : '-'}
                </td>
              </tr>
              <tr>
                <td>发展潜力</td>
                <td className="text-green">
                  {currentProvince ? currentProvince.potential : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 下方：产业详细说明面板 */}
        {currentProvince && (
          <div className="info-card">
            <h3>产业概况</h3>
            <div>
              <div className="panel-section mb-12">
                <span className="section-label">主要产业：</span>
                <div className="text-cyan">
                  {currentProvince.industry.split('、').map((item, idx) => (
                    <span key={idx} className="industry-tag">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="panel-section">
                <span className="section-label">经济特点：</span>
                <div className="section-content">
                  {getEconomicDescription(getProvinceName(currentProvince))}
                </div>
              </div>
              <div className="panel-section">
                <span className="section-label">发展定位：</span>
                <div className="section-content text-yellow">
                  {getDevelopmentPosition(currentProvince.potential)}
                </div>
              </div>
              <div className="panel-section mt-12">
                <span className="section-label">年轻人发展前景：</span>
                <div
                  title={getYouthProspect(getProvinceName(currentProvince), currentProvince.potential)}
                  className="youth-prospect text-green"
                >
                  {getYouthProspect(getProvinceName(currentProvince), currentProvince.potential)}
                </div>
              </div>
            </div>
          </div>
        )}

        {!currentProvince && (
          <div className="info-card">
            <h3>产业概况</h3>
            <div className="empty-card">
              等待加载...
            </div>
          </div>
        )}
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner" />
          <div className="loading-text">加载地图中...</div>
        </div>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <div className="error-container">
          <div className="error-title">⚠️ {error}</div>
          <div className="error-desc">请检查网络连接后重试</div>
          <button
            onClick={() => window.location.reload()}
            className="reload-button"
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 255, 255, 0.4)'
              e.target.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0, 255, 255, 0.2)'
              e.target.style.boxShadow = 'none'
            }}
          >
            重新加载
          </button>
        </div>
      )}

      {/* 图表容器 */}
      <div
        ref={chartRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`chart-container ${loading || error ? 'chart-container--hidden' : ''}`}
      />

      {/* 右侧：两个面板上下排列 */}
      <div className="side-panel">
        {/* 上方：GDP对比面板 */}
        <div className="info-card">
          <h3>GDP排名对比</h3>
          {currentProvince && (
            <table className="info-table">
              <tbody>
                <tr>
                  <td>GDP全国排名</td>
                  <td className="text-yellow">
                    {currentProvince.rank}
                  </td>
                </tr>
                <tr>
                  <td>GDP总量</td>
                  <td className="text-red">
                    {currentProvince.gdp.toLocaleString()} 亿元
                  </td>
                </tr>
                <tr>
                  <td>常住人口</td>
                  <td>
                    {currentProvince.population.toLocaleString()} 万人
                  </td>
                </tr>
                <tr>
                  <td>人均GDP</td>
                  <td className="text-green">
                    {Math.round(currentProvince.gdp * 10000 / currentProvince.population).toLocaleString()} 元
                  </td>
                </tr>
                <tr>
                  <td>占全国比重</td>
                  <td className="text-orange">
                    {(currentProvince.gdp / 1360000 * 100).toFixed(2)}%
                  </td>
                </tr>
                <tr>
                  <td>增速等级</td>
                  <td style={{
                    color: getGrowthRateColor(currentProvince.rank, currentProvince.potential),
                  }}>
                    {getGrowthRateText(currentProvince.rank, currentProvince.potential)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
          {!currentProvince && (
            <div className="empty-card">
              等待加载...
            </div>
          )}
        </div>

        {/* 下方：未来产业升级方向 */}
        {currentProvince && (
          <div className="info-card">
            <h3>产业升级方向</h3>
            <div>
              <div className="panel-section">
                <span className="section-label">重点转型方向：</span>
                <div className="section-content text-orange">
                  {getUpgradeDirection(getProvinceName(currentProvince), currentProvince.potential)}
                </div>
              </div>
              <div className="panel-section">
                <span className="section-label">新兴产业布局：</span>
                <div className="section-content text-green">
                  {getEmergingIndustries(getProvinceName(currentProvince))}
                </div>
              </div>
              <div className="panel-section">
                <span className="section-label">重点投资园区：</span>
                <div className="section-content text-yellow">
                  {getKeyZones(getProvinceName(currentProvince))}
                </div>
              </div>
              <div className="panel-section">
                <span className="section-label">政策支持力度：</span>
                <div className="section-content text-purple">
                  {getPolicySupport(currentProvince.potential)}
                </div>
              </div>
            </div>
          </div>
        )}

        {!currentProvince && (
          <div className="info-card">
            <h3>产业升级方向</h3>
            <div className="empty-card">
              等待加载...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
