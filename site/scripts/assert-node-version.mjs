const [major, minor] = process.versions.node.split('.').map(Number);
const supported = major === 22 && minor >= 12;

if (!supported) {
  console.error(
    `This project requires Node.js 22.12 or newer within the Node 22 release line. Current version: ${process.versions.node}.`,
  );
  console.error('Use the version recorded in .nvmrc before running the build.');
  process.exit(1);
}
