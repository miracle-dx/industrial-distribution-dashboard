import ChinaMap3D from './components/ChinaMap3D'
import './App.css'

function App() {
  return (
    <div className="dashboard-container">
      <div className="header">
        <h1 className="title">全国各省产业现状</h1>
        <div className="subtitle">INDUSTRIAL DISTRIBUTION OF CHINA</div>
      </div>
      <ChinaMap3D />
    </div>
  )
}

export default App
