import { Command } from 'commander';
import { run } from './metrics-gathering-command';

/**
 * Command-line program definition
 */

new Command()
  .description('Gather multiple contributor metrics on a local repo, every distinct email is considered as a distinct contributor')
  .requiredOption('-r, --repositoryPath <repositoryPath>', 'specify your local repository in absolute or relative path')
  .option(
    '-t, --targetDirectory <targetDirectory>',
    '(optional), specify the target directory from the root folder you want to check for multiple contributions',
    'packages'
  )
  .action(({ repositoryPath, targetDirectory }) => run({ repositoryPath, targetDirectory }))
  .parse();
