import fs from 'fs'
import { v4 as uuid } from 'uuid'


const data = fs.readFileSync('./people.txt', {encoding: 'utf8'})
const lines = data.split('\n')

const linesPartOne = []
const linesPartTwo = []

for (let i = 0; i < 500000; i++){
    linesPartOne.push(lines[i])
}

const statementsOne = linesPartOne.map(line => {
    const [name, age, city] = line.split(',')
    const [second_name, first_name] = name.split(' ')
    return `INSERT INTO users (id, first_name, second_name, age, city) VALUES('${uuid()}', '${first_name}', '${second_name}', ${age}, '${city}');`
})

fs.writeFileSync('./people-sample.sql', statementsOne.join('\n'), {encoding: 'utf8'})

for (let i = 500000; i < 1000000; i++){
    linesPartTwo.push(lines[i])
}

const statementsTwo = linesPartTwo.map(line => {
    const [name, age, city] = line.split(',')
    const [second_name, first_name] = name.split(' ')
    return `INSERT INTO users (id, first_name, second_name, age, city) VALUES('${uuid()}', '${first_name}', '${second_name}', ${age}, '${city}');`
})

fs.writeFileSync('./people-two.sql', statementsTwo.join('\n'), {encoding: 'utf8'})
