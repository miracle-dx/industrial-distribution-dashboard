import ChinaMap3D from './components/ChinaMap3D'
import './App.css'

function App() {
  return (
    <div className="dashboard-container">
      {/* 标题 */}
      <div className="header">
        <h1 className="title">全国各省产业现状</h1>
        <div className="subtitle">INDUSTRIAL DISTRIBUTION OF CHINA</div>
      </div>

      {/* 中国地图 */}
      <ChinaMap3D />
    </div>
  )
}

export default App
