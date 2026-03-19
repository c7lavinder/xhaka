# Research: Unsloth (Ultra-Fast LLM Fine-Tuning)

- **Source:** [unslothai/unsloth](https://github.com/unslothai/unsloth)
- **Key Philosophy:** Fine-tuning and running LLMs shouldn't be slow or memory-heavy. Unsloth allows 2x faster training with 70% less VRAM and no accuracy loss.

## The Technical Stack
- **Supported Models:** Llama-3, Mistral, Gemma, Phi, Qwen, and DeepSeek.
- **Key Innovation:** Custom Triton kernels and manual backpropagation that bypass the overhead of standard PyTorch Autograd.
- **Capabilities:**
  - **Unsloth Studio:** Web UI for running and training text, audio, vision, and embedding models.
  - **Tool Calling:** Native support for "self-healing" tool calling (corrects its own tool call errors).
  - **GRPO (Reinforcement Learning):** Most efficient library for RL (DeepSeek style), using 80% less VRAM.
  - **Context Window:** Possible to train 20B models with 500k context on a single 80GB GPU.

## Strategic Takeaway for Gunner
- **Domain-Specific Fine-Tuning:** As Gunner scales, we can use Unsloth to fine-tune a local "Gunner-OS" model (based on Llama-3 or DeepSeek) specifically on **Wholesale Real Estate data** and **NAH sales transcripts**. This would make call grading significantly cheaper and more accurate than using generic Claude/Gemini models.
- **Self-Healing Tools:** The "auto-healing tool calling" feature in Unsloth Studio is exactly what we need for the Gunner "Worker" agents to prevent them from looping on bad API calls.
- **Local Inference:** For privacy-conscious or high-volume clients, we could run the "Grading Engine" locally on a Mac Studio or Linux box using Unsloth's optimized GGUF/16-bit exports.
- **The "Brain" for Xhaka:** If we want Xhaka to have a "permanent" personality that isn't just a system prompt, fine-tuning an Unsloth model on your entire Slack/Telegram history and business docs is the way to do it.
