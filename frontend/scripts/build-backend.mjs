import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BACKEND_DIR = path.resolve(__dirname, '../../backend');
const FRONTEND_RESOURCES = path.resolve(__dirname, '../src-tauri/resources/backend');

// Helper to handle Windows command execution
const runCommand = async (command, cwd) => {
    console.log(`> ${command} (in ${cwd})`);
    try {
        const { stdout, stderr } = await execAsync(command, { cwd });
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
    } catch (error) {
        console.error(`Command failed: ${command}`);
        console.error(error.message);
        throw error;
    }
};

async function build() {
    console.log('🏗️  Starting Cross-Platform Backend Build...');

    // 1. Install dependencies
    console.log('📦 Installing backend dependencies...');
    await runCommand('npm install', BACKEND_DIR);

    // 2. Build with esbuild
    console.log('⚡ Running esbuild...');
    const esbuildCmd = 'npx esbuild src/index.js --bundle --platform=node --target=node20 --format=cjs --outfile=dist/backend.cjs';
    await runCommand(esbuildCmd, BACKEND_DIR);

    // 3. Copy files
    console.log('📂 Copying backend bundle to Tauri resources...');
    if (!fs.existsSync(FRONTEND_RESOURCES)) {
        console.log(`Creating directory: ${FRONTEND_RESOURCES}`);
        fs.mkdirSync(FRONTEND_RESOURCES, { recursive: true });
    }

    const src = path.join(BACKEND_DIR, 'dist/backend.cjs');
    const dest = path.join(FRONTEND_RESOURCES, 'backend.cjs');

    console.log(`Copying ${src} -> ${dest}`);
    fs.copyFileSync(src, dest);

    // Copy sql-wasm.wasm if it exists (it should be bundled if used correctly, or copied separately)
    // Earlier we saw explicit copy of sql-wasm.wasm might be needed if sql.js doesn't embed it perfectly.
    // But for now let's stick to the main bundle. If sql-wasm.wasm is needed, we'll need to locate it.
    // In previous steps we didn't explicitly copy wasm because sql.js was bundled? 
    // Wait, sql.js usually needs the .wasm file.
    // In my previous manual command I didn't copy .wasm, I only copied backend.cjs.
    // And it worked? Maybe sql.js/dist/sql-wasm.js embeds it or loads it?
    // Actually, I saw `sql-wasm.wasm` in the `git add` output earlier!
    // "create mode 100755 frontend/src-tauri/resources/backend/sql-wasm.wasm"
    // So it WAS there. How did it get there? I must have copied it manually or via some command I forgot.
    // Ah, I see in previous logs: I might have missed copying it in my manual steps, OR it was already there.
    // Let's ensure we copy it if it exists in backend/node_modules/sql.js/dist/

    const wasmSrc = path.join(BACKEND_DIR, 'node_modules/sql.js/dist/sql-wasm.wasm');
    const wasmDest = path.join(FRONTEND_RESOURCES, 'sql-wasm.wasm');
    if (fs.existsSync(wasmSrc)) {
        console.log(`Copying WASM: ${wasmSrc} -> ${wasmDest}`);
        fs.copyFileSync(wasmSrc, wasmDest);
    }

    console.log('✅ Backend build successful!');
}

build().catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});
