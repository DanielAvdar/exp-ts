import * as path from 'path';
import * as Mocha from 'mocha';
import { glob } from 'glob';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise<void>((c, e) => {
    try {
      // Find all test files in the suite directory (excluding index.ts itself)
      const files = glob.sync('**/suite/**/*.test.js', { cwd: testsRoot });

      // Add files to the test suite
      files.forEach((file: string) => {
        mocha.addFile(path.resolve(testsRoot, file));
      });

      // Run the mocha test
      mocha.run(failures => {
        if (failures > 0) {
          e(new Error(`${failures} tests failed.`));
        } else {
          c();
        }
      });
    } catch (err: any) {
      console.error(err);
      e(err);
    }
  });
}
