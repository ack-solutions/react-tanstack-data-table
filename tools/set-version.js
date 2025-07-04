const fs = require("fs");
const path = require("path");

const version = process.argv[2];
if (!version) {
    console.error("❌ Usage: node tools/set-version.js <version>");
    process.exit(1);
}

const baseDir = path.resolve(__dirname, "../packages");
const scope = "@ackplus";

fs.readdirSync(baseDir).forEach((pkgName) => {
    const pkgPath = path.join(baseDir, pkgName, "package.json");
    if (!fs.existsSync(pkgPath)) return;

    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    pkg.version = version;

    // Update internal dependencies
    ["dependencies", "devDependencies", "peerDependencies"].forEach((section) => {
        if (pkg[section]) {
            Object.keys(pkg[section]).forEach((dep) => {
                if (dep.startsWith(scope)) {
                    pkg[section][dep] = `^${version}`;
                }
            });
        }
    });

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.info(`✅ Updated ${pkg.name} to version ${version}`);
});
