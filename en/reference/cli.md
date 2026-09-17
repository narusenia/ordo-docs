# CLI Commands

## Global Flags

These flags are available on all commands:

| Flag | Description |
|------|-------------|
| `--color <MODE>` | Control colored output: `auto`, `always`, `never`. Default: `auto`. Env: `ORDO_COLOR` |
| `-v, --verbose` | Verbose output. Use `-v` to show compiler commands, `-vv` for debug logging |
| `--style <MODE>` | Output style: `default`, `minimal`, `cargo-like`. Default: `default`. Env: `ORDO_CLI_STYLE` |

## Commands

### `ordo new [NAME]`

Create a new project.

```sh
ordo new myapp              # C++ executable (default)
ordo new mylib --lib        # Static library
ordo new myapp --lang c     # C project
ordo new                    # Interactive mode
```

| Flag | Description |
|------|-------------|
| `--lib` | Create a library project instead of an executable |
| `--lang <LANG>` | Project language: `c` or `cpp` (default: `cpp`) |
| `--no-git` | Skip git initialization |

If `NAME` is omitted, Ordo enters interactive mode and prompts for the project name, language, and type.

### `ordo init`

Initialize Ordo in an existing directory. Detects the project type automatically — if `main.cpp` or `main.c` exists in `src/`, the project is set to executable; otherwise it is set to library.

Fails if `Ordo.toml` already exists.

### `ordo build`

Build the project.

```sh
ordo build                  # Debug build
ordo build --release        # Release build
ordo build --profile asan   # Named profile
ordo build -p core          # Build specific workspace member
ordo build --locked         # Fail if Ordo.lock is out of sync
```

| Flag | Description |
|------|-------------|
| `--release` | Build with the release profile |
| `--profile <NAME>` | Build with a named profile (conflicts with `--release`) |
| `-j, --jobs <N>` | Number of parallel Ninja jobs |
| `--target <TRIPLE>` | Target triple for cross-compilation |
| `--no-cache` | Disable build cache |
| `--features <LIST>` | Enable features (comma-separated) |
| `--no-default-features` | Disable default features |
| `--all-features` | Enable all features |
| `--locked` | Error if `Ordo.lock` is out of sync with `Ordo.toml` |
| `--frozen` | Disallow network access; require cached dependencies |
| `-p, --package <NAME>` | Build a specific workspace member |

### `ordo run [-- ARGS...]`

Build and run the project. Arguments after `--` are passed to the resulting binary.

```sh
ordo run
ordo run --release
ordo run -p editor
ordo run -- --config myconfig.toml
```

| Flag | Description |
|------|-------------|
| `--release` | Build with the release profile |
| `-p, --package <NAME>` | Run a specific workspace member |

Fails if the project type is not `executable`.

### `ordo add <SPEC>...`

Add one or more dependencies to `Ordo.toml`.

```sh
ordo add vcpkg:fmt@11.2.0
ordo add conan:sdl@3.4.8
ordo add system:m
ordo add git:fmtlib/fmt@11.1.0
ordo add raylib                  # Interactive provider selection
ordo add fmt glfw raylib -P vcpkg   # Multiple packages
ordo add z -P system --alias zlib --link-name z
```

The spec format is `[provider:]name[@version]`. Multiple specs can be passed in one invocation.

| Flag | Description |
|------|-------------|
| `-P, --provider <NAME>` | Specify the provider (applies to all specs) |
| `--no-verify` | Skip provider verification (offline use) |
| `--with <SCRIPT>` | Lua build script path (git deps only, single spec only) |
| `--alias <NAME>` | Real package name for provider resolution (single spec only) |
| `--link-name <NAME>` | Override library name(s) for linking, comma-separated (single spec only) |

If the provider is omitted from both the spec and the `--provider` flag, Ordo prompts you to choose interactively (single spec only). For multi-add without `-P`, use the `provider:name` syntax.

### `ordo update [NAME]`

Re-resolve dependencies and update `Ordo.lock`.

```sh
ordo update             # Re-resolve all
ordo update fmt         # Re-resolve a specific dependency
```

If `NAME` is given, only that dependency is re-resolved.

### `ordo tree`

Display the dependency tree.

```sh
ordo tree
ordo tree -p core       # Show tree for a specific workspace member
```

| Flag | Description |
|------|-------------|
| `-p, --package <NAME>` | Show tree for a specific workspace member |

### `ordo clean`

Remove build artifacts.

```sh
ordo clean
ordo clean --cache      # Also clear external build cache
ordo clean -p core      # Clean a specific workspace member
```

| Flag | Description |
|------|-------------|
| `--cache` | Also clear external build cache (ccache/sccache) |
| `-p, --package <NAME>` | Clean a specific workspace member |

### `ordo test`

Build and run the project's tests.

```sh
ordo test                   # Run all tests
ordo test --filter parser   # Run tests whose name matches
ordo test --release         # Test against the release profile
ordo test -p core           # Test one workspace member
```

| Flag | Description |
|------|-------------|
| `--filter <NAME>` | Run only tests whose name matches |
| `-j, --jobs <N>` | Number of parallel test jobs |
| `--release` | Use the release profile |
| `--profile <NAME>` | Use a named profile (conflicts with `--release`) |
| `--features <LIST>` | Enable features (comma-separated) |
| `--no-default-features` | Disable default features |
| `--all-features` | Enable all features |
| `-p, --package <NAME>` | Test a specific workspace member |

Test sources live in `tests/` by default (`[test] src`). The framework is detected per file from its `#include` lines: `gtest/gtest.h` or `gmock/gmock.h` selects GoogleTest, a `catch2/` header selects Catch2, `doctest.h` selects doctest, and anything else is treated as a plain test binary that supplies its own `main`. Set `[test] framework` to pin it explicitly.

### `ordo check`

Compile for syntax errors without producing binaries. Much faster than a full build.

```sh
ordo check
ordo check --release
ordo check -p core
```

| Flag | Description |
|------|-------------|
| `--release` | Check against the release profile |
| `--profile <NAME>` | Check against a named profile (conflicts with `--release`) |
| `--features <LIST>` | Enable features (comma-separated) |
| `--no-default-features` | Disable default features |
| `--all-features` | Enable all features |
| `-p, --package <NAME>` | Check a specific workspace member |

### `ordo fmt`

Format C/C++ sources under `src/`, `include/`, `tests/` and `test/` with clang-format.

```sh
ordo fmt                    # Rewrite files in place
ordo fmt --check            # Report differences, change nothing (CI)
ordo fmt -p core            # Format one workspace member
```

| Flag | Description |
|------|-------------|
| `--check` | Report formatting differences without modifying files; exits non-zero when any are found |
| `-p, --package <NAME>` | Format a specific workspace member |

**Style.** If a `.clang-format` (or `_clang-format`) exists in the project or any parent directory, clang-format uses it and Ordo stays out of the way. Otherwise Ordo passes its own defaults — LLVM style, `IndentWidth: 4`, `ColumnLimit: 100` — without writing anything into your project. Override those defaults with `[fmt] style` in `Ordo.toml`, which takes clang-format YAML:

```toml
[fmt]
style = """
BasedOnStyle: Google
ColumnLimit: 120
"""
```

Run [`ordo generate clang-format`](#ordo-generate-target) when you want the defaults committed as a real file, for editors and other tools to read. Passing a style without a file needs clang-format 14 or newer; older versions report what to do.

**Which clang-format runs.** `[fmt] tool` wins outright when set. Otherwise Ordo takes the first of: a copy managed by [`ordo toolchain`](#ordo-toolchain-subcommand), one on `PATH`, Xcode's (macOS), and finally offers to install one. Pin the version with `clang-format` under `[toolchain]`, and every candidate is checked against that pin — so a different version sitting earlier on someone's `PATH` cannot quietly change the formatting.

### `ordo lint`

Lint C/C++ sources with clang-tidy.

```sh
ordo lint
ordo lint --fix             # Apply the fixes clang-tidy can make
ordo lint -p core
```

| Flag | Description |
|------|-------------|
| `--fix` | Apply auto-fixes (passes `--fix-errors` as well) |
| `-p, --package <NAME>` | Lint a specific workspace member |

Linting reads `compile_commands.json`; Ordo builds the project first when that file is missing. A `.clang-tidy` is generated with Ordo's defaults if the project has none. When the compiler and clang-tidy come from different toolchains — GCC with an LLVM clang-tidy, say — Ordo adds the compiler's system include paths to the compilation database and warns, so clang-tidy does not report missing standard headers.

### `ordo run-script <NAME>`

Run a script defined in the `[scripts]` section of `Ordo.toml`.

```sh
ordo run-script deploy
```

### `ordo toolchain <SUBCOMMAND>` <Badge type="warning" text="beta" />

Download and version-manage the external tools Ordo shells out to. Ninja comes from the official `ninja-build/ninja` GitHub releases, and clang-format from the PyPI wheels that package the LLVM binary — the only prebuilt distribution covering every platform Ordo runs on. Versions install side by side, and tool lookup prefers a managed binary before falling back to `PATH`.

```sh
ordo toolchain install ninja                    # Install the latest Ninja
ordo toolchain install clang-format --version 23
ordo toolchain list                             # List installed tools
ordo toolchain which clang-format               # Print the path to the binary
ordo toolchain update                           # Update everything installed
ordo toolchain remove ninja 1.12                # Remove one version
ordo toolchain clean                            # Remove all installed tools
```

| Subcommand | Description |
|------------|-------------|
| `install <TOOL> [--version <V>]` | Install a tool, optionally at a specific version |
| `list` | List installed tools and versions |
| `which <TOOL>` | Show the path to a tool's binary |
| `update [TOOL]` | Update a tool, or every installed tool if omitted |
| `remove <TOOL> <VERSION>` | Remove a specific version |
| `clean` | Remove all installed tools |

Managed tools: `ninja`, `clang-format`.

Pin a version per project with `ninja` or `clang-format` under `[toolchain]` in `Ordo.toml`. When a command needs a tool that is nowhere to be found, Ordo offers to install it rather than failing; the prompt is skipped and the install proceeds when `CI` or `ORDO_YES` is set.

### `ordo generate <TARGET>`

Generate configuration files from the project.

```sh
ordo generate clang-format   # Write .clang-format from the project's fmt style
```

| Target | Status |
|--------|--------|
| `clang-format` | Writes `.clang-format` using `[fmt] style`, or Ordo's defaults when unset. Refuses to overwrite an existing file. |
| `cmake`, `presets`, `vscode`, `clion`, `clangd`, `github-actions`, `gitlab-ci` | Not yet implemented |

## Not Yet Implemented

The following commands are defined but not yet functional:

| Command | Description |
|---------|-------------|
| `ordo watch <cmd>` | Watch for changes and re-run a command |
| `ordo install` | Install the project to system paths |
| `ordo package` | Create a distributable archive |
| `ordo publish` | Publish to the Ordo registry |
| `ordo import cmake` | Import from a CMakeLists.txt |
| `ordo ci` | Run CI pipeline steps |
| `ordo doctor` | Diagnose the development environment |
| `ordo config show` | Show resolved configuration |
| `ordo self update` | Update Ordo itself |
