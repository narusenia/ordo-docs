# Changelog

## v0.1.2 <Badge type="tip" text="latest" />

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
