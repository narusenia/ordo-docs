# Ordo.toml

`Ordo.toml` is the project manifest. It lives at the root of your project (or workspace) and defines everything Ordo needs to build your project.

## `[package]`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | Yes | — | Package name (kebab-case recommended) |
| `version` | string | Yes | — | SemVer version (e.g., `"0.1.0"`) |
| `type` | string | Yes | — | `"executable"`, `"static-library"`, or `"shared-library"` |
| `license` | string | No | — | SPDX license identifier |
| `description` | string | No | — | One-line description |
| `authors` | string[] | No | `[]` | List of authors |
| `repository` | string | No | — | Repository URL |

```toml
[package]
name = "myapp"
version = "0.1.0"
type = "executable"
license = "MIT"
description = "My application"
authors = ["Your Name"]
repository = "https://github.com/you/myapp"
```

## `[language]`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `c` | string | No | — | C standard: `"c11"`, `"c17"`, `"c23"` |
| `cpp` | string | No | `"c++20"` | C++ standard: `"c++17"`, `"c++20"`, `"c++23"`, `"c++26"` |

Set either `c` or `cpp` (or both if your project mixes C and C++ sources).

```toml
[language]
cpp = "c++20"
```

## `[toolchain]`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `compiler` | string | No | auto-detect | `"clang"`, `"gcc"`, `"msvc"`, `"clang-cl"` |
| `linker` | string | No | compiler default | `"lld"`, `"mold"`, `"gold"`, `"default"` |
| `ninja` | string | No | latest | Ninja version managed by Arsenal, e.g. `"1.12"` |

Ordo auto-detects the compiler if not specified, with priority: Clang > GCC > MSVC.

```toml
[toolchain]
compiler = "clang"
linker = "lld"
ninja = "1.12"
```

`ninja` pins the version `ordo toolchain install ninja` resolves to. Ordo prefers an Arsenal-managed binary and falls back to `PATH`.

## `[cli]`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `style` | string | No | `"default"` | Output style: `"default"`, `"minimal"`, `"cargo-like"` |

Controls the display style of CLI output. Can also be overridden with the `--style` flag or `ORDO_CLI_STYLE` environment variable. Priority: CLI flag > env var > `Ordo.toml` > default.

```toml
[cli]
style = "minimal"
```

## `[dependencies]`

Dependencies can be declared in several formats. See the [Dependencies guide](/en/guide/dependencies) for usage details.

```toml
[dependencies]
# Registry (short form)
fmt = "11"

# Registry (long form)
fmt = { version = "11" }

# Provider
fmt = { version = "11.2.0", provider = "vcpkg" }
openssl = { provider = "pkg-config" }
m = { provider = "system" }

# Path
core = { path = "../core" }

# Git
fmt = { git = "https://github.com/fmtlib/fmt", tag = "11.1.0" }
fmt = { git = "https://...", branch = "main" }
fmt = { git = "https://...", rev = "abc123" }

# Git with Lua build script
sdl = { git = "https://...", tag = "3.4.8", with = "build.lua" }

# Optional (for features)
qt = { provider = "vcpkg", optional = true }

# Workspace reference
fmt = { workspace = true }

# With provider features
spdlog = { version = "1.14", provider = "vcpkg", features = ["async"] }
```

### Dependency Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Version constraint (SemVer) |
| `provider` | string | `"vcpkg"`, `"conan"`, `"pkg-config"`, `"system"`, `"brew"`, `"nix"`, `"pacman"`, `"clib"`, `"nuget"` |
| `path` | string | Relative path to a local project |
| `git` | string | Git repository URL |
| `tag` | string | Git tag (with `git`) |
| `branch` | string | Git branch (with `git`) |
| `rev` | string | Git commit hash (with `git`) |
| `with` | string | Lua build script path (with `git`) |
| `optional` | bool | Only linked when a feature enables it |
| `workspace` | bool | Inherit from `[workspace.dependencies]` |
| `features` | string[] | Provider-specific features to enable |
| `alias` | string | Real package name when using a different TOML key |
| `link-name` | string/string[] | Override library name(s) for linking |

## `[dev-dependencies]`

Same syntax as `[dependencies]`. These are only linked into test and bench binaries, not release builds.

```toml
[dev-dependencies]
googletest = { version = "1.14", provider = "vcpkg" }
```

## `[features]`

Define conditional compilation features.

```toml
[features]
default = ["logging"]
logging = []
gui = ["dep:qt", "logging"]
simd = []

[features.config]
prefix = "MYAPP_"       # Default: "ORDO_FEATURE_"
```

When a feature is enabled, Ordo defines a preprocessor macro (e.g., `MYAPP_LOGGING`). Features can depend on other features and can enable optional dependencies with the `dep:` prefix.

## `[build]`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `engine` | string | No | `"ninja"` | Build engine: `"ninja"` or `"faber"` (beta, built in — no Ninja install needed) |
| `jobs` | int | No | `0` (auto) | Parallel compilation jobs for Ninja |
| `pch` | string | No | — | Path to precompiled header source |
| `unity` | bool | No | `false` | Enable unity build |

```toml
[build]
engine = "faber"
jobs = 8
pch = "include/pch.hpp"
unity = true
```

## `[profile.<name>]`

Build profiles control optimization, debug info, and other compiler settings. The `dev` and `release` profiles are built-in; you can define custom profiles that inherit from them.

| Field | Type | Default (dev) | Default (release) | Description |
|-------|------|---------------|-------------------|-------------|
| `inherits` | string | — | — | Base profile to inherit from |
| `opt-level` | int/string | `0` | `3` | `0`, `1`, `2`, `3`, `s`, `z` |
| `debug` | bool | `true` | `false` | Include debug information |
| `assertions` | bool | `true` | `false` | Enable assertions |
| `sanitize` | string[] | `[]` | `[]` | `"address"`, `"undefined"`, `"thread"`, `"memory"` |
| `lto` | string/bool | `false` | `false` | `false`, `"thin"`, `"full"` |
| `strip` | bool | `false` | `true` | Strip symbols from output |
| `pic` | bool | `false` | `false` | Position-independent code |
| `rtti` | bool | `true` | `true` | C++ RTTI |
| `exceptions` | bool | `true` | `true` | C++ exceptions |
| `warnings` | string | `"all"` | `"all"` | `"default"`, `"all"`, `"extra"`, `"error"` |
| `linker` | string | — | — | Override linker for this profile |
| `static-runtime` | bool | `false` | `false` | Static C/C++ runtime |
| `coverage` | bool | `false` | `false` | Code coverage instrumentation |
| `split-debug` | bool | `false` | `false` | Separate debug info file |
| `pch` | string | — | — | Per-profile PCH override |
| `unity` | bool | — | — | Per-profile unity build override |
| `parallel` | int | — | — | Per-profile job count override |

```toml
[profile.dev]
debug = true
sanitize = ["address", "undefined"]

[profile.release]
opt-level = 3
lto = "thin"
strip = true

[profile.asan]
inherits = "dev"
sanitize = ["address"]
opt-level = 1
```

Use custom profiles with `ordo build --profile asan`.

## `[modules]`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `enabled` | bool | No | `false` | Enable C++ modules support |
| `import-std` | bool | No | `false` | Enable `import std;` support |

```toml
[modules]
enabled = true
import-std = true
```

## `[test]`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `framework` | string | No | `"auto"` | `"auto"`, `"googletest"`, `"catch2"`, `"doctest"`, `"plain"` |
| `src` | string | No | `"tests/"` | Test source directory |

## `[fmt]`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `tool` | string | No | `"clang-format"` | Formatting tool |
| `style` | string | No | `".clang-format"` | Style config file path |

## `[lint]`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `tool` | string | No | `"clang-tidy"` | Linting tool |
| `config` | string | No | `".clang-tidy"` | Config file path |

## `[cache]`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `tool` | string | No | `"auto"` | `"auto"`, `"ccache"`, `"sccache"`, `"none"` |

## `[watch]`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `include` | string[] | No | `[]` | Additional directories to watch |
| `exclude` | string[] | No | `[]` | Directories to exclude from watching |

## `[install]`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `binaries` | string[] | No | inferred | Binary names to install |
| `headers` | string[] | No | inferred | Header glob patterns |
| `libraries` | string[] | No | inferred | Library files to install |

## `[scripts]`

User-defined scripts that can be run with `ordo run-script <name>`.

```toml
[scripts]
prebuild = "python generate_version.py"
deploy = "rsync -av target/release/ server:/opt/"
```

## `[ci]`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `steps` | string[] | No | see below | CI pipeline steps |

Default steps:

```toml
[ci]
steps = ["fmt --check", "lint", "build", "test", "build --release"]
```

## `[target.'cfg(...)'.dependencies]`

Platform-conditional dependencies. Only included when the `cfg()` condition matches the build platform.

```toml
[target.'cfg(macos)'.dependencies]
openssl = { provider = "brew" }

[target.'cfg(linux)'.dependencies]
openssl = { provider = "pacman" }

[target.'cfg(windows)'.dependencies]
openssl = { provider = "nuget" }

[target.'cfg(any(macos, linux))'.dependencies]
libuv = { provider = "pkg-config" }
```

### Supported conditions

| Condition | Matches |
|-----------|---------|
| `cfg(macos)` | macOS |
| `cfg(linux)` | Linux |
| `cfg(windows)` | Windows |
| `cfg(unix)` | macOS or Linux |
| `cfg(x86_64)` | x86_64 architecture |
| `cfg(aarch64)` | ARM64 architecture |
| `cfg(not(...))` | Negation |
| `cfg(all(...))` | All conditions must match |
| `cfg(any(...))` | Any condition must match |

Target sections can also contain `[target.'cfg(...)'.dev-dependencies]`.

## `[target.<triple>]`

Cross-compilation settings per target triple.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `compiler` | string | No | from `[toolchain]` | Compiler for this target |
| `sysroot` | string | No | — | Sysroot path |
| `linker` | string | No | from `[toolchain]` | Linker for this target |

```toml
[target.aarch64-linux-gnu]
compiler = "clang"
sysroot = "/opt/aarch64-sysroot"
linker = "lld"
```

## `[workspace]`

See the [Workspace guide](/en/guide/workspace).

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `members` | string[] | Yes | — | Member paths (glob patterns supported) |
| `exclude` | string[] | No | `[]` | Paths to exclude |

## `[workspace.dependencies]`

Shared dependencies for all workspace members. Same syntax as `[dependencies]`. Members reference them with `{ workspace = true }`.
