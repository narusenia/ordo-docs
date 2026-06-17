# Ordo.toml

`Ordo.toml` はプロジェクトのマニフェストファイルです。プロジェクト（またはワークスペース）のルートに配置し、ビルドに必要なすべての情報を定義します。

## `[package]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `name` | string | Yes | — | パッケージ名（kebab-case 推奨） |
| `version` | string | Yes | — | SemVer バージョン（例: `"0.1.0"`） |
| `type` | string | Yes | — | `"executable"`、`"static-library"`、`"shared-library"` |
| `license` | string | No | — | SPDX ライセンス識別子 |
| `description` | string | No | — | 1行の説明 |
| `authors` | string[] | No | `[]` | 作者リスト |
| `repository` | string | No | — | リポジトリURL |

```toml
[package]
name = "myapp"
version = "0.1.0"
type = "executable"
license = "MIT"
description = "My application"
authors = ["Your Name"]
repository = "https://github.com/you/myapp"
```

## `[language]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `c` | string | No | — | C標準: `"c11"`、`"c17"`、`"c23"` |
| `cpp` | string | No | `"c++20"` | C++標準: `"c++17"`、`"c++20"`、`"c++23"`、`"c++26"` |

CとC++のソースを混在させるプロジェクトでは両方設定できます。

```toml
[language]
cpp = "c++20"
```

## `[toolchain]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `compiler` | string | No | 自動検出 | `"clang"`、`"gcc"`、`"msvc"`、`"clang-cl"` |
| `linker` | string | No | コンパイラデフォルト | `"lld"`、`"mold"`、`"gold"`、`"default"` |

未指定の場合、Ordoはコンパイラを自動検出します（優先順位: Clang > GCC > MSVC）。

```toml
[toolchain]
compiler = "clang"
linker = "lld"
```

## `[dependencies]`

依存関係はいくつかの形式で宣言できます。詳しい使い方は [依存関係ガイド](/ja/guide/dependencies) を参照してください。

```toml
[dependencies]
# レジストリ（短縮形）
fmt = "11"

# レジストリ（長い形式）
fmt = { version = "11" }

# プロバイダ
fmt = { version = "11.2.0", provider = "vcpkg" }
openssl = { provider = "pkg-config" }
m = { provider = "system" }

# パス
core = { path = "../core" }

# Git
fmt = { git = "https://github.com/fmtlib/fmt", tag = "11.1.0" }
fmt = { git = "https://...", branch = "main" }
fmt = { git = "https://...", rev = "abc123" }

# Git + Luaビルドスクリプト
sdl = { git = "https://...", tag = "3.4.8", with = "build.lua" }

# オプション依存（フィーチャー用）
qt = { provider = "vcpkg", optional = true }

# ワークスペース参照
fmt = { workspace = true }

# プロバイダフィーチャー付き
spdlog = { version = "1.14", provider = "vcpkg", features = ["async"] }
```

### 依存関係フィールド

| フィールド | 型 | 説明 |
|-----------|------|------|
| `version` | string | バージョン制約（SemVer） |
| `provider` | string | `"vcpkg"`、`"conan"`、`"pkg-config"`、`"system"` |
| `path` | string | ローカルプロジェクトへの相対パス |
| `git` | string | Gitリポジトリ URL |
| `tag` | string | Gitタグ（`git` と併用） |
| `branch` | string | Gitブランチ（`git` と併用） |
| `rev` | string | Gitコミットハッシュ（`git` と併用） |
| `with` | string | Luaビルドスクリプトのパス（`git` と併用） |
| `optional` | bool | フィーチャーで有効化されたときのみリンク |
| `workspace` | bool | `[workspace.dependencies]` から継承 |
| `features` | string[] | プロバイダ固有の機能 |

## `[dev-dependencies]`

`[dependencies]` と同じ構文です。テストやベンチマークのバイナリにのみリンクされ、リリースビルドには含まれません。

```toml
[dev-dependencies]
googletest = { version = "1.14", provider = "vcpkg" }
```

## `[features]`

条件付きコンパイルのフィーチャーを定義します。

```toml
[features]
default = ["logging"]
logging = []
gui = ["dep:qt", "logging"]
simd = []

[features.config]
prefix = "MYAPP_"       # デフォルト: "ORDO_FEATURE_"
```

フィーチャーが有効化されると、Ordoはプリプロセッサマクロを定義します（例: `MYAPP_LOGGING`）。フィーチャーは他のフィーチャーに依存でき、`dep:` プレフィックスでオプション依存を有効化できます。

## `[build]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `jobs` | int | No | `0`（自動） | Ninjaの並列コンパイルジョブ数 |
| `pch` | string | No | — | プリコンパイル済みヘッダーのソースパス |
| `unity` | bool | No | `false` | ユニティビルドを有効化 |

## `[profile.<name>]`

ビルドプロファイルは最適化、デバッグ情報、その他のコンパイラ設定を制御します。`dev` と `release` は組み込みプロファイルで、それらを継承するカスタムプロファイルを定義できます。

| フィールド | 型 | デフォルト (dev) | デフォルト (release) | 説明 |
|-----------|------|---------------|-------------------|------|
| `inherits` | string | — | — | 継承元のプロファイル |
| `opt-level` | int/string | `0` | `3` | `0`, `1`, `2`, `3`, `s`, `z` |
| `debug` | bool | `true` | `false` | デバッグ情報を含む |
| `assertions` | bool | `true` | `false` | アサーションを有効化 |
| `sanitize` | string[] | `[]` | `[]` | `"address"`, `"undefined"`, `"thread"`, `"memory"` |
| `lto` | string/bool | `false` | `false` | `false`, `"thin"`, `"full"` |
| `strip` | bool | `false` | `true` | シンボルをストリップ |
| `pic` | bool | `false` | `false` | 位置独立コード |
| `rtti` | bool | `true` | `true` | C++ RTTI |
| `exceptions` | bool | `true` | `true` | C++例外 |
| `warnings` | string | `"all"` | `"all"` | `"default"`, `"all"`, `"extra"`, `"error"` |
| `linker` | string | — | — | このプロファイル用のリンカオーバーライド |
| `static-runtime` | bool | `false` | `false` | 静的C/C++ランタイム |
| `coverage` | bool | `false` | `false` | コードカバレッジ計測 |
| `split-debug` | bool | `false` | `false` | デバッグ情報を別ファイルに分離 |

```toml
[profile.dev]
debug = true
sanitize = ["address", "undefined"]

[profile.release]
opt-level = 3
lto = "thin"
strip = true

[profile.asan]
inherits = "dev"
sanitize = ["address"]
opt-level = 1
```

カスタムプロファイルは `ordo build --profile asan` で使用します。

## `[modules]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `enabled` | bool | No | `false` | C++モジュールサポートを有効化 |
| `import-std` | bool | No | `false` | `import std;` サポートを有効化 |

## `[test]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `framework` | string | No | `"auto"` | `"auto"`, `"googletest"`, `"catch2"`, `"doctest"`, `"plain"` |
| `src` | string | No | `"tests/"` | テストソースディレクトリ |

## `[fmt]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `tool` | string | No | `"clang-format"` | フォーマットツール |
| `style` | string | No | `".clang-format"` | スタイル設定ファイルのパス |

## `[lint]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `tool` | string | No | `"clang-tidy"` | リントツール |
| `config` | string | No | `".clang-tidy"` | 設定ファイルのパス |

## `[cache]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `tool` | string | No | `"auto"` | `"auto"`, `"ccache"`, `"sccache"`, `"none"` |

## `[watch]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `include` | string[] | No | `[]` | 追加で監視するディレクトリ |
| `exclude` | string[] | No | `[]` | 監視から除外するディレクトリ |

## `[install]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `binaries` | string[] | No | 推定 | インストールするバイナリ名 |
| `headers` | string[] | No | 推定 | ヘッダーのグロブパターン |
| `libraries` | string[] | No | 推定 | インストールするライブラリファイル |

## `[scripts]`

`ordo run-script <name>` で実行できるユーザー定義スクリプトです。

```toml
[scripts]
prebuild = "python generate_version.py"
deploy = "rsync -av target/release/ server:/opt/"
```

## `[ci]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `steps` | string[] | No | 下記参照 | CIパイプラインのステップ |

デフォルトのステップ:

```toml
[ci]
steps = ["fmt --check", "lint", "build", "test", "build --release"]
```

## `[target.<triple>]`

ターゲットトリプルごとのクロスコンパイル設定です。

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `compiler` | string | No | `[toolchain]` から継承 | このターゲット用のコンパイラ |
| `sysroot` | string | No | — | sysrootパス |
| `linker` | string | No | `[toolchain]` から継承 | このターゲット用のリンカ |

```toml
[target.aarch64-linux-gnu]
compiler = "clang"
sysroot = "/opt/aarch64-sysroot"
linker = "lld"
```

## `[workspace]`

詳細は [ワークスペースガイド](/ja/guide/workspace) を参照してください。

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `members` | string[] | Yes | — | メンバーパス（グロブパターン対応） |
| `exclude` | string[] | No | `[]` | 除外パス |

## `[workspace.dependencies]`

ワークスペースの全メンバーで共有する依存関係です。構文は `[dependencies]` と同じです。メンバーは `{ workspace = true }` で参照します。
