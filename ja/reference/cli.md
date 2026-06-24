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

## 未実装のコマンド

以下のコマンドは定義されていますが、まだ機能していません。

| コマンド | 説明 |
|---------|------|
| `ordo test` | フレームワーク自動検出によるテスト実行 |
| `ordo check` | バイナリを生成せずに構文チェック |
| `ordo fmt` | clang-format によるコードフォーマット |
| `ordo lint` | clang-tidy によるコードリント |
| `ordo watch <cmd>` | ファイル変更を監視してコマンドを再実行 |
| `ordo install` | プロジェクトをシステムパスにインストール |
| `ordo package` | 配布用アーカイブの作成 |
| `ordo publish` | Ordo レジストリへの公開 |
| `ordo import cmake` | CMakeLists.txt からのインポート |
| `ordo generate` | IDE 設定ファイルの生成（vscode、clion、clangd など） |
| `ordo toolchain` | ツールチェインの一覧表示・インストール |
| `ordo ci` | CI パイプラインステップの実行 |
| `ordo doctor` | 開発環境の診断 |
| `ordo config show` | 解決済み設定の表示 |
| `ordo run-script` | ユーザー定義スクリプトの実行 |
| `ordo self update` | Ordo 自体の更新 |
