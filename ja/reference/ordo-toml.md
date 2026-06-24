# Ordo.toml

`Ordo.toml` はプロジェクトのマニフェストです。プロジェクト（またはワークスペース）のルートに配置し、Ordo がプロジェクトをビルドするために必要なすべてを定義します。

## `[package]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `name` | string | Yes | — | パッケージ名（kebab-case 推奨） |
| `version` | string | Yes | — | SemVer バージョン（例: `"0.1.0"`） |
| `type` | string | Yes | — | `"executable"`、`"static-library"`、`"shared-library"` のいずれか |
| `license` | string | No | — | SPDX ライセンス識別子 |
| `description` | string | No | — | 一行の説明 |
| `authors` | string[] | No | `[]` | 著者リスト |
| `repository` | string | No | — | リポジトリ URL |

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
| `c` | string | No | — | C 標準。`"c11"`、`"c17"`、`"c23"` |
| `cpp` | string | No | `"c++20"` | C++ 標準。`"c++17"`、`"c++20"`、`"c++23"`、`"c++26"` |

`c` または `cpp`（プロジェクトが C と C++ のソースを混在させている場合は両方）を設定してください。

```toml
[language]
cpp = "c++20"
```

## `[toolchain]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `compiler` | string | No | 自動検出 | `"clang"`、`"gcc"`、`"msvc"`、`"clang-cl"` |
| `linker` | string | No | コンパイラのデフォルト | `"lld"`、`"mold"`、`"gold"`、`"default"` |

コンパイラが指定されていない場合、Ordo は Clang > GCC > MSVC の優先順位で自動検出します。

```toml
[toolchain]
compiler = "clang"
linker = "lld"
```

## `[cli]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `style` | string | No | `"default"` | 出力スタイル。`"default"`、`"minimal"`、`"cargo-like"` |

CLI出力の表示スタイルを制御します。`--style` フラグや `ORDO_CLI_STYLE` 環境変数でもオーバーライドできます。優先順位: CLIフラグ > 環境変数 > `Ordo.toml` > デフォルト。

```toml
[cli]
style = "minimal"
```

## `[dependencies]`

依存関係はいくつかのフォーマットで宣言できます。詳しい使い方は[依存関係ガイド](/ja/guide/dependencies)を参照してください。

```toml
[dependencies]
# レジストリ（短縮形）
fmt = "11"

# レジストリ（長形式）
fmt = { version = "11" }

# プロバイダー指定
fmt = { version = "11.2.0", provider = "vcpkg" }
openssl = { provider = "pkg-config" }
m = { provider = "system" }

# パス依存関係
core = { path = "../core" }

# Git 依存関係
fmt = { git = "https://github.com/fmtlib/fmt", tag = "11.1.0" }
fmt = { git = "https://...", branch = "main" }
fmt = { git = "https://...", rev = "abc123" }

# Git + Lua ビルドスクリプト
sdl = { git = "https://...", tag = "3.4.8", with = "build.lua" }

# オプション（フィーチャー用）
qt = { provider = "vcpkg", optional = true }

# ワークスペース参照
fmt = { workspace = true }

# プロバイダーフィーチャー付き
spdlog = { version = "1.14", provider = "vcpkg", features = ["async"] }
```

### 依存関係フィールド

| フィールド | 型 | 説明 |
|-----------|------|------|
| `version` | string | バージョン制約（SemVer） |
| `provider` | string | `"vcpkg"`、`"conan"`、`"pkg-config"`、`"system"`、`"brew"`、`"nix"`、`"pacman"`、`"clib"`、`"nuget"` |
| `path` | string | ローカルプロジェクトへの相対パス |
| `git` | string | Git リポジトリ URL |
| `tag` | string | Git タグ（`git` と併用） |
| `branch` | string | Git ブランチ（`git` と併用） |
| `rev` | string | Git コミットハッシュ（`git` と併用） |
| `with` | string | Lua ビルドスクリプトのパス（`git` と併用） |
| `optional` | bool | フィーチャーが有効にした場合のみリンクされます |
| `workspace` | bool | `[workspace.dependencies]` から継承します |
| `features` | string[] | プロバイダー固有のフィーチャーを有効にします |
| `alias` | string | TOMLキーと異なる実際のパッケージ名 |
| `link-name` | string/string[] | リンク時のライブラリ名をオーバーライド |

## `[dev-dependencies]`

`[dependencies]` と同じ構文です。テストおよびベンチバイナリにのみリンクされ、リリースビルドには含まれません。

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

フィーチャーが有効になると、Ordo はプリプロセッサマクロ（例: `MYAPP_LOGGING`）を定義します。フィーチャーは他のフィーチャーに依存でき、`dep:` プレフィックスでオプション依存関係を有効にできます。

## `[build]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `jobs` | int | No | `0`（自動） | Ninja の並列コンパイルジョブ数 |
| `pch` | string | No | — | プリコンパイル済みヘッダーのソースパス |
| `unity` | bool | No | `false` | ユニティビルドを有効にします |

```toml
[build]
jobs = 8
pch = "include/pch.hpp"
unity = true
```

## `[profile.<name>]`

ビルドプロファイルは最適化、デバッグ情報、その他のコンパイラ設定を制御します。`dev` と `release` はビルトインプロファイルです。これらを継承するカスタムプロファイルも定義できます。

| フィールド | 型 | デフォルト (dev) | デフォルト (release) | 説明 |
|-----------|------|---------------|-------------------|------|
| `inherits` | string | — | — | 継承元のベースプロファイル |
| `opt-level` | int/string | `0` | `3` | `0`、`1`、`2`、`3`、`s`、`z` |
| `debug` | bool | `true` | `false` | デバッグ情報を含めます |
| `assertions` | bool | `true` | `false` | アサーションを有効にします |
| `sanitize` | string[] | `[]` | `[]` | `"address"`、`"undefined"`、`"thread"`、`"memory"` |
| `lto` | string/bool | `false` | `false` | `false`、`"thin"`、`"full"` |
| `strip` | bool | `false` | `true` | 出力からシンボルを除去します |
| `pic` | bool | `false` | `false` | 位置独立コード |
| `rtti` | bool | `true` | `true` | C++ RTTI |
| `exceptions` | bool | `true` | `true` | C++ 例外 |
| `warnings` | string | `"all"` | `"all"` | `"default"`、`"all"`、`"extra"`、`"error"` |
| `linker` | string | — | — | このプロファイルのリンカーをオーバーライドします |
| `static-runtime` | bool | `false` | `false` | 静的 C/C++ ランタイム |
| `coverage` | bool | `false` | `false` | コードカバレッジの計装 |
| `split-debug` | bool | `false` | `false` | デバッグ情報を分離ファイルに出力します |
| `pch` | string | — | — | プロファイル固有の PCH オーバーライド |
| `unity` | bool | — | — | プロファイル固有のユニティビルドオーバーライド |
| `parallel` | int | — | — | プロファイル固有のジョブ数オーバーライド |

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
| `enabled` | bool | No | `false` | C++ モジュールサポートを有効にします |
| `import-std` | bool | No | `false` | `import std;` サポートを有効にします |

```toml
[modules]
enabled = true
import-std = true
```

## `[test]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `framework` | string | No | `"auto"` | `"auto"`、`"googletest"`、`"catch2"`、`"doctest"`、`"plain"` |
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
| `tool` | string | No | `"auto"` | `"auto"`、`"ccache"`、`"sccache"`、`"none"` |

## `[watch]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `include` | string[] | No | `[]` | 追加で監視するディレクトリ |
| `exclude` | string[] | No | `[]` | 監視から除外するディレクトリ |

## `[install]`

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `binaries` | string[] | No | 推論 | インストールするバイナリ名 |
| `headers` | string[] | No | 推論 | ヘッダーのグロブパターン |
| `libraries` | string[] | No | 推論 | インストールするライブラリファイル |

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
| `steps` | string[] | No | 下記参照 | CI パイプラインのステップ |

デフォルトのステップは以下の通りです。

```toml
[ci]
steps = ["fmt --check", "lint", "build", "test", "build --release"]
```

## `[target.'cfg(...)'.dependencies]`

プラットフォーム条件付き依存。`cfg()` 条件がビルドプラットフォームに一致する場合のみ組み込まれる。

```toml
[target.'cfg(macos)'.dependencies]
openssl = { provider = "brew" }

[target.'cfg(linux)'.dependencies]
openssl = { provider = "pacman" }

[target.'cfg(windows)'.dependencies]
openssl = { provider = "nuget" }

[target.'cfg(any(macos, linux))'.dependencies]
libuv = { provider = "pkg-config" }
```

### サポートされる条件

| 条件 | 一致対象 |
|------|---------|
| `cfg(macos)` | macOS |
| `cfg(linux)` | Linux |
| `cfg(windows)` | Windows |
| `cfg(unix)` | macOS または Linux |
| `cfg(x86_64)` | x86_64 アーキテクチャ |
| `cfg(aarch64)` | ARM64 アーキテクチャ |
| `cfg(not(...))` | 否定 |
| `cfg(all(...))` | すべての条件に一致 |
| `cfg(any(...))` | いずれかの条件に一致 |

`[target.'cfg(...)'.dev-dependencies]` も使用可能。

## `[target.<triple>]`

ターゲットトリプルごとのクロスコンパイル設定です。

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `compiler` | string | No | `[toolchain]` から継承 | このターゲットのコンパイラ |
| `sysroot` | string | No | — | sysroot のパス |
| `linker` | string | No | `[toolchain]` から継承 | このターゲットのリンカー |

```toml
[target.aarch64-linux-gnu]
compiler = "clang"
sysroot = "/opt/aarch64-sysroot"
linker = "lld"
```

## `[workspace]`

詳しくは[ワークスペースガイド](/ja/guide/workspace)を参照してください。

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|---------|------|
| `members` | string[] | Yes | — | メンバーパス（グロブパターン対応） |
| `exclude` | string[] | No | `[]` | 除外するパス |

## `[workspace.dependencies]`

全ワークスペースメンバーで共有される依存関係です。`[dependencies]` と同じ構文で記述します。メンバーは `{ workspace = true }` で参照します。
