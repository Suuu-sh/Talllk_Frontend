# FORSUU.md - Talllk Frontend

## Project Overview

Talllk（トーク）は、コミュニケーションに不安を感じる人のための会話準備アプリです。面接、デート、商談など、予測可能な場面での会話を事前に準備し、本番で自信を持って臨めるようサポートします。

このドキュメントはFrontendプロジェクトの全体像を説明します。

---

## Tech Stack

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| Framework | Next.js (App Router) | 14.1.0 |
| Language | TypeScript | ^5 |
| UI Library | React | ^18.2.0 |
| Styling | Tailwind CSS | ^3.4.1 |
| HTTP Client | Axios | ^1.6.5 |
| State Management | React Context API | - |

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # ルートレイアウト（ThemeProvider）
│   ├── page.tsx                  # ランディングページ
│   ├── globals.css               # グローバルスタイル
│   ├── login/page.tsx            # ログイン・新規登録
│   ├── dashboard/page.tsx        # シチュエーション一覧
│   ├── situations/[id]/page.tsx  # シチュエーション詳細（メイン機能）
│   └── topics/[id]/page.tsx      # トピック詳細
├── components/
│   └── Header.tsx                # ヘッダーコンポーネント
├── contexts/
│   └── ThemeContext.tsx          # ダーク/ライトモード管理
├── types/
│   └── index.ts                  # 型定義
└── lib/
    └── api.ts                    # API通信ユーティリティ
```

---

## Core Concepts

### 1. データ構造

```
User
└── Situation（シチュエーション）: 面接、デートなどの場面
    └── Topic（トピック/フォルダ）: 話題のカテゴリ
        └── Question（質問）: Q&Aペア
            └── Question（子質問）: ネストした関連質問
```

### 2. 型定義

```typescript
// ユーザー
type User = {
  id: number
  email: string
  name: string
  created_at: string
  updated_at: string
}

// シチュエーション（場面）
type Situation = {
  id: number
  user_id: number
  title: string
  description: string
  created_at: string
  updated_at: string
}

// トピック（フォルダ）- 階層構造対応
type Topic = {
  id: number
  situation_id: number
  parent_id: number | null      // 親フォルダ
  title: string
  description: string
  questions: Question[]
}

// 質問 - 階層構造 & リンク機能
type Question = {
  id: number
  topic_id: number
  parent_id: number | null      // 親質問
  linked_topic_id: number | null    // 関連フォルダへのリンク
  linked_question_id: number | null // 関連質問へのリンク
  question: string
  answer: string
}
```

---

## Pages

### Landing Page (`/`)
- アプリの紹介とCTA
- ログイン状態に応じたナビゲーション
- 未ログイン: 「ログイン」「サインアップ」
- ログイン済み: 「ダッシュボード」

### Login Page (`/login`)
- ログイン/新規登録の切り替え
- JWT認証（トークンはlocalStorageに保存）
- 成功時にダッシュボードへリダイレクト

### Dashboard (`/dashboard`)
- シチュエーション一覧（カードグリッド）
- 新規シチュエーション作成
- 各カードクリックで詳細ページへ

### Situation Detail (`/situations/[id]`)
**メイン機能ページ**

- **ツリービュー**: フォルダと質問を階層表示
- **ドラッグ&ドロップ**: 項目の並び替え・移動
- **CRUD操作**:
  - フォルダ: 作成・編集・削除
  - 質問: 作成・編集・削除
- **リンク機能**: 質問同士、質問とフォルダの紐付け
- **詳細パネル**: 選択した質問の詳細表示

---

## Components

### Header
- ロゴ（クリックでダッシュボードへ）
- 設定ボタン（テーマ切り替え）
- ログアウトボタン

### ThemeContext
- ダーク/ライトモードの切り替え
- システム設定との連動
- localStorageへの永続化

---

## API Communication

### 設定 (`src/lib/api.ts`)

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
})

// リクエストインターセプタでトークンを付与
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### エンドポイント

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/auth/register` | ユーザー登録 |
| POST | `/auth/login` | ログイン |
| GET | `/situations` | シチュエーション一覧 |
| POST | `/situations` | シチュエーション作成 |
| GET | `/situations/:id` | シチュエーション詳細 |
| PUT | `/situations/:id` | シチュエーション更新 |
| POST | `/situations/:id/topics` | トピック作成 |
| PUT | `/situations/:id/topics/:topicId` | トピック更新 |
| DELETE | `/situations/:id/topics/:topicId` | トピック削除 |
| POST | `/situations/:id/topics/:topicId/questions` | 質問作成 |
| PUT | `/situations/:id/topics/:topicId/questions/:questionId` | 質問更新 |
| DELETE | `/situations/:id/topics/:topicId/questions/:questionId` | 質問削除 |

---

## Styling

### Design System

- **ガラスモーフィズム**: 半透明カード、ぼかし効果
- **グラデーション**: ブランドカラー（オレンジ系）
- **ダークモード**: 完全対応（`dark:` プリフィックス）
- **アニメーション**: fadeIn, fadeUp, scaleIn

### カスタムクラス

```css
.glass-card-solid    /* ガラスカード */
.btn-primary         /* プライマリボタン */
.btn-secondary       /* セカンダリボタン */
.btn-ghost           /* ゴーストボタン */
.btn-icon            /* アイコンボタン */
.input-field         /* 入力フィールド */
.badge-brand         /* バッジ */
```

### カスタムカラー

```
brand-50  ~ brand-900  /* オレンジグラデーション */
```

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## Build & Run

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Docker
```bash
docker compose up frontend -d
```

---

## Key Features

1. **階層的な情報整理**: フォルダと質問をツリー構造で管理
2. **ドラッグ&ドロップ**: 直感的な並び替え
3. **リンク機能**: 関連する質問・フォルダを紐付け
4. **ダークモード**: 目に優しいUI
5. **レスポンシブ**: モバイル対応
6. **JWT認証**: セキュアなAPI通信

---

## File Relationships

```
layout.tsx
├── ThemeContext (ダーク/ライトモード)
├── page.tsx (Landing)
├── login/page.tsx
│   └── api.ts → POST /auth/login, /auth/register
├── dashboard/page.tsx
│   ├── Header.tsx
│   └── api.ts → GET/POST /situations
└── situations/[id]/page.tsx
    └── api.ts → CRUD /situations/:id/*
```

---

## Notes

- Next.js 14のApp Routerを使用（`'use client'`ディレクティブでクライアントコンポーネント）
- 状態管理はReact useState（Context APIはテーマのみ）
- TypeScript厳密モードで型安全性を確保
- Tailwind CSSでユーティリティファーストなスタイリング
