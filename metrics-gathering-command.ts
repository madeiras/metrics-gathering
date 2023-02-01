import { exec } from 'child_process';
import { promisify } from 'util';
import { appendFile, copyFile, readFile, stat, unlink, writeFile } from 'fs';

/**
 * Promisified commands
 */

export const appendFileCommand = promisify(appendFile);
export const copyFileCommand = promisify(copyFile);
export const executeCommand = promisify(exec);
export const readFileCommand = promisify(readFile);
export const removeFileCommand = promisify(unlink);
export const statCommand = promisify(stat);
export const writeFileCommand = promisify(writeFile);

/**
 * Get directory log
 */

export const getDirectoryLog = async ({
  limit,
  repositoryPath,
  skip,
  targetDirectory,
}: {
  limit: number;
  repositoryPath: string;
  skip: number;
  targetDirectory: string;
}) => {
  return executeCommand(
    `git --git-dir=${repositoryPath}/.git log --max-count=${limit} --pretty=format:"contributor:%an" --skip=${skip} --dirstat=files -- ${targetDirectory}`
  );
};

/**
 * Is file
 */

export const isFile = async ({ path }: { path: string }) => {
  try {
    await statCommand(path);
  } catch (error) {
    return false;
  }

  return true;
};

/**
 * Run
 */

export const run = async ({ repositoryPath, targetDirectory = 'packages' }: { repositoryPath: string; targetDirectory?: string }) => {
  if (typeof repositoryPath !== 'string') {
    throw new Error(`Unexpected input, expected "string", got "${typeof repositoryPath}"`);
  }

  try {
    await executeCommand(`git --git-dir=${repositoryPath}/.git rev-parse`);
  } catch (error) {
    throw new Error(`Failed to load repository at "${repositoryPath}" as a valid git repository`);
  }

  const contributorMap = {};
  const limit = 5000;
  let currentContributor;
  let directoryLogOutput = '';
  let skip = 0;

  console.log(`Starting evaluation of repository at: "${repositoryPath}"...`);

  do {
    const directoryLog = await getDirectoryLog({ limit, repositoryPath, skip, targetDirectory });

    if (directoryLog.stderr !== '') {
      throw new Error(`Unexpected error when retrieving dirstat data from repository (limit: "${limit}", skip: "${skip}"): "${directoryLog.stderr}"`);
    }

    directoryLogOutput = directoryLog.stdout;
    const logLines = directoryLogOutput.split('\n');

    // Parse the log lines
    for (const line of logLines) {
      if (line.trim() === '') {
        continue;
      }

      const [, contributor] = line.split('contributor:');

      if (contributor) {
        currentContributor = contributor;

        if (!contributorMap[contributor]) {
          contributorMap[contributor] = new Set();
        }

        continue;
      }

      // If this one is already guaranteed then skip
      if (contributorMap[currentContributor].size > 1) {
        continue;
      }

      const [, directory] = line.split(targetDirectory);
      const projectSubFolder = directory.split('/')[1];

      contributorMap[currentContributor].add(projectSubFolder);
    }

    skip += limit;
  } while (directoryLogOutput !== '');

  const result = Object.keys(contributorMap).filter((contributor) => contributorMap[contributor].size > 1).length;

  console.log(`Finished evaluation of repository at: "${repositoryPath}"`);
  console.log(`Result: "${result}"`);
  console.log('Writing result on README.md...');

  await writeResult({ repositoryPath, result });

  console.log('Finished writing result on README.md');
};

/**
 * Write result
 */

export const writeResult = async ({ repositoryPath, result }) => {
  const fileExists = await isFile({ path: './README.md' });

  if (!fileExists) {
    await copyFileCommand('./README.md.dist', './README.md');
    await appendFileCommand('./README.md', `\n\n## Latest result evaluating repository at "${repositoryPath}": ${result}\n`);

    return;
  }

  console.log('README.md already exists, checking file...');

  const fileData = await readFileCommand('./README.md', 'utf-8');
  const lines = fileData.split('\n');

  for (let index = 0; index < lines.length; index++) {
    if (lines[index].startsWith('## Latest result evaluating repository at "')) {
      console.log('Found result from last run on README.md, replacing...');

      lines[index] = `## Latest result evaluating repository at "${repositoryPath}": ${result}`;

      await writeFileCommand('./README.md', lines.join('\n'));

      return;
    }
  }

  console.log('Could not find result from last run on README.md, appending...');

  await appendFileCommand('./README.md', `\n\n## Latest result evaluating repository at "${repositoryPath}": ${result}\n`);
};
