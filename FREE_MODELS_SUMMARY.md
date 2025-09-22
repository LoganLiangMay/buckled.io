# 🆓 Free OpenRouter Models - Optimized Configuration

## Current Configuration (Best Free Models)

### 🖼️ Vision Model: **Llama 3.2 11B Vision Instruct**
- **Model ID**: `meta-llama/llama-3.2-11b-vision-instruct:free`
- **Parameters**: 11 billion
- **Strengths**:
  - Excellent multimodal capabilities
  - Strong OCR and document analysis
  - Great for automotive repair quote extraction
  - Pre-trained on massive image-text datasets
  - Superior visual question answering

### 💬 Text Model: **DeepSeek R1**
- **Model ID**: `deepseek/deepseek-r1:free`
- **Strengths**:
  - Advanced reasoning capabilities
  - Excellent for technical domain understanding
  - Strong performance in categorization tasks
  - Research-oriented optimization
  - Perfect for automotive service standardization

## Alternative Free Options

### 🔄 Other Strong Vision Models:
1. **Google Gemini 2.0 Flash Thinking** - `google/gemini-2.0-flash-thinking-exp:free`
   - Experimental thinking model with vision
   - Strong reasoning + visual analysis

2. **Kimi VL A3B Thinking** - `kimi-vl-a3b-thinking:free`
   - Efficient edge AI optimized
   - Good for resource-constrained scenarios

### 🔄 Other Strong Text Models:
1. **Llama 3.3 70B** - `meta-llama/llama-3.3-70b-instruct:free`
   - Latest Meta model with 70B parameters
   - Excellent general reasoning

2. **DeepSeek Chat V3** - `deepseek/deepseek-chat-v3-0324:free`
   - Optimized for conversational tasks
   - Strong coding capabilities

3. **Gemini 2.5 Pro Experimental** - `google/gemini-2.5-pro-exp-03-25:free`
   - Google's latest experimental model
   - Cutting-edge capabilities

4. **Nvidia Nemotron Ultra** - `nvidia/llama-3.1-nemotron-ultra-253b-v1:free`
   - Nvidia's fine-tuned Llama model
   - Optimized for technical tasks

## Model Performance Comparison

| Use Case | Current Model | Performance | Alternative |
|----------|---------------|-------------|-------------|
| Document OCR | Llama 3.2 11B Vision | ⭐⭐⭐⭐⭐ | Gemini 2.0 Flash |
| Service Classification | DeepSeek R1 | ⭐⭐⭐⭐⭐ | Llama 3.3 70B |
| Technical Reasoning | DeepSeek R1 | ⭐⭐⭐⭐⭐ | Nvidia Nemotron |
| Conversational Tasks | DeepSeek R1 | ⭐⭐⭐⭐ | DeepSeek Chat V3 |

## Cost Benefits

- **100% Free**: No API costs
- **No Usage Limits**: Unlike paid tiers
- **High Performance**: Competitive with paid models
- **Easy Switching**: Change models by updating `.env`

## How to Switch Models

Edit your `.env` file:
```bash
# Change vision model
VITE_VISION_MODEL=google/gemini-2.0-flash-thinking-exp:free

# Change text model
VITE_TEXT_MODEL=meta-llama/llama-3.3-70b-instruct:free
```

Then restart your dev server to apply changes.

## Testing Your Configuration

Use the AI Test Button on the homepage to verify your models are working correctly. Each model change should be tested to ensure compatibility with your use case.

## Important Notes

- **Data Training**: Free models require opting into data training
- **Model Availability**: Free model availability may change over time
- **Performance**: These models compete with paid alternatives
- **Latency**: May be slightly slower than paid premium models
- **Updates**: Check OpenRouter regularly for new free models