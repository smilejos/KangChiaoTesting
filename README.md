# MyGrammar Quiz

A bilingual (English/Chinese) grammar quiz app for KangChiao elementary students (Grade 3-4), built with Angular and deployed to GitHub Pages.

## Quiz Format

Quiz data lives in `public/quizzes/`. To create new quizzes:

- **[QUIZ_GUIDE.md](./QUIZ_GUIDE.md)** -- Full guide with format spec, all question types, and rules
- **[quiz-sample.json](./quiz-sample.json)** -- A complete sample quiz file for reference

### Adding a New Quiz

1. Create a folder structure: `public/quizzes/<Book>/<Unit>/`
2. Drop a quiz `.json` file inside (see `quiz-sample.json`).
3. Run `npm run generate-index` (or it runs automatically on build/start).
4. That's it -- no manual `index.json` editing needed.

### Supported Question Types

| Type | Description |
|------|-------------|
| `multiple-choice` | Pick one correct answer from 3-4 options |
| `true-false` | Decide if a statement is true or false |
| `fill-in` | Type the answer (supports multiple accepted answers) |
| `categorize` | Drag/sort items into category buckets |
| `reorder` | Arrange scrambled words into correct sentence order |

### File Structure

```
public/quizzes/
  index.json              # Auto-generated (do not edit)
  MyGrammar/              # Book
    Unit_1/               # Unit
      plural.json         # Quiz
      nouns.json
    Unit_2/
      verbs.json
  MyView/                 # Another book
    Test_1/
      sample.json
```

### Key Rules for AI Agents

- `meta.id` must match the path: `<Book>/<Unit>/<filename>` (without `.json`)
- Use 10-20 questions per quiz, mix at least 3 question types
- Difficulty: 1 = easy, 2 = medium, 3 = hard
- `index.json` is auto-generated -- never edit it manually
- Vocabulary should be appropriate for Grade 3-4 students

---

## Development

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
