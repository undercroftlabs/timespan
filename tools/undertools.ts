import yargs, { Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { invoker } from './registered-commands';

const cli = yargs(hideBin(process.argv));

// Iterate over commands and add them to yargs
invoker.getCommands().forEach(({ command, description, builder }) => {
  const builderFunction = !builder
    ? (yargs: Argv<unknown>) => {
        return yargs;
      }
    : builder;
  cli.command(command, description, builderFunction, (argv) => {
    invoker.execute(command, argv);
  });
});

// Add demandCommand and help
cli.demandCommand(1, 'Please provide a valid command.').strict().help().argv;
