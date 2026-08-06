# 新CSS構成 移行手順（実施後まとめ版）

## 1. ファイル構成
リポジトリの `css/` フォルダに、以下の構成で配置済み。

```
css/
├── reset.css        ← 既存のまま
├── variables.css     ← 新規（色・余白・フォントのトークン）
├── base.css           ← 新規（body, h1〜h4, p, ul などの基本タイポグラフィ）
├── components.css     ← 新規（.card, .badge, .container などの共通部品）
└── 5-9.css           ← 既存のまま（トップページ演出専用）
```

## 2. 各HTMLの `<head>` の書き方

**重要: パスは絶対パス（`/css/...`）ではなく相対パスにする。**
理由: 絶対パスだとローカルでファイルをダブルクリックして確認する時に
CSSが見つからずデザインが反映されない（`file://`ではドメインのルートが
存在しないため）。GitHub Pagesでもローカルでも同じように動くよう、
フォルダの深さに応じた相対パスに統一した。

- サブフォルダ内のページ（ほぼ全ページ）:
  ```html
  <link rel="stylesheet" href="../css/reset.css">
  <link rel="stylesheet" href="../css/variables.css">
  <link rel="stylesheet" href="../css/base.css">
  <link rel="stylesheet" href="../css/components.css">
  ```
- ルート直下のページ（`※index.html`のみ）:
  ```html
  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/components.css">
  ```

## 3. ページごとの移行パターン（3種類）

当初は「全ページ4点セットに統一」を想定していたが、実際は
ページのデザインの独自度に応じて3パターンに分かれた。

### パターンA: 共通style.cssを使っていたページ
`<link href="../style.css">` を4行の新リンクに置き換えるだけ。
中身の追加スタイルはそのまま残してOK（衝突しないか要確認）。

### パターンB: 記事型ページ（見出し色などを自前で指定済み）
`reset.css`＋`variables.css`＋`base.css`のみをリンク。
`components.css`は読み込まない。中身の`<style>`は基本そのまま。
理由: h1/h2の色を自前で明示的に指定しているページは、
components.cssの`.card`や`.badge`などのクラス名が偶然重複していても
悪影響が出にくいが、念のため安全側に倒している。

### パターンC: 完全に独自デザインのページ（紺色帯ヘッダーなど）
パターンBと同じ（`components.css`は読み込まない）。
**ただし要注意点が1つ**: `header`の背景色を紺色にして、
中の`h1`に白文字を「継承」させる作りのページが多数あった。
この場合、`h1`自体には色指定がないため、`base.css`の
`h1 { color: var(--color-navy-800); }` が優先されてしまい、
「紺色の背景に紺色文字」で見出しが読めなくなる事故が繰り返し発生した。

**対策**: このパターンのページでは、移行時に必ず以下を追加する。
```css
header h1 {
  color: #fff; /* 元の背景色に合わせた文字色 */
  border-bottom: none;
}
```
同様に、`.card-header h2`のような「色付き背景の中の見出し」でも
同じ事故が起きるので、色付き背景の中に見出しタグがある箇所は
必ず色を明示指定する。

## 4. 移行済み一覧

以下、全フォルダ・全ページ移行完了（2026年8月時点）。

- AI規制の枠組み（7ページ）
- AIと投資（5ページ）
- AIの基礎（3ページ）
- AIとその開発（2ページ）
- AIと量子論（4ページ）
- 経済安全保障規制（2ページ）
- 知性と知能について（2ページ）
- 中国の規制（8ページ）
- 米国の規制（2ページ）
- 量子生物学（7ページ）
- AI×生物学（5ページ）
- 別２化学品規制（3ページ）
- お釈迦様の教え（14ページ）
- ルート `※index.html`

古い共通`style.css`（ルート直下）はどこからも読み込まれなくなったが、
点検が完了するまでは切り戻し用にそのまま残してある。全ページの
表示確認が済み次第、削除して問題ない。

## 5. 移行中に見つかった、CSSとは別件の不具合

CSS移行の副産物として、いくつかのページで画像/PDFのパス指定ミスが
見つかり、あわせて修正した。原因は「同じフォルダ内のimagesを想定して
`images/〜`と書いていたが、実際のファイルはリポジトリ最上位の
`images`フォルダにあった」というもの。

| ページ | 対象ファイル |
|---|---|
| recursive_self-improvement.html | self-improvement.png |
| electric_current_flows.html | poynting_vector_wire_energy_flow.svg |
| PFAS-related_substances.html | 117-list.pdf / 138-list.pdf / 156-list.pdf |

ルート`images`フォルダの`shingo.svg`は、どのページからも参照が
見つかっていない（未使用の可能性）。

## 6. 今後、新しいページを作るとき

- 新しい色が必要になったら、まず `variables.css` に追加してから使う
  （ページ内で直接 `#2b6cb0` のような16進数を書かない）
- 3ページ以上で同じ見た目の部品が欲しくなったら `components.css` に
  昇格させる。1ページだけの特殊な見た目は、そのページの `<style>` に
  残したままでよい（無理に共通化しない）
- 色付き背景（ヘッダーやカード見出しなど）の中に見出しタグを置く時は、
  必ずその見出しに文字色を明示指定する（継承任せにしない）
- 画像・PDFを新しく置く時は、そのページと同じフォルダに置くか、
  共通で使うならルートの`images`フォルダに置いて `../images/〜` で
  参照する、のどちらかに統一する
