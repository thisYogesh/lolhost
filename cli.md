## 1) Create `cli.js`
```
#!/usr/bin/env node

const [,, ...args] = process.argv
console.log('arguments are ' + args)
```

\#!/usr/bin/env node This is called as shebang, 
and very important to convert the JavaScript file into a NodeJS command-line script

## 2) Create "bin" field in `package.json`
```
,
,
"bin": {
    "<command name>": "./cli.js"
}
,
,
```

## 3) `npm link`

###  Now you are ready to execute you own command on cmd globally

#source
https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e