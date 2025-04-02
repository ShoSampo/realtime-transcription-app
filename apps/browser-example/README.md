# OpenAI Official SDK Realtime Example

This is a working example of using OpenAI Realtime SDK using the tsorta unnoficial TypeScript OpenAI Realtime API package and official OpenAI SDK's recently added support for the Realtime API documented in [the readme here](https://github.com/openai/openai-node/tree/v4.81.0#realtime-api-beta) (added on 2025-01-17).

## 環境設定

1. `.env.example` を `.env` にコピーします
2. `.env` ファイルにOpenAI APIキーを設定します:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
3. 環境変数を設定しない場合は、アプリケーション実行時にブラウザ上でAPIキーを入力することも可能です

## アプリケーション構成

このアプリケーションはリアルタイム文字起こし機能に特化したシンプルな構成になっています。

### ファイル構造と役割

#### コアファイル
- `src/App.tsx` - メインアプリケーションのエントリーポイント。APIキーの管理とTranscriptionPageの表示を担当
- `src/main.tsx` - Reactアプリケーションの初期化と描画を行うエントリーポイント
- `src/styles.scss` - アプリケーション全体のスタイル定義

#### ページコンポーネント
- `src/pages/TranscriptionPage.tsx` - 文字起こし機能のメインページ。OpenAI Realtime APIとの通信処理を管理し、RealtimeClientの初期化と音声処理を担当。文字起こしに必要な設定も一元管理。
- `src/pages/props.ts` - ページコンポーネント間で共有する型定義

#### UIコンポーネント
- `src/components/RealtimeSessionView.tsx` - 文字起こしセッションのUI表示を担当。録音の開始/停止ボタンや文字起こし結果の表示、イベントタブの切り替えなどのユーザーインターフェースを提供。
- `src/components/EventList.tsx` - APIから受信したイベントの表示とフィルタリングを担当。デバッグ用のイベント情報の可視化。
- `src/components/BootstrapIcon.tsx` - Bootstrapアイコンを簡単に使用するためのヘルパーコンポーネント。

### 主な機能

1. **文字起こし機能**
   - 日本語に特化した文字起こし設定
   - リアルタイムでの音声認識と表示
   - 文字起こしテキストの自動スクロール

2. **デバッグ機能**
   - イベントタブでのAPI通信の可視化
   - イベントのフィルタリングと保存機能

3. **UI/UX**
   - 直感的な録音開始/停止ボタン
   - タブ切り替えによる文字起こし/イベント表示の切り替え
   - レスポンシブなレイアウト

## 開発情報

Created with `npm create vite@6.0.11` and using the `react-ts` template preset as described at https://vite.dev/guide/

## 使用方法

1. 環境設定を完了後、以下のコマンドでアプリケーションを起動します：
   ```
   npm run dev
   ```

2. ブラウザで表示されるUIから「録音開始」ボタンをクリックして文字起こしを開始します。

3. 「録音停止」ボタンをクリックして文字起こしを終了します。

4. 「イベント」タブをクリックすると、API通信の詳細を確認できます。
