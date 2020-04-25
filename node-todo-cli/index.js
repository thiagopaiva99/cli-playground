const program = require('commander')
const { join } = require('path')
const fs = require('fs')
const inquirer = require('inquirer')
const chalk = require('chalk')
const Table = require('cli-table')
const shell = require('shelljs')
const figlet = require('figlet')

const package = require('./package.json')
const todosPath = join(__dirname, 'todos.json')

const getJson = path => {
    const data = fs.existsSync(path) ? fs.readFileSync(path) : []
    
    try {
        return JSON.parse(data)
    } catch (e) {
        return []      
    }
}

const saveJson = (path, data) => fs.writeFileSync(path, JSON.stringify(data, null, '\t'))

const showTodoTable = (data) => {
    const table = new Table({
        head: ['id', 'to-do', 'status'],
        colWidths: [10, 20, 10]
    })

    data.map((todo, index) =>
        table.push(
            [index, todo.title, todo.done ? chalk.green('feito') : chalk.yellow('pendente')]
        )
    )

    console.log(table.toString())
}

program.version(package.version)

console.log(chalk.cyan(figlet.textSync('To-do CLI')))

program
    .command('add [todo]')
    .description('Adiciona um to-do')
    .option('-s, --status [status]', 'Initial to-do status')
    .action(async (todo, options) => {
        let answer
        
        if (!todo) {
            answer = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'todo',
                    message: 'What is your to-do?',
                    validate: value => value ? true : 'You have to inform at least one char'
                }
            ])
        }

        const data = getJson(todosPath)

        data.push({
            title: todo || answer.todo,
            done: options.status === 'true' || false
        })

        saveJson(todosPath, data)

        console.log(`${chalk.green('To-do saved!')}`)
    })

program
    .command('list')
    .description('List all to-dos')
    .action(() => showTodoTable(getJson(todosPath)))


program
    .command('do <todo>')
    .description('Toggle todo as Done')
    .action(async (todo) => {
        let answers
        if (!todo) {
            answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'todo',
                    message: 'What\'s the to-do id?',
                    validate: value => value !== undefined ? true : 'You should inform the to-do id!'
                }
            ])
        }

        const data = getJson(todosPath)
        data[todo].done = true
        saveJson(todosPath, data)
        console.log(`${chalk.green('Todo updated!')}`)
        showTodoTable(data)
    })

program
    .command('undo <todo>')
    .description('Toggle todo as Pending')
    .action(async (todo) => {
        let answers
        if (!todo) {
            answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'todo',
                    message: 'What\'s the to-do id?',
                    validate: value => value ? true : 'You should inform the to-do id!'
                }
            ])
        }

        const data = getJson(todosPath)
        data[todo].done = false
        saveJson(todosPath, data)
        console.log(`${chalk.green('Todo updated!')}`)
        showTodoTable(data)
    })

program
    .command('backup')
    .description('Do a backup of the current to-dos state')
    .action(() => {
        shell.mkdir('-p', 'backup')
        const command = shell.exec(`cp ./todos.json ./backup/todos-${new Date().getTime()}.json`, { silent: true })
        if (!command.code) {
            console.log(chalk.green('Backup done!'))
        } else {
            console.log(command.stderr)
            console.log(chalk.red('Error to realize a backup.'))
        }
    })


program.parse(process.argv)