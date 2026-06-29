# Changelog

## v0.1.4 <Badge type="tip" text="latest" />

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
