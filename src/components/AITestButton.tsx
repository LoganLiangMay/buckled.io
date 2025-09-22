import React, { useState } from 'react';
import { testEnhancedConnection } from '../services/enhancedOpenRouter';
import Button from './common/Button';

const AITestButton: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const success = await testEnhancedConnection();
      setResult(success ? '✅ API Connection Successful!' : '❌ API Connection Failed');
    } catch (error) {
      setResult('❌ API Connection Error: ' + (error as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
      <div className="text-sm font-medium mb-2">AI Connection Test</div>
      <Button
        size="sm"
        onClick={handleTest}
        disabled={testing}
        className="w-full mb-2"
      >
        {testing ? 'Testing...' : 'Test OpenRouter API'}
      </Button>
      {result && (
        <div className={`text-xs p-2 rounded ${
          result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {result}
        </div>
      )}
      <div className="text-xs text-gray-500 mt-2">
        Make sure to set your OpenRouter API key in .env file
      </div>
    </div>
  );
};

export default AITestButton;