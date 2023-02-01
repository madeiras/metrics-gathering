import * as MethicsGatheringCommand from './metrics-gathering-command';

/**
 * Test `metrics-gathering`.
 */

describe('metrics-gathering', () => {
  afterAll(async () => {
    await MethicsGatheringCommand.copyFileCommand('./README.md.dist', './README.md');
  });

  beforeEach(async () => {
    const fileExists = await MethicsGatheringCommand.isFile({ path: './README.md' });

    if (fileExists) {
      await MethicsGatheringCommand.removeFileCommand('./README.md');
    }
  });

  describe('run()', () => {
    it('should throw an error if `repositoryPath` is not a string', async () => {
      try {
        await MethicsGatheringCommand.run({ repositoryPath: null as unknown as string });

        fail();
      } catch (error) {
        expect(error.message).toBe('Unexpected input, expected "string", got "object"');
      }
    });

    it('should throw an error if `repositoryPath` is not a valid git repo', async () => {
      try {
        await MethicsGatheringCommand.run({ repositoryPath: 'null' });

        fail();
      } catch (error) {
        expect(error.message).toBe('Failed to load repository at "null" as a valid git repository');
      }
    });

    it("should write the number of multiple contributors to a new README file if it doesn't exist", async () => {
      jest.spyOn(MethicsGatheringCommand, 'getDirectoryLog').mockReturnValueOnce(
        Promise.resolve({
          stdout:
            'contributor:Aliyah\n' +
            ' 100.0% packages/folderC/\n' +
            '\n' +
            'contributor:Bob\n' +
            '  50.0% packages/folderB/\n' +
            '  50.0% packages/folderC/\n' +
            '\n' +
            'contributor:Isaac Mann\n' +
            '  50.0% packages/folderA/\n' +
            '  50.0% packages/folderB/\n',
          stderr: '',
        })
      );
      jest.spyOn(MethicsGatheringCommand, 'getDirectoryLog').mockReturnValueOnce(Promise.resolve({ stdout: '', stderr: '' }));

      await MethicsGatheringCommand.run({ repositoryPath: '../count-contributors-sample' });

      const outputFile = await MethicsGatheringCommand.readFileCommand('./README.md', 'utf-8');

      expect(MethicsGatheringCommand.getDirectoryLog).toHaveBeenCalledTimes(2);
      expect(outputFile).toMatchSnapshot();
    });

    it('should write the number of multiple contributors to an existing README file with no result section by appending it', async () => {
      await MethicsGatheringCommand.appendFileCommand('./README.md', 'foobar');

      const existingFile = await MethicsGatheringCommand.readFileCommand('./README.md', 'utf-8');

      expect(existingFile).toMatchSnapshot();

      jest.spyOn(MethicsGatheringCommand, 'getDirectoryLog').mockReturnValueOnce(
        Promise.resolve({
          stdout:
            'contributor:Aliyah\n' +
            ' 100.0% packages/folderC/\n' +
            '\n' +
            'contributor:Bob\n' +
            '  50.0% packages/folderB/\n' +
            '  50.0% packages/folderC/\n' +
            '\n' +
            'contributor:Isaac Mann\n' +
            '  50.0% packages/folderA/\n' +
            '  50.0% packages/folderB/\n',
          stderr: '',
        })
      );
      jest.spyOn(MethicsGatheringCommand, 'getDirectoryLog').mockReturnValueOnce(Promise.resolve({ stdout: '', stderr: '' }));

      await MethicsGatheringCommand.run({ repositoryPath: '../count-contributors-sample' });

      const outputFile = await MethicsGatheringCommand.readFileCommand('./README.md', 'utf-8');

      expect(MethicsGatheringCommand.getDirectoryLog).toHaveBeenCalledTimes(2);
      expect(outputFile).toMatchSnapshot();
    });

    it('should write the number of multiple contributors to an existing README file with a result section by updating it', async () => {
      await MethicsGatheringCommand.appendFileCommand('./README.md', '\n\n## Latest result evaluating repository at "foobar": foobiz\n');

      const existingFile = await MethicsGatheringCommand.readFileCommand('./README.md', 'utf-8');

      expect(existingFile).toMatchSnapshot();

      jest.spyOn(MethicsGatheringCommand, 'getDirectoryLog').mockReturnValueOnce(
        Promise.resolve({
          stdout:
            'contributor:Aliyah\n' +
            ' 100.0% packages/folderC/\n' +
            '\n' +
            'contributor:Bob\n' +
            '  50.0% packages/folderB/\n' +
            '  50.0% packages/folderC/\n' +
            '\n' +
            'contributor:Isaac Mann\n' +
            '  50.0% packages/folderA/\n' +
            '  50.0% packages/folderB/\n',
          stderr: '',
        })
      );
      jest.spyOn(MethicsGatheringCommand, 'getDirectoryLog').mockReturnValueOnce(Promise.resolve({ stdout: '', stderr: '' }));

      await MethicsGatheringCommand.run({ repositoryPath: '../count-contributors-sample' });

      const outputFile = await MethicsGatheringCommand.readFileCommand('./README.md', 'utf-8');

      expect(MethicsGatheringCommand.getDirectoryLog).toHaveBeenCalledTimes(2);
      expect(outputFile).toMatchSnapshot();
    });
  });
});
