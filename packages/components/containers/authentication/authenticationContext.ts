import { createContext } from 'react';

import type { PrivateAuthenticationStore, PublicAuthenticationStore } from '../app/interface';

// Trusting this always gets set
export default createContext<PublicAuthenticationStore | PrivateAuthenticationStore>(null as any);
