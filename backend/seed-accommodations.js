const { exec } = require('child_process');
const path = require('path');

console.log('🌱 Seeding accommodations...');

// Run the TypeScript seed script using ts-node
const scriptPath = path.join(__dirname, 'src/scripts/seedAccommodations.ts');
const command = `npx ts-node ${scriptPath}`;

const child = exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error running seed script:', error);
    return;
  }

  if (stderr) {
    console.error('⚠️  Warning:', stderr);
  }

  console.log(stdout);
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Seed script completed successfully');
  } else {
    console.error(`❌ Seed script exited with code ${code}`);
  }
});