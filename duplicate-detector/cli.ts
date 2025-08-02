import { CLIConfigParser } from './config/cli-config.js';
import { DuplicateDetector } from './core/duplicate-detector.js';
import { FileDiscoveryEngine } from './core/file-discovery.js';
import { loadConfigFromFile } from './config/index.js';

async function main() {
  const args = process.argv.slice(2);
  const options = CLIConfigParser.parseArgs(args);

  if (options.help) {
    console.log(CLIConfigParser.getHelpText());
    return;
  }

  if (options.version) {
    // Assuming package.json is in the root of the project
    const packageJson = JSON.parse(require('fs').readFileSync(require('path').resolve(__dirname, '../../package.json'), 'utf-8'));
    console.log(`Duplicate Code Detector v${packageJson.version}`);
    return;
  }

  try {
    const config = await CLIConfigParser.loadConfiguration(options);
    const detector = new DuplicateDetector(config);
    const fileDiscovery = new FileDiscoveryEngine();

    console.log('Running duplicate detection with config:', config);

    const filesToAnalyze = await fileDiscovery.discoverFiles(process.cwd(), config);
    const report = await detector.analyze(filesToAnalyze);
    console.log(JSON.stringify(report, null, 2));

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal Error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
