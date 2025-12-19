#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const PACKAGE_PATH = path.join(__dirname, '../packages/react-tanstack-data-table/package.json');
const PACKAGE_DIR = path.dirname(PACKAGE_PATH);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}

function closeReadline() {
    rl.close();
}

function getPackageJson() {
    return JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
}

function getCurrentVersion() {
    return getPackageJson().version;
}

function calculateVersion(currentVersion, versionType) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (versionType) {
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'major':
            return `${major + 1}.0.0`;
        default:
            return versionType;
    }
}

async function selectVersionType(currentVersion) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    const patchVersion = `${major}.${minor}.${patch + 1}`;
    const minorVersion = `${major}.${minor + 1}.0`;
    const majorVersion = `${major + 1}.0.0`;

    console.log(`\n📝 Select version bump type:\n`);
    console.log(`   1) Patch  ${currentVersion} → ${patchVersion}  (Bug fixes, small changes)`);
    console.log(`   2) Minor  ${currentVersion} → ${minorVersion}  (New features, backward compatible)`);
    console.log(`   3) Major  ${currentVersion} → ${majorVersion}  (Breaking changes)\n`);

    const selection = await question('❓ Enter your choice (1-3): ');

    let versionType;
    switch (selection.trim()) {
        case '1':
            versionType = 'patch';
            break;
        case '2':
            versionType = 'minor';
            break;
        case '3':
            versionType = 'major';
            break;
        default:
            console.error('❌ Invalid selection. Please choose 1, 2, or 3.');
            process.exit(1);
    }

    console.log(`\n✅ Selected: ${versionType.toUpperCase()}\n`);
    return versionType;
}

function buildPackage() {
    console.log('🔨 Building package...\n');
    try {
        execSync('pnpm build', { cwd: PACKAGE_DIR, stdio: 'inherit' });
        console.log('\n✅ Build completed successfully\n');
    } catch (error) {
        console.error('❌ Build failed');
        process.exit(1);
    }
}

function updateVersion(versionType) {
    const packageJson = getPackageJson();
    const oldVersion = packageJson.version;
    const newVersion = calculateVersion(oldVersion, versionType);

    console.log('📦 Updating package version...\n');
    packageJson.version = newVersion;
    fs.writeFileSync(PACKAGE_PATH, JSON.stringify(packageJson, null, 2) + '\n');

    console.log(`✅ Updated ${packageJson.name} from ${oldVersion} to ${newVersion}\n`);
    return { oldVersion, newVersion, packageName: packageJson.name };
}

async function ensureNpmAuth() {
    try {
        execSync('npm whoami', { stdio: 'ignore' });
        return true;
    } catch (error) {
        console.error('❌ Not authenticated with npm');
        console.error('   Run: npm login\n');
        return false;
    }
}

async function publishPackage() {
    try {
        console.log('📦 Publishing to npm...\n');
        execSync('npm publish --access public', {
            cwd: PACKAGE_DIR,
            stdio: 'inherit',
        });
        console.log('\n✅ Published successfully!\n');
        return true;
    } catch (error) {
        console.error('❌ Publish failed\n');
        return false;
    }
}

async function main() {
    try {
        console.log('🚀 Starting publish process...\n');

        const currentVersion = getCurrentVersion();
        const { name: packageName } = getPackageJson();
        console.log(`📦 Package: ${packageName}`);
        console.log(`📦 Current version: ${currentVersion}\n`);

        const versionType = await selectVersionType(currentVersion);
        const newVersion = calculateVersion(currentVersion, versionType);

        console.log('📋 Summary:');
        console.log(`   Current: ${currentVersion}`);
        console.log(`   New:     ${newVersion}`);
        console.log(`   Type:    ${versionType}\n`);

        const confirm = await question('❓ Proceed with publish? (Y/n): ');
        if (confirm.toLowerCase() === 'n' || confirm.toLowerCase() === 'no') {
            console.log('❌ Cancelled\n');
            closeReadline();
            return;
        }

        buildPackage();

        const versionInfo = updateVersion(versionType);

        const isAuthenticated = await ensureNpmAuth();
        if (!isAuthenticated) {
            console.log('⚠️  Skipping publish (not authenticated)\n');
            closeReadline();
            return;
        }

        const success = await publishPackage();

        if (success) {
            console.log('🎉 Package published successfully!\n');
            console.log(`📦 https://www.npmjs.com/package/${versionInfo.packageName}/v/${versionInfo.newVersion}`);
            console.log('\n📥 Install with:');
            console.log(`   npm install ${versionInfo.packageName}@${versionInfo.newVersion}`);
            console.log(`   pnpm add ${versionInfo.packageName}@${versionInfo.newVersion}\n`);
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        closeReadline();
    }
}

main();
