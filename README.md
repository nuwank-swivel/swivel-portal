# swivel-portal

## Semantic Commit Message Enforcement

This repository enforces semantic commit messages using [commitlint](https://commitlint.js.org/) and [husky](https://typicode.github.io/husky/).

### What are Semantic Commits?

Semantic commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard. Example formats:

- `feat: add new user login page`
- `fix: correct typo in booking logic`
- `docs: update API documentation`
- `refactor: improve seat allocation algorithm`

### How Enforcement Works

- On every commit, a git hook checks your commit message.
- If your message does not follow the conventional format, the commit will be rejected.

### How to Use

1. **Write your commit messages in the semantic format.**
   - Example: `feat: implement seat booking UI`
2. **If you see an error about your commit message,** reword it to follow the format above.

### Tooling

- **commitlint**: Lints commit messages for semantic format.
- **husky**: Manages git hooks to run commitlint automatically.

### Customization

- The commitlint rules are defined in `commitlint.config.js` in the project root.
- Husky hooks are in the `.husky/` directory.

### Troubleshooting

- If you have issues committing, check your message format first.
- For more info, see the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) documentation.

---

For any questions, contact the project maintainers.
