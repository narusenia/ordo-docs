# Workspace

::: warning UNRELEASED
Workspace support is available in the development branch and will be included in the next release.
:::

A workspace lets you manage multiple related projects in a single repository. Dependencies, toolchain settings, and build artifacts are shared across all members.

## Setting Up a Workspace

Create an `Ordo.toml` at the repository root with a `[workspace]` section:

```toml
[workspace]
members = [
    "apps/editor",
    "libs/core",
    "libs/render",
]
```

Glob patterns are supported:

```toml
[workspace]
members = ["apps/*", "libs/*"]
exclude = ["libs/experimental"]
```

Each member directory must have its own `Ordo.toml` with a `[package]` section.

## Shared Dependencies

Declare common dependencies in `[workspace.dependencies]` to keep versions consistent across all members:

```toml
# Root Ordo.toml
[workspace]
members = ["apps/*", "libs/*"]

[workspace.dependencies]
fmt = { version = "11.2.0", provider = "vcpkg" }
spdlog = { version = "1.14", provider = "vcpkg" }
```

Members reference shared dependencies with `{ workspace = true }`:

```toml
# libs/core/Ordo.toml
[package]
name = "core"
version = "0.1.0"
type = "static-library"

[dependencies]
fmt = { workspace = true }
```

Members can also add their own independent dependencies alongside workspace dependencies.

## Shared Toolchain

The workspace root's `[toolchain]` and `[language]` settings are inherited by all members:

```toml
# Root Ordo.toml
[workspace]
members = ["apps/*", "libs/*"]

[language]
cpp = "c++20"

[toolchain]
compiler = "clang"
linker = "lld"
```

Individual members can override these settings in their own `Ordo.toml` if needed.

## Building

```sh
ordo build              # Build all members
ordo build -p editor    # Build a specific member (and its dependencies)
ordo run -p editor      # Run a specific member
```

Ordo generates a single `build.ninja` for the entire workspace, which allows Ninja to schedule compilation across all members optimally. Build artifacts and `Ordo.lock` are stored at the workspace root under `target/`.

## Inter-Member Dependencies

Members can depend on each other using path dependencies:

```toml
# apps/editor/Ordo.toml
[package]
name = "editor"
version = "0.1.0"
type = "executable"

[dependencies]
core = { path = "../../libs/core" }
render = { path = "../../libs/render" }
fmt = { workspace = true }
```

Ordo resolves the dependency graph and builds members in the correct order.

## Workspace-Only Root

The root `Ordo.toml` does not need a `[package]` section. A workspace-only root that only coordinates members is valid:

```toml
# Only workspace configuration, no package
[workspace]
members = ["apps/*", "libs/*"]

[workspace.dependencies]
fmt = { version = "11.2.0", provider = "vcpkg" }
```
