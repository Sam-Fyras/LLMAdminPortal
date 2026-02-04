import axiosInstance from '../api/axios';
import { setupMockApi } from './mockApi';

// Check if mock API mode is enabled
const MOCK_API_MODE = process.env.REACT_APP_MOCK_API === 'true';

// Configurable delay for mock responses (simulates network latency)
const MOCK_API_DELAY = parseInt(process.env.REACT_APP_MOCK_API_DELAY || '500');

/**
 * Initialize mock API if enabled
 * This should be called before any API requests are made
 */
export function initializeMockApi() {
  if (MOCK_API_MODE) {
    setupMockApi(axiosInstance, MOCK_API_DELAY);
    console.log('✅ Mock API initialized successfully');
    console.log(`🔧 Mock API Delay: ${MOCK_API_DELAY}ms`);
    console.log('🔧 All backend services mocked:');
    console.log('   - TenantConfigService (tenants, users, LLM configs)');
    console.log('   - UsageTrackingService (usage tracking, token limits, analytics)');
    console.log('   - RuleManagementService (rules CRUD, validation, versioning)');
  } else {
    console.log('ℹ️ Mock API disabled - using real backend services');
  }
}

/**
 * Check if mock API is enabled
 */
export function isMockApiEnabled(): boolean {
  return MOCK_API_MODE;
}

// Export mock data for use in tests or other places
export * from './data/tenants';
export * from './data/usage';
export * from './data/roles';
export * from './data/rules';
