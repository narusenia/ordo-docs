# Getting Started

## Prerequisites

- A C/C++ compiler (Clang, GCC, or MSVC) — the one thing Ordo will not install for you
- Optional: [Ninja](https://ninja-build.org/). Ordo offers to install it the first time a build needs it, and `[build] engine = "faber"` builds without it entirely
- Optional: clang-format and clang-tidy for `ordo fmt` / `ordo lint`. clang-format is installed on demand the same way
- Optional: [vcpkg](https://vcpkg.io/), [Conan](https://conan.io/), pkg-config (depending on which dependency providers you use)

## Installation

**Install script (Linux / macOS):**

```sh
curl -fsSL https://raw.githubusercontent.com/narusenia/ordo/main/install.sh | sh
```

**From source (requires Rust):**

```sh
cargo install --git https://github.com/narusenia/ordo.git
```

**Manual download:**

Download a binary from the [Releases](https://github.com/NaruseNia/ordo/releases) page.

| Platform | Binary |
|----------|--------|
| Linux x86_64 | `ordo-linux-x86_64` |
| Linux aarch64 | `ordo-linux-aarch64` |
| macOS x86_64 | `ordo-macos-x86_64` |
| macOS aarch64 | `ordo-macos-aarch64` |
| Windows x86_64 | `ordo-windows-x86_64.exe` |

## Create a Project

```sh
ordo new myapp
cd myapp
```

This generates the following structure:

```
myapp/
├── Ordo.toml
├── src/
│   └── main.cpp
└── .gitignore
```

The generated `Ordo.toml` looks like this:

```toml
[package]
name = "myapp"
version = "0.1.0"
type = "executable"

[language]
cpp = "c++20"
```

`ordo new` also supports additional options:

```sh
ordo new mylib --lib        # Static library
ordo new myapp --lang c     # C project
ordo init                   # Initialize in an existing directory
```

Running `ordo new` without arguments enters interactive mode, prompting for the project name, language, and type.

## Add a Dependency

Let's add [raylib](https://www.raylib.com/) from vcpkg:

```sh
ordo add vcpkg:raylib@6.0
```

This appends to your `Ordo.toml`:

```toml
[dependencies]
raylib = { version = "6.0", provider = "vcpkg" }
```

Ordo handles vcpkg setup automatically. On first use, it bootstraps vcpkg if it's not already installed.

## Write Some Code

Edit `src/main.cpp`:

```cpp
#include <raylib.h>

int main() {
    InitWindow(800, 600, "Hello Ordo");

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(RAYWHITE);
        DrawText("Hello from Ordo!", 200, 260, 40, DARKGRAY);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}
```

## Build and Run

```sh
ordo build
ordo run
```

That's it. No `CMakeLists.txt`, no `vcpkg.json`, no `-DCMAKE_TOOLCHAIN_FILE=...`. Ordo resolves the dependency, generates a `build.ninja`, and invokes Ninja.

For a release build:

```sh
ordo build --release
ordo run --release
```

## Inspect Dependencies

To see what was installed and linked:

```sh
ordo tree
```

```
myapp v0.1.0
├── raylib v6.0 (vcpkg)
│   libs: glfw3, nanosvg, nanosvgrast, raylib
│   frameworks: Cocoa, CoreFoundation, IOKit
│   include: /Users/.../vcpkg/installed/arm64-osx/include
```

## Other Useful Commands

```sh
ordo update             # Re-resolve all dependencies
ordo update raylib      # Re-resolve a specific dependency
ordo clean              # Remove build artifacts
```

## What's Next?

- Learn about all [dependency providers](/en/guide/dependencies)
- Set up a [workspace](/en/guide/workspace) for multi-project builds
- Use [Lua build scripts](/en/guide/lua-build-scripts) for git dependencies
- See the full [CLI reference](/en/reference/cli)
- See the full [`Ordo.toml` reference](/en/reference/ordo-toml)
