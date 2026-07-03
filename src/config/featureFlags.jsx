import { createContext, useContext } from 'react'

// Feature flags — set via env vars or default values
const DEFAULT_FLAGS = {
  // AI features
  aiGenerate: import.meta.env.VITE_FEATURE_AI_GENERATE !== 'false',
  ocrImport: import.meta.env.VITE_FEATURE_OCR_IMPORT === 'true',
  skillRecommendations: import.meta.env.VITE_FEATURE_SKILL_RECOMMEND !== 'false',

  // Payment / tokens
  tokenPurchase: import.meta.env.VITE_FEATURE_TOKEN_PURCHASE === 'true',

  // UI features
  darkMode: import.meta.env.VITE_FEATURE_DARK_MODE === 'true',
  printExport: import.meta.env.VITE_FEATURE_PRINT_EXPORT !== 'false',
  analytics: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
}

const FeatureFlagContext = createContext(DEFAULT_FLAGS)

export function FeatureFlagProvider({ children, flags = {} }) {
  const merged = { ...DEFAULT_FLAGS, ...flags }
  return (
    <FeatureFlagContext.Provider value={merged}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

export function useFeatureFlag(flagName) {
  const flags = useContext(FeatureFlagContext)
  return flags[flagName] ?? false
}

export default FeatureFlagContext
