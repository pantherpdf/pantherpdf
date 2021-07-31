#!/usr/bin/env node


const child_process = require('child_process')
const path = require('path')


// check package.json is not changed
const buffer = child_process.execSync('git diff-index --name-only HEAD', {
	cwd: __dirname,
	encoding: 'utf-8',
})
const out = buffer.toString()
const splitLines = str => str.split(/\r?\n/);
const lines = splitLines(out).map(x => x.trim())
// git on all platforms reports paths with forward slash
if (lines.indexOf('frontend/package.json') !== -1) {
	throw new Error('frontend/package.json is changed')
}
if (lines.indexOf('backend/package.json') !== -1) {
	throw new Error('backend/package.json is changed')
}


// update version in shared
child_process.execSync('npm version patch', {
	cwd: path.join(__dirname, 'shared'),
	stdio: 'inherit'
})


// build
child_process.execSync('yarn build', {
	cwd: path.join(__dirname, 'shared'),
	stdio: 'inherit'
})


// upgrade
child_process.execSync('yarn upgrade reports-shared', {
	cwd: path.join(__dirname, 'frontend'),
	stdio: 'inherit'
})
child_process.execSync('yarn upgrade reports-shared', {
	cwd: path.join(__dirname, 'backend'),
	stdio: 'inherit'
})


// remove changed package.json
child_process.execSync('git checkout HEAD -- frontend/package.json', {
	cwd: __dirname,
	stdio: 'inherit'
})
child_process.execSync('git checkout HEAD -- backend/package.json', {
	cwd: __dirname,
	stdio: 'inherit'
})


// ok
console.log('OK')
