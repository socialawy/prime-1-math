# Contributing to prime-1-math

Welcome! We appreciate your interest in contributing to the Egyptian Primary 1 Math curriculum project.

## Local Setup

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/socialawy/primary-1-math.git
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Dev Environment**:
   ```bash
   npm run dev
   ```

## Development Workflow

- **Branching**: Use descriptive branch names. We use `main` as the default branch.
- **Content**: Curriculum data is stored in `data/*.json`. If you're adding new textbook extractions, ensure they follow the established schema.
- **Interactives**: New interactive widgets should be added to `src/components/interactives/` and registered in `ActivityRenderer.tsx`.
- **Testing**: Run `npx tsc -b` to ensure no type regressions occur before submitting a PR.

## Licensing

By contributing to this project, you agree that your contributions will be licensed under the MIT License as described in the [LICENSE](LICENSE) file, excluding the `/data` curriculum payload.
