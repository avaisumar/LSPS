// ** React Imports
import { useEffect, useState } from "react"

// ** Custom Components
import Timeline from "@components/timeline"

// ** Reactstrap Imports
import { Card, CardBody, CardHeader, CardTitle, Spinner } from "reactstrap"

// ** API
import axios from "axios"
import { useSelector } from "react-redux"

const BasicTimeline = ({ taskId }) => {
  const token = useSelector((state) => state.auth.accessToken)
  const [timelineData, setTimelineData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!taskId) return

    setLoading(true)
    axios
      .get(`https://lspschoolerp.pythonanywhere.com/erp-api/task/${taskId}/logs/`, {
        headers: { Authorization: `Token ${token}` }
      })
      .then((res) => {
        const formattedData = res.data.map((log) => ({
          title: log.action_display,
          content: log.message,
          meta: new Date(log.created_at).toLocaleString(),
          color:
            log.action === "created"
              ? "success"
              : log.action === "status_changed"
              ? "warning"
              : "info",
          customContent: (
            <small className="text-muted">
              {log.user?.name || "Unknown"}
            </small>
          )
        }))
        setTimelineData(formattedData)
      })
      .catch((err) => console.error("Timeline fetch error:", err))
      .finally(() => setLoading(false))
  }, [taskId, token])

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Task History</CardTitle>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="text-center py-2">
            <Spinner size="sm" /> Loading timeline...
          </div>
        ) : timelineData.length > 0 ? (
          <Timeline data={timelineData} />
        ) : (
          <p className="text-muted mb-0">No logs available for this task.</p>
        )}
      </CardBody>
    </Card>
  )
}

export default BasicTimeline
