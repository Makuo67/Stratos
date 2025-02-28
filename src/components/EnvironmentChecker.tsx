import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

/**
 * Component to verify that environment variables are properly set
 * This is a development utility that can be used during setup
 */
const EnvironmentChecker: React.FC = () => {
  const [errors, setErrors] = useState<string[]>([]);
  
  useEffect(() => {
    // Check required environment variables
    const requiredVars = [
      { name: 'VITE_ADAFRUIT_USERNAME', value: import.meta.env.VITE_ADAFRUIT_USERNAME },
      { name: 'VITE_ADAFRUIT_KEY', value: import.meta.env.VITE_ADAFRUIT_KEY },
      { name: 'VITE_OPENWEATHERMAP_KEY', value: import.meta.env.VITE_OPENWEATHERMAP_KEY }
    ];
    
    const missingVars = requiredVars
      .filter(v => !v.value)
      .map(v => v.name);
    
    setErrors(missingVars);
  }, []);
  
  // Only show errors if there are missing variables
  if (errors.length === 0) {
    return null;
  }
  
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTitle>Missing Environment Variables</AlertTitle>
      <AlertDescription>
        <p>The following environment variables are required but not set:</p>
        <ul className="list-disc ml-6 mt-2">
          {errors.map(error => (
            <li key={error}>{error}</li>
          ))}
        </ul>
        <p className="mt-2">
          Please create or update your .env file based on the .env.example template.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default EnvironmentChecker;
