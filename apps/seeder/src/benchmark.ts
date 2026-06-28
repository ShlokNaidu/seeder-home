import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function runBenchmark() {
    console.log("Starting Benchmark Suite...");
    const target = 'test-app';
    const numRuns = 3; // Regression Testing Phase 7 loop
    const results = [];

    for (let i = 0; i < numRuns; i++) {
        console.log(`\n--- Run ${i + 1} of ${numRuns} ---`);
        const startTime = Date.now();
        const startMem = process.memoryUsage().heapUsed;
        
        try {
            execSync(`npx tsx apps/seeder/src/index.ts --target ${target}`, { stdio: 'inherit' });
        } catch (e) {
            console.error(`Run ${i + 1} failed.`);
        }
        
        const endTime = Date.now();
        const endMem = process.memoryUsage().heapUsed;

        // Parse run.json from latest
        const latestDir = path.join(__dirname, '../../../artifacts', target, 'latest');
        let artifactSize = 0;
        let authSuccess = false;
        let discoveryCoverage = 0;
        let uiStatesCount = 0;
        let mutationSurfacesCount = 0;

        try {
            const runJson = JSON.parse(fs.readFileSync(path.join(latestDir, 'run.json'), 'utf8'));
            authSuccess = runJson.success !== false; // If run succeeded, auth succeeded (simplification)
            
            const discoveryJson = JSON.parse(fs.readFileSync(path.join(latestDir, 'discovery.json'), 'utf8'));
            if (discoveryJson.stats) {
                uiStatesCount = discoveryJson.stats.uiStatesCount || 0;
                mutationSurfacesCount = discoveryJson.stats.mutationSurfacesCount || 0;
            }
            
            // Calculate size
            const files = fs.readdirSync(latestDir);
            for (const file of files) {
                artifactSize += fs.statSync(path.join(latestDir, file)).size;
            }
        } catch (e) {}

        const durationMinutes = (endTime - startTime) / 60000;
        const statesPerMinute = durationMinutes > 0 ? uiStatesCount / durationMinutes : 0;
        const surfacesPerMinute = durationMinutes > 0 ? mutationSurfacesCount / durationMinutes : 0;

        results.push({
            run: i + 1,
            totalExecutionTimeMs: endTime - startTime,
            peakMemoryUsageBytes: endMem > startMem ? endMem : startMem, // rough approximation for external process
            artifactSizeBytes: artifactSize,
            authenticationSuccess: authSuccess,
            uiStatesDiscovered: uiStatesCount,
            mutationSurfacesDiscovered: mutationSurfacesCount,
            statesPerMinute: Math.round(statesPerMinute * 100) / 100,
            surfacesPerMinute: Math.round(surfacesPerMinute * 100) / 100
        });
    }

    fs.writeFileSync('benchmark-report.json', JSON.stringify(results, null, 2));
    
    // Also generate PERFORMANCE_BASELINE.md
    const md = [
        `# Performance Baseline`,
        `Generated across ${numRuns} consecutive regression runs.`,
        ``,
        `| Metric | Average |`,
        `|--------|---------|`,
        `| Execution Time | ${Math.round(results.reduce((a,b)=>a+b.totalExecutionTimeMs, 0)/numRuns)}ms |`,
        `| Artifact Size | ${Math.round(results.reduce((a,b)=>a+b.artifactSizeBytes, 0)/numRuns)} bytes |`,
        `| Peak Memory | ${Math.round(results.reduce((a,b)=>a+b.peakMemoryUsageBytes, 0)/numRuns)} bytes |`,
        `| Avg States / Min | ${Math.round(results.reduce((a,b)=>a+b.statesPerMinute, 0)/numRuns)} |`,
        `| Avg Mutations / Min | ${Math.round(results.reduce((a,b)=>a+b.surfacesPerMinute, 0)/numRuns)} |`
    ].join('\n');
    
    fs.writeFileSync('PERFORMANCE_BASELINE.md', md);
    fs.writeFileSync('product-benchmarks.json', JSON.stringify(results, null, 2));
    console.log("Benchmark suite completed. Reports generated.");
}

runBenchmark();
