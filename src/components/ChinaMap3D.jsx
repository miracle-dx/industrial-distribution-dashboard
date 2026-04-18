import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import chinaJson from '../../public/china.json'
console.info(3)
// 各省份详细数据（人口单位：万人，GDP单位：亿元）
// 数据来源：2024年各省统计局公开数据
const provinceData = {
  '广东省': { industry: '电子制造、对外贸易、先进制造业', gdp: 135673, population: 12657, rank: 1, potential: 'A+' },
  '江苏省': { industry: '制造业、电子信息、化工', gdp: 128224, population: 8515, rank: 2, potential: 'A+' },
  '山东省': { industry: '重化工、农业、装备制造', gdp: 92485, population: 10163, rank: 3, potential: 'A' },
  '浙江省': { industry: '数字经济、民营制造、电子商务', gdp: 87351, population: 6627, rank: 4, potential: 'A+' },
  '河南省': { industry: '农业、食品加工、装备制造', gdp: 63090, population: 9872, rank: 5, potential: 'A' },
  '四川省': { industry: '电子信息、装备制造、食品饮料', gdp: 61039, population: 8374, rank: 6, potential: 'A' },
  '湖北省': { industry: '汽车制造、光电子、生物医药', gdp: 56235, population: 5844, rank: 7, potential: 'A' },
  '福建省': { industry: '电子信息、纺织服装、对外贸易', gdp: 54355, population: 4188, rank: 8, potential: 'A' },
  '湖南省': { industry: '工程机械、文化娱乐、农业', gdp: 50917, population: 6604, rank: 9, potential: 'A' },
  '安徽省': { industry: '家电制造、新能源、农业', gdp: 49132, population: 6127, rank: 10, potential: 'A' },
  '上海市': { industry: '金融贸易、高端制造、生物医药', gdp: 48473, population: 2487, rank: 11, potential: 'A+' },
  '北京市': { industry: '科技创新、金融服务、文化旅游', gdp: 47104, population: 2185, rank: 12, potential: 'A+' },
  '河北省': { industry: '钢铁、建材、医药', gdp: 43938, population: 7420, rank: 13, potential: 'B+' },
  '陕西省': { industry: '能源化工、装备制造、航空航天', gdp: 35516, population: 3956, rank: 14, potential: 'A-' },
  '江西省': { industry: '有色金属、电子信息、航空', gdp: 34505, population: 4517, rank: 15, potential: 'A-' },
  '辽宁省': { industry: '重工业、船舶制造、石油化工', gdp: 32613, population: 4197, rank: 16, potential: 'B+' },
  '云南省': { industry: '烟草、旅游、有色金属', gdp: 31000, population: 4690, rank: 17, potential: 'B+' },
  '重庆市': { industry: '汽车制造、电子信息、生物医药', gdp: 30159, population: 3213, rank: 18, potential: 'A-' },
  '广西壮族自治区': { industry: '有色金属、蔗糖、旅游业', gdp: 28896, population: 5013, rank: 19, potential: 'B+' },
  '山西省': { industry: '煤炭、钢铁、电力', gdp: 26948, population: 3481, rank: 20, potential: 'B' },
  '内蒙古自治区': { industry: '煤炭、畜牧业、稀土', gdp: 24652, population: 2401, rank: 21, potential: 'B' },
  '贵州省': { industry: '大数据、煤炭、白酒', gdp: 20548, population: 3856, rank: 22, potential: 'A-' },
  '新疆维吾尔自治区': { industry: '石油天然气、农业、煤炭', gdp: 19123, population: 2589, rank: 23, potential: 'B+' },
  '黑龙江省': { industry: '农业、石油化工、林业', gdp: 15889, population: 3099, rank: 24, potential: 'B' },
  '吉林省': { industry: '汽车制造、农业、化工', gdp: 14783, population: 2348, rank: 25, potential: 'B' },
  '甘肃省': { industry: '石油化工、有色金属、新能源', gdp: 11864, population: 2492, rank: 26, potential: 'B-' },
  '海南省': { industry: '旅游业、现代服务业、热带农业', gdp: 7551, population: 1027, rank: 28, potential: 'A-' },
  '宁夏回族自治区': { industry: '煤炭、电力、煤化工', gdp: 5615, population: 728, rank: 29, potential: 'B' },
  '青海省': { industry: '盐湖化工、新能源、畜牧业', gdp: 3799, population: 595, rank: 30, potential: 'B+' },
  '西藏自治区': { industry: '旅游业、特色农牧业、清洁能源', gdp: 2392, population: 364, rank: 31, potential: 'B+' },
  '台湾省': { industry: '电子科技、半导体、外贸', gdp: 54000, population: 2330, rank: 12, potential: 'A' },
  '香港特别行政区': { industry: '金融、贸易、旅游', gdp: 2986, population: 741, rank: 32, potential: 'A-' },
  '澳门特别行政区': { industry: '博彩旅游、酒店餐饮', gdp: 1773, population: 673, rank: 33, potential: 'B+' }
}

// 根据GDP生成地图数据（排除南部群岛不展示）
const excludedProvinces = ['南海诸岛']
const mapData = Object.keys(provinceData)
  .filter(name => !excludedProvinces.includes(name))
  .map(name => ({
    name,
    value: provinceData[name].gdp
  }))

export default function ChinaMap3D() {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // 默认显示北京
  const [currentProvince, setCurrentProvince] = useState(null)
  const isHoveringRef = useRef(false)

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
      chartInstance.current?.dispose()
    }
  }, [])

  // 初始化高亮北京
  const initHighlight = () => {
    if (!chartInstance.current) return
    // 默认高亮北京
    setCurrentProvince(provinceData['北京市'])
    const beijingIndex = mapData.findIndex(item => item.name === '北京市')
    if (beijingIndex >= 0) {
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
  }

  // 鼠标事件处理（轮播已移除）
  const handleMouseEnter = () => {
    isHoveringRef.current = true
  }

  const handleMouseLeave = () => {
    isHoveringRef.current = false
  }

  // 获取经济特点描述
  const getEconomicDescription = (provinceName) => {
    const descriptions = {
      '北京市': '作为首都，北京是全国政治、文化、科技创新和国际交往中心，高新技术产业和现代服务业高度发达，拥有众多国家级科研机构和高新技术企业。',
      '上海市': '中国的经济、金融、贸易中心，拥有全球最大的港口，先进制造业和现代服务业双轮驱动，生物医药、人工智能、高端装备制造实力雄厚。',
      '广东省': '改革开放前沿，制造业规模全国第一，电子信息产业集群优势明显，对外贸易发达，粤港澳大湾区建设推动高质量发展。',
      '江苏省': '制造业强省，实体经济根基扎实，装备制造、电子信息、化工、纺织等产业齐全，苏南地区创新活力强劲。',
      '山东省': '工业体系完整，轻重工业均衡发展，能源、化工、冶金、装备制造实力突出，农业产业化水平全国领先。',
      '浙江省': '数字经济先行区，民营企业活力迸发，电子商务、数字安防、集成电路等新兴产业快速发展，专业镇经济特色鲜明。',
    }
    const defaultDesc = '依托自身区位优势和资源禀赋，形成了独具特色的产业体系，近年来在新兴产业培育和传统产业升级方面取得积极进展。'
    return descriptions[provinceName] || defaultDesc
  }

  // 获取发展定位描述
  const getDevelopmentPosition = (potential) => {
    const positions = {
      'A+': '极具发展潜力，创新活力充沛，未来增长空间巨大，是国家战略重点支持区域。',
      'A': '发展前景良好，产业基础扎实，创新能力较强，保持稳定增长态势。',
      'A-': '具有较好发展条件，特色产业鲜明，后发优势逐步显现。',
      'B+': '发展潜力较大，特色经济明显，需要进一步优化产业结构。',
      'B': '稳步发展，产业结构调整中，特色产业保持竞争力。',
      'B-': '资源型产业占比高，转型发展中，培育新增长点是重点。'
    }
    return positions[potential] || ''
  }

  // 获取年轻人发展前景分析
  const getYouthProspect = (provinceName, potential) => {
    const prospectDescriptions = {
      '北京市': '互联网、人工智能、金融科技等行业岗位丰富，薪资水平高，但生活成本也高。适合有野心、敢打拼的年轻人，创新创业氛围浓厚，资源汇聚优势明显。',
      '上海市': '金融、高端制造、生物医药行业机会多，国际化程度高，发展空间广阔。生活便利多元化，房租压力大，但薪资回报也高，适合追求高端职业发展。',
      '广东省': '制造业、外贸、电子信息产业链完整，创业机会多，中小企业活跃。珠三角城市群生活便利，包容度高，适合来南方打拼。',
      '江苏省': '制造业发达，实体经济机会多，苏州、无锡、常州等城市性价比高。南京、苏州创新资源集聚，适合技术型人才。',
      '浙江省': '数字经济发达，民营经济活跃，电子商务、互联网创业氛围好。杭州等城市生活环境优，对年轻人友好，创新创业机会多。',
      '山东省': '传统产业基础扎实，国有企业多，工作稳定，生活压力相对较小。青岛、济南发展快，适合追求稳定生活的年轻人。',
      '四川省': '成都发展迅速，电子信息产业聚集，生活舒适，房价友好。西部开发战略带来新机遇，安逸又有发展机会。',
      '湖北省': '武汉高校众多，光电子、汽车产业发达，近年来崛起快。生活成本适中，光谷等区域年轻人多，发展前景看好。',
    }
    const defaultProspect = {
      'A+': '产业转型升级快，新兴产业布局早，创业环境不断改善，对人才吸引力持续增强，机会多房价适中，年轻人发展空间大。',
      'A': '重点产业发展稳定，经济保持中高速增长，城市建设不断完善，就业机会逐步增多，生活性价比不错。',
      'A-': '特色产业正在崛起，后发优势明显，对人才需求增长快，生活压力较小，适合扎根发展。',
      'B+': '传统产业转型中，新兴产业逐步培育，机会不如一线城市，但生活成本低，竞争压力小，适合就地发展。',
      'B': '经济增长平稳，就业机会以传统行业为主，发展速度不快，但生活安逸稳定。',
      'B-': '正在培育新兴产业，转型需要时间，年轻人机会相对较少，建议外出闯荡后再考虑回乡发展。'
    }
    return prospectDescriptions[provinceName] || defaultProspect[potential] || '产业结构正在优化升级，逐步创造更多高质量就业机会。'
  }

  // 获取产业升级方向
  const getUpgradeDirection = (provinceName, potential) => {
    const directions = {
      '北京市': '推动科技创新引领，加快传统服务业数字化升级，聚焦人工智能、量子信息、生物科技等前沿领域。',
      '上海市': '强化高端制造核心竞争力，提升集成电路、生物医药、人工智能三大先导产业能级，打造全球经济中心。',
      '广东省': '推进制造业高端化智能化绿色化，发展先进装备制造、新能源汽车、半导体，加快数字经济创新发展。',
      '江苏省': '推动实体经济转型升级，聚焦物联网、生物医药、高端装备，打造世界级先进制造业集群。',
      '浙江省': '深化数字经济创新发展，打造数字产业集群，推动传统制造业数字化改造，培育新经济新业态。',
    }
    const defaultDirections = {
      'A+': '加快新兴产业培育，推动数字经济与实体经济深度融合，打造区域创新高地。',
      'A': '推进传统产业转型升级，加大技术改造投入，培育壮大特色优势产业，提升产业链现代化水平。',
      'A-': '发挥资源禀赋优势，做优做强特色产业，承接东部产业转移，培育新增长点。',
      'B+': '淘汰落后产能，推进清洁生产，发展循环经济，提升产品附加值，延伸产业链条。',
      'B': '稳步推进产业结构调整，支持优势企业做大做强，因地制宜发展特色产业。',
      'B-': '加快资源型产业转型，培育接续替代产业，发展生态经济和文化旅游。',
    }
    return directions[provinceName] || defaultDirections[potential] || '持续优化产业结构，推动高质量发展。'
  }

  // 获取新兴产业布局
  const getEmergingIndustries = (provinceName) => {
    const industries = {
      '北京市': '人工智能、量子计算、生物医药、新能源汽车、金融科技',
      '上海市': '集成电路、人工智能、生物医药、航空航天、新能源',
      '广东省': '新能源汽车、半导体、集成电路、人工智能、生物医药',
      '江苏省': '物联网、生物医药、高端装备、新能源、新材料',
      '浙江省': '数字经济、电子商务、人工智能、新能源、生物医药',
      '山东省': '新一代信息技术、新能源汽车、高端装备、现代海洋产业',
      '四川省': '电子信息、装备制造、食品饮料、先进材料、能源化工',
      '湖北省': '光电子信息、汽车制造、生物医药、新能源、人工智能',
    }
    const defaultIndustries = '新能源、新材料、电子信息、生物医药'
    return industries[provinceName] || defaultIndustries
  }

  // 获取重点产业园区
  const getKeyZones = (provinceName) => {
    const zones = {
      '北京市': '中关村科学城、亦庄经济技术开发区、怀柔科学城',
      '上海市': '张江综合性国家科学中心、临港新片区、苏州工业园区',
      '广东省': '粤港澳大湾区、深圳前海、广州南沙、珠海横琴',
      '江苏省': '苏州工业园区、南京江北新区、无锡高新区',
      '浙江省': '杭州未来科技城、宁波舟山港、温州瓯江口',
    }
    const defaultZones = '国家级新区、高新技术产业开发区、经济技术开发区'
    return zones[provinceName] || defaultZones
  }

  // 获取政策支持力度
  const getPolicySupport = (potential) => {
    const support = {
      'A+': '国家级战略区域，政策支持力度大，税收优惠多，资金投入充足',
      'A': '省级重点发展区域，政策配套完善，招商引资力度大',
      'A-': '区域中心城市，有一定政策扶持，发展环境逐步优化',
      'B+': '传统产业转型区域，政策支持转型，给予税收减免',
      'B': '稳步发展，政策支持特色产业发展',
      'B-': '生态保护优先，支持绿色产业发展',
    }
    return support[potential] || '政策支持力度逐步加大'
  }

  // 获取增速等级颜色
  const getGrowthRateColor = (rank, potential) => {
    if (potential.includes('A')) return rank <= 10 ? '#00ff00' : '#00ffaa'
    if (potential.includes('B+')) return '#ffff00'
    return '#ffaa00'
  }

  // 获取增速等级文字
  const getGrowthRateText = (rank, potential) => {
    if (rank <= 10 && potential.includes('A')) return '高速增长'
    if (potential.includes('A')) return '较快增长'
    if (potential.includes('B+')) return '平稳增长'
    return '稳步调整'
  }

  return (
    <div style={{
      position: 'absolute',
      top: 100,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 15,
      paddingLeft: 20,
      paddingRight: 20,
    }}>
      {/* 左侧：两个面板上下排列 */}
      <div style={{
        width: 290,
        display: 'flex',
        flexDirection: 'column',
        gap: 15,
        alignSelf: 'center',
      }}>
        {/* 上方：基础数据信息面板 */}
        <div style={{
          background: 'rgba(0, 20, 40, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.4)',
          borderRadius: 10,
          backdropFilter: 'blur(10px)',
          padding: 20,
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)',
          animation: 'borderGlow 3s ease infinite',
          height: 'fit-content',
        }}>
          <h3 style={{
            color: '#00ffff',
            fontSize: 18,
            textAlign: 'center',
            marginBottom: 20,
            letterSpacing: 2,
            textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
          }}>
            基本信息
          </h3>
          <div style={{
            textAlign: 'center',
            color: '#00ffff',
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 15,
            paddingBottom: 10,
            borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
          }}>
            {currentProvince ? Object.keys(provinceData).find(key => provinceData[key] === currentProvince) : '等待加载'}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{
                  padding: '10px 6px',
                  borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                  color: '#888',
                  fontSize: 13,
                }}>
                  常住人口
                </td>
                <td style={{
                  padding: '10px 6px',
                  borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 'bold',
                  textAlign: 'right',
                }}>
                  {currentProvince ? `${currentProvince.population.toLocaleString()} 万` : '-'}
                </td>
              </tr>
              <tr>
                <td style={{
                  padding: '10px 6px',
                  borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                  color: '#888',
                  fontSize: 13,
                }}>
                  2024年GDP
                </td>
                <td style={{
                  padding: '10px 6px',
                  borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                  color: '#ff0000',
                  fontSize: 15,
                  fontWeight: 'bold',
                  textAlign: 'right',
                }}>
                  {currentProvince ? `${currentProvince.gdp.toLocaleString()} 亿元` : '-'}
                </td>
              </tr>
              <tr>
                <td style={{
                  padding: '10px 6px',
                  borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                  color: '#888',
                  fontSize: 13,
                }}>
                  GDP全国排名
                </td>
                <td style={{
                  padding: '10px 6px',
                  borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                  color: '#ffff00',
                  fontSize: 15,
                  fontWeight: 'bold',
                  textAlign: 'right',
                }}>
                  {currentProvince ? `第 ${currentProvince.rank} 名` : '-'}
                </td>
              </tr>
              <tr>
                <td style={{
                  padding: '10px 6px',
                  color: '#888',
                  fontSize: 13,
                }}>
                  发展潜力
                </td>
                <td style={{
                  padding: '10px 6px',
                  color: '#00ff00',
                  fontSize: 16,
                  fontWeight: 'bold',
                  textAlign: 'right',
                }}>
                  {currentProvince ? currentProvince.potential : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 下方：产业详细说明面板 */}
        {currentProvince && (
          <div style={{
            background: 'rgba(0, 20, 40, 0.8)',
            border: '1px solid rgba(0, 255, 255, 0.4)',
            borderRadius: 10,
            backdropFilter: 'blur(10px)',
            padding: 20,
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)',
            animation: 'borderGlow 3s ease infinite',
            height: 'fit-content',
          }}>
            <h3 style={{
              color: '#00ffff',
              fontSize: 18,
              textAlign: 'center',
              marginBottom: 15,
              letterSpacing: 2,
              textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
            }}>
              产业概况
            </h3>
            <div style={{
              color: '#fff',
              fontSize: 13,
              lineHeight: 1.7,
            }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: '#888', display: 'block', marginBottom: 6 }}>主要产业：</span>
                <div style={{ color: '#00ffff' }}>
                  {currentProvince.industry.split('、').map((item, idx) => (
                    <span key={idx} style={{
                      display: 'inline-block',
                      background: 'rgba(0, 255, 255, 0.15)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      margin: '2px 3px 2px 0',
                    }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: '#888', display: 'block', marginBottom: 6 }}>经济特点：</span>
                <div style={{ color: '#fff' }}>
                  {getEconomicDescription(Object.keys(provinceData).find(key => provinceData[key] === currentProvince))}
                </div>
              </div>
              <div>
                <span style={{ color: '#888', display: 'block', marginBottom: 6 }}>发展定位：</span>
                <div style={{ color: '#ffff00' }}>
                  {getDevelopmentPosition(currentProvince.potential)}
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <span style={{ color: '#888', display: 'block', marginBottom: 6 }}>年轻人发展前景：</span>
                <div
                  title={getYouthProspect(Object.keys(provinceData).find(key => provinceData[key] === currentProvince), currentProvince.potential)}
                  style={{
                    color: '#00ffaa',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.6,
                    maxHeight: '3.2em',
                  }}
                >
                  {getYouthProspect(Object.keys(provinceData).find(key => provinceData[key] === currentProvince), currentProvince.potential)}
                </div>
              </div>
            </div>
          </div>
        )}

        {!currentProvince && (
          <div style={{
            background: 'rgba(0, 20, 40, 0.8)',
            border: '1px solid rgba(0, 255, 255, 0.4)',
            borderRadius: 10,
            backdropFilter: 'blur(10px)',
            padding: 20,
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)',
            animation: 'borderGlow 3s ease infinite',
          }}>
            <h3 style={{
              color: '#00ffff',
              fontSize: 18,
              textAlign: 'center',
              marginBottom: 15,
              letterSpacing: 2,
              textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
            }}>
              产业概况
            </h3>
            <div style={{
              color: '#888',
              fontSize: 14,
              textAlign: 'center',
              padding: '20px 0',
            }}>
              等待加载...
            </div>
          </div>
        )}
      </div>

      {/* 加载状态 */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(0, 255, 255, 0.2)',
            borderTop: '4px solid #00ffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
          }} />
          <div style={{
            color: '#00ffff',
            fontSize: '16px',
            letterSpacing: '3px',
            textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
          }}>
            加载地图中...
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
          background: 'rgba(0, 10, 30, 0.95)',
          padding: '40px 50px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 0, 0, 0.5)',
          boxShadow: '0 0 30px rgba(255, 0, 0, 0.3)'
        }}>
          <div style={{
            color: '#ff6b6b',
            fontSize: '18px',
            marginBottom: '15px'
          }}>
            ⚠️ {error}
          </div>
          <div style={{
            color: '#888',
            fontSize: '14px',
            marginBottom: '25px'
          }}>
            请检查网络连接后重试
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 35px',
              background: 'rgba(0, 255, 255, 0.2)',
              border: '1px solid #00ffff',
              color: '#00ffff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s',
              textShadow: '0 0 5px rgba(0, 255, 255, 0.8)'
            }}
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
        style={{
          flex: 1,
          height: '100%',
          opacity: loading || error ? 0 : 1,
          transition: 'opacity 0.5s'
        }}
      />

      {/* 右侧：两个面板上下排列 */}
      <div style={{
        width: 290,
        display: 'flex',
        flexDirection: 'column',
        gap: 15,
        alignSelf: 'center',
      }}>
        {/* 上方：GDP对比面板 */}
        <div style={{
          background: 'rgba(0, 20, 40, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.4)',
          borderRadius: 10,
          backdropFilter: 'blur(10px)',
          padding: 20,
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)',
          animation: 'borderGlow 3s ease infinite',
          height: 'fit-content',
        }}>
          <h3 style={{
            color: '#00ffff',
            fontSize: 18,
            textAlign: 'center',
            marginBottom: 15,
            letterSpacing: 2,
            textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
          }}>
            GDP排名对比
          </h3>
          {currentProvince && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{
                    padding: '10px 6px',
                    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                    color: '#888',
                    fontSize: 13,
                  }}>
                    GDP全国排名
                  </td>
                  <td style={{
                    padding: '10px 6px',
                    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                    color: '#ffff00',
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'right',
                  }}>
                    {currentProvince.rank}
                  </td>
                </tr>
                <tr>
                  <td style={{
                    padding: '10px 6px',
                    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                    color: '#888',
                    fontSize: 13,
                  }}>
                    GDP总量
                  </td>
                  <td style={{
                    padding: '10px 6px',
                    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                    color: '#ff0000',
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'right',
                  }}>
                    {currentProvince.gdp.toLocaleString()} 亿元
                  </td>
                </tr>
                <tr>
                  <td style={{
                    padding: '10px 6px',
                    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                    color: '#888',
                    fontSize: 13,
                  }}>
                    常住人口
                  </td>
                  <td style={{
                    padding: '10px 6px',
                    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 'bold',
                    textAlign: 'right',
                  }}>
                    {currentProvince.population.toLocaleString()} 万人
                  </td>
                </tr>
                <tr>
                  <td style={{
                    padding: '10px 6px',
                    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                    color: '#888',
                    fontSize: 13,
                  }}>
                    人均GDP
                  </td>
                  <td style={{
                    padding: '10px 6px',
                    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                    color: '#00ffaa',
                    fontSize: 15,
                    fontWeight: 'bold',
                    textAlign: 'right',
                  }}>
                    {Math.round(currentProvince.gdp * 10000 / currentProvince.population).toLocaleString()} 元
                  </td>
                </tr>
                <tr>
                  <td style={{
                    padding: '10px 6px',
                    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                    color: '#888',
                    fontSize: 13,
                  }}>
                    占全国比重
                  </td>
                  <td style={{
                    padding: '10px 6px',
                    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                    color: '#ffaa00',
                    fontSize: 15,
                    fontWeight: 'bold',
                    textAlign: 'right',
                  }}>
                    {(currentProvince.gdp / 1360000 * 100).toFixed(2)}%
                  </td>
                </tr>
                <tr>
                  <td style={{
                    padding: '10px 6px',
                    color: '#888',
                    fontSize: 13,
                  }}>
                    增速等级
                  </td>
                  <td style={{
                    padding: '10px 6px',
                    color: getGrowthRateColor(currentProvince.rank, currentProvince.potential),
                    fontSize: 15,
                    fontWeight: 'bold',
                    textAlign: 'right',
                  }}>
                    {getGrowthRateText(currentProvince.rank, currentProvince.potential)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
          {!currentProvince && (
            <div style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>
              等待加载...
            </div>
          )}
        </div>

        {/* 下方：未来产业升级方向 */}
        {currentProvince && (
          <div style={{
            background: 'rgba(0, 20, 40, 0.8)',
            border: '1px solid rgba(0, 255, 255, 0.4)',
            borderRadius: 10,
            backdropFilter: 'blur(10px)',
            padding: 20,
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)',
            animation: 'borderGlow 3s ease infinite',
            height: 'fit-content',
          }}>
            <h3 style={{
              color: '#00ffff',
              fontSize: 18,
              textAlign: 'center',
              marginBottom: 15,
              letterSpacing: 2,
              textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
            }}>
              产业升级方向
            </h3>
            <div style={{
              color: '#fff',
              fontSize: 13,
              lineHeight: 1.7,
            }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: '#888', display: 'block', marginBottom: 6 }}>重点转型方向：</span>
                <div style={{ color: '#ffaa00' }}>
                  {getUpgradeDirection(Object.keys(provinceData).find(key => provinceData[key] === currentProvince), currentProvince.potential)}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: '#888', display: 'block', marginBottom: 6 }}>新兴产业布局：</span>
                <div style={{ color: '#00ffaa' }}>
                  {getEmergingIndustries(Object.keys(provinceData).find(key => provinceData[key] === currentProvince))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: '#888', display: 'block', marginBottom: 6 }}>重点投资园区：</span>
                <div style={{ color: '#ffff00' }}>
                  {getKeyZones(Object.keys(provinceData).find(key => provinceData[key] === currentProvince))}
                </div>
              </div>
              <div>
                <span style={{ color: '#888', display: 'block', marginBottom: 6 }}>政策支持力度：</span>
                <div style={{ color: '#ff00ff' }}>
                  {getPolicySupport(currentProvince.potential)}
                </div>
              </div>
            </div>
          </div>
        )}

        {!currentProvince && (
          <div style={{
            background: 'rgba(0, 20, 40, 0.8)',
            border: '1px solid rgba(0, 255, 255, 0.4)',
            borderRadius: 10,
            backdropFilter: 'blur(10px)',
            padding: 20,
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)',
            animation: 'borderGlow 3s ease infinite',
          }}>
            <h3 style={{
              color: '#00ffff',
              fontSize: 18,
              textAlign: 'center',
              marginBottom: 15,
              letterSpacing: 2,
              textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
            }}>
              产业升级方向
            </h3>
            <div style={{
              color: '#888',
              fontSize: 14,
              textAlign: 'center',
              padding: '20px 0',
            }}>
              等待加载...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
