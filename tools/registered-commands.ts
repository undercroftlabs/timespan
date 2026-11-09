import { CleanCommand, TestDistribution } from './commands';
import { CommandInvoker } from './core/command-invoker';

export const invoker = new CommandInvoker();

invoker.register(new CleanCommand());
invoker.register(new TestDistribution());
