# Lua ビルドスクリプト

::: warning 未リリース
Luaビルドスクリプト機能は開発ブランチで利用可能で、次のリリースに含まれる予定です。
:::

git 依存関係を使う場合、クローンしたリポジトリを利用前にコンパイルする必要があることがあります。Lua ビルドスクリプトを使うと、サンドボックス環境内で依存関係のビルド方法を明示的に制御できます。

## 概要

Lua ビルドスクリプトを使うには、git 依存関係に `with` フィールドを追加します。

```toml
[dependencies]
sdl = { git = "https://github.com/libsdl-org/SDL", tag = "release-3.4.8", with = "build.lua" }
```

スクリプトパスはプロジェクトルートからの相対パスです（クローンしたリポジトリからではありません）。Ordo はクローン後にスクリプトを実行し、スクリプトはリンクに必要なインクルードパス、ライブラリパス、ライブラリ名を返す必要があります。

## ビルドスクリプトの書き方

典型的なビルドスクリプトは以下のようになります。

```lua
-- build.lua
exec("cmake", {
    "-B", "build",
    "-G", "Ninja",
    "-DCMAKE_BUILD_TYPE=" .. profile,
    "-DCMAKE_INSTALL_PREFIX=" .. out
})
exec("cmake", {"--build", "build"})
exec("cmake", {"--install", "build"})

return {
    include_dirs = { out .. "/include" },
    lib_dirs = { out .. "/lib" },
    libs = { "SDL3" }
}
```

スクリプトはクローンされたソースディレクトリのコンテキストで実行されます。コンテキスト変数と少数の API 関数にアクセスできます。

## コンテキスト変数

すべての Lua スクリプトに以下の変数が注入されます。

| 変数 | 型 | 説明 |
|------|------|------|
| `src` | string | クローンされたソースディレクトリの絶対パス |
| `out` | string | ビルド出力ディレクトリの絶対パス |
| `profile` | string | `"debug"` または `"release"` |
| `target.os` | string | `"linux"`、`"macos"`、`"windows"` のいずれか |
| `target.arch` | string | `"x86_64"` または `"aarch64"` |
| `compiler.cc` | string | C コンパイラのパス |
| `compiler.cxx` | string | C++ コンパイラのパス |
| `compiler.id` | string | `"clang"`、`"gcc"`、`"msvc"` のいずれか |

## API 関数

### `exec(command, args[, opts])`

外部コマンドを実行します。

```lua
exec("cmake", {"--build", "build"})

-- エラーを無視する
exec("make", {"clean"}, { ignore_errors = true })
```

`(success, exit_code)` を返します。デフォルトでは、終了コードが 0 以外の場合に Lua エラーが発生します。`{ ignore_errors = true }` を渡すと、失敗を自分で処理できます。

### `copy(src_path, dst_path)`

ファイルまたはディレクトリをコピーします。

```lua
copy("include/mylib.h", out .. "/include/mylib.h")
```

### `mkdir(path)`

ディレクトリを作成します。親ディレクトリも含めて作成されます。

```lua
mkdir(out .. "/include")
mkdir(out .. "/lib")
```

### `glob(pattern)`

グロブパターンにマッチするファイルパスのリストを返します。

```lua
local headers = glob("include/**/*.h")
for _, h in ipairs(headers) do
    copy(h, out .. "/" .. h)
end
```

## 返り値

すべてのスクリプトはビルド結果を含むテーブルを返す必要があります。

```lua
return {
    include_dirs = { out .. "/include" },
    lib_dirs = { out .. "/lib" },
    libs = { "mylib" }
}
```

| フィールド | 型 | 説明 |
|-----------|------|------|
| `include_dirs` | string[] | インクルードディレクトリの絶対パス |
| `lib_dirs` | string[] | ライブラリディレクトリの絶対パス |
| `libs` | string[] | ライブラリ名（`lib` プレフィックスやファイル拡張子なし） |

すべてのフィールドに空のリストを指定できます。ヘッダーオンリーライブラリの場合に有用です。

```lua
copy("single_include/mylib.hpp", out .. "/include/mylib.hpp")
return {
    include_dirs = { out .. "/include" },
    lib_dirs = {},
    libs = {}
}
```

## サンドボックス

Lua スクリプトはセキュリティのためサンドボックス環境で実行されます。

- **ファイルシステムアクセス**は `src`（クローンディレクトリ）と `out`（出力ディレクトリ）のパスのみに制限されます
- **標準ライブラリ** `io`、`os`、`loadfile`、`dofile` は削除されています
- **グローバルテーブル**は読み取り専用です
- **ネットワークアクセス**はデフォルトで無効です
- **パストラバーサル**の試み（例: `../../../etc/passwd`）は検出されてエラーになります

`Ordo.toml` の `with` フィールドは明示的なオプトインです。宣言しない限り、スクリプトは実行されません。

## キャッシュ

ビルド結果はキャッシュされ、不要な再ビルドを回避します。

- スクリプトの SHA-256 ハッシュが `Ordo.lock` に `script-hash` として記録されます
- git コミットハッシュも記録されます
- 次回以降のビルドで、スクリプトも git コミットも変更されていなければ、キャッシュされた結果が使用されます
- `ordo update <name>` は git コミットが変更された場合にスクリプトを再実行します
- `ordo update <name> --rebuild` は条件に関係なく再実行を強制します

ビルド出力は `~/.ordo/cache/git-builds/<slug>-<commit>/` に保存されます。

## 例

### CMake ベースのライブラリ

```lua
exec("cmake", {
    "-B", "build",
    "-G", "Ninja",
    "-DCMAKE_BUILD_TYPE=" .. profile,
    "-DCMAKE_INSTALL_PREFIX=" .. out,
    "-DBUILD_SHARED_LIBS=OFF",
    "-DBUILD_TESTING=OFF"
})
exec("cmake", {"--build", "build"})
exec("cmake", {"--install", "build"})

return {
    include_dirs = { out .. "/include" },
    lib_dirs = { out .. "/lib" },
    libs = { "mylib" }
}
```

### ヘッダーオンリーライブラリ

```lua
mkdir(out .. "/include")
local headers = glob("include/**/*.hpp")
for _, h in ipairs(headers) do
    copy(h, out .. "/" .. h)
end

return {
    include_dirs = { out .. "/include" },
    lib_dirs = {},
    libs = {}
}
```

### Makefile ベースのライブラリ

```lua
exec("make", {
    "-j4",
    "PREFIX=" .. out,
    "CC=" .. compiler.cc
})
exec("make", {"install", "PREFIX=" .. out})

return {
    include_dirs = { out .. "/include" },
    lib_dirs = { out .. "/lib" },
    libs = { "mylib" }
}
```
