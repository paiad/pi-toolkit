# pi-mem

This is a source-vendored, project-scoped adaptation of
[jayzeng/pi-memory](https://github.com/jayzeng/pi-memory).

It stores memory in <project>/.pi/memory/ by default instead of the
user-global Pi memory directory. .pi/ is ignored by this repository, so
memory remains local to the project checkout and is not committed.

PI_MEMORY_DIR remains available for an explicit override. qmd is optional;
when installed, this extension derives a unique collection name from the
absolute project memory path so searches cannot cross project boundaries.

The upstream MIT license is preserved in [LICENSE](LICENSE).
