# 変更履歴

## v0.1.3 <Badge type="tip" text="latest" />

_2026-06-24_

### 機能追加

- **ビルドプロファイル** — `[profile.dev]`、`[profile.release]`、カスタムプロファイルに完全対応。`--profile` フラグ、opt-level、debug、lto、defines、コンパイラ/リンカフラグ。
- **フィーチャーフラグ** — Cargo風の `[features]` セクション。`dep:name` による依存有効化、`--features`、`--no-default-features`、`--all-features`。`ORDO_FEATURE_*` プリプロセッサ定義を生成。
- **開発依存** — `[dev-dependencies]` セクション。テストビルド時のみ組み込み。`ordo tree` で `[dev]` マーカーを表示。
- **エイリアスとリンク名** — `alias` フィールドでパッケージのローカル名を変更。`link-name` でリンク時のライブラリ名をオーバーライド。`ordo add` に `--alias` と `--link-name` フラグを追加。
- **複数パッケージ一括追加** — `ordo add raylib fmt glfw -P vcpkg` のように複数パッケージを一度に追加可能。部分的な失敗にも対応しサマリーを表示。
- **システムレベルプロバイダ** — 3つのパッシブ（検出専用）プロバイダを追加:
  - **brew** (macOS) — `brew info --json`、`brew --prefix` でインクルード/ライブラリパスを取得
  - **nix** — `nix profile list`（モダン）/ `nix-env -q`（レガシー）
  - **pacman** (Arch Linux) — `pacman -Qi` でパッケージ検出とバージョン取得
- **プロジェクトレベルプロバイダ** — 2つのアクティブ（インストール）プロバイダを追加:
  - **clib** — clibレジストリからCライブラリをインストール
  - **nuget** — Windows C++ネイティブライブラリ用NuGetパッケージをインストール
- **プラットフォーム条件付き依存** — `[target.'cfg(macos)'.dependencies]` 構文。`cfg(macos)`、`cfg(linux)`、`cfg(windows)`、`cfg(unix)`、アーキテクチャ条件（`x86_64`、`aarch64`）、`not()`/`all()`/`any()` コンビネータに対応。

---

## v0.1.2

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
