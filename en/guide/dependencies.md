# Dependencies

Ordo supports five dependency providers through a unified interface. You can mix providers freely within a single project.

## Adding Dependencies

The `ordo add` command adds a dependency to your `Ordo.toml`:

```sh
ordo add vcpkg:fmt@11.2.0       # vcpkg with pinned version
ordo add vcpkg:raylib@>=6       # vcpkg with minimum version
ordo add conan:sdl@3.4.8        # Conan
ordo add system:m                # System library (-lm)
ordo add git:fmtlib/fmt@11.1.0  # Git (GitHub shorthand)
ordo add git:codeberg.org/u/r   # Git (custom host)
ordo add raylib                  # Interactive provider selection
```

The general format is `[provider:]name[@version]`. If you omit the provider, Ordo prompts you to choose one interactively.

### Version Operators

- `@11.2.0` or `@=11.2.0` — exact version
- `@>=11` — minimum version
- `@^11` — compatible version (>=11.0.0, <12.0.0)
- `@~11.2` — patch-level compatible (>=11.2.0, <11.3.0)
- No version — latest available

## Providers

### vcpkg

```toml
[dependencies]
fmt = { version = "11.2.0", provider = "vcpkg" }
raylib = { version = "6.0", provider = "vcpkg" }
```

vcpkg is the recommended provider for most C/C++ libraries. Ordo manages vcpkg automatically:

- If vcpkg is not installed, Ordo bootstraps it on first use
- If `VCPKG_ROOT` is set, Ordo uses that installation
- Otherwise, vcpkg is managed under `~/.ordo/`
- Packages are installed and include/lib paths are extracted automatically

### Conan

```toml
[dependencies]
sdl = { version = "3.4.8", provider = "conan" }
```

Conan requires the `conan` CLI to be installed. Ordo generates an internal `conanfile.txt`, runs `conan install`, and extracts the results.

### pkg-config

```toml
[dependencies]
openssl = { provider = "pkg-config" }
```

Discovers system-installed libraries using `pkg-config`. The library must already be installed on your system. Ordo runs `pkg-config --cflags --libs` and passes the flags to the compiler and linker.

### system

```toml
[dependencies]
m = { provider = "system" }
pthread = { provider = "system" }
```

Adds `-l<name>` directly to the linker command. Use this for standard system libraries like `m` (math), `pthread`, or `dl`. No installation or lookup is performed — if the library is missing, linking will fail.

### git

```toml
[dependencies]
fmt = { git = "https://github.com/fmtlib/fmt", tag = "11.1.0" }
```

Clones a git repository and uses it as a dependency. You must specify exactly one of `tag`, `branch`, or `rev`:

```toml
# Pin to a tag
fmt = { git = "https://github.com/fmtlib/fmt", tag = "11.1.0" }

# Track a branch
fmt = { git = "https://github.com/fmtlib/fmt", branch = "main" }

# Pin to a commit
fmt = { git = "https://github.com/fmtlib/fmt", rev = "abc123" }
```

For libraries that need to be compiled before use, you can specify a [Lua build script](/en/guide/lua-build-scripts):

```toml
sdl = { git = "https://github.com/libsdl-org/SDL", tag = "release-3.4.8", with = "build.lua" }
```

### Path Dependencies

```toml
[dependencies]
core = { path = "../core" }
```

Path dependencies reference a local project by relative path. They are built recursively — if `core` has its own dependencies, those are resolved and built first. Circular dependencies are detected and reported.

## Updating Dependencies

```sh
ordo update             # Re-resolve all dependencies
ordo update fmt         # Re-resolve a specific dependency
```

`ordo update` re-runs dependency resolution against the version constraints in `Ordo.toml` and updates `Ordo.lock`.

## Inspecting the Dependency Tree

```sh
ordo tree
```

```
myapp v0.1.0
├── raylib v6.0 (vcpkg)
│   libs: glfw3, nanosvg, nanosvgrast, raylib
│   frameworks: Cocoa, CoreFoundation, IOKit
│   include: /Users/.../vcpkg/installed/arm64-osx/include
├── sdl v3.4.8 (conan)
│   libs: SDL3
│   frameworks: AVFoundation, CoreHaptics, Cocoa, ...
└── m (system)
    libs: m
```

## Lock File

When you build or update, Ordo writes an `Ordo.lock` file that records the exact resolved version and integrity hash for every dependency. This ensures reproducible builds across machines and CI.

```sh
ordo build --locked     # Error if Ordo.lock is out of sync with Ordo.toml
ordo build --frozen     # Disallow network access; use cached dependencies only
```

See the [Ordo.lock reference](/en/reference/ordo-lock) for the lock file format.

## Offline Usage

```sh
ordo add vcpkg:fmt --no-verify  # Add without contacting the provider
ordo build --frozen             # Build using only cached dependencies
```
