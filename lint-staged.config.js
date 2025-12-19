module.exports = {
  '**/*.{js,jsx,ts,tsx,json,css,md,yml,yaml}': (files) => {
    const q = (s) => s.replaceAll('"', '\\"');
    const list = files.map((f) => `"${q(f)}"`).join(' ');
    const cmds = [];
    cmds.push(`prettier --write ${list}`);
    cmds.push(`eslint --fix ${list}`);
    return cmds;
  },
};
