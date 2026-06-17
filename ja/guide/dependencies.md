# 依存管理

Ordo は統一されたインターフェースを通じて 5 つの依存プロバイダをサポートしています。ひとつのプロジェクト内でプロバイダを自由に組み合わせることができます。

## 依存の追加

`ordo add` コマンドで `Ordo.toml` に依存を追加します。

```sh
ordo add vcpkg:fmt@11.2.0       # vcpkg でバージョンを固定
ordo add vcpkg:raylib@>=6       # vcpkg で最小バージョンを指定
ordo add conan:sdl@3.4.8        # Conan
ordo add system:m                # システムライブラリ (-lm)
ordo add git:fmtlib/fmt@11.1.0  # Git (GitHub 短縮表記)
ordo add git:codeberg.org/u/r   # Git (カスタムホスト)
ordo add raylib                  # 対話的にプロバイダを選択
```

一般的な書式は `[provider:]name[@version]` です。プロバイダを省略すると、Ordo が対話的にプロバイダの選択を促します。

### バージョン演算子

- `@11.2.0` または `@=11.2.0` — 完全一致
- `@>=11` — 最小バージョン
- `@^11` — 互換バージョン (>=11.0.0, <12.0.0)
- `@~11.2` — パッチレベル互換 (>=11.2.0, <11.3.0)
- バージョン指定なし — 利用可能な最新版

## プロバイダ

### vcpkg

```toml
[dependencies]
fmt = { version = "11.2.0", provider = "vcpkg" }
raylib = { version = "6.0", provider = "vcpkg" }
```

vcpkg はほとんどの C/C++ ライブラリに推奨されるプロバイダです。Ordo は vcpkg を自動的に管理します。

- vcpkg がインストールされていない場合、初回使用時に自動でブートストラップします
- `VCPKG_ROOT` が設定されている場合、そのインストールを使用します
- それ以外の場合、`~/.ordo/` 配下で vcpkg を管理します
- パッケージのインストールと include/lib パスの抽出は自動的に行われます

### Conan

```toml
[dependencies]
sdl = { version = "3.4.8", provider = "conan" }
```

Conan を利用するには `conan` CLI が別途インストールされている必要があります。Ordo は内部的に `conanfile.txt` を生成し、`conan install` を実行して結果を抽出します。

### pkg-config

```toml
[dependencies]
openssl = { provider = "pkg-config" }
```

`pkg-config` を使用してシステムにインストール済みのライブラリを検出します。ライブラリがシステムに事前にインストールされている必要があります。Ordo は `pkg-config --cflags --libs` を実行し、そのフラグをコンパイラとリンカに渡します。

### system

```toml
[dependencies]
m = { provider = "system" }
pthread = { provider = "system" }
```

リンカコマンドに `-l<name>` を直接追加します。`m` (数学ライブラリ)、`pthread`、`dl` などの標準システムライブラリに使用します。インストールや検索は行われないため、ライブラリが存在しない場合はリンク時にエラーになります。

### git

```toml
[dependencies]
fmt = { git = "https://github.com/fmtlib/fmt", tag = "11.1.0" }
```

git リポジトリをクローンして依存として使用します。`tag`、`branch`、`rev` のいずれかひとつを指定する必要があります。

```toml
# タグで固定
fmt = { git = "https://github.com/fmtlib/fmt", tag = "11.1.0" }

# ブランチを追跡
fmt = { git = "https://github.com/fmtlib/fmt", branch = "main" }

# コミットで固定
fmt = { git = "https://github.com/fmtlib/fmt", rev = "abc123" }
```

使用前にコンパイルが必要なライブラリの場合、[Lua ビルドスクリプト](/ja/guide/lua-build-scripts)を指定できます。

```toml
sdl = { git = "https://github.com/libsdl-org/SDL", tag = "release-3.4.8", with = "build.lua" }
```

### パス依存

```toml
[dependencies]
core = { path = "../core" }
```

パス依存は、相対パスでローカルプロジェクトを参照します。再帰的にビルドされるため、`core` が独自の依存を持っている場合はそれらが先に解決・ビルドされます。循環依存は検出され、エラーとして報告されます。

## 依存の更新

```sh
ordo update             # すべての依存を再解決
ordo update fmt         # 特定の依存を再解決
```

`ordo update` は `Ordo.toml` のバージョン制約に基づいて依存解決を再実行し、`Ordo.lock` を更新します。

## 依存ツリーの確認

```sh
ordo tree
```

```
myapp v0.1.0
├── raylib v6.0 (vcpkg)
│   libs: glfw3, nanosvg, nanosvgrast, raylib
│   frameworks: Cocoa, CoreFoundation, IOKit
│   include: /Users/.../vcpkg/installed/arm64-osx/include
├── sdl v3.4.8 (conan)
│   libs: SDL3
│   frameworks: AVFoundation, CoreHaptics, Cocoa, ...
└── m (system)
    libs: m
```

## ロックファイル

ビルドや更新時に、Ordo はすべての依存について解決された正確なバージョンとインテグリティハッシュを記録した `Ordo.lock` ファイルを書き出します。これにより、異なるマシンや CI 環境でも再現性のあるビルドが保証されます。

```sh
ordo build --locked     # Ordo.lock と Ordo.toml が同期していない場合にエラー
ordo build --frozen     # ネットワークアクセスを禁止し、キャッシュ済みの依存のみを使用
```

ロックファイルのフォーマットについては [Ordo.lock リファレンス](/ja/reference/ordo-lock)を参照してください。

## オフラインでの使用

```sh
ordo add vcpkg:fmt --no-verify  # プロバイダへの問い合わせなしで追加
ordo build --frozen             # キャッシュ済みの依存のみでビルド
```
