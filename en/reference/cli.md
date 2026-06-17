# CLI Commands

## Global Flags

These flags are available on all commands:

| Flag | Description |
|------|-------------|
| `--color <MODE>` | Control colored output: `auto`, `always`, `never`. Default: `auto`. Env: `ORDO_COLOR` |
| `-v, --verbose` | Verbose output. Use `-v` to show compiler commands, `-vv` for debug logging |

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

### `ordo add <SPEC>`

Add a dependency to `Ordo.toml`.

```sh
ordo add vcpkg:fmt@11.2.0
ordo add conan:sdl@3.4.8
ordo add system:m
ordo add git:fmtlib/fmt@11.1.0
ordo add raylib                  # Interactive provider selection
```

The spec format is `[provider:]name[@version]`.

| Flag | Description |
|------|-------------|
| `-P, --provider <NAME>` | Specify the provider explicitly |
| `--no-verify` | Skip provider verification (offline use) |
| `--with <SCRIPT>` | Lua build script path (git dependencies only) |

If the provider is omitted from both the spec and the `--provider` flag, Ordo prompts you to choose interactively.

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

## Not Yet Implemented

The following commands are defined but not yet functional:

| Command | Description |
|---------|-------------|
| `ordo test` | Run tests with framework auto-detection |
| `ordo check` | Syntax check without producing binaries |
| `ordo fmt` | Format code using clang-format |
| `ordo lint` | Lint code using clang-tidy |
| `ordo watch <cmd>` | Watch for changes and re-run a command |
| `ordo install` | Install the project to system paths |
| `ordo package` | Create a distributable archive |
| `ordo publish` | Publish to the Ordo registry |
| `ordo import cmake` | Import from a CMakeLists.txt |
| `ordo generate` | Generate IDE configs (vscode, clion, clangd, etc.) |
| `ordo toolchain` | List or install toolchains |
| `ordo ci` | Run CI pipeline steps |
| `ordo doctor` | Diagnose the development environment |
| `ordo config show` | Show resolved configuration |
| `ordo run-script` | Run a user-defined script |
| `ordo self update` | Update Ordo itself |
