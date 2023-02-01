# metrics-gathering

A command to calculate the number of multiple contributors from a local repository that contains projects inside a `packages` folder, ideal for monorepos with this structure. 

## Installation

Install dependencies via `yarn`:

```sh
❯ yarn
```

or via `npm`:

```sh
❯ npm install
```

## Usage

The command can be run via `index.ts`:

```sh
❯ ts-node ./index.ts --repositoryPath <absolute or relative path to a git repository>
```

Additionally if you want to check a repository folder other than `packages`:

```sh
❯ ts-node ./index.ts --repositoryPath <absolute or relative path to a git repository> --targetDirectory <packages is the default>
```

__NOTE__: The main function is called `run` on `metrics-gathering-command.ts`.

## Tests

```sh
❯ yarn test
```

## License

MIT