# クイックスタート

## 前提条件

- [Ninja](https://ninja-build.org/) ビルドシステム
- C/C++ コンパイラ (Clang, GCC, or MSVC)
- オプション: [vcpkg](https://vcpkg.io/), [Conan](https://conan.io/), pkg-config（使用する依存プロバイダに応じて必要）

## インストール

**インストールスクリプト (Linux / macOS)**

```sh
curl -fsSL https://raw.githubusercontent.com/narusenia/ordo/main/install.sh | sh
```

**ソースからビルド (Rust が必要)**

```sh
cargo install --git https://github.com/narusenia/ordo.git
```

**手動ダウンロード**

[Releases](https://github.com/NaruseNia/ordo/releases) ページからバイナリをダウンロードできます。

| プラットフォーム | バイナリ |
|----------|--------|
| Linux x86_64 | `ordo-linux-x86_64` |
| Linux aarch64 | `ordo-linux-aarch64` |
| macOS x86_64 | `ordo-macos-x86_64` |
| macOS aarch64 | `ordo-macos-aarch64` |
| Windows x86_64 | `ordo-windows-x86_64.exe` |

## プロジェクトの作成

```sh
ordo new myapp
cd myapp
```

以下のディレクトリ構造が生成されます。

```
myapp/
├── Ordo.toml
├── src/
│   └── main.cpp
└── .gitignore
```

生成される `Ordo.toml` の内容は以下のとおりです。

```toml
[package]
name = "myapp"
version = "0.1.0"
type = "executable"

[language]
cpp = "c++20"
```

`ordo new` には追加オプションもあります。

```sh
ordo new mylib --lib        # 静的ライブラリ
ordo new myapp --lang c     # C プロジェクト
ordo init                   # 既存のディレクトリで初期化
```

引数なしで `ordo new` を実行すると、プロジェクト名・言語・タイプを対話的に入力するインタラクティブモードになります。

## 依存の追加

vcpkg から [raylib](https://www.raylib.com/) を追加してみましょう。

```sh
ordo add vcpkg:raylib@6.0
```

このコマンドにより、`Ordo.toml` に以下が追加されます。

```toml
[dependencies]
raylib = { version = "6.0", provider = "vcpkg" }
```

Ordo は vcpkg のセットアップを自動で行います。初回使用時に vcpkg がインストールされていなければ、自動的にブートストラップされます。

## コードを書く

`src/main.cpp` を編集します。

```cpp
#include <raylib.h>

int main() {
    InitWindow(800, 600, "Hello Ordo");

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(RAYWHITE);
        DrawText("Hello from Ordo!", 200, 260, 40, DARKGRAY);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}
```

## ビルドと実行

```sh
ordo build
ordo run
```

これだけです。`CMakeLists.txt` も `vcpkg.json` も `-DCMAKE_TOOLCHAIN_FILE=...` も必要ありません。Ordo が依存を解決し、`build.ninja` を生成して Ninja を呼び出します。

リリースビルドの場合は以下のようにします。

```sh
ordo build --release
ordo run --release
```

## 依存ツリーの確認

インストールされた依存とリンク情報を確認するには、以下のコマンドを実行します。

```sh
ordo tree
```

```
myapp v0.1.0
├── raylib v6.0 (vcpkg)
│   libs: glfw3, nanosvg, nanosvgrast, raylib
│   frameworks: Cocoa, CoreFoundation, IOKit
│   include: /Users/.../vcpkg/installed/arm64-osx/include
```

## その他の便利なコマンド

```sh
ordo update             # すべての依存を再解決
ordo update raylib      # 特定の依存を再解決
ordo clean              # ビルド成果物を削除
```

## 次のステップ

- [依存管理](/ja/guide/dependencies) — すべての依存プロバイダについて学ぶ
- [ワークスペース](/ja/guide/workspace) — マルチプロジェクトビルドの設定
- [Lua ビルドスクリプト](/ja/guide/lua-build-scripts) — git 依存のビルドスクリプト
- [CLI リファレンス](/ja/reference/cli) — 全コマンドの詳細
- [`Ordo.toml` リファレンス](/ja/reference/ordo-toml) — 設定ファイルの仕様
