// ** React Imports
import { useRef, useState, useEffect } from 'react'

// ** Chart.js Imports
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

// ✅ Register the components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

// ** Reactstrap Imports
import { Card, CardHeader, CardTitle, CardBody } from 'reactstrap'

const ChartjsRadarChart = ({ gridLineColor, labelColor }) => {
  const [chartData, setChartData] = useState({ datasets: [] })
  const chartRef = useRef(null)

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    layout: { padding: { top: -20 } },
    scales: {
      r: {
        ticks: { display: false, color: labelColor },
        grid: { color: gridLineColor },
        pointLabels: { color: labelColor },
        angleLines: { color: gridLineColor }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: labelColor, padding: 25 }
      }
    }
  }

  useEffect(() => {
    if (!chartRef.current) return
    const ctx = chartRef.current.ctx

    const gradientBlue = ctx.createLinearGradient(0, 0, 0, 150)
    gradientBlue.addColorStop(0, 'rgba(155,136,250, 0.9)')
    gradientBlue.addColorStop(1, 'rgba(155,136,250, 0.8)')

    const gradientRed = ctx.createLinearGradient(0, 0, 0, 150)
    gradientRed.addColorStop(0, 'rgba(255,161,161, 0.9)')
    gradientRed.addColorStop(1, 'rgba(255,161,161, 0.8)')

    setChartData({
      labels: ['STA', 'STR', 'AGI', 'VIT', 'CHA', 'INT'],
      datasets: [
        {
          label: 'Donté Panlin',
          data: [25, 59, 90, 81, 60, 82],
          backgroundColor: gradientRed,
          borderColor: 'transparent',
          fill: true
        },
        {
          label: 'Mireska Sunbreeze',
          data: [40, 100, 40, 90, 40, 90],
          backgroundColor: gradientBlue,
          borderColor: 'transparent',
          fill: true
        }
      ]
    })
  }, [])

  const plugins = [
    {
      id: 'legendSpacing',
      afterInit(chart) {
        if (chart.legend) {
          const originalFit = chart.legend.fit
          chart.legend.fit = function fit() {
            originalFit.bind(chart.legend)()
            this.height += 20
          }
        }
      }
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle tag='h4'>Radar Chart</CardTitle>
      </CardHeader>
      <CardBody>
        <div style={{ height: '355px' }}>
          <Radar ref={chartRef} data={chartData} options={options} height={355} plugins={plugins} />
        </div>
      </CardBody>
    </Card>
  )
}

export default ChartjsRadarChart
