# Lua ビルドスクリプト API

このページでは、Luaビルドスクリプト内で使えるランタイム環境、コンテキスト変数、API関数を解説します。使い方やサンプルについては [Lua ビルドスクリプト ガイド](/ja/guide/lua-build-scripts) を参照してください。

## ランタイム

- **Luaバージョン**: 5.4（[mlua](https://github.com/khvzak/mlua) によるベンダー済みランタイム）
- **サンドボックス**: 有効 — ファイルシステムアクセス制限、`io`/`os`/`loadfile`/`dofile` 無効、グローバルテーブル読み取り専用、ネットワークアクセス無効
- **作業ディレクトリ**: クローンされたソースディレクトリ（`src`）

## コンテキスト変数

スクリプト実行前にグローバルスコープに注入されます。

| 変数 | 型 | 説明 |
|------|------|------|
| `src` | `string` | クローンされたソースディレクトリの絶対パス |
| `out` | `string` | ビルド出力ディレクトリの絶対パス |
| `profile` | `string` | `"debug"` または `"release"` |
| `target.os` | `string` | `"linux"`、`"macos"`、`"windows"` のいずれか |
| `target.arch` | `string` | `"x86_64"` または `"aarch64"` |
| `compiler.cc` | `string` | Cコンパイラの絶対パス |
| `compiler.cxx` | `string` | C++コンパイラの絶対パス |
| `compiler.id` | `string` | `"clang"`、`"gcc"`、`"msvc"` のいずれか |

## 関数

### `exec(command, args [, opts])`

外部コマンドをサブプロセスとして実行します。

**パラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `command` | `string` | Yes | コマンド名またはパス |
| `args` | `string[]` | Yes | 引数リスト（文字列のテーブル） |
| `opts` | `table` | No | オプションテーブル |

**オプション:**

| キー | 型 | デフォルト | 説明 |
|-----|------|---------|------|
| `ignore_errors` | `bool` | `false` | `true` にすると、終了コードが0以外でもLuaエラーを発生させません |

**返り値:** `(success: bool, exit_code: int)`

**動作:**
- stdout/stderr はリアルタイムでターミナルに出力されます
- デフォルトでは、終了コードが0以外の場合にLuaエラーが発生し、スクリプトが中断されます
- `ignore_errors = true` を指定すると、`false` と終了コードが返されます

```lua
-- 基本的な使い方
exec("cmake", {"--build", "build"})

-- 終了コードを確認する
local ok, code = exec("make", {"test"}, { ignore_errors = true })
if not ok then
    print("Tests failed with code " .. code)
end
```

### `copy(src_path, dst_path)`

ファイルまたはディレクトリをコピーします。

**パラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `src_path` | `string` | Yes | コピー元パス（`src` からの相対パス、またはサンドボックス内の絶対パス） |
| `dst_path` | `string` | Yes | コピー先パス（`src` からの相対パス、またはサンドボックス内の絶対パス） |

**返り値:** なし

**動作:**
- `src_path` がディレクトリの場合、再帰的にコピーされます
- `dst_path` の親ディレクトリは自動的に作成されます
- 両パスとも `src` または `out` ディレクトリ内に収まる必要があります（サンドボックス制約）

```lua
copy("include/mylib.h", out .. "/include/mylib.h")
```

### `mkdir(path)`

ディレクトリを作成します。親ディレクトリも含めて作成されます。

**パラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `path` | `string` | Yes | ディレクトリパス（`src` からの相対パス、またはサンドボックス内の絶対パス） |

**返り値:** なし

```lua
mkdir(out .. "/include")
mkdir(out .. "/lib")
```

### `glob(pattern)`

グロブパターンにマッチするファイルを検索します。

**パラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `pattern` | `string` | Yes | グロブパターン（`src` からの相対パス） |

**返り値:** `string[]` — マッチしたファイルパスのテーブル（`src` からの相対パス）

```lua
local headers = glob("include/**/*.h")
-- 結果: {"include/foo.h", "include/bar/baz.h", ...}
```

## 返り値

すべてのスクリプトは、ビルド成果物を記述するテーブルを返す必要があります。

```lua
return {
    include_dirs = { out .. "/include" },
    lib_dirs = { out .. "/lib" },
    libs = { "mylib" }
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `include_dirs` | `string[]` | Yes | インクルードディレクトリの絶対パス（`-I` フラグ） |
| `lib_dirs` | `string[]` | Yes | ライブラリディレクトリの絶対パス（`-L` フラグ） |
| `libs` | `string[]` | Yes | ライブラリ名。`lib` プレフィックスや拡張子なし（`-l` フラグ） |

すべてのフィールドに空テーブル（`{}`）を指定できます。ヘッダーオンリーライブラリの場合に有用です。

## サンドボックス制約

| 制約 | 詳細 |
|------|------|
| ファイルシステム | `src` と `out` ディレクトリ内のみ読み書き可能 |
| 標準ライブラリ | `io`、`os`、`loadfile`、`dofile` は削除済み |
| グローバルテーブル | 読み取り専用 — グローバル変数の追加・変更不可 |
| ネットワーク | デフォルトで無効 |
| パストラバーサル | 検出されるとエラーが発生（例: `../../../etc/passwd`） |

## キャッシュ

| 条件 | 動作 |
|------|------|
| スクリプトハッシュ・gitコミットともに変更なし | キャッシュされた結果を使用、スクリプトは再実行されない |
| gitコミットが変更された | `ordo update <name>` 時にスクリプトを再実行 |
| スクリプトファイルが変更された | 次の `ordo build` または `ordo update` でスクリプトを再実行 |
| `ordo update <name> --rebuild` | 条件に関係なくスクリプトを再実行 |

スクリプトのSHA-256ハッシュは `Ordo.lock` の `script-hash` フィールドに記録されます。ビルド成果物は `~/.ordo/cache/git-builds/<slug>-<commit>/` に保存されます。
