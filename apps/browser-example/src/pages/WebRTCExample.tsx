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

      // 文字起こし専用の設定を強制的に適用
      const modifiedSessionRequest = {
        ...sessionRequest,
        // 応答モダリティをテキストのみに設定 (APIエラー回避のため)
        modalities: ["text"],
        // 文字起こし専用の指示
        instructions: "You are a transcription service. Only transcribe what you hear without adding any response or commentary. Do not engage in conversation."
      }

      console.debug("Starting session with request", {
        sessionRequest: modifiedSessionRequest,
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
            body: JSON.stringify(modifiedSessionRequest),
          })
          
          // エラーチェックを追加
          if (!r.ok) {
            const errorText = await r.text();
            console.error("Failed to create session:", r.status, errorText);
            throw new Error(`Failed to create session: ${r.status} ${errorText}`);
          }
          
          const data = (await r.json()) as RealtimeSessionCreateResponse

          console.log("Session created with settings:", {
            modalities: data.modalities,
            instructions: data.instructions?.substring(0, 50) + "..." || "Not available",
          })

          // client_secretが存在するか確認
          if (!data.client_secret?.value) {
            console.error("Client secret not found in response:", data);
            throw new Error("Client secret not found in API response");
          }
          
          return data.client_secret.value
        },
        audioElementRef.current
      )
      setClient(client)

      client.addEventListener("serverEvent", (event) => {
        // 重要なイベントをログに記録
        if (event.event.type.includes("input_audio") || 
            event.event.type.includes("response")) {
          console.log("Server event:", event.event.type);
        }
        setEvents((events) => [...events, event.event])
      })

      client.addEventListener("conversationChanged", (event) => {
        console.log("Conversation updated, items:", event.conversation.length);
        setConversation(event.conversation)
      })

      try {
        await client.start()
      } catch (e) {
        console.error("Error starting session", e)
        // セッション開始失敗時にステータスを戻す
        onSessionStatusChanged("stopped"); 
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
      <h1>商談同席くん</h1>
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
