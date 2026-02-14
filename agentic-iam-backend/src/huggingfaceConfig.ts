// huggingfaceConfig.ts
// Central config for Hugging Face API credentials and model name

export const huggingfaceConfig = {
  apiKey: process.env.HUGGINGFACE_API_KEY || '',
  model: process.env.HUGGINGFACE_MODEL || 'HuggingFaceH4/zephyr-7b-beta',
  endpoint: process.env.HUGGINGFACE_ENDPOINT || 'https://api-inference.huggingface.co/models/',
};
