import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import mjml from 'mjml';

const templates = [
  {
    name: 'reminder',
    path: path.join(process.cwd(), 'emails', 'reminder.mjml'),
  },
  {
    name: 'invitation',
    path: path.join(process.cwd(), 'emails', 'invitation.mjml'),
  },
];

for (const template of templates) {
  const templatePath = template.path;
  const mjmlTemplate = readFileSync(templatePath, 'utf8');
  const { html, errors } = mjml(mjmlTemplate);

  if (errors && errors.length > 0) {
    console.error(`MJML compilation errors in ${template.name}:`, errors);
    throw new Error(`Failed to compile MJML template: ${template.name}`);
  }

  const outputPath = path.join(
    process.cwd(),
    'emails',
    `${template.name}.html`,
  );

  writeFileSync(outputPath, html, 'utf8');
  console.log(`✅ Compiled ${template.name} template to ${outputPath}`);
}
