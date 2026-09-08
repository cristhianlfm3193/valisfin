import { getUnifiedTransactions } from './app/actions/consultas';

// Mock supabase client to bypass auth
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'mock' } } }) },
    from: jest.fn().mockImplementation((table) => {
      // we can't really execute this easily without connecting to real DB.
      // let's just query the real DB directly with standard supabase client
    })
  })
}));
