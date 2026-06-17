# Lua Build Script API

::: warning UNRELEASED
Lua build scripts are available in the development branch and will be included in the next release.
:::

This page documents the runtime environment, context variables, and API functions available inside Lua build scripts. For a usage guide with examples, see the [Lua Build Scripts guide](/en/guide/lua-build-scripts).

## Runtime

- **Lua version**: 5.4 (via [mlua](https://github.com/khvzak/mlua) with vendored runtime)
- **Sandbox**: enabled — restricted filesystem access, no `io`/`os`/`loadfile`/`dofile`, read-only globals, no network access
- **Working directory**: the cloned source directory (`src`)

## Context Variables

Injected into the global scope before script execution.

| Variable | Type | Description |
|----------|------|-------------|
| `src` | `string` | Absolute path to the cloned source directory |
| `out` | `string` | Absolute path to the build output directory |
| `profile` | `string` | `"debug"` or `"release"` |
| `target.os` | `string` | `"linux"`, `"macos"`, or `"windows"` |
| `target.arch` | `string` | `"x86_64"` or `"aarch64"` |
| `compiler.cc` | `string` | Absolute path to the C compiler |
| `compiler.cxx` | `string` | Absolute path to the C++ compiler |
| `compiler.id` | `string` | `"clang"`, `"gcc"`, or `"msvc"` |

## Functions

### `exec(command, args [, opts])`

Execute an external command as a subprocess.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | `string` | Yes | Command name or path |
| `args` | `string[]` | Yes | Argument list (table of strings) |
| `opts` | `table` | No | Options table |

**Options:**

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `ignore_errors` | `bool` | `false` | If `true`, non-zero exit codes do not raise a Lua error |

**Returns:** `(success: bool, exit_code: int)`

**Behavior:**
- stdout/stderr are streamed to the terminal in real-time
- By default, a non-zero exit code raises a Lua error and aborts the script
- With `ignore_errors = true`, the function returns `false` and the exit code instead

```lua
-- Basic usage
exec("cmake", {"--build", "build"})

-- Check exit code
local ok, code = exec("make", {"test"}, { ignore_errors = true })
if not ok then
    print("Tests failed with code " .. code)
end
```

### `copy(src_path, dst_path)`

Copy a file or directory.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `src_path` | `string` | Yes | Source path (relative to `src`, or absolute within sandbox) |
| `dst_path` | `string` | Yes | Destination path (relative to `src`, or absolute within sandbox) |

**Returns:** nothing

**Behavior:**
- If `src_path` is a directory, it is copied recursively
- Parent directories of `dst_path` are created automatically
- Both paths must resolve within the `src` or `out` directories (sandbox enforced)

```lua
copy("include/mylib.h", out .. "/include/mylib.h")
```

### `mkdir(path)`

Create a directory, including all parent directories.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | Yes | Directory path (relative to `src`, or absolute within sandbox) |

**Returns:** nothing

```lua
mkdir(out .. "/include")
mkdir(out .. "/lib")
```

### `glob(pattern)`

Find files matching a glob pattern.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pattern` | `string` | Yes | Glob pattern (relative to `src`) |

**Returns:** `string[]` — table of matching file paths, relative to `src`

```lua
local headers = glob("include/**/*.h")
-- Returns: {"include/foo.h", "include/bar/baz.h", ...}
```

## Return Value

Every script must return a table describing the build output.

```lua
return {
    include_dirs = { out .. "/include" },
    lib_dirs = { out .. "/lib" },
    libs = { "mylib" }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `include_dirs` | `string[]` | Yes | Absolute paths to include directories (`-I` flags) |
| `lib_dirs` | `string[]` | Yes | Absolute paths to library directories (`-L` flags) |
| `libs` | `string[]` | Yes | Library names without `lib` prefix or extension (`-l` flags) |

All fields accept empty tables (`{}`). This is valid for header-only libraries.

## Sandbox Restrictions

| Restriction | Detail |
|-------------|--------|
| Filesystem | Read/write limited to `src` and `out` directories only |
| Standard libraries | `io`, `os`, `loadfile`, `dofile` are removed |
| Global table | Read-only — cannot add or modify global variables |
| Network | Disabled by default |
| Path traversal | Caught and produces an error (e.g., `../../../etc/passwd`) |

## Caching

| Condition | Behavior |
|-----------|----------|
| Script hash unchanged + git commit unchanged | Cached results used, script not re-executed |
| Git commit changed | Script re-executed on `ordo update <name>` |
| Script file changed | Script re-executed on next `ordo build` or `ordo update` |
| `ordo update <name> --rebuild` | Script re-executed regardless |

The script's SHA-256 hash is recorded in `Ordo.lock` as the `script-hash` field. Build outputs are stored in `~/.ordo/cache/git-builds/<slug>-<commit>/`.
