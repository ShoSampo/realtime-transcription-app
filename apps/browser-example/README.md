# OpenAI Official SDK Realtime Example

This is a working example of using OpenAI Realtime SDK using the tsorta unnoficial TypeScript OpenAI Realtime API package and official OpenAI SDK's recently added support for the Realtime API documented in [the readme here](https://github.com/openai/openai-node/tree/v4.81.0#realtime-api-beta) (added on 2025-01-17).

## 環境設定

1. `.env.example` を `.env` にコピーします
2. `.env` ファイルにOpenAI APIキーを設定します:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
3. 環境変数を設定しない場合は、アプリケーション実行時にブラウザ上でAPIキーを入力することも可能です

## For Posterity

Created with `npm create vite@6.0.11` and using the `react-ts` template preset as described at https://vite.dev/guide/
