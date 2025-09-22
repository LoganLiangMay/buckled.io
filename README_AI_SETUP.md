# AI Integration Setup Guide

## Overview
The Buckled app now includes AI-powered features for analyzing service quotes and processing user input using OpenRouter API.

## Setup Instructions

### 1. Get OpenRouter API Key
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to your API Keys section
4. Create a new API key

### 2. Configure Environment Variables
1. Open the `.env` file in the project root
2. Replace `your_openrouter_api_key_here` with your actual API key:
   ```
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
   ```

### 3. Model Configuration

#### Vision Model (Image/PDF Analysis)
- **Model**: `meta-llama/llama-3.2-11b-vision-instruct:free` ✨ **FREE**
- **Purpose**: Analyzing uploaded images and PDFs to extract service information
- **Features**:
  - 11B parameter multimodal model optimized for vision tasks
  - Extracts service names from repair quotes
  - Identifies vehicle information
  - Reads price estimates and OCR
  - Excellent at visual question answering
  - Pre-trained on massive image-text datasets

#### Text Model (Service Processing)
- **Model**: `deepseek/deepseek-r1:free` ✨ **FREE**
- **Purpose**: Processing and cleaning user text input
- **Features**:
  - Advanced reasoning capabilities for complex text processing
  - Standardizes service names (e.g., "need oil change" → "Oil Change")
  - Excellent at categorizing automotive services
  - Strong performance in technical domain understanding
  - Optimized for research-oriented and analytical tasks

### 4. Available Features

#### Homepage (HeroSection)
- **Text Processing**: When users type service needs, AI cleans and standardizes the input
- **File Upload**: Users can upload images or PDFs of repair quotes via the paperclip icon
- **Auto-navigation**: Processed services automatically navigate to the app page

#### Customer App
- **Enhanced Search**: AI processes search queries to find better matches
- **Document Upload**: Upload repair quotes/estimates for automatic service extraction
- **Real-time Feedback**: Visual indicators show when AI is processing

### 5. Error Handling
- Graceful fallbacks when AI processing fails
- Original functionality preserved if API is unavailable
- User-friendly error messages for upload issues

### 6. Cost Management ✨ **COMPLETELY FREE**
- **Zero Cost**: Both models are completely free on OpenRouter
- **No Usage Limits**: Free models don't have strict usage limits
- **High Performance**: These free models compete with paid alternatives
- **Smart Usage**: AI calls only made when necessary (user interactions)
- **Data Training**: Free models require opting into data training (already configured)

### 7. Testing the Setup
The app includes a test function to verify API connectivity:
```typescript
import { testOpenRouterConnection } from './services/openrouter';

// Test in browser console
testOpenRouterConnection().then(console.log);
```

### 8. Alternative Free Models
You can modify the model selection in `.env` to try other free models:

#### Other Free Vision Models:
```
# Experimental thinking model with vision
VITE_VISION_MODEL=google/gemini-2.0-flash-thinking-exp:free

# Efficient edge AI vision model
VITE_VISION_MODEL=kimi-vl-a3b-thinking:free
```

#### Other Free Text Models:
```
# Latest Meta model with strong reasoning
VITE_TEXT_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Advanced DeepSeek variant
VITE_TEXT_MODEL=deepseek/deepseek-chat-v3-0324:free

# Google's latest experimental model
VITE_TEXT_MODEL=google/gemini-2.5-pro-exp-03-25:free

# Nvidia's fine-tuned Llama model
VITE_TEXT_MODEL=nvidia/llama-3.1-nemotron-ultra-253b-v1:free
```

### 9. Privacy & Security
- API key is only used client-side (safe for demos)
- For production, implement server-side API calls
- Files are not stored - only processed temporarily
- No personal data is sent to AI models

## Usage Examples

### Text Input Examples:
- "I need an oil change" → "Oil Change"
- "my brakes are squeaking" → "Brake Service"
- "battery replacement needed" → "Battery Replacement"

### Supported File Types:
- Images: JPEG, PNG, WebP
- Documents: PDF
- Content: Repair quotes, estimates, invoices

## Troubleshooting

### Common Issues:
1. **"API connection failed"**: Check your API key in `.env`
2. **"Failed to analyze document"**: Ensure file is a clear image/PDF of automotive content
3. **Slow processing**: Vision models take 2-5 seconds, this is normal

### Development Notes:
- Restart the dev server after changing `.env` variables
- Check browser console for detailed error messages
- API usage is tracked in your OpenRouter dashboard