# Vive Coding Camp 感想サイト（MVP）

- トップページ: `public/index.html`
- 投稿ページ: `public/feedback.html`
- 閲覧ページ: `public/view.html`（直前に投稿した内容を表示）

ローカルでそのままブラウザで開けます（サーバ不要）。投稿データはブラウザの localStorage に保存され、公開可のものが一覧に表示されます。

## 使い方
- `public/index.html` をブラウザで開く
- 「感想を投稿する」からフォーム入力
- 投稿完了後、自動で `public/view.html` に遷移し、入力内容をそのまま表示します。
- トップでは公開可の感想のみ最新順で最大10件表示されます。

## データの削除（開発用）
- ブラウザ開発者ツールから localStorage の `vcc_feedbacks` を削除、または以下をコンソールで実行：
  ```js
  localStorage.removeItem('vcc_feedbacks')
  ```

## 構成
- `public/` … 静的ファイル（HTML/CSS/JS）
- `requirements-ja.md` … 要件定義書

## 将来拡張の例
- サーバ API と DB に保存
- モデレーション、非公開運用
- 認証、管理画面
- 検索・並び替え・タグ
