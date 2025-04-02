import { useEffect, useState } from "react"
import { WebRTCExample } from "./pages/WebRTCExample"

export function App() {
  const [apiKey, setApiKey] = useState<string | undefined>(undefined)
  const [sessionStatus, setSessionStatus] = useState<
    "unavailable" | "stopped" | "recording"
  >("unavailable")

  useEffect(() => {
    // 環境変数からAPIキーを取得
    const envKey = import.meta.env.VITE_OPENAI_API_KEY
    if (envKey) {
      setApiKey(envKey)
      setSessionStatus("stopped")
    }
  }, [])

  return (
    <main className="container">
      <WebRTCExample
        apiKey={apiKey}
        sessionStatus={sessionStatus}
        onSessionStatusChanged={(status) => {
          setSessionStatus(status)
        }}
      />
    </main>
  )
}
