# CLI コマンド

## グローバルフラグ

すべてのコマンドで使用できるフラグです。

| フラグ | 説明 |
|------|------|
| `--color <MODE>` | カラー出力の制御。`auto`、`always`、`never` から選択します。デフォルトは `auto` です。環境変数 `ORDO_COLOR` でも設定できます |
| `-v, --verbose` | 詳細出力を有効にします。`-v` でコンパイラコマンドを表示、`-vv` でデバッグログを表示します |
| `--style <MODE>` | 出力スタイル。`default`、`minimal`、`cargo-like` から選択します。デフォルトは `default` です。環境変数 `ORDO_CLI_STYLE` でも設定できます |

## コマンド

### `ordo new [NAME]`

新しいプロジェクトを作成します。

```sh
ordo new myapp              # C++ 実行ファイル（デフォルト）
ordo new mylib --lib        # スタティックライブラリ
ordo new myapp --lang c     # C プロジェクト
ordo new                    # インタラクティブモード
```

| フラグ | 説明 |
|------|------|
| `--lib` | 実行ファイルの代わりにライブラリプロジェクトを作成します |
| `--lang <LANG>` | プロジェクト言語。`c` または `cpp` を指定します（デフォルトは `cpp`） |
| `--no-git` | git の初期化をスキップします |

`NAME` を省略すると、Ordo はインタラクティブモードに入り、プロジェクト名、言語、タイプを対話的に選択できます。

### `ordo init`

既存のディレクトリで Ordo を初期化します。プロジェクトタイプは自動検出されます。`src/` に `main.cpp` または `main.c` が存在する場合は実行ファイル、それ以外はライブラリとして設定されます。

`Ordo.toml` がすでに存在する場合は失敗します。

### `ordo build`

プロジェクトをビルドします。

```sh
ordo build                  # デバッグビルド
ordo build --release        # リリースビルド
ordo build --profile asan   # 名前付きプロファイル
ordo build -p core          # 特定のワークスペースメンバーをビルド
ordo build --locked         # Ordo.lock が同期していなければ失敗
```

| フラグ | 説明 |
|------|------|
| `--release` | release プロファイルでビルドします |
| `--profile <NAME>` | 名前付きプロファイルでビルドします（`--release` と併用不可） |
| `-j, --jobs <N>` | Ninja の並列ジョブ数を指定します |
| `--target <TRIPLE>` | クロスコンパイル用のターゲットトリプルを指定します |
| `--no-cache` | ビルドキャッシュを無効にします |
| `--features <LIST>` | 有効にするフィーチャーをカンマ区切りで指定します |
| `--no-default-features` | デフォルトフィーチャーを無効にします |
| `--all-features` | すべてのフィーチャーを有効にします |
| `--locked` | `Ordo.lock` が `Ordo.toml` と同期していない場合にエラーを返します |
| `--frozen` | ネットワークアクセスを禁止し、キャッシュされた依存関係のみを使用します |
| `-p, --package <NAME>` | 特定のワークスペースメンバーをビルドします |

### `ordo run [-- ARGS...]`

プロジェクトをビルドして実行します。`--` の後の引数はビルドされたバイナリに渡されます。

```sh
ordo run
ordo run --release
ordo run -p editor
ordo run -- --config myconfig.toml
```

| フラグ | 説明 |
|------|------|
| `--release` | release プロファイルでビルドします |
| `-p, --package <NAME>` | 特定のワークスペースメンバーを実行します |

プロジェクトタイプが `executable` でない場合は失敗します。

### `ordo add <SPEC>...`

`Ordo.toml` に1つ以上の依存関係を追加する。

```sh
ordo add vcpkg:fmt@11.2.0
ordo add conan:sdl@3.4.8
ordo add system:m
ordo add git:fmtlib/fmt@11.1.0
ordo add raylib                     # インタラクティブにプロバイダー選択
ordo add fmt glfw raylib -P vcpkg   # 複数パッケージ一括
ordo add z -P system --alias zlib --link-name z
```

spec フォーマット: `[provider:]name[@version]`。複数specを一度に渡せる。

| フラグ | 説明 |
|------|------|
| `-P, --provider <NAME>` | プロバイダー指定（全specに適用） |
| `--no-verify` | プロバイダー検証スキップ（オフライン用） |
| `--with <SCRIPT>` | Lua ビルドスクリプトパス（git依存のみ、単一spec時のみ） |
| `--alias <NAME>` | プロバイダー解決に使う実パッケージ名（単一spec時のみ） |
| `--link-name <NAME>` | リンク時ライブラリ名オーバーライド、カンマ区切り（単一spec時のみ） |

プロバイダー未指定時は対話的に選択（単一specのみ）。複数specの場合は `-P` または `provider:name` 構文を使用。

### `ordo update [NAME]`

依存関係を再解決し、`Ordo.lock` を更新します。

```sh
ordo update             # すべて再解決
ordo update fmt         # 特定の依存関係を再解決
```

`NAME` を指定すると、その依存関係のみが再解決されます。

### `ordo tree`

依存関係ツリーを表示します。

```sh
ordo tree
ordo tree -p core       # 特定のワークスペースメンバーのツリーを表示
```

| フラグ | 説明 |
|------|------|
| `-p, --package <NAME>` | 特定のワークスペースメンバーのツリーを表示します |

### `ordo clean`

ビルド成果物を削除します。

```sh
ordo clean
ordo clean --cache      # 外部ビルドキャッシュも削除
ordo clean -p core      # 特定のワークスペースメンバーをクリーン
```

| フラグ | 説明 |
|------|------|
| `--cache` | 外部ビルドキャッシュ（ccache/sccache）も削除します |
| `-p, --package <NAME>` | 特定のワークスペースメンバーをクリーンします |

### `ordo test`

プロジェクトのテストをビルドして実行します。

```sh
ordo test                   # すべてのテストを実行
ordo test --filter parser   # 名前が一致するテストのみ実行
ordo test --release         # release プロファイルでテスト
ordo test -p core           # 特定のワークスペースメンバーをテスト
```

| フラグ | 説明 |
|------|------|
| `--filter <NAME>` | 名前が一致するテストのみ実行します |
| `-j, --jobs <N>` | テストの並列実行数 |
| `--release` | release プロファイルを使用します |
| `--profile <NAME>` | 名前付きプロファイルを使用します（`--release` と併用不可） |
| `--features <LIST>` | フィーチャーを有効化します（カンマ区切り） |
| `--no-default-features` | デフォルトフィーチャーを無効化します |
| `--all-features` | すべてのフィーチャーを有効化します |
| `-p, --package <NAME>` | 特定のワークスペースメンバーをテストします |

テストソースの既定の置き場は `tests/` です（`[test] src` で変更可）。フレームワークはファイルごとに `#include` 行から判定され、`gtest/gtest.h` または `gmock/gmock.h` なら GoogleTest、`catch2/` のヘッダなら Catch2、`doctest.h` なら doctest、いずれにも該当しなければ自前の `main` を持つプレーンなテストバイナリとして扱われます。明示的に固定する場合は `[test] framework` を指定します。

### `ordo check`

バイナリを生成せずに構文エラーだけを検査します。フルビルドより大幅に高速です。

```sh
ordo check
ordo check --release
ordo check -p core
```

| フラグ | 説明 |
|------|------|
| `--release` | release プロファイルで検査します |
| `--profile <NAME>` | 名前付きプロファイルで検査します（`--release` と併用不可） |
| `--features <LIST>` | フィーチャーを有効化します（カンマ区切り） |
| `--no-default-features` | デフォルトフィーチャーを無効化します |
| `--all-features` | すべてのフィーチャーを有効化します |
| `-p, --package <NAME>` | 特定のワークスペースメンバーを検査します |

### `ordo fmt`

`src/`、`include/`、`tests/`、`test/` 以下の C/C++ ソースを clang-format で整形します。

```sh
ordo fmt                    # ファイルを直接書き換え
ordo fmt --check            # 差分を報告するだけで書き換えない（CI 向け）
ordo fmt -p core            # 特定のワークスペースメンバーを整形
```

| フラグ | 説明 |
|------|------|
| `--check` | 書き換えずに差分を報告します。差分があれば非ゼロで終了します |
| `-p, --package <NAME>` | 特定のワークスペースメンバーを整形します |

**スタイル。** プロジェクトまたはその親ディレクトリに `.clang-format`（`_clang-format` も可）があれば clang-format がそれを使い、Ordo は介入しません。無い場合は Ordo の既定値（LLVM スタイル、`IndentWidth: 4`、`ColumnLimit: 100`）を渡します。**このときプロジェクトにファイルは書き込まれません。** 既定値を変えるには `Ordo.toml` の `[fmt] style` に clang-format の YAML を書きます:

```toml
[fmt]
style = """
BasedOnStyle: Google
ColumnLimit: 120
"""
```

エディタなど他のツールにも読ませたい場合は [`ordo generate clang-format`](#ordo-generate-target) で実ファイルとして書き出します。ファイル無しでスタイルを渡す方式は clang-format 14 以降が必要で、それより古い場合は対処方法を含むエラーになります。

**どの clang-format が使われるか。** `[fmt] tool` が設定されていればそれが最優先です。それ以外の場合、[`ordo toolchain`](#ordo-toolchain-subcommand) が管理するバイナリ → `PATH` → Xcode 同梱（macOS）の順で最初に見つかったものを使い、どれも無ければインストールを提案します。バージョンは `[toolchain]` の `clang-format` で固定でき、**候補はすべてこのピンと照合されます**。誰かの `PATH` の手前にある別バージョンが整形結果を黙って変えることはありません。

### `ordo lint`

C/C++ ソースを clang-tidy で静的解析します。

```sh
ordo lint
ordo lint --fix             # clang-tidy が修正できるものを適用
ordo lint -p core
```

| フラグ | 説明 |
|------|------|
| `--fix` | 自動修正を適用します（`--fix-errors` も同時に渡されます） |
| `-p, --package <NAME>` | 特定のワークスペースメンバーを解析します |

lint は `compile_commands.json` を参照します。存在しない場合は先にビルドを実行します。`.clang-tidy` がプロジェクトに無ければ Ordo の既定値で生成されます。コンパイラと clang-tidy が別のツールチェイン由来の場合（GCC に LLVM の clang-tidy を組み合わせた場合など）、Ordo はコンパイラのシステムインクルードパスをコンパイルデータベースに追加した上で警告を出し、clang-tidy が標準ヘッダを見失わないようにします。

### `ordo run-script <NAME>`

`Ordo.toml` の `[scripts]` に定義したスクリプトを実行します。

```sh
ordo run-script deploy
```

### `ordo toolchain <SUBCOMMAND>` <Badge type="warning" text="beta" />

Ordo が外部プロセスとして呼び出すツールのダウンロードとバージョン管理を行います。Ninja は公式の `ninja-build/ninja` GitHub Releases から、clang-format は LLVM のバイナリを同梱した PyPI の wheel から取得します（Ordo が動作する全プラットフォームを覆う唯一の配布形態のため）。複数バージョンが併存でき、ツール解決は管理下のバイナリを優先し、無ければ `PATH` にフォールバックします。

```sh
ordo toolchain install ninja                    # 最新の Ninja をインストール
ordo toolchain install clang-format --version 23
ordo toolchain list                             # インストール済みツールの一覧
ordo toolchain which clang-format               # バイナリのパスを表示
ordo toolchain update                           # インストール済みのものをすべて更新
ordo toolchain remove ninja 1.12                # 特定バージョンを削除
ordo toolchain clean                            # インストール済みツールをすべて削除
```

| サブコマンド | 説明 |
|------------|------|
| `install <TOOL> [--version <V>]` | ツールをインストールします（バージョン指定可） |
| `list` | インストール済みのツールとバージョンを一覧表示します |
| `which <TOOL>` | ツールのバイナリのパスを表示します |
| `update [TOOL]` | ツールを更新します（省略時はインストール済みのものすべて） |
| `remove <TOOL> <VERSION>` | 特定バージョンを削除します |
| `clean` | インストール済みのツールをすべて削除します |

管理対象のツール: `ninja`、`clang-format`。

プロジェクトごとのバージョン固定は `Ordo.toml` の `[toolchain]` の `ninja` / `clang-format` で行います。コマンドの実行に必要なツールがどこにも見つからない場合、Ordo は失敗せずにインストールを提案します（`CI` または `ORDO_YES` 設定時はプロンプトを省略して実行）。

### `ordo generate <TARGET>`

プロジェクトから設定ファイルを生成します。

```sh
ordo generate clang-format   # fmt のスタイルから .clang-format を書き出す
```

| ターゲット | 状態 |
|--------|--------|
| `clang-format` | `[fmt] style`（未設定なら Ordo の既定値）から `.clang-format` を生成します。既存ファイルがある場合は上書きせずエラーになります |
| `cmake`、`presets`、`vscode`、`clion`、`clangd`、`github-actions`、`gitlab-ci` | 未実装 |

## 未実装のコマンド

以下のコマンドは定義されていますが、まだ機能していません。

| コマンド | 説明 |
|---------|------|
| `ordo watch <cmd>` | ファイル変更を監視してコマンドを再実行 |
| `ordo install` | プロジェクトをシステムパスにインストール |
| `ordo package` | 配布用アーカイブの作成 |
| `ordo publish` | Ordo レジストリへの公開 |
| `ordo import cmake` | CMakeLists.txt からのインポート |
| `ordo ci` | CI パイプラインステップの実行 |
| `ordo doctor` | 開発環境の診断 |
| `ordo config show` | 解決済み設定の表示 |
| `ordo self update` | Ordo 自体の更新 |
