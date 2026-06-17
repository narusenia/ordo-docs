# Introduction

## What is Ordo?

Ordo is a build and project management tool for C and C++, written in Rust. It provides a Cargo-like developer experience — from project creation to dependency management, building, and running — all through a single CLI.

Modern C/C++ development often requires juggling multiple tools:

- **CMake** for build configuration
- **Ninja** for build execution
- **vcpkg** or **Conan** for package management
- **pkg-config** for system library discovery
- **clang-format** and **clang-tidy** for code quality

Ordo unifies these into a single workflow. Instead of writing `CMakeLists.txt`, configuring toolchain files, and manually wiring up package managers, you write an `Ordo.toml` and let Ordo handle the rest.

```sh
ordo new myapp
cd myapp
ordo add vcpkg:fmt@11.2.0
ordo build
ordo run
```

## Philosophy

> **Don't replace the ecosystem. Orchestrate it.**

Ordo does not reimplement compilers, linkers, or package managers. It coordinates existing tools — Ninja for builds, vcpkg/Conan/pkg-config for dependencies, Clang/GCC/MSVC for compilation — behind a consistent, discoverable interface.

## Key Features

- **Cargo-like CLI** — `new`, `build`, `run`, `add`, `update`, `tree`, `clean`
- **Unified dependency management** — vcpkg, Conan, pkg-config, system, and git providers through one interface
- **Direct Ninja generation** — no CMake in the pipeline
- **Reproducible builds** — `Ordo.lock` with integrity hashes
- **Workspace support** — monorepo-native, shared dependencies and toolchain
- **Lua build scripts** — sandboxed scripts for building git dependencies
- **Automatic toolchain detection** — Clang, GCC, MSVC
- **IDE integration** — `compile_commands.json` generated automatically

## How It Works

Ordo reads your `Ordo.toml` manifest, resolves dependencies through the configured providers, and generates a `build.ninja` file directly. Ninja then executes the build.

```
Ordo.toml → Ordo (resolve deps, generate ninja) → build.ninja → Ninja → binary
```

There is no intermediate CMake step. The build pipeline is straightforward and transparent — if something goes wrong, you know exactly where to look.

## Current Status

Ordo is under active development. The core workflow — project creation, dependency management, building, and running — is functional. See the [Changelog](/en/changelog) for the latest updates.
