# Changelog

## v0.3.0 <Badge type="tip" text="latest" />

_2026-09-16_

### Features

- **Faber build engine (beta)** — A built-in parallel build executor. Set `engine = "faber"` under `[build]` to build without Ninja installed. Runs across all logical CPU cores by default (`-j` to override) and rebuilds incrementally from timestamps plus compiler depfiles.
- **Faber support for `ordo test` and `ordo check`** — Test binaries and syntax-only checks run on the same engine, so `engine = "faber"` covers those paths too.
- **Arsenal toolchain manager (beta)** — `ordo toolchain install | list | which | remove | update | clean` downloads and version-manages external tools. Ninja comes from the official GitHub Releases; versions install side by side and can be pinned with `ninja = "1.12"` under `[toolchain]`. Tool lookup prefers an Arsenal-managed binary, then falls back to `PATH`.
- **Automatic Ninja provisioning** — When a build needs Ninja and none is found, Ordo offers to install it via Arsenal instead of failing. The prompt is skipped when `CI` or `ORDO_YES` is set.
- **Build directory lock** — A second build against the same build directory waits for the first to finish instead of interleaving with it.

### Fixes

- **`compile_commands.json` system include paths** — Compiler system include paths are now recorded in the compilation database, so clang-tidy no longer reports missing standard headers under GCC.
- **Release binaries no longer link OpenSSL** — Arsenal's downloader uses rustls, so the published binaries carry no OpenSSL dependency.

---

## v0.2.0

_2026-07-13_

### Features

- **`ordo test` command** — Run C/C++ tests with automatic test discovery, GTest/Catch2/doctest framework support, and Ninja-based test binary compilation. Workspace-aware with `-p` flag.
- **`ordo fmt` command** — Format source files using clang-format. Auto-generates `.clang-format` with LLVM-based defaults if absent. Supports `--check` mode and workspace builds.
- **`ordo lint` command** — Lint source files using clang-tidy. Auto-generates `.clang-tidy` config. Supports `--fix` mode with `--fix-errors`.
- **`ordo check` command** — Syntax-only compilation check via Ninja, much faster than a full build. Workspace-aware.
- **`ordo run-script` command** — Execute scripts defined in `[scripts]` section of `Ordo.toml`.
- **Workspace support for fmt/lint/check** — All three commands now support `-p/--package` flag and run across workspace members.
- **MSVC Ninja generation** — Ninja build files now support the MSVC toolchain: `deps = msvc` with `/showIncludes`, `link.exe`/`lib.exe` commands, MSVC compile and link flags.
- **Platform-aware output** — Binary output extensions adapt to the target platform: `.exe`/`.lib`/`.dll` (Windows), `.a`/`.dylib` (macOS), `.a`/`.so` (Linux).

### Fixes

- **vcpkg version normalization** — `ordo add vcpkg:raylib@6.0` no longer fails by incorrectly padding the version to `6.0.0`.
- **Windows compiler detection** — `which` replaced with `where` on Windows. MSVC `cl.exe` detection now reads stderr instead of relying on `--version`.
- **`ordo lint --fix`** — Now passes `--fix-errors` alongside `--fix`. Warnings-only output uses warn style instead of error.
- **`ordo clean --package`** — Correctly cleans individual workspace member targets.
- **Test include paths** — Test builds now resolve dependencies and use the correct project root for include paths.

---

## v0.1.4

_2026-06-29_

### Features

- **Feature flags in `ordo run`** — `ordo run` now accepts `--features`, `--all-features`, and `--no-default-features`, matching `ordo build`.
- **Feature propagation** — Feature defines from path dependencies and workspace members now propagate to consumer compilations. When a library is built with features enabled, its preprocessor defines (e.g., `MATHLIB_LOGGING`) are passed to any project that includes its headers.
- **`dep_name/feature` forwarding** — Cargo-style feature forwarding syntax: `full = ["mathlib/simd", "mathlib/logging"]`. Enabling a feature on the parent activates the specified features on the dependency.
- **Path dependency `features = [...]`** — Specify features directly on path dependencies: `mathlib = { path = "...", features = ["simd"] }`.

### Fixes

- **Cached path dep feature defines** — When a workspace member was already built and cached, its feature defines were not propagated to consumers. Now correctly resolved on cache hits.

---

## v0.1.3

_2026-06-24_

### Features

- **Build profiles** — Full profile support with `[profile.dev]`, `[profile.release]`, and custom named profiles. `--profile` flag, opt-level, debug, lto, defines, compiler/linker flags.
- **Feature flags** — Cargo-style `[features]` with `dep:name` activation, `--features`, `--no-default-features`, `--all-features`. Generates `ORDO_FEATURE_*` preprocessor defines.
- **Dev dependencies** — `[dev-dependencies]` section, included only in test builds. Shown in `ordo tree` with `[dev]` marker.
- **Alias & link-name** — `alias` field to use a different local name for a package. `link-name` to override library names at link time. `--alias` and `--link-name` flags in `ordo add`.
- **Multi-add** — `ordo add` accepts multiple packages in one invocation: `ordo add raylib fmt glfw -P vcpkg`. Partial failure support with summary output.
- **System-level providers** — Three new passive (detection-only) providers:
  - **brew** (macOS) — `brew info --json`, `brew --prefix` for include/lib paths
  - **nix** — `nix profile list` (modern) / `nix-env -q` (legacy)
  - **pacman** (Arch Linux) — `pacman -Qi` for detection and version
- **Project-level providers** — Two new active (install) providers:
  - **clib** — Installs C libraries from the clib registry
  - **nuget** — Installs NuGet packages for Windows C++ native libraries
- **Platform-conditional dependencies** — `[target.'cfg(macos)'.dependencies]` syntax. Supports `cfg(macos)`, `cfg(linux)`, `cfg(windows)`, `cfg(unix)`, architecture conditions (`x86_64`, `aarch64`), and `not()`/`all()`/`any()` combinators.

---

## v0.1.2

_2026-06-18_

### Features

- **CLI output styles** — Three output modes: `default` (icons + spinners), `minimal` (plain text, Ninja passthrough), `cargo-like` (Cargo-style right-aligned verbs). Configure via `--style` flag, `ORDO_CLI_STYLE` env var, or `[cli] style` in Ordo.toml.
- **Lock file versions** — `Ordo.lock` now records actual resolved versions from each provider (vcpkg, pkg-config, conan, git, path) instead of `0.0.0` stubs.
- **Git checksums** — Git dependencies now include `checksum = "git:<commit-hash>"` for supply chain integrity.
- **Resolver lock pinning** — Resolver reads pinned versions from `Ordo.lock` (like Cargo). Use `ordo update` to bump versions.

### Fixes

- **Path dependency caching** — Workspace members built via DAG order are cached. Eliminates redundant rebuilds and duplicate `Finished` lines when multiple members share a path dependency.

---

## v0.1.1

_2026-06-17_

### Repository

- Migrated from Codeberg to GitHub as the primary repository.

### Features

- **Path dependency builds** — `mylib = { path = "./mylib" }` now fully works. Path deps are recursively built, with include paths and library artifacts automatically passed to the parent build. Header-only deps (no `src/`) skip the build step. Circular dependency detection included.
- **Dependency caching** — Build now generates `Ordo.lock` and caches resolved dependency info in `target/.dep-cache.json`. On subsequent builds with unchanged deps, all provider queries (vcpkg install, conan resolve, pkg-config, etc.) are skipped entirely.
- **`--locked` flag** — Error if `Ordo.lock` is out of sync with `Ordo.toml`. Useful for CI.
- **`--frozen` flag** — Disallow network access; require existing dependency cache.
- **`ordo add --no-verify`** — Add a dependency without contacting the provider. Useful for offline use.
- **Cache hit feedback** — Shows `✔ Resolved N dependencies (cached)` when deps are loaded from cache.
- **Workspace support** — `[workspace]` with `members` glob patterns, `[workspace.dependencies]` with `{ workspace = true }` references, shared toolchain/language inheritance, `ordo build -p <member>`.
- **Lua build scripts** — Git dependencies can specify `with = "build.lua"` for sandboxed Lua 5.4 build scripts. API: `exec()`, `copy()`, `mkdir()`, `glob()`. Results cached in `Ordo.lock`.
- **`-p/--package` flag for `ordo run`** — Run a specific workspace member.
- **Visual separator between workspace member builds** — Clear boundaries in build output.

### Fixes

- **vcpkg resolve spinner** — vcpkg resolve/fetch in build now shows a spinner instead of blocking silently.
- **`ordo tree` display** — Fixed indentation of detail lines (libs, include paths). Tree connector lines now render correctly.
- **`ordo tree` fetch spinner** — Added spinner during dependency info fetching.
- **Workspace member builds** — Fixed resolution of shared deps and transitive includes.

### Infrastructure

- CI split into 4 parallel jobs: rustfmt, clippy, test (ubuntu + macOS), rustdoc.
- Added concurrency groups and `RUSTFLAGS: -D warnings`.
- mise-managed Rust components (clippy, rustfmt, rust-src).
- Codebase-wide rustfmt pass.

---

## v0.1.0

_2026-06-16_

Initial release.

### Features

- **Project scaffolding** — `ordo new` and `ordo init` with interactive mode.
- **Build system** — Ninja-based build with automatic compiler detection (Clang, GCC, MSVC), C/C++ source separation, and progress display.
- **Dependency management** — Five provider backends:
  - **vcpkg** — auto-bootstrap, batch install, version pinning
  - **Conan** — PkgConfigDeps generator, auto profile detection
  - **pkg-config** — system library discovery
  - **system** — direct `-l` linking
  - **git** — clone and cache with `git:user/repo@tag` shorthand
- **CLI commands** — `ordo add`, `ordo update`, `ordo tree`, `ordo build`, `ordo run`, `ordo clean`.
- **Rich terminal UI** — spinners, colored progress, interactive prompts.
- **macOS framework linking** — automatic `-framework` flag extraction from `.pc` files.
- **`compile_commands.json`** — generated automatically for IDE integration.

### Requirements

- [Ninja](https://ninja-build.org/) build system
- A C/C++ compiler (Clang, GCC, or MSVC)
