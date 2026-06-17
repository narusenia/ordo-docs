# CLI コマンド

## グローバルフラグ

すべてのコマンドで使用可能なフラグです。

| フラグ | 説明 |
|------|------|
| `--color <MODE>` | カラー出力の制御。`auto`、`always`、`never`。デフォルト: `auto`。環境変数: `ORDO_COLOR` |
| `-v, --verbose` | 詳細出力。`-v` でコンパイラコマンドを表示、`-vv` でデバッグログを出力 |

## コマンド

### `ordo new [NAME]`

新しいプロジェクトを作成します。

```sh
ordo new myapp              # C++ 実行ファイル（デフォルト）
ordo new mylib --lib        # 静的ライブラリ
ordo new myapp --lang c     # C プロジェクト
ordo new                    # インタラクティブモード
```

| フラグ | 説明 |
|------|------|
| `--lib` | 実行ファイルの代わりにライブラリプロジェクトを作成 |
| `--lang <LANG>` | プロジェクト言語。`c` または `cpp`（デフォルト: `cpp`） |
| `--no-git` | git初期化をスキップ |

`NAME` を省略すると、プロジェクト名・言語・タイプを対話的に入力するインタラクティブモードになります。

### `ordo init`

既存のディレクトリでOrdoを初期化します。プロジェクトタイプは自動検出されます。`src/` に `main.cpp` や `main.c` があれば実行ファイル、なければライブラリとして設定されます。

`Ordo.toml` がすでに存在する場合は失敗します。

### `ordo build`

プロジェクトをビルドします。

```sh
ordo build                  # デバッグビルド
ordo build --release        # リリースビルド
ordo build --profile asan   # カスタムプロファイル
ordo build -p core          # ワークスペースの特定メンバーをビルド
ordo build --locked         # Ordo.lock が不整合なら失敗
```

| フラグ | 説明 |
|------|------|
| `--release` | リリースプロファイルでビルド |
| `--profile <NAME>` | カスタムプロファイルでビルド（`--release` と排他） |
| `-j, --jobs <N>` | Ninjaの並列ジョブ数 |
| `--target <TRIPLE>` | クロスコンパイル用のターゲットトリプル |
| `--no-cache` | ビルドキャッシュを無効化 |
| `--features <LIST>` | 有効にする機能（カンマ区切り） |
| `--no-default-features` | デフォルト機能を無効化 |
| `--all-features` | すべての機能を有効化 |
| `--locked` | `Ordo.lock` が `Ordo.toml` と不整合ならエラー |
| `--frozen` | ネットワークアクセスを禁止。キャッシュ済みの依存のみ使用 |
| `-p, --package <NAME>` | ワークスペースの特定メンバーをビルド |

### `ordo run [-- ARGS...]`

プロジェクトをビルドして実行します。`--` 以降の引数はバイナリに渡されます。

```sh
ordo run
ordo run --release
ordo run -p editor
ordo run -- --config myconfig.toml
```

| フラグ | 説明 |
|------|------|
| `--release` | リリースプロファイルでビルド |
| `-p, --package <NAME>` | ワークスペースの特定メンバーを実行 |

プロジェクトタイプが `executable` でない場合は失敗します。

### `ordo add <SPEC>`

依存を `Ordo.toml` に追加します。

```sh
ordo add vcpkg:fmt@11.2.0
ordo add conan:sdl@3.4.8
ordo add system:m
ordo add git:fmtlib/fmt@11.1.0
ordo add raylib                  # プロバイダを対話的に選択
```

specの形式は `[provider:]name[@version]` です。

| フラグ | 説明 |
|------|------|
| `-P, --provider <NAME>` | プロバイダを明示的に指定 |
| `--no-verify` | プロバイダへの問い合わせをスキップ（オフライン用） |
| `--with <SCRIPT>` | Luaビルドスクリプトのパス（git依存のみ） |

specにも `--provider` フラグにもプロバイダが指定されていない場合、対話的に選択するプロンプトが表示されます。

### `ordo update [NAME]`

依存を再解決し、`Ordo.lock` を更新します。

```sh
ordo update             # すべて再解決
ordo update fmt         # 特定の依存のみ再解決
```

### `ordo tree`

依存ツリーを表示します。

```sh
ordo tree
ordo tree -p core       # ワークスペースの特定メンバーのツリーを表示
```

| フラグ | 説明 |
|------|------|
| `-p, --package <NAME>` | ワークスペースの特定メンバーのツリーを表示 |

### `ordo clean`

ビルド成果物を削除します。

```sh
ordo clean
ordo clean --cache      # 外部ビルドキャッシュも削除
ordo clean -p core      # ワークスペースの特定メンバーをクリーン
```

| フラグ | 説明 |
|------|------|
| `--cache` | 外部ビルドキャッシュ（ccache/sccache）も削除 |
| `-p, --package <NAME>` | ワークスペースの特定メンバーをクリーン |

## 未実装のコマンド

以下のコマンドは定義済みですが、まだ実装されていません。

| コマンド | 説明 |
|---------|------|
| `ordo test` | テストフレームワークの自動検出とテスト実行 |
| `ordo check` | バイナリを生成しない構文チェック |
| `ordo fmt` | clang-formatによるコードフォーマット |
| `ordo lint` | clang-tidyによるリント |
| `ordo watch <cmd>` | ファイル変更を監視してコマンドを再実行 |
| `ordo install` | システムパスへのインストール |
| `ordo package` | 配布用アーカイブの作成 |
| `ordo publish` | Ordoレジストリへの公開 |
| `ordo import cmake` | CMakeLists.txtからのインポート |
| `ordo generate` | IDE設定の生成（vscode, clion, clangd 等） |
| `ordo toolchain` | ツールチェインの一覧・インストール |
| `ordo ci` | CIパイプラインの実行 |
| `ordo doctor` | 開発環境の診断 |
| `ordo config show` | 解決済み設定の表示 |
| `ordo run-script` | ユーザー定義スクリプトの実行 |
| `ordo self update` | Ordo自体のアップデート |
