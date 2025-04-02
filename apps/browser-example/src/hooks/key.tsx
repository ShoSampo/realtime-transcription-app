import { ReactNode, useEffect, useState } from "react"
import { KeyRequestModal } from "../components/KeyPromptModal"
import { BootstrapIcon } from "../components/BootstrapIcon"

export function useKeyManager(): {
  key: string | undefined
  KeyModal: ReactNode
  EnterKeyButton: ReactNode
} {
  const [key, setKey] = useState<string | undefined>(undefined)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const envKey = import.meta.env.VITE_OPENAI_API_KEY
    if (envKey) {
      setKey(envKey)
      return
    }

    const storedKey = loadKeyFromBrowser()
    if (storedKey) {
      setKey(storedKey)
      return
    }

    // 環境変数にもブラウザのストレージにもキーがない場合は入力モーダルを表示
    setShowModal(true)
  }, [])

  const EnterKeyButton = (
    <button
      className="btn btn-outline-success d-flex align-items-center gap-1"
      type="button"
      onClick={() => setShowModal(true)}
    >
      <BootstrapIcon name="gear" />
      <span>{key ? "✅" : "❌"}</span>
      {import.meta.env.VITE_OPENAI_API_KEY ? "環境変数のAPIキーを使用中" : "APIキーを入力"}
    </button>
  )

  const KeyModal = showModal ? (
    <KeyRequestModal
      onKeySaved={(key) => {
        setKey(key)
        saveKeyToBrowser(key)
        setShowModal(false)
      }}
      onCanceled={() => {
        if (key) {
          // 既にキーがある場合はモーダルを閉じるだけ
          setShowModal(false)
        } else {
          // キーがない場合は環境変数をチェック
          const envKey = import.meta.env.VITE_OPENAI_API_KEY
          if (envKey) {
            setKey(envKey)
            setShowModal(false)
          }
        }
      }}
    />
  ) : (
    <></>
  )
  return { key, KeyModal, EnterKeyButton }
}

const OPENAI_API_KEY_NAME = "OPENAI_API_KEY"
function saveKeyToBrowser(key: string) {
  console.debug(`Saved key to browser with length ${key.length}`)
  document.cookie = `${OPENAI_API_KEY_NAME}=${encodeURIComponent(
    key
  )}; max-age=${60 * 60 * 24 * 30}; SameSite=Strict; Secure`
}

function loadKeyFromBrowser(): string | undefined {
  const cookie = document.cookie
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${OPENAI_API_KEY_NAME}=`))

  const key = cookie?.split("=")[1]
  console.debug(`Loaded key from browser with length ${key?.length ?? 0}`)
  return key ? decodeURIComponent(key) : undefined
}
