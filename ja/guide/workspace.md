# ワークスペース

::: warning 未リリース
ワークスペース機能は開発ブランチで利用可能で、次のリリースに含まれる予定です。
:::

ワークスペースを使うと、複数の関連プロジェクトを1つのリポジトリで管理できます。依存関係、ツールチェイン設定、ビルド成果物がすべてのメンバー間で共有されます。

## ワークスペースの設定

リポジトリのルートに `[workspace]` セクションを持つ `Ordo.toml` を作成します。

```toml
[workspace]
members = [
    "apps/editor",
    "libs/core",
    "libs/render",
]
```

グロブパターンも使えます。

```toml
[workspace]
members = ["apps/*", "libs/*"]
exclude = ["libs/experimental"]
```

各メンバーのディレクトリには、`[package]` セクションを持つ独自の `Ordo.toml` が必要です。

## 共有依存関係

`[workspace.dependencies]` で共通の依存関係を宣言すると、全メンバーでバージョンを統一できます。

```toml
# ルートの Ordo.toml
[workspace]
members = ["apps/*", "libs/*"]

[workspace.dependencies]
fmt = { version = "11.2.0", provider = "vcpkg" }
spdlog = { version = "1.14", provider = "vcpkg" }
```

メンバー側では `{ workspace = true }` で共有依存関係を参照します。

```toml
# libs/core/Ordo.toml
[package]
name = "core"
version = "0.1.0"
type = "static-library"

[dependencies]
fmt = { workspace = true }
```

メンバーはワークスペース依存関係に加えて、独自の依存関係も追加できます。

## ツールチェインと言語設定の共有

ワークスペースルートの `[toolchain]` と `[language]` の設定は全メンバーに継承されます。

```toml
# ルートの Ordo.toml
[workspace]
members = ["apps/*", "libs/*"]

[language]
cpp = "c++20"

[toolchain]
compiler = "clang"
linker = "lld"
```

必要に応じて、個々のメンバーが自分の `Ordo.toml` でこれらの設定をオーバーライドすることもできます。

## ビルド

```sh
ordo build              # 全メンバーをビルド
ordo build -p editor    # 特定のメンバーとその依存関係をビルド
ordo run -p editor      # 特定のメンバーを実行
```

Ordo はワークスペース全体に対して単一の `build.ninja` を生成します。これにより、Ninja がすべてのメンバー間で最適にコンパイルをスケジューリングできます。ビルド成果物と `Ordo.lock` はワークスペースルートの `target/` に格納されます。

## メンバー間のパス依存関係

メンバー同士はパス依存関係で参照できます。

```toml
# apps/editor/Ordo.toml
[package]
name = "editor"
version = "0.1.0"
type = "executable"

[dependencies]
core = { path = "../../libs/core" }
render = { path = "../../libs/render" }
fmt = { workspace = true }
```

Ordo が依存グラフを解決し、正しい順序でメンバーをビルドします。

## ワークスペース専用ルート

ルートの `Ordo.toml` に `[package]` セクションは必須ではありません。メンバーの調整だけを行うワークスペース専用ルートも有効です。

```toml
# パッケージなし、ワークスペース設定のみ
[workspace]
members = ["apps/*", "libs/*"]

[workspace.dependencies]
fmt = { version = "11.2.0", provider = "vcpkg" }
```
