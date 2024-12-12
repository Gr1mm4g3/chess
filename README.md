# Chess.com Clone

A modern chess platform built with Next.js and TypeScript, featuring a powerful chess engine and beautiful UI.

## Features

- Professional chess piece designs (Lichess cburnett set)
- Fast and efficient chess engine
- Type-safe codebase with TypeScript
- Comprehensive test coverage
- Responsive design (coming soon)
- AI opponent (coming soon)
- Multiplayer support (coming soon)

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Linting**: [ESLint](https://eslint.org/)
- **Formatting**: [Prettier](https://prettier.io/)
- **Git Hooks**: [Husky](https://typicode.github.io/husky/)

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd chess
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development

### Project Structure

```
chess/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   │   └── chess/       # Chess-specific components
│   └── lib/             # Core libraries
│       └── chess/       # Chess engine
├── public/              # Static assets
│   └── pieces/         # Chess piece SVGs
└── scripts/            # Utility scripts
```

### Chess Engine

The chess engine is built from scratch and includes:

- Board representation
- Legal move generation
- Game state management
- Check/checkmate detection (coming soon)

### Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Contributing

1. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit using conventional commits:

```bash
git commit -m "feat: add new feature"
```

3. Push your changes and create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Chess piece designs from [Lichess](https://github.com/lichess-org/lila)
