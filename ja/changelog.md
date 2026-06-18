# 変更履歴

## v0.1.2 <Badge type="tip" text="latest" />

_2026-06-18_

### 機能追加

- **CLI出力スタイル** — 3つの出力モード: `default`（アイコン + スピナー）、`minimal`（プレーンテキスト、Ninja出力パススルー）、`cargo-like`（Cargo風の右寄せ動詞）。`--style` フラグ、`ORDO_CLI_STYLE` 環境変数、または `Ordo.toml` の `[cli] style` で設定可能。
- **ロックファイルのバージョン記録** — `Ordo.lock` が各プロバイダの実際の解決バージョンを記録（vcpkg、pkg-config、conan、git、path）。`0.0.0` スタブを解消。
- **git依存のチェックサム** — git依存に `checksum = "git:<commit-hash>"` フィールドを追加。
- **リゾルバのロックピン留め** — リゾルバが `Ordo.lock` のピン留めバージョンを読み込み（Cargoと同様）。`ordo update` でバージョンを更新。

### バグ修正

- **パス依存のキャッシュ** — ワークスペースのDAGビルドで、ビルド済みのパス依存をキャッシュ。複数メンバーが共有する依存の冗長な再ビルドと重複した `Finished` 行を排除。

---

## v0.1.1

_2026-06-17_

### リポジトリ

- プライマリリポジトリを Codeberg から GitHub に移行しました。

### 機能追加

- **パス依存のビルド** — `mylib = { path = "./mylib" }` が完全に動作するようになりました。パス依存は再帰的にビルドされ、インクルードパスとライブラリ成果物が親ビルドに自動的に渡されます。ヘッダーオンリーの依存（`src/` なし）はビルドステップをスキップします。循環依存の検出も含まれています。
- **依存キャッシュ** — ビルド時に `Ordo.lock` を生成し、解決済みの依存情報を `target/.dep-cache.json` にキャッシュします。依存に変更がない後続のビルドでは、すべてのプロバイダクエリ（vcpkgインストール、conan解決、pkg-config等）がスキップされます。
- **`--locked` フラグ** — `Ordo.lock` が `Ordo.toml` と不整合な場合にエラーを返します。CI向け。
- **`--frozen` フラグ** — ネットワークアクセスを禁止し、既存の依存キャッシュのみを要求します。
- **`ordo add --no-verify`** — プロバイダに問い合わせずに依存を追加します。オフライン使用向け。
- **キャッシュヒット表示** — 依存がキャッシュから読み込まれた際に `✔ Resolved N dependencies (cached)` と表示します。
- **ワークスペース対応** — `[workspace]` のグロブパターンによる `members` 指定、`[workspace.dependencies]` と `{ workspace = true }` 参照、ツールチェイン/言語設定の継承、`ordo build -p <member>` に対応。
- **Luaビルドスクリプト** — git依存に `with = "build.lua"` を指定してサンドボックス化されたLua 5.4ビルドスクリプトを実行可能。API: `exec()`, `copy()`, `mkdir()`, `glob()`。結果は `Ordo.lock` にキャッシュ。
- **`ordo run` の `-p/--package` フラグ** — ワークスペースの特定メンバーを実行可能に。
- **ワークスペースメンバービルド間のセパレータ** — ビルド出力に明確な区切りを表示。

### バグ修正

- **vcpkg解決スピナー** — ビルド中のvcpkg解決/取得にスピナーを表示（無言のブロックを解消）。
- **`ordo tree` の表示** — 詳細行（libs、インクルードパス）のインデントを修正。ツリー接続線が正しくレンダリングされるように。
- **`ordo tree` の取得スピナー** — 依存情報の取得中にスピナーを追加。
- **ワークスペースメンバービルド** — 共有依存と推移的インクルードの解決を修正。

### インフラ

- CIを4つの並列ジョブに分割: rustfmt、clippy、test（ubuntu + macOS）、rustdoc。
- コンカレンシーグループと `RUSTFLAGS: -D warnings` を追加。
- mise管理のRustコンポーネント（clippy、rustfmt、rust-src）。
- コードベース全体へのrustfmt適用。

---

## v0.1.0

_2026-06-16_

初回リリース。

### 機能

- **プロジェクトスキャフォールド** — `ordo new` と `ordo init`。インタラクティブモード対応。
- **ビルドシステム** — Ninjaベースのビルド。コンパイラ自動検出（Clang、GCC、MSVC）、C/C++ソースの分離、プログレス表示。
- **依存管理** — 5つのプロバイダバックエンド
  - **vcpkg** — 自動ブートストラップ、一括インストール、バージョン固定
  - **Conan** — PkgConfigDepsジェネレータ、自動プロファイル検出
  - **pkg-config** — システムライブラリの検出
  - **system** — 直接 `-l` リンク
  - **git** — クローンとキャッシュ。`git:user/repo@tag` の省略記法対応
- **CLIコマンド** — `ordo add`、`ordo update`、`ordo tree`、`ordo build`、`ordo run`、`ordo clean`
- **リッチなターミナルUI** — スピナー、カラー進捗表示、インタラクティブプロンプト
- **macOSフレームワークリンク** — `.pc` ファイルからの `-framework` フラグの自動抽出
- **`compile_commands.json`** — IDE連携用に自動生成

### 必要要件

- [Ninja](https://ninja-build.org/) ビルドシステム
- C/C++コンパイラ（Clang、GCC、またはMSVC）
