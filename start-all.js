#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting StockPilot - All Applications');
console.log('==========================================\n');

// Function to start a process
function startProcess(name, command, args, cwd) {
  console.log(`📦 Starting ${name}...`);
  
  const child = spawn(command, args, {
    cwd: path.resolve(__dirname, cwd),
    stdio: 'pipe',
    shell: true
  });

  child.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });

  child.stderr.on('data', (data) => {
    console.log(`[${name}] ERROR: ${data.toString().trim()}`);
  });

  child.on('error', (error) => {
    console.log(`[${name}] Failed to start: ${error.message}`);
  });

  child.on('close', (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
  });

  return child;
}

// Start all applications
try {
  // Start backend
  const backend = startProcess('Backend', 'npm', ['run', 'dev'], 'backend');
  
  // Wait a bit for backend to start
  setTimeout(() => {
    // Start frontend
    const frontend = startProcess('Frontend', 'npm', ['run', 'dev'], 'frontend');
    
    // Wait a bit for frontend to start
    setTimeout(() => {
      // Start landing page
      const landingPage = startProcess('Landing Page', 'npm', ['run', 'dev'], 'LandingPage');
      
      console.log('\n✅ All applications started!');
      console.log('\n🌐 Access your applications:');
      console.log('   Backend API:    http://localhost:5000');
      console.log('   Frontend App:   http://localhost:5500');
      console.log('   Landing Page:   http://localhost:3000');
      console.log('\n🔗 The landing page is now connected to the frontend login page!');
      console.log('   Click "Login" or "Get Started Free" buttons to access the application.');
      
      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down all applications...');
        backend.kill();
        frontend.kill();
        landingPage.kill();
        process.exit(0);
      });
      
    }, 2000);
  }, 2000);
  
} catch (error) {
  console.error('❌ Error starting applications:', error.message);
  process.exit(1);
} 