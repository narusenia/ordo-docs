# Error Codes

Ordo uses structured error codes to help identify and resolve issues. Each code belongs to a domain indicated by its prefix.

## E00xx — Configuration

Errors related to `Ordo.toml` parsing and configuration resolution.

| Code | Description |
|------|-------------|
| `E0001` | Failed to read `Ordo.toml`. The file may be missing or inaccessible. |
| `E0002` | TOML parse error. The manifest contains invalid TOML syntax. |
| `E0003` | Manifest validation error. The manifest is valid TOML but contains invalid or missing fields (e.g., missing `[package].name`). |
| `E0004` | Configuration resolution error. Conflicting settings across the configuration hierarchy (CLI, env, project, workspace, global). |

## E01xx — Dependency Resolution

Errors during dependency resolution and lock file operations.

| Code | Description |
|------|-------------|
| `E0100` | Dependency not found. The specified package does not exist in the configured provider. |
| `E0101` | Version conflict. Two or more packages require incompatible versions of a shared dependency. |
| `E0102` | Provider not specified. The dependency declaration is ambiguous — specify a `provider` field or use `ordo add` with a provider prefix. |
| `E0103` | Lock file out of sync. `Ordo.lock` does not match the current `Ordo.toml`. Run `ordo update` to re-resolve, or remove `--locked`. |
| `E0104` | Hash mismatch. The checksum in `Ordo.lock` does not match the downloaded artifact. This may indicate a corrupted download or a tampered package. |

## E02xx — Build

Errors during the build process.

| Code | Description |
|------|-------------|
| `E0200` | Ninja not found. Install [Ninja](https://ninja-build.org/) and ensure it is on your `PATH`. |
| `E0201` | Compilation failed. One or more source files failed to compile. Check the compiler output above for details. |
| `E0202` | Linking failed. The linker could not produce the final binary. Common causes: missing library, undefined symbols, incompatible object files. |
| `E0203` | Build artifact not found. The expected output file was not produced after a successful Ninja run. |

## E03xx — Toolchain

Errors related to compiler and toolchain detection.

| Code | Description |
|------|-------------|
| `E0300` | No compiler found. Ordo could not detect a C/C++ compiler. Install Clang, GCC, or MSVC. |
| `E0301` | Compiler version too old. The detected compiler does not support the requested language standard. |
| `E0302` | Unsupported target triple. The specified `--target` is not recognized or the required cross-compilation toolchain is not available. |
| `E0303` | Sysroot not found. The `sysroot` path specified in `[target.<triple>]` does not exist. |

## E04xx — Test

Errors during test execution.

| Code | Description |
|------|-------------|
| `E0400` | Test binary failed to build. The test sources could not be compiled. |
| `E0401` | Test execution failed. One or more tests returned a non-zero exit code. |
| `E0402` | No tests found. No test sources were found in the configured test directory. |
