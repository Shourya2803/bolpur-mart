# Contributing to Bolpur Mart

👍 First off, thanks for taking the time to contribute! 🎉

## Code of Conduct
This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs
Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps to reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements
Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead

### Pull Requests
* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the TypeScript and CSS styleguides
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Styleguides

### Git Commit Messages
* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### TypeScript Styleguide
* Use TypeScript for all new code
* Prefer `const` over `let`
* Use meaningful variable names
* Add types to all variables and function parameters
* Use interfaces over type aliases when possible
* Document complex functions with JSDoc comments

### CSS/Tailwind Styleguide
* Use Tailwind CSS classes when possible
* Follow mobile-first approach
* Keep components responsive
* Use semantic class names when custom CSS is needed
* Follow BEM naming convention for custom CSS classes

### Documentation Styleguide
* Use [Markdown](https://guides.github.com/features/mastering-markdown/)
* Reference functions and classes in backticks: \`functionName()\`
* Include code examples when explaining features

## Development Process
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Setting Up Development Environment
1. Install Node.js (v18.17 or later)
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```
3. Copy `.env.local.example` to `.env.local` and fill in required values
4. Start development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## Running Tests
```bash
npm run test
# or
pnpm test
```

## Additional Notes
* If you can't find an open issue addressing the problem, [open a new one](https://github.com/yourusername/bolpur-mart/issues/new)
* If you find a closed issue that seems related to your issue, link to the closed issue in your issue

Thank you for contributing to Bolpur Mart! 🙏