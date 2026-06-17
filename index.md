---
layout: home
hero:
  name: Ordo
  text: A modern project orchestrator for C and C++
  tagline: Cargo-like developer experience for native development. No CMakeLists.txt required.
  actions:
    - theme: brand
      text: Get Started
      link: /en/guide/getting-started
    - theme: alt
      text: 日本語で読む
      link: /ja/
features:
  - icon: ⚡
    title: Cargo-like Workflow
    details: "ordo new → ordo add → ordo build → ordo run. Simple commands, no build system boilerplate."
  - icon: 📦
    title: Unified Dependency Management
    details: Five provider backends — vcpkg, Conan, pkg-config, system, and git — all through one interface.
  - icon: 🔒
    title: Reproducible Builds
    details: Ordo.lock pins every dependency with integrity hashes. Same input, same output, every time.
  - icon: 🏗️
    title: Workspace Support
    details: Monorepo-native. Shared dependencies, unified toolchain, single build.ninja for all members.
  - icon: 🔧
    title: Direct Ninja Generation
    details: No CMake in the pipeline. Ordo generates build.ninja directly for maximum transparency.
  - icon: 🌙
    title: Lua Build Scripts
    details: Build git dependencies with sandboxed Lua scripts. Full control, no implicit execution.
---
