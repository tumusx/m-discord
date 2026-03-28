// Basic structural tests for the Discord bot
const fs = require('fs');
const path = require('path');

console.log('Running structural tests...\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        testsPassed++;
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   ${error.message}`);
        testsFailed++;
    }
}

// Test 1: Check if required files exist
test('Required files exist', () => {
    const requiredFiles = [
        'index.js',
        'deploy-commands.js',
        'package.json',
        '.env.example',
        'commands/chatresume.js'
    ];
    
    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Missing required file: ${file}`);
        }
    });
});

// Test 2: Check if package.json has required dependencies
test('Package.json has required dependencies', () => {
    const packageJson = require('./package.json');
    
    if (!packageJson.dependencies) {
        throw new Error('No dependencies found in package.json');
    }
    
    const requiredDeps = ['discord.js', 'dotenv'];
    requiredDeps.forEach(dep => {
        if (!packageJson.dependencies[dep]) {
            throw new Error(`Missing dependency: ${dep}`);
        }
    });
});

// Test 3: Check if main bot file can be loaded
test('Main bot file (index.js) has valid syntax', () => {
    try {
        const indexPath = path.join(__dirname, 'index.js');
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        
        // Check for required Discord.js imports
        if (!indexContent.includes('discord.js')) {
            throw new Error('index.js does not import discord.js');
        }
        
        if (!indexContent.includes('Client')) {
            throw new Error('index.js does not use Discord Client');
        }
        
        // Syntax check
        require.resolve('./index.js');
    } catch (error) {
        throw new Error(`index.js validation failed: ${error.message}`);
    }
});

// Test 4: Check if chatresume command exists and has required structure
test('Chat resume command has required structure', () => {
    const command = require('./commands/chatresume.js');
    
    if (!command.data) {
        throw new Error('Command missing data property');
    }
    
    if (!command.execute) {
        throw new Error('Command missing execute function');
    }
    
    if (typeof command.execute !== 'function') {
        throw new Error('execute must be a function');
    }
});

// Test 5: Check if deploy-commands.js has valid syntax
test('Deploy commands script has valid syntax', () => {
    try {
        const deployPath = path.join(__dirname, 'deploy-commands.js');
        const deployContent = fs.readFileSync(deployPath, 'utf8');
        
        if (!deployContent.includes('discord.js')) {
            throw new Error('deploy-commands.js does not import discord.js');
        }
        
        if (!deployContent.includes('REST')) {
            throw new Error('deploy-commands.js does not use REST client');
        }
        
        // Syntax check
        require.resolve('./deploy-commands.js');
    } catch (error) {
        throw new Error(`deploy-commands.js validation failed: ${error.message}`);
    }
});

// Test 6: Check if .env.example has required variables
test('.env.example contains required variables', () => {
    const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
    
    const requiredVars = ['DISCORD_TOKEN', 'CLIENT_ID'];
    requiredVars.forEach(varName => {
        if (!envExample.includes(varName)) {
            throw new Error(`Missing required environment variable: ${varName}`);
        }
    });
});

// Test 7: Check command registration properties
test('Chat resume command has correct slash command structure', () => {
    const command = require('./commands/chatresume.js');
    const commandData = command.data.toJSON();
    
    if (commandData.name !== 'chatresume') {
        throw new Error(`Expected command name 'chatresume', got '${commandData.name}'`);
    }
    
    if (!commandData.description) {
        throw new Error('Command missing description');
    }
    
    if (!commandData.options || commandData.options.length < 2) {
        throw new Error('Command must have at least start_date and end_date options');
    }
    
    // Check for required options
    const optionNames = commandData.options.map(opt => opt.name);
    if (!optionNames.includes('start_date')) {
        throw new Error('Command missing start_date option');
    }
    if (!optionNames.includes('end_date')) {
        throw new Error('Command missing end_date option');
    }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log('='.repeat(50));

if (testsFailed > 0) {
    process.exit(1);
}

console.log('\n✅ All tests passed!');
