# Contributing to BreakFlow

Thank you for your interest in contributing to **BreakFlow**! We welcome bug reports, feature requests, documentation improvements, and code contributions.

---

## 🍴 Contribution Workflow (Fork & Pull Request)

To maintain code quality and keep the main repository clean, all external contributions follow the **Fork & Pull Request** model.

### Step 1: Fork the Repository
1. Click the **Fork** button at the top right of the [BreakFlow Repository](https://github.com/mehmetduran932/BreakFlow).
2. Clone your forked repository locally:
   ```bash
   git clone https://github.com/<your-username>/BreakFlow.git
   cd BreakFlow
   ```

### Step 2: Install Dependencies
BreakFlow uses [pnpm](https://pnpm.io/) workspaces:
```bash
pnpm install
```

### Step 3: Create a Dedicated Feature Branch
Branch names must follow descriptive prefixes:
- `feature/<name>` for new features (e.g., `feature/custom-page-templates`)
- `fix/<name>` or `bugfix/<name>` for bug fixes (e.g., `fix/margin-collapse-calculation`)
- `docs/<name>` for documentation updates (e.g., `docs/add-angular-integration`)
- `refactor/<name>` for code refactoring
- `test/<name>` for adding or updating tests

```bash
git checkout -b feature/my-feature-name
```

### Step 4: Implement & Test Your Changes
- Ensure your changes adhere to TypeScript strict mode and the project architecture.
- Run the build and verification commands before committing:
  ```bash
  # Build all workspace packages
  pnpm build

  # Run type checking
  pnpm typecheck

  # Run unit test suite
  pnpm test:unit

  # Run Playwright browser integration tests
  pnpm test:browser
  ```

### Step 5: Commit Your Changes
Use [Conventional Commits](https://www.conventionalcommits.org/):
```bash
git commit -m "feat(core): add support for nested table header repetition"
git commit -m "fix(browser): calculate correct sibling distance with collapsed margins"
```

### Step 6: Push and Open a Pull Request
1. Push the branch to your fork:
   ```bash
   git push origin feature/my-feature-name
   ```
2. Navigate to the original [BreakFlow Repository](https://github.com/mehmetduran932/BreakFlow) and click **New Pull Request**.
3. Fill out the PR description with:
   - Summary of changes
   - Problem solved or feature added
   - Testing steps performed

---

## 🔒 Branch Protection & CI Policies

- **Protected Branches**: `master` and `main` branches are protected. Direct pushes are disabled.
- **Review Requirements**: Every PR requires review and approval before merging.
- **CI Status**: All automated GitHub Actions builds, typechecks, and unit tests must pass.
- **Clean History**: Rebase and squash workflows are preferred to maintain a clean git log.

---

## 🐞 Reporting Issues & Bugs

If you find a bug or have a suggestion:
1. Check the [Issues Tab](https://github.com/mehmetduran932/BreakFlow/issues) to ensure it hasn't already been reported.
2. Open a new issue with detailed reproduction steps, minimal reproducible HTML snippet, and expected vs. actual pagination results.
