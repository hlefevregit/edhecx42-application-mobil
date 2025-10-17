import { useState } from 'react';
import visionService from '../../../services/visionService';

export const useImageAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeImage = async (imageUri) => {
    try {
      setAnalyzing(true);
      const result = await visionService.analyzeFullFridge(imageUri);
      return result;
    } catch (error) {
      console.error('Erreur analyse image:', error);
      throw error;
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzing,
    analyzeImage
  };
};