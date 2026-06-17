# Lua ビルドスクリプト

::: warning 未リリース
Luaビルドスクリプト機能は開発ブランチで利用可能で、次のリリースに含まれる予定です。
:::

git依存を使う際、クローンしたリポジトリをビルドしてから使う必要がある場合があります。Luaビルドスクリプトを使えば、サンドボックス環境内で依存のビルド方法を明示的に制御できます。

## 概要

Luaビルドスクリプトを使うには、git依存に `with` フィールドを追加します。

```toml
[dependencies]
sdl = { git = "https://github.com/libsdl-org/SDL", tag = "release-3.4.8", with = "build.lua" }
```

スクリプトのパスはプロジェクトルートからの相対パスです（クローン先ではありません）。Ordoはクローン後にスクリプトを実行し、スクリプトはOrdoがリンクに必要なインクルードパス、ライブラリパス、ライブラリ名を返します。

## スクリプトの書き方

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

スクリプトはクローンされたソースディレクトリのコンテキストで実行されます。コンテキスト変数と少数のAPI関数が利用可能です。

## コンテキスト変数

すべてのLuaスクリプトに注入される変数です。

| 変数 | 型 | 説明 |
|------|------|------|
| `src` | string | クローンされたソースディレクトリの絶対パス |
| `out` | string | ビルド出力ディレクトリの絶対パス |
| `profile` | string | `"debug"` または `"release"` |
| `target.os` | string | `"linux"`、`"macos"`、`"windows"` |
| `target.arch` | string | `"x86_64"` または `"aarch64"` |
| `compiler.cc` | string | Cコンパイラのパス |
| `compiler.cxx` | string | C++コンパイラのパス |
| `compiler.id` | string | `"clang"`、`"gcc"`、`"msvc"` |

## API関数

### `exec(command, args[, opts])`

外部コマンドを実行します。

```lua
exec("cmake", {"--build", "build"})

-- エラーを無視する
exec("make", {"clean"}, { ignore_errors = true })
```

`(success, exit_code)` を返します。デフォルトでは終了コードが0以外の場合にLuaエラーが発生します。`{ ignore_errors = true }` を渡すと、失敗時に `false` と終了コードが返されます。

### `copy(src_path, dst_path)`

ファイルまたはディレクトリをコピーします。

```lua
copy("include/mylib.h", out .. "/include/mylib.h")
```

### `mkdir(path)`

ディレクトリを作成します（親ディレクトリ含む）。

```lua
mkdir(out .. "/include")
mkdir(out .. "/lib")
```

### `glob(pattern)`

グロブパターンにマッチするファイルのリストを返します。

```lua
local headers = glob("include/**/*.h")
for _, h in ipairs(headers) do
    copy(h, out .. "/" .. h)
end
```

## 返り値

すべてのスクリプトはビルド結果のテーブルを返す必要があります。

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
| `libs` | string[] | ライブラリ名（`lib` プレフィックスや拡張子なし） |

すべてのフィールドに空リストを指定できます。ヘッダーオンリーライブラリの場合に有用です。

```lua
copy("single_include/mylib.hpp", out .. "/include/mylib.hpp")
return {
    include_dirs = { out .. "/include" },
    lib_dirs = {},
    libs = {}
}
```

## サンドボックス

Luaスクリプトはセキュリティのためサンドボックス環境で実行されます。

- **ファイルシステムアクセス**は `src`（クローンディレクトリ）と `out`（出力ディレクトリ）のパスのみに制限
- **標準ライブラリ** `io`、`os`、`loadfile`、`dofile` は削除済み
- **グローバルテーブル**は読み取り専用
- **ネットワークアクセス**はデフォルトで無効
- **パストラバーサル**（例: `../../../etc/passwd`）は検出されエラーになる

`Ordo.toml` の `with` フィールドは明示的なオプトインです。宣言しない限りスクリプトは実行されません。

## キャッシュ

不要な再ビルドを避けるため、ビルド結果はキャッシュされます。

- スクリプトの SHA-256 ハッシュが `Ordo.lock` に `script-hash` として記録されます
- gitコミットハッシュも記録されます
- スクリプトとコミットのどちらも変わっていなければ、キャッシュされた結果が使われます
- `ordo update <name>` はgitコミットが変わった場合にスクリプトを再実行します
- `ordo update <name> --rebuild` は条件に関係なく再実行を強制します

ビルド出力は `~/.ordo/cache/git-builds/<slug>-<commit>/` に保存されます。

## 使用例

### CMakeベースのライブラリ

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

### Makefileベースのライブラリ

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

API関数の詳細なリファレンスについては [Lua API リファレンス](/ja/reference/lua-api) を参照してください。
