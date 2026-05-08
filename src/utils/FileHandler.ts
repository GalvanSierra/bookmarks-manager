import { Logger } from '@/utils/Logger';

/**
 * Handles file system operations such as reading file contents.
 * Uses Bun's file API and integrates with the Logger for error reporting.
 */
export class FileHandler {
  constructor(private logger: Logger) {}

  /**
   * Reads the contents of a file at the given path.
   *
   * @param path - Absolute or relative path to the file
   * @returns The file contents as a string
   * @throws If the file does not exist or cannot be read
   */
  async read(path: string): Promise<string> {
    const file = Bun.file(path);

    if (!(await file.exists())) {
      this.logger.error(`File does not exist: ${path}`);
      throw new Error(`File does not exist: ${path}`);
    }

    try {
      return await file.text();
    } catch (error) {
      this.logger.error(`Failed to read file: ${error}`, { filePath: path });
      throw error;
    }
  }

  /**
   * Writes the given content to a file at the given path.
   *
   * @param destination - Absolute or relative path to the file
   * @param content     - The content to write to the file
   * @throws If the file cannot be written
   */
  async write(destination: string, content: string): Promise<void> {
    try {
      await Bun.write(destination, content);
    } catch (error) {
      this.logger.error(`Failed to write file: ${error}`, { filePath: destination });
      throw error;
    }
  }
}
