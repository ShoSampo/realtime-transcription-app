import { ReactNode, useCallback, useRef, useState } from "react"
import {
  RealtimeSessionView,
  StartSessionOptions,
} from "../components/RealtimeSessionView"
import { RealtimeClient } from "@tsorta/browser/WebRTC"
import { PageProps } from "./props"
import {
  RealtimeConversationItem,
  RealtimeSessionCreateResponse,
} from "@tsorta/browser/openai"

export function WebRTCExample({
  apiKey,
  sessionStatus,
  onSessionStatusChanged,
}: PageProps): ReactNode {
  const audioElementRef = useRef<HTMLAudioElement>(null)

  const [client, setClient] = useState<RealtimeClient | undefined>(undefined)
  const [events, setEvents] = useState<any[]>([])
  const [conversation, setConversation] = useState<RealtimeConversationItem[]>(
    []
  )

  const startSession = useCallback(
    async function startSession({
      sessionRequest,
    }: StartSessionOptions): Promise<void> {
      if (!apiKey) {
        throw new Error("API key is required")
      }
      if (!audioElementRef?.current) {
        throw new Error("Audio element not found")
      }

      console.debug("Starting session with request", {
        sessionRequest,
      })

      const client = new RealtimeClient(
        navigator,
        async () => {
          const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sessionRequest),
          })
          const data = (await r.json()) as RealtimeSessionCreateResponse

          return data.client_secret.value
        },
        audioElementRef.current
      )
      setClient(client)

      client.addEventListener("serverEvent", (event) => {
        setEvents((events) => [...events, event.event])
      })

      client.addEventListener("conversationChanged", (event) => {
        setConversation(event.conversation)
      })

      try {
        await client.start()
      } catch (e) {
        console.error("Error starting session", e)
        return
      }

      onSessionStatusChanged("recording")
    },
    [apiKey, audioElementRef, onSessionStatusChanged, navigator]
  )

  const stopSession = useCallback(
    async function stopSession(): Promise<void> {
      await client?.stop()
      onSessionStatusChanged("stopped")
    },
    [client, onSessionStatusChanged]
  )

  return (
    <div>
      <h1>リアルタイム文字起こし</h1>
      <audio ref={audioElementRef}></audio>

      <RealtimeSessionView
        startSession={startSession}
        stopSession={stopSession}
        sessionStatus={sessionStatus}
        events={events}
        conversation={conversation}
      />
    </div>
  )
}
