import { useEffect, useState } from 'react'
import { apiRequest } from '../../utils/apiClient.js'
import { Button } from './Button.jsx'

export function AnonymousRequestInbox() {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiRequest('/requests')
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setIsLoading(false))
  }, [])

  const handleAccept = async (requestId) => {
    await apiRequest(`/requests/${requestId}?status=accepted`, { method: 'PATCH' })
    setRequests(requests.filter(r => r.id !== requestId))
  }

  const handleDecline = async (requestId) => {
    await apiRequest(`/requests/${requestId}?status=declined`, { method: 'PATCH' })
    setRequests(requests.filter(r => r.id !== requestId))
  }

  if (isLoading) return <div>Loading...</div>
  if (requests.length === 0) return <div className="text-sm text-muted-foreground">No pending requests</div>

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <div key={req.id} className="rounded-lg border border-border p-3 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-foreground">
              Someone requested to {req.request_type} you
            </p>
            <p className="text-xs text-muted-foreground">Their identity will be revealed if accepted</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleDecline(req.id)}>
              Decline
            </Button>
            <Button size="sm" onClick={() => handleAccept(req.id)}>
              Accept
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}