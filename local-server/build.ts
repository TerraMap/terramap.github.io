import { parseArgs } from '@std/cli/parse-args';

function generateBuildInfo() {
  const result = new Deno.Command('git', {
    args: ['rev-parse', '--short', 'HEAD'],
    stdout: 'piped'
  }).outputSync();
  const commit = new TextDecoder().decode(result.stdout).trim();
  const { version } = JSON.parse(Deno.readTextFileSync('deno.json'));
  Deno.writeTextFileSync('build-info.json', JSON.stringify({ commit, version }, null, 2) + '\n');
  console.log(`Build info: v${version} (${commit})`);
}

const Targets = [
  { alias: 'linux-a', target: 'aarch64-unknown-linux-gnu', output: 'dist/linux/aarch64/terramap-server' },
  { alias: 'linux-x', target: 'x86_64-unknown-linux-gnu', output: 'dist/linux/x86_64/terramap-server' },
  { alias: 'mac-a', target: 'aarch64-apple-darwin', output: 'dist/mac/aarch64/terramap-server' },
  { alias: 'mac-x', target: 'x86_64-apple-darwin', output: 'dist/mac/x86_64/terramap-server' },
  { alias: 'win', target: 'x86_64-pc-windows-msvc', output: 'dist/win/x86_64/terramap-server' }
];

const flags = parseArgs(Deno.args, {
  boolean: ['help'],
  alias: { help: 'h' }
});

const printHelp = () => {
  const aliasLength = Targets.toSorted((a, b) => b.alias.length - a.alias.length)[0].alias.length;

  const validTargets = `
alias   | target
-----     ------
${Targets.map((t) => `${t.alias}${' '.repeat(aliasLength - t.alias.length)} | ${t.target}`).join('\n')}
`;

  console.log(
    `
\x1b[35m TerraMap Server Build Script \x1b[0m

deno run build

By default all OS & arch targets are built.

Optionally build only one or more specified targets:

deno run build [alias]
${validTargets}`
  );
};

if (flags.help) {
  printHelp();
  Deno.exit();
}

const targets = flags._.filter((f) => typeof f === 'string');

const selected = targets.length
  ? Targets.filter((t) => targets.includes(t.target) || targets.includes(t.alias))
  : Targets;

if (selected.length === 0) {
  console.error(`\nUnknown target: ${targets.join(', ')}`);
  printHelp();
  Deno.exit(1);
}

generateBuildInfo();

for (const { target, output } of selected) {
  console.log(`\nCompiling for ${target}...`);

  const args = [
    'compile',
    '--allow-env',
    '--allow-net',
    '--allow-read',
    '--allow-run=open,xdg-open,cmd',
    '--include',
    'build-info.json',
    '--target',
    target,
    '--output',
    output
  ];

  if (target === 'x86_64-pc-windows-msvc') {
    args.push('--icon');
    args.push('../public/favicon.ico');
  }

  args.push('main.ts');

  const cmd = new Deno.Command('deno', {
    args,
    stdout: 'inherit',
    stderr: 'inherit'
  });
  console.log({ args });
  const result = cmd.outputSync();
  if (!result.success) Deno.exit(result.code);
}
