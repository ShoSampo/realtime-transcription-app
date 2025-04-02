import { ReactNode, useEffect, useRef, useState } from "react"
import { BootstrapIcon } from "./BootstrapIcon"
import { EventList } from "./EventList"
import {
  RealtimeConversationItem,
  RealtimeSessionCreateRequest,
} from "@tsorta/browser/openai"

// 許可されたモデルの型を定義
export type AllowedModel = 
  | "gpt-4o-realtime-preview-2024-12-17" 

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
  // 文字起こし設定を親コンポーネントから受け取る
  transcriptionSettings: {
    model: AllowedModel;
    modalities: string[];
    instructions: string;
    input_audio_transcription: {
      model: string;
      language: string;
      prompt: string;
    };
  }
}

export function RealtimeSessionView({
  startSession,
  stopSession,
  sessionStatus,
  events,
  conversation,
  transcriptionSettings,
}: RealtimeSessionViewProps): ReactNode {
  const [activeTab, setActiveTab] = useState<"events" | "transcription">(
    "transcription"
  )
  
  // 文字起こしエリアへの参照を追加
  const transcriptionAreaRef = useRef<HTMLDivElement>(null);

  // 会話データが更新されたら自動スクロール
  useEffect(() => {
    if (transcriptionAreaRef.current && activeTab === "transcription") {
      transcriptionAreaRef.current.scrollTop = transcriptionAreaRef.current.scrollHeight;
    }
  }, [conversation, activeTab]);

  const handleRecordingToggle = async () => {
    if (sessionStatus === "recording") {
      await stopSession()
    } else if (sessionStatus === "stopped") {
      // 親コンポーネントから受け取った設定をそのまま使用
      await startSession({ 
        sessionRequest: { 
          model: transcriptionSettings.model
        } 
      })
    }
  }

  // ユーザーの発言のみを抽出する関数
  const userMessages = () => {
    if (!conversation) return []
    
    return conversation.filter(item => item.role === "user")
  }

  const renderTranscriptions = () => {
    const messages = userMessages()
    
    if (messages.length === 0) {
      return (
        <div className="alert alert-info m-2" role="alert">
          文字起こしデータはまだありません。録音を開始して話してください。
        </div>
      )
    }

    // すべての文字起こしテキストを連結して表示
    const combinedTranscript = messages.map((item) => {
      const text = item.content?.find(c => c.type === "input_audio")?.transcript || "";
      return text.trim();
    }).join(" ");

    return (
      <div 
        ref={transcriptionAreaRef}
        className="transcription-area p-3 mt-3" 
        style={{
          height: "400px",
          overflowY: "auto",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
          lineHeight: "1.7",
          fontSize: "1.1rem",
          whiteSpace: "pre-wrap"
        }}
      >
        {combinedTranscript}
      </div>
    )
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
            className={`nav-link ${activeTab === "transcription" ? "active" : ""}`}
            id="transcription-tab"
            type="button"
            role="tab"
            aria-controls="transcription"
            aria-selected={activeTab === "transcription"}
            onClick={() => setActiveTab("transcription")}
          >
            文字起こし
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
            activeTab === "transcription" ? "show active" : ""
          }`}
          id="transcription"
          role="tabpanel"
          aria-labelledby="transcription-tab"
        >
          {renderTranscriptions()}
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
