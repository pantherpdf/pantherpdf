const fs = require('fs');
const path = require('path');

// copy CSS files
function processDir(pth, targetDir) {
  const sub = fs.readdirSync(pth);
  for (const name of sub) {
    const pth2 = path.join(pth, name);
    const dts = fs.lstatSync(pth2);
    const pthTarget = path.join(targetDir, name);
    if (dts.isDirectory()) {
      processDir(pth2, pthTarget);
    } else if (dts.isFile() && name.endsWith('.css')) {
      if (!fs.existsSync(targetDir) || !fs.lstatSync(targetDir).isDirectory()) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.copyFileSync(pth2, pthTarget);
    }
  }
}

processDir(
  path.join(__dirname, 'src'),
  path.join(__dirname, 'build-package', 'src'),
);
