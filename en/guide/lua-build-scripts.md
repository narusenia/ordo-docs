# Lua Build Scripts

::: warning UNRELEASED
Lua build scripts are available in the development branch and will be included in the next release.
:::

When using git dependencies, the cloned repository may need to be compiled before it can be used. Lua build scripts give you explicit control over how a dependency is built, within a sandboxed environment.

## Overview

To use a Lua build script, add the `with` field to a git dependency:

```toml
[dependencies]
sdl = { git = "https://github.com/libsdl-org/SDL", tag = "release-3.4.8", with = "build.lua" }
```

The script path is relative to your project root (not the cloned repository). Ordo executes the script after cloning, and the script must return the include paths, library paths, and library names that Ordo needs to link against.

## Writing a Build Script

A typical build script looks like this:

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

The script runs in the context of the cloned source directory. It has access to context variables and a small set of API functions.

## Context Variables

These variables are injected into every Lua script:

| Variable | Type | Description |
|----------|------|-------------|
| `src` | string | Absolute path to the cloned source directory |
| `out` | string | Absolute path to the build output directory |
| `profile` | string | `"debug"` or `"release"` |
| `target.os` | string | `"linux"`, `"macos"`, or `"windows"` |
| `target.arch` | string | `"x86_64"` or `"aarch64"` |
| `compiler.cc` | string | Path to the C compiler |
| `compiler.cxx` | string | Path to the C++ compiler |
| `compiler.id` | string | `"clang"`, `"gcc"`, or `"msvc"` |

## API Functions

### `exec(command, args[, opts])`

Executes an external command.

```lua
exec("cmake", {"--build", "build"})

-- Ignore errors
exec("make", {"clean"}, { ignore_errors = true })
```

Returns `(success, exit_code)`. By default, a non-zero exit code raises a Lua error. Pass `{ ignore_errors = true }` to handle failure yourself.

### `copy(src_path, dst_path)`

Copies a file or directory.

```lua
copy("include/mylib.h", out .. "/include/mylib.h")
```

### `mkdir(path)`

Creates a directory, including parent directories.

```lua
mkdir(out .. "/include")
mkdir(out .. "/lib")
```

### `glob(pattern)`

Returns a list of file paths matching a glob pattern.

```lua
local headers = glob("include/**/*.h")
for _, h in ipairs(headers) do
    copy(h, out .. "/" .. h)
end
```

## Return Value

Every script must return a table with the build results:

```lua
return {
    include_dirs = { out .. "/include" },
    lib_dirs = { out .. "/lib" },
    libs = { "mylib" }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `include_dirs` | string[] | Absolute paths to include directories |
| `lib_dirs` | string[] | Absolute paths to library directories |
| `libs` | string[] | Library names (without `lib` prefix or file extension) |

All fields accept empty lists. This is valid for header-only libraries:

```lua
copy("single_include/mylib.hpp", out .. "/include/mylib.hpp")
return {
    include_dirs = { out .. "/include" },
    lib_dirs = {},
    libs = {}
}
```

## Sandbox

Lua scripts run in a sandboxed environment for security:

- **Filesystem access** is restricted to the `src` (clone directory) and `out` (output directory) paths only
- **Standard libraries** `io`, `os`, `loadfile`, and `dofile` are removed
- **The global table** is read-only
- **Network access** is disabled by default
- **Path traversal** attempts (e.g., `../../../etc/passwd`) are caught and produce an error

The `with` field in `Ordo.toml` is an explicit opt-in. No scripts are executed unless you declare them.

## Caching

Build results are cached to avoid unnecessary rebuilds:

- The script's SHA-256 hash is recorded in `Ordo.lock` as `script-hash`
- The git commit hash is also recorded
- On subsequent builds, if neither the script nor the git commit has changed, cached results are used
- `ordo update <name>` re-executes the script if the git commit changed
- `ordo update <name> --rebuild` forces re-execution regardless

Build outputs are stored in `~/.ordo/cache/git-builds/<slug>-<commit>/`.

## Examples

### CMake-based library

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

### Header-only library

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

### Makefile-based library

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
