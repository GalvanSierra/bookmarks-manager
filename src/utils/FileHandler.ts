import { Logger } from '@/utils/Logger';

export class FileHandler {
  constructor(private logger: Logger) {}

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
}
