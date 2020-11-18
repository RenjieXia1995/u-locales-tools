const { getGroups } = require('./tasks/get-groups');
const { checkProperties } = require('./check/check-properties-key-in-js');
const { checkTranslation } = require('./check/check-translation');
const { ApplyTask, StoreTask } = require('./tasks/Task');
const chalk = require('chalk');

const exec = async (config, options, Task) => {
  const groups = getGroups(config);
  if (groups.length === 0) {
    console.log(chalk.yellow('任务列表为空'));
  }
  for (let i = 0; i < groups.length; i++) {
    const task = new Task(groups[i], config, options);
    console.log(chalk.green.bold(`${task.project}${task.name ? ':' + task.name : ''}`));
    const count = await task.start();
    if (!options.list) {
      console.log(chalk.green(`转换完成：${count > 0 ? '更改了' + count + '个文件' : '没有文件发生更改'}\n`));
    } else {
      console.log('');
    }
  }
};

module.exports.store = async (config, options) => {
  await exec(config, options, StoreTask);
};

module.exports.apply = async (config, options) => {
  await exec(config, options, ApplyTask);
};

module.exports.list = (config) => {
  const projects = require('./tasks/projects');
  const nameCol = 'name';
  const aliasCol = 'alias';
  const groupsCol = 'groups';
  const nameMax = Math.max(nameCol.length, ...projects.filter((it) => it.name).map(it => it.name.length));
  const aliasMax = Math.max(aliasCol.length, ...projects.filter((it) => it.alias).map(it => it.alias.length));
  const gutter = ' '.repeat(8);
  const header = `${nameCol.padEnd(nameMax, ' ')}${gutter}${aliasCol.padEnd(aliasMax, ' ')}${gutter}${groupsCol}`
  console.log(header);
  console.log('-'.repeat(header.length + 8))
  const log = (name, alias, groups) => {
    const nameColumn = (name || '').padEnd(nameMax, ' ');
    const aliasColumn = (alias || '').padEnd(aliasMax, ' ');
    const groupsColumn = groups.join(' ');
    console.log(`${chalk.green(nameColumn)}${gutter}${chalk.cyan(aliasColumn)}${gutter}${chalk.yellow(groupsColumn)}`);
  };
  for (let i = 0; i < projects.length; i++) {
    const { name, groups } = projects[i];
    if (name) {
      const alias = config.projects[name] && config.projects[name].alias;
      log(name, alias, groups.map(it => it.name));
    }
  }
};

module.exports.check = (config, options) => {
  if (options.translation) {
    checkTranslation(config, options);
  } else if (options.properties) {
    checkProperties(config, options);
  } else {
    console.log(chalk.yellow('似乎没有要执行的动作'));
  }
};
