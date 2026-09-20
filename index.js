import { completion, LLAMA_3_2_1B_INST_Q4_0, loadModel, unloadModel, VERBOSITY } from '@qvac/sdk';

async function main() {
  console.log('🚀 Loading QVAC local model on-device...');

  // Official loadModel syntax
  const modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelConfig: {
      device: 'cpu',
      ctx_size: 1024,
      verbosity: VERBOSITY.ERROR
    }
  });

  console.log('✅ Model loaded successfully! Generating response locally...\n');

  const history = [
    { role: 'user', content: 'Explain why on-device AI protects personal data privacy in two short sentences.' }
  ];

  const result = completion({
    modelId,
    history,
    stream: true
  });

  process.stdout.write('AI Output: ');
  for await (const token of result.tokenStream) {
    process.stdout.write(token);
  }
  console.log('\n\n✅ Done!');

  await unloadModel({ modelId });
}

main().catch(console.error);
