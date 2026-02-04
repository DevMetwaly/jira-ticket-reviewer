import { writeFileSync } from 'fs';
import { dirname } from 'path';
import { mkdirSync, existsSync } from 'fs';

export interface OutputOptions {
  stdout: boolean;
  file?: string;
}

export async function writeOutput(content: string, options: OutputOptions): Promise<void> {
  // Write to file if specified
  if (options.file) {
    const dir = dirname(options.file);
    if (dir && dir !== '.' && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(options.file, content, 'utf-8');
    console.log(`\nReview saved to: ${options.file}\n`);
  }

  // Write to stdout
  if (options.stdout) {
    console.log(content);
  }
}
