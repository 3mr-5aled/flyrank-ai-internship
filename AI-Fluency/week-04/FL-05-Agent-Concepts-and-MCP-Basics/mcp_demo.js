/**
 * Model Context Protocol (MCP) Standard Stdio Server & Client Demonstration
 * Protocol Version: 2024-11-05
 * Demonstrates: Handshake, Primitives (Tools, Resources, Prompts), and Tool Execution
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// --- SERVER IMPLEMENTATION ---
if (process.argv[2] === '--server') {
    process.stdin.setEncoding('utf8');
    let buffer = '';

    process.stdin.on('data', async (chunk) => {
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const req = JSON.parse(line);
                const res = await handleRPC(req);
                if (res) {
                    process.stdout.write(JSON.stringify(res) + '\n');
                }
            } catch (err) {
                process.stdout.write(JSON.stringify({
                    jsonrpc: "2.0",
                    id: null,
                    error: { code: -32700, message: "Parse error: " + err.message }
                }) + '\n');
            }
        }
    });

    async function handleRPC(req) {
        const { id, method, params } = req;

        switch (method) {
            case 'initialize':
                return {
                    jsonrpc: "2.0",
                    id,
                    result: {
                        protocolVersion: "2024-11-05",
                        capabilities: {
                            tools: {},
                            resources: {},
                            prompts: {}
                        },
                        serverInfo: { name: "SystemAndApiMCPServer", version: "1.0.0" }
                    }
                };

            case 'notifications/initialized':
                return null;

            case 'tools/list':
                return {
                    jsonrpc: "2.0",
                    id,
                    result: {
                        tools: [
                            {
                                name: "read_local_file",
                                description: "Reads text content from a specified local file path.",
                                inputSchema: {
                                    type: "object",
                                    properties: { filePath: { type: "string", description: "Absolute or relative file path" } },
                                    required: ["filePath"]
                                }
                            },
                            {
                                name: "query_live_weather_api",
                                description: "Queries live real-time weather API for specified latitude and longitude.",
                                inputSchema: {
                                    type: "object",
                                    properties: {
                                        latitude: { type: "number" },
                                        longitude: { type: "number" },
                                        city: { type: "string" }
                                    },
                                    required: ["latitude", "longitude"]
                                }
                            },
                            {
                                name: "execute_data_analytics",
                                description: "Performs mathematical aggregation and writes output report file to disk.",
                                inputSchema: {
                                    type: "object",
                                    properties: {
                                        datasetName: { type: "string" },
                                        numbers: { type: "array", items: { type: "number" } }
                                    },
                                    required: ["datasetName", "numbers"]
                                }
                            }
                        ]
                    }
                };

            case 'resources/list':
                return {
                    jsonrpc: "2.0",
                    id,
                    result: {
                        resources: [
                            {
                                uri: "system://env/status",
                                name: "Local System Status",
                                description: "Current operating system uptime and runtime version.",
                                mimeType: "application/json"
                            }
                        ]
                    }
                };

            case 'prompts/list':
                return {
                    jsonrpc: "2.0",
                    id,
                    result: {
                        prompts: [
                            {
                                name: "study_guide_generator",
                                description: "Prompt template for generating study guides from raw notes",
                                arguments: [{ name: "topic", description: "Subject topic", required: true }]
                            }
                        ]
                    }
                };

            case 'tools/call':
                const toolName = params.name;
                const args = params.arguments || {};

                if (toolName === 'read_local_file') {
                    try {
                        const targetPath = path.resolve(args.filePath);
                        if (!fs.existsSync(targetPath)) {
                            return { jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: `File not found: ${targetPath}` }] } };
                        }
                        const content = fs.readFileSync(targetPath, 'utf8');
                        return {
                            jsonrpc: "2.0",
                            id,
                            result: {
                                content: [
                                    { type: "text", text: `--- FILE READ SUCCESS [${targetPath}] ---\n${content}` }
                                ]
                            }
                        };
                    } catch (e) {
                        return { jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: e.message }] } };
                    }
                }

                if (toolName === 'query_live_weather_api') {
                    return new Promise((resolve) => {
                        const url = `https://api.open-meteo.com/v1/forecast?latitude=${args.latitude}&longitude=${args.longitude}&current_weather=true`;
                        https.get(url, (res) => {
                            let data = '';
                            res.on('data', chunk => data += chunk);
                            res.on('end', () => {
                                try {
                                    const json = JSON.parse(data);
                                    resolve({
                                        jsonrpc: "2.0",
                                        id,
                                        result: {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: JSON.stringify({
                                                        location: args.city || "Coordinates",
                                                        latitude: args.latitude,
                                                        longitude: args.longitude,
                                                        current_weather: json.current_weather,
                                                        timestamp: new Date().toISOString()
                                                    }, null, 2)
                                                }
                                            ]
                                        }
                                    });
                                } catch (e) {
                                    resolve({ jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: "API Parse Error" }] } });
                                }
                            });
                        }).on('error', (err) => {
                            resolve({ jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: err.message }] } });
                        });
                    });
                }

                if (toolName === 'execute_data_analytics') {
                    const nums = args.numbers || [];
                    const sum = nums.reduce((a, b) => a + b, 0);
                    const avg = nums.length ? sum / nums.length : 0;
                    const min = Math.min(...nums);
                    const max = Math.max(...nums);
                    
                    const reportPath = path.join(__dirname, 'analytics_summary.json');
                    const outputData = {
                        dataset: args.datasetName,
                        count: nums.length,
                        sum,
                        average: avg,
                        min,
                        max,
                        generatedAt: new Date().toISOString()
                    };
                    fs.writeFileSync(reportPath, JSON.stringify(outputData, null, 2));

                    return {
                        jsonrpc: "2.0",
                        id,
                        result: {
                            content: [
                                {
                                    type: "text",
                                    text: `Analytics executed successfully.\nWritten report artifact to: ${reportPath}\nSummary: Count=${nums.length}, Sum=${sum}, Avg=${avg}, Range=[${min}, ${max}]`
                                }
                            ]
                        }
                    };
                }

                return { jsonrpc: "2.0", id, error: { code: -32601, message: `Tool not found: ${toolName}` } };

            default:
                return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
        }
    }
} else {
    // --- CLIENT IMPLEMENTATION ---
    console.log("=========================================================");
    console.log("   MCP CLIENT SIMULATOR: RUNNING TOOL CALL DEMONSTRATIONS ");
    console.log("=========================================================\n");

    const serverProc = spawn(process.execPath, [__filename, '--server']);
    let reqId = 1;
    const pendingRequests = new Map();
    let responseBuffer = '';

    serverProc.stdout.on('data', (data) => {
        responseBuffer += data.toString();
        const lines = responseBuffer.split('\n');
        responseBuffer = lines.pop();

        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const res = JSON.parse(line);
                if (res.id && pendingRequests.has(res.id)) {
                    const resolve = pendingRequests.get(res.id);
                    pendingRequests.delete(res.id);
                    resolve(res);
                }
            } catch (err) {
                console.error("Client Error parsing response:", err);
            }
        }
    });

    function sendRPC(method, params = {}) {
        return new Promise((resolve) => {
            const id = reqId++;
            pendingRequests.set(id, resolve);
            const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + '\n';
            serverProc.stdin.write(msg);
        });
    }

    async function runDemo() {
        console.log("[STEP 1] Client Handshake -> Sending 'initialize'...");
        const initRes = await sendRPC('initialize', {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "Claude-MCP-Client-Demo", version: "1.0.0" }
        });
        console.log("Server Capabilities Response:", JSON.stringify(initRes.result, null, 2));

        console.log("\n[STEP 2] Discovering Available Tools (`tools/list`)...");
        const toolsRes = await sendRPC('tools/list');
        console.log(`Discovered ${toolsRes.result.tools.length} available MCP tools:`);
        toolsRes.result.tools.forEach(t => console.log(` - [TOOL] ${t.name}: ${t.description}`));

        console.log("\n---------------------------------------------------------");
        console.log("   TASK 1: READING LOCAL SYSTEM FILES VIA MCP TOOL CALL ");
        console.log("---------------------------------------------------------");
        const fileToRead = path.join(__dirname, '..', 'FL-04-Automation-Workflow', 'README.md');
        console.log(`[CALLING TOOL] read_local_file with args: { filePath: "${fileToRead}" }`);
        const task1Res = await sendRPC('tools/call', {
            name: "read_local_file",
            arguments: { filePath: fileToRead }
        });
        console.log("[MCP TOOL OUTPUT]:\n" + task1Res.result.content[0].text);

        console.log("\n---------------------------------------------------------");
        console.log("   TASK 2: QUERYING LIVE REAL-TIME API VIA MCP TOOL CALL ");
        console.log("---------------------------------------------------------");
        console.log(`[CALLING TOOL] query_live_weather_api with args: { latitude: 30.0444, longitude: 31.2357, city: "Cairo" }`);
        const task2Res = await sendRPC('tools/call', {
            name: "query_live_weather_api",
            arguments: { latitude: 30.0444, longitude: 31.2357, city: "Cairo" }
        });
        console.log("[MCP TOOL OUTPUT]:\n" + task2Res.result.content[0].text);

        console.log("\n---------------------------------------------------------");
        console.log("   TASK 3: EXECUTING ANALYTICS & DISK REPORT GENERATION ");
        console.log("---------------------------------------------------------");
        console.log(`[CALLING TOOL] execute_data_analytics with args: { datasetName: "FL-04 Run Time Benchmark", numbers: [18, 15, 22, 14, 19] }`);
        const task3Res = await sendRPC('tools/call', {
            name: "execute_data_analytics",
            arguments: { datasetName: "FL-04 Run Time Benchmark", numbers: [18, 15, 22, 14, 19] }
        });
        console.log("[MCP TOOL OUTPUT]:\n" + task3Res.result.content[0].text);

        console.log("\n=========================================================");
        console.log("   MCP DEMONSTRATION EXECUTED SUCCESSFULLY ");
        console.log("=========================================================");

        serverProc.kill();
        process.exit(0);
    }

    runDemo();
}
