import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  completion,
  LLAMA_3_2_1B_INST_Q4_0,
  loadModel,
  unloadModel,
} from "@qvac/sdk";

async function main() {
  console.log("Loading QVAC model on CPU. First run may download the model.");

  const modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelConfig: {
      device: "cpu",
      ctx_size: 2048,
    },
    onProgress: (p) => {
      if (typeof p.percentage === "number") {
        process.stderr.write("\rDownload " + p.percentage.toFixed(0) + "%");
        if (p.percentage >= 100) process.stderr.write("\n");
      }
    },
  });

  console.log("Offline Hindi-English translator ready.");
  console.log("QVAC SDK 0.19.1 on CPU. Calls: loadModel, completion, unloadModel.");
  console.log("Type Hindi or English. Type help or exit.\n");

  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      const text = (await rl.question("Text: ")).trim();
      if (!text) continue;
      if (text.toLowerCase() === "exit" || text.toLowerCase() === "quit") break;
      if (text.toLowerCase() === "help") {
        console.log("Type Hindi or English. The app translates offline using QVAC loadModel + completion.");
        continue;
      }

      const result = completion({
        modelId,
        history: [
          {
            role: "user",
            content:
              "Translate between Hindi and English. Reply with only the translation.\n\n" +
              text,
          },
        ],
        stream: true,
      });

      process.stdout.write("Translation: ");
      for await (const token of result.tokenStream) {
        process.stdout.write(token);
      }
      process.stdout.write("\n\n");
    }
  } finally {
    rl.close();
    await unloadModel({ modelId });
    console.log("Model unloaded.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
