#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const readline = require('readline');

const log = {
  info: (msg) => console.log(`INFO ${msg}`),
  success: (msg) => console.log(`SUCCESS ${msg}`),
  error: (msg) => console.log(`ERROR ${msg}`),
  warning: (msg) => console.log(`WARNING ${msg}`),
  header: (msg) => console.log(msg)
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function clearConsole() {
  console.clear();
}

function printHeader() {
  clearConsole();
  log.header('Omarchy Menu Manager v0.0.2');
  console.log('Backup and replace tool for Omarchy Menu\n');
}

function getCurrentUser() {
  return os.userInfo().username;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function backupOmarchyMenu(username) {
  const sourceFile = `/home/${username}/.local/share/omarchy/bin/omarchy-menu`;
  const backupFile = `/home/${username}/.local/share/omarchy/bin/omarchy-menu.backup`;

  try {
    if (!await fileExists(sourceFile)) {
      log.error(`Source file not found: ${sourceFile}`);
      return false;
    }

    if (await fileExists(backupFile)) {
      const answer = await prompt('Backup file already exists. Overwrite? (y/n): ');
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        log.warning('Backup cancelled');
        return false;
      }
    }

    await fs.copyFile(sourceFile, backupFile);
    log.success(`Backup created: ${backupFile}`);
    return true;
  } catch (error) {
    log.error(`Backup failed: ${error.message}`);
    return false;
  }
}

async function replaceOmarchyMenu(username) {
  const targetFile = `/home/${username}/.local/share/omarchy/bin/omarchy-menu`;
  const sourceFile = path.join(__dirname, 'files', 'omarchy-menu');

  try {
    if (!await fileExists(sourceFile)) {
      log.error(`Replacement file not found: ${sourceFile}`);
      log.info('Package files may be missing. Try reinstalling the package.');
      return false;
    }

    const targetDir = path.dirname(targetFile);
    if (!await fileExists(targetDir)) {
      log.error(`Target directory not found: ${targetDir}`);
      return false;
    }

    await fs.copyFile(sourceFile, targetFile);
    await fs.chmod(targetFile, 0o755);

    log.success(`File replaced: ${targetFile}`);
    return true;
  } catch (error) {
    log.error(`Replace failed: ${error.message}`);
    return false;
  }
}

async function restoreFromBackup(username) {
  const backupFile = `/home/${username}/.local/share/omarchy/bin/omarchy-menu.backup`;
  const targetFile = `/home/${username}/.local/share/omarchy/bin/omarchy-menu`;

  try {
    if (!await fileExists(backupFile)) {
      log.error('No backup file found');
      return false;
    }

    await fs.copyFile(backupFile, targetFile);
    await fs.chmod(targetFile, 0o755);
    log.success(`File restored from backup: ${targetFile}`);
    return true;
  } catch (error) {
    log.error(`Restore failed: ${error.message}`);
    return false;
  }
}

async function checkStatus(username) {
  console.log('\nSystem Status\n');

  const omarchyPath = `/home/${username}/.local/share/omarchy/bin/omarchy-menu`;
  const backupPath = `/home/${username}/.local/share/omarchy/bin/omarchy-menu.backup`;
  const replacementPath = path.join(__dirname, 'files', 'omarchy-menu');

  if (await fileExists(omarchyPath)) {
    const stats = await fs.stat(omarchyPath);
    log.success(`Original file exists: ${omarchyPath}`);
    console.log(`   Size: ${stats.size} bytes | Modified: ${stats.mtime.toLocaleString()}`);
  } else {
    log.error(`Original file not found: ${omarchyPath}`);
  }

  if (await fileExists(backupPath)) {
    const stats = await fs.stat(backupPath);
    log.success(`Backup exists: ${backupPath}`);
    console.log(`   Size: ${stats.size} bytes | Created: ${stats.mtime.toLocaleString()}`);
  } else {
    log.info(`No backup found at: ${backupPath}`);
  }

  if (await fileExists(replacementPath)) {
    const stats = await fs.stat(replacementPath);
    log.success(`Replacement file ready: ${replacementPath}`);
    console.log(`   Size: ${stats.size} bytes`);
  } else {
    log.error(`Replacement file not found: ${replacementPath}`);
    log.warning('Package files may be missing. Try reinstalling the package.');
  }

  console.log('');
}

async function interactiveMenu() {
  const username = getCurrentUser();

  while (true) {
    printHeader();
    console.log('  1) Full Process (Backup + Replace)');
    console.log('  2) Backup Only');
    console.log('  3) Replace Only (No Backup)');
    console.log('  4) Restore from Backup');
    console.log('  5) Check Status');
    console.log('  6) Exit\n');

    const choice = await prompt('Enter your choice (1-6): ');

    switch (choice) {
      case '1':
        console.log('\nStarting full process...\n');

        const confirmFull = await prompt('This will backup and replace the omarchy-menu file. Continue? (y/n): ');
        if (confirmFull.toLowerCase() === 'y' || confirmFull.toLowerCase() === 'yes') {
          console.log('\nStep 1/2: Creating backup...');
          const backupOk = await backupOmarchyMenu(username);

          if (backupOk) {
            console.log('\nStep 2/2: Replacing file...');
            const replaceOk = await replaceOmarchyMenu(username);

            if (replaceOk) {
              console.log('\nAll operations completed successfully.');
            } else {
              const shouldRestore = await prompt('\nReplace failed. Restore from backup? (y/n): ');
              if (shouldRestore.toLowerCase() === 'y' || shouldRestore.toLowerCase() === 'yes') {
                await restoreFromBackup(username);
              }
            }
          }
        }
        break;

      case '2':
        console.log('\nCreating backup...\n');
        await backupOmarchyMenu(username);
        break;

      case '3':
        console.log('\nReplace without backup\n');
        log.warning('This will replace the file WITHOUT creating a backup!');

        const confirmReplace = await prompt('Are you sure you want to continue? (y/n): ');
        if (confirmReplace.toLowerCase() === 'y' || confirmReplace.toLowerCase() === 'yes') {
          await replaceOmarchyMenu(username);
        }
        break;

      case '4':
        console.log('\nRestore from backup\n');

        const confirmRestore = await prompt('This will restore the original file from backup. Continue? (y/n): ');
        if (confirmRestore.toLowerCase() === 'y' || confirmRestore.toLowerCase() === 'yes') {
          await restoreFromBackup(username);
        }
        break;

      case '5':
        await checkStatus(username);
        break;

      case '6':
        console.log('\nExiting...\n');
        rl.close();
        process.exit(0);
        break;

      default:
        log.error('Invalid option. Please choose 1-6.');
    }

    await prompt('\nPress Enter to continue...');
  }
}

const program = new Command();

program
  .name('omarchy-menu-manager')
  .description('Interactive CLI tool to backup and replace omarchy-menu file')
  .version('1.0.0')
  .action(async () => {
    await interactiveMenu();
  });

program
  .command('direct')
  .description('Direct command mode (non-interactive)')
  .option('-b, --backup', 'backup only')
  .option('-r, --replace', 'replace only')
  .option('-f, --full', 'full process (backup + replace)')
  .option('-s, --restore', 'restore from backup')
  .option('-c, --check', 'check status')
  .option('-u, --user <username>', 'specify username')
  .action(async (options) => {
    const username = options.user || getCurrentUser();

    if (options.backup) {
      await backupOmarchyMenu(username);
    } else if (options.replace) {
      await replaceOmarchyMenu(username);
    } else if (options.full) {
      console.log('Starting full process...');
      const backupOk = await backupOmarchyMenu(username);
      if (backupOk) {
        await replaceOmarchyMenu(username);
      }
    } else if (options.restore) {
      await restoreFromBackup(username);
    } else if (options.check) {
      await checkStatus(username);
    } else {
      console.log('No action specified. Use --help for options.');
    }

    rl.close();
    process.exit(0);
  });

process.on('SIGINT', () => {
  console.log('\n\nExiting...\n');
  rl.close();
  process.exit(0);
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  interactiveMenu().catch((error) => {
    log.error(`Fatal error: ${error.message}`);
    rl.close();
    process.exit(1);
  });
}
