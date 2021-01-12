const chalk = require('chalk');
const { program } = require('commander');

const { Discoverer, setName } = require('..');

program
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .name('discover-local-network');

program
  .command('discover <ip-range>', { isDefault: true })
  .description('(default) tests all ip in the range (ping test) and show results', {
    'ip-range': 'IP range in CIDR format',
  })
  .action(ipRange => new Discoverer(ipRange, { printAtEnd: true, showProgress: true }));

program
  .command('name <mac-address> <name>')
  .description('set name of the device with <mac-address>', {
    'mac-address': 'the mac address of the device',
    name: 'the name of the device',
  })
  .action(setName);

program
  .parseAsync(process.argv)
  .catch(error => {
    console.error(chalk.red('error'), error.message);
  });
