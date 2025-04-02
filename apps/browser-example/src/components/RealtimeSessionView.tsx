import { ReactNode, useState } from "react"
import { BootstrapIcon } from "./BootstrapIcon"
import { EventList } from "./EventList"
import {
  RealtimeConversationItem,
  RealtimeSessionCreateRequest,
} from "@tsorta/browser/openai"
import { ConversationView } from "./ConversationView"

type PartialSessionRequestWithModel = Partial<RealtimeSessionCreateRequest> &
  Pick<Required<RealtimeSessionCreateRequest>, "model">
export interface StartSessionOptions {
  sessionRequest: PartialSessionRequestWithModel
}

interface RealtimeSessionViewProps {
  startSession: (options: StartSessionOptions) => Promise<void>
  stopSession: () => Promise<void>
  sessionStatus: "unavailable" | "stopped" | "recording"
  events: { type: string }[]
  conversation?: RealtimeConversationItem[]
}

export function RealtimeSessionView({
  startSession,
  stopSession,
  sessionStatus,
  events,
  conversation,
}: RealtimeSessionViewProps): ReactNode {
  // OpenAI Realtime API モデル
  const model = "gpt-4o-realtime-preview-2024-12-17"

  const [activeTab, setActiveTab] = useState<"events" | "conversation">(
    "conversation"
  )

  const handleRecordingToggle = async () => {
    if (sessionStatus === "recording") {
      await stopSession()
    } else if (sessionStatus === "stopped") {
      let sessionRequest: PartialSessionRequestWithModel = {
        model,
        // 常に文字起こしを有効にする
        input_audio_transcription: {
          model: "whisper-1",
        },
      }
      
      await startSession({ sessionRequest })
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-center mt-3 mb-4">
        <button
          className={`btn ${sessionStatus === "recording" ? "btn-danger" : "btn-primary"} btn-lg d-flex align-items-center gap-2`}
          type="button"
          disabled={sessionStatus === "unavailable"}
          onClick={handleRecordingToggle}
        >
          {sessionStatus === "recording" ? (
            <>
              <div
                className="spinner-grow spinner-grow-sm"
                role="status"
              >
                <span className="visually-hidden">録音中...</span>
              </div>
              <BootstrapIcon name="stop" size={24} />
              録音停止
            </>
          ) : (
            <>
              <BootstrapIcon name="record" size={24} />
              録音開始
            </>
          )}
        </button>
      </div>

      <ul className="nav nav-tabs mt-3" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "conversation" ? "active" : ""}`}
            id="conversation-tab"
            type="button"
            role="tab"
            aria-controls="conversation"
            aria-selected={activeTab === "conversation"}
            onClick={() => setActiveTab("conversation")}
          >
            会話
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "events" ? "active" : ""}`}
            id="events-tab"
            type="button"
            role="tab"
            aria-controls="events"
            aria-selected={activeTab === "events"}
            onClick={() => setActiveTab("events")}
          >
            イベント
          </button>
        </li>
      </ul>
      <div className="tab-content">
        <div
          className={`tab-pane fade ${
            activeTab === "conversation" ? "show active" : ""
          }`}
          id="conversation"
          role="tabpanel"
          aria-labelledby="conversation-tab"
        >
          {conversation && conversation.length > 0 ? (
            <ConversationView conversation={conversation} />
          ) : (
            <div className="alert alert-info m-2" role="alert">
              {conversation !== undefined
                ? "会話データはまだありません。録音を開始して会話を始めてください。"
                : "会話データは利用できません"}
            </div>
          )}
        </div>
        <div
          className={`tab-pane fade ${
            activeTab === "events" ? "show active" : ""
          }`}
          id="events"
          role="tabpanel"
          aria-labelledby="events-tab"
        >
          <EventList events={events} />
        </div>
      </div>
    </div>
  )
}
